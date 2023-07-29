import AppError from "../utils/error.util.js";
import Jwt  from "jsonwebtoken";

const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;

    if(!token) {
        return next(new AppError('Unauthenticated please login again', 401))
    }

    const userDetails = await Jwt.verify(token, process.env.JWT_SECRET);

    req.user = userDetails;

    next();
}

const authorizedRoles = (...roles) => async(req, res, next) => {
    const currentUser = req.user.role;
    if(!roles.includes(currentUser)) {
        return next(new AppError('You do not have permission to access this route',300))
    }
    next();
}

const authorizeSubscriber = async(req, res, next) => {
    const subsciption = req.user.subsciption;
    const currentUser = req.user.role;
    if(currentUser !== 'ADMIN' && subsciption.status !== 'active') {
        return next(new Error('Please subscribe to access this route', 403));
    } 

    next();
}

export { isLoggedIn, authorizedRoles, authorizeSubscriber };