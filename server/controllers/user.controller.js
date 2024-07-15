import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import sendEmail from "../utils/sendEmail.js";
import cloudinary from "cloudinary";
import crypto from "crypto";
import fs from "fs/promises";
const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
  secure: true,
};

//#region REGISTER FORM
const register = async (req, res, next) => {
  const { fullName, email, password} = req.body;

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
      secure_url:"https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxy.jpg",
    },
  });

  if (!user) {
    return next(
      new AppError("User registration failed, please try again", 400)
    );
  }

  //  File upload logic
  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
        width: 250,
        height: 250,
        gravity: "faces",
        crop: "fill",
      });

      if (result) {
        // Set the public_id and secret_Url in DB
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        // Remove file from local store
        await fs.rm(`upload/${req.file.filename}`);
      }
    } catch (e) {
      return next(new AppError(e || "File not uploaded try again", 500));
    }
  }

  await user.save();

  user.password = undefined;

  const token = await user.generateJWTToken();

  res.cookie("token", token, cookieOptions);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user,
  });
};

//#region LOGIN FORM
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

//#region LOGOUT
const logout = (req, res) => {
  res.cookie("token", null, {
    secure: true,
    maxAge: 0,
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "User logout successfully",
  });
};

//#region GET PROFILE
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    res.status(200).json({
      success: true,
      message: "User Details",
      user,
    });
  } catch (e) {
    return next(new AppError("Failed to fetch User details", 500));
  }
};

//#region FORGET PASSWORD
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("Email not registered", 400));
  }

  const resetToken = await user.generatePasswordResetToken();

  await user.save();

  const resetPasswordURL = `${process.env.FRONTEND_URL}/reset/${resetToken}`;

  const subject = "Reset password";
  const message = `You can reset your password by clicking <a href=${resetPasswordURL} target="_blank">Reset your password</a>\n If the above link does not work for some reason then copy paste this link in new tab ${resetPasswordURL}`;

  try {
    await sendEmail(email, subject, message);

    res.status(200).json({
      success: true,
      message: `Reset password token has been send to ${email} successfully`,
    });
  } catch (e) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();
    return next(new AppError(e.message, 500));
  }
};
//#region RESET PASSWORD
const resetPassword = async (req, res) => {
  const { resetToken } = req.params;

  const { password } = req.body;

  const forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError("Token is invalid or expired, please try again", 400)
    );
  }

  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  user.save();

  res.status(200).json({
    success: true,
    message: "password changed successfully!",
  });
};

//#region CHANGE PASSWORD
const changePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const { id } = req.user;

  if (!oldPassword || !newPassword) {
    return next(new AppError("All fields are mandatory", 400));
  }

  const user = await User.findById(id).select("+password");

  if (!user) {
    return next(new AppError("User does not exist", 400));
  }

  const isPasswordValid = await user.comparePassword(oldPassword);

  if (!isPasswordValid) {
    return next(new AppError("Invalid old password", 400));
  }

  user.password = newPassword;

  await User.save();

  user.password = undefined;

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
};

//#region UPDATE PROFILE
const updateProfile = async (req, res, next) => {
  const { fullName } = req.body;
  const { id } = req.user.id;

  const user = await User.findById(id);

  if (!user) {
    return next(new AppError("User does not exist", 400));
  }

  if (req.fullName) {
    user.fullName = fullName;
  }

  if (req.file) {
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
        width: 250,
        height: 250,
        gravity: "faces",
        crop: "fill",
      });

      if (result) {
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        // Remove file from server
        fs.rm(`upload/${req.file.filename}`);
      }
    } catch (e) {
      return next(new AppError(e || "File not uploaded try again", 500));
    }
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
  });
};

export {
  register,
  login,
  logout,
  getProfile,
  resetPassword,
  forgotPassword,
  changePassword,
  updateProfile,
};
