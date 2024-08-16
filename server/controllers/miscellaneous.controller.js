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

    const subscribeCount = await User.countDocuments({ isSubscribed: true });

    const monthlySalesRecord = await Payment.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalSales: { $sum: "$amount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]).exec();

    const salesData = Array(12).fill(0);
    monthlySalesRecord.forEach((record) => {
      salesData[record._id - 1] = record.totalSales;
    });

    res.status(200).json({
      success: true,
      data: {
        allUsersCount,
        subscribeCount,
        monthlySalesRecord: salesData,
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
