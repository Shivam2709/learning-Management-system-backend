import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import sendEmail from '../utils/sendEmail.js'
import cloudinary from 'cloudinary';
import fs from 'fs/promises';
const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
  secure: true,
};

const register = async (req, res, next) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return next(new AppError("All fields are required", 400));
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    return next(new AppError("Email already exists", 400));
  }

  const user = await User.create({
    fullName,
    email,
    password,
    avatar: {
      public_id: email,
      secure_url:
        "https://cdn.pixabay.com/photo/2016/07/11/15/43/woman-1509956_640.jpg",
    },
  });

  if (!user) {
    return next(
      new AppError("User registration failed, please try again", 400)
    );
  }

  //  File upload logic
  console.log('File details > ',JSON.stringify(req.file));
  if(req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: 'lms',
        width: 250,
        height: 250,
        gravity: 'faces',
        crop: 'fill'
      });

      if(result) {
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        // Remove file from server
        fs.rm(`upload/${req.file.filename}`)
      }
    } catch (e) {
        return next(
          new AppError(e || 'File not uploaded try again',500)
        )
    }
  }

  await user.save();

  user.password = undefined;

  const token = await user.generateJWTToken();

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    success: true,
    message: "User registered successfully",
    user,
  });
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("All fields are required", 400));
    }

    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user || !user.comparePassword(password)) {
      return next(new AppError("Email or password does not match", 400));
    }

    const token = await user.generateJWTToken();
    user.password = undefined;

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "User loggedin successfully",
      user,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const logout = (req, res) => {
  res.cookie('token', null, {
    secure: true,
    maxAge : 0,
    httpOnly : true
  });

  res.status(200).json ({
    success: true,
    message: 'User logout successfully'
  })
};

const getProfile = async (req, res) => {
  try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      res.status(200).json({
        success: true,
        message: "User Details",
        user
      });
  } catch (e) {
    return next(new AppError('Failed to fetch User details', 500))
  }
};

const forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    if(!email) {
      return next(new AppError('Email is required', 400))
    }

    const user = await User.findOne({ email });
      if(!user) {
        return next(new AppError('Email not registered', 400))
      }

      const resetToken = await user.generatePasswordResetToken();

      await user.save();

      const resetPasswordURL = `${process.env.FRONTEND_URL}/reset/${resetToken}`;
      
      const subject = 'Reset password';
      const message = `You can reset your password by clicking <a href=${resetPasswordURL} target="_blank">Reset your password</a>\n If the above link does not work for some reason then copy paste this link in new tab ${resetPasswordURL}`;

      try {
        await sendEmail(email, subject, message); 

        res.status(200).json({
          success: true,
          message: `Reset password token has been send to ${email} successfully`
        })
      } catch(e) {

          user.forgotPasswordExpiry = undefined;
          user.forgotPasswordToken = undefined;

          await user.save();
          return next (new AppError(e.message, 500))
      }
}

const resetPassword = () => {

}

export { register, login, logout, getProfile, resetPassword, forgotPassword };
