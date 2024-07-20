import Contact from "../models/contact.model.js";
import AppError from "../utils/error.util.js";
const contactUs = async (req, res, next) => {
    const { name, email, message } = req.body;
    try{
        if(!name || !email || !message ){
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
    }catch(err){
        return next(new AppError(err.message, 500));
    }
};
const userStats = async () => {

}

export { contactUs, userStats};