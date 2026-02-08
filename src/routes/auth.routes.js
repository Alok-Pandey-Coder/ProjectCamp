import { Router } from 'express';
import { registerUser, loginUser, logoutUser, getCurrentUser, changeCurrentPassword, verifyEmail, forgotPassword, resetForgotPassword, resendEmailVerification , refreshAccessToken, updateAvatar} from '../controllers/auth.controllers.js';
import { auth } from '../middlewares/auth.middlewares.js';
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();

router.route("/register").post(upload.fields([
  {
    name: "avatar",
    maxCount: 1
  }
]),registerUser);;//checked & Passed

router.route('/login').post(loginUser)
router.route('/logout').post(auth, logoutUser)//secured routes
router.route('/current-user').get(auth, getCurrentUser);//secured routes
router.route('/change-password').post(auth, changeCurrentPassword);//secured routes
router.route('/refreshToken').post(refreshAccessToken);
router.route('/verify-email/:verificationToken').get(verifyEmail);//checked & Passed
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:resetToken').post(resetForgotPassword);
router.route('/resend-email-verification').post(auth, resendEmailVerification);//secured routes

//---------
router.route("/avatar").patch(auth, upload.single("avatar"),updateAvatar)




export default router;
