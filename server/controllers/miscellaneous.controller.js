import Contact from "../models/contact.model.js";
import AppError from "../utils/error.util.js";
import User from "../models/user.model.js";
import Payment from "../models/payment.model.js";

const contactUs = async (req, res, next) => {
  const { name, email, message } = req.body;
  try {
    if (!name || !email || !message) {
      return next(new AppError("All fields are required", 400));
    }

    const contactMessage = await Contact.create({
      name,
      email,
      message,
    });
    await contactMessage.save();
    res.status(200).json({
      success: true,
      message: "receive Your Message Successfully...",
      contactMessage,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};
const userStats = async (req, res) => {
  try {
    const allUsersCount = await User.countDocuments({});

    const subscribeCount = await User.countDocuments({ "subscription.status": "active" });
    
    console.log("all User", allUsersCount);
    console.log("sub", subscribeCount);
    
    

    res.status(200).json({
      success: true,
      data: {
        allUsersCount,
        subscribeCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get statistics",
      error: error.message,
    });
  }
};

export { contactUs, userStats };
