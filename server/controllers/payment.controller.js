import User from "../models/user.model.js";
import { razorpay } from "../server.js";
import AppError from "../utils/error.util.js";
import crypto from 'crypto';

export const getRazorpayApiKey = (req, res, next) => {
    res.status(200).json({
        success: true,
        message: 'Razorpay API key',
        key: process.env.RAZORPAY_KEY_ID
    });
}

export const buySubscription = async (req, res, next) => {
    const { id } = req.user;
    const user = await User.findById(id);

    if(!user) {
        return next(new AppError('Unauthorized, please login',400))
    }

    if (user.role === 'ADMIN') {
        return next(new AppError('Admin cannot purchase a subscription', 400))
    }

    const subscription = await razorpay.subscription.create({
        plan_id: process.env.RAZORPAY_PLAN_ID,
        customer_notify: 1
    });

    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Subscribed Successfully',
        subscription_id: subscription.id
    });
}

export const verifyScription = async (req, res, next) => {
    const { id } = req.user;
    const { Payment_id, subscription_id, signature_id } = req.body;

    const user = await User.findById(id);

    if(!user) {
        return next(new AppError('Unauthorized, please login',400))
    }

    const subscriptionId = user.subscription.id;

    const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(`${razorpay_payment_id}|${subscriptionId}`)
            .digest('hex');

    if(generatedSignature !== signature_id) {
        return next (new AppError('Payment not verified, please try again', 500))
    }

    await Payment.create({
        Payment_id, 
        subscription_id, 
        signature_id
    });

    user.subscription.status = 'active';
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Payment verified successfully'
    });
}

export const cancelSubscription = (req, res, next) => {

}

export const allPayments = (req, res, next) => {

}