import { Router } from "express";
import { getProfile, login, logout, register, resetPassword, forgotPassword, changePassword, updateProfile } from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.post('/register', upload.single("avatar"), register);
router.post('/login', login);
router.post('/logout', isLoggedIn, logout);
router.get('/me', isLoggedIn, getProfile);
router.post('/forgot', forgotPassword);
router.post('/reset', resetPassword);
router.post('/change-password', isLoggedIn, changePassword);
router.put('/update', isLoggedIn, upload.single("avatar"), updateProfile)

export default router;