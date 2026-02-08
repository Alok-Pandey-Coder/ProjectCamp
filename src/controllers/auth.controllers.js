import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import {asyncHandler}  from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import mongoose from "mongoose"
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from '../utils/mail.js';
import crypto from "crypto"
//-----------------
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { deleteFromCloudinary } from "../utils/cloudinary.js";
//------------------

const generateAccessTokenAndRefreshToken = async function(userId) {
  if(!userId) {
    throw new ApiError(400, "User id is missing while generation of access and refresh token")
  }

  const user = await User.findById(userId);
  if(!user) {
    throw new ApiError(401, "UserId provided is not valid")
  }

  let accessToken;
  let refreshToken;
  try {
      accessToken =  user.generateAccessToken();
      refreshToken =  user.generateRefreshToken();
      console.log("Token generated successfully")
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh Token")
  }

  return {accessToken, refreshToken}
}

const registerUser = asyncHandler(async (req, res) => {
  const {username, email, password, fullname} = req.body

  if(!username || !email || !password || !fullname) {
    throw new ApiError(400, "Basic user details are missing for registeration")
  }
  const existedUser = await User.findOne(
    {
      $or: [{email}, {username}]
    }
  )

  if(existedUser) {
    throw new ApiError(409, "User with this credential is already registered")
  }

  //localPathforfile avatar
    const avatarLocalPath = req.files?.avatar?.[0]?.path

    if(!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is missing")
    }


  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath)
    console.log("uploaded avatar", avatar)
  } catch (error) {
    console.log("Error uplaoding avatar", error)
    throw new ApiError(500, "Failed to load avatar")
  }
  //-------------
let user;
try {
     user = await User.create(
      {
        username,
        email: email.toLowerCase(),
        password,
        fullname,
        avatar: avatar?.url,
      }
    )
  
    if(!user) {
      throw new ApiError(400,"User creation failed")
    }
} catch (error) {
  console.error("🔥 REAL ERROR FROM MONGOOSE ↓↓↓");
  console.error(error);

  if (avatar) await deleteFromCloudinary(avatar.public_id);

  throw error;
}

  const {accessToken, refreshToken: newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)

  if(!accessToken && !newRefreshToken) {
    throw new ApiError(500, "Error while generating tokens")
  }

  user.refreshToken = newRefreshToken; 

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({validateBeforeSave: false})

  await sendEmail(
    {
      email: user?.email,
      subject: "please verify your email",
      mailgenContent: emailVerificationMailgenContent(
        user.username,
        `${req.protocol}://${req.host}/api/v1/users/verify-email/${unHashedToken}`
      )
    }
  )

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  )

  if(!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  res.status(201).json(new ApiResponse(201, {user: createdUser}, "User registered successfully and verification email has been sent on your email"))

})

const loginUser = asyncHandler(async (req, res) => {
  const {email, username, password} = req.body

  if(!email && !username) {
    throw new ApiError(400, "Email or username is required")
  }

  if(!password) {
    throw new ApiError(400, "Password is required")
  }

  const user = await User.findOne(
    {
      $or: [{email}, {username}]
    }
  ).select("+password")

  if(!user) {
    throw new ApiError(404, "User does not exist in db")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid) {
    throw new ApiError(401, "Password is not valid")
  }

  const accessToken = user.generateAccessToken()
  const newRefreshToken = user.generateRefreshToken()
  if(!accessToken) {
    throw new ApiError(500, "Something went wrong while generating accessToken")
  }
  if(!newRefreshToken) {
    throw new ApiError(500, "Something went wrong while generating refreshToken")
  }

  user.refreshToken = newRefreshToken

  await user.save({validateBeforeSave: false})
  
  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: accessToken, newRefreshToken },
        'User is logged in successfully',
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user
  if(!user) {
    throw new ApiError(400, "User is not logged in")
  }

  const loggedInUser = await User.findById(user?._id);

  if(!loggedInUser) {
    throw new ApiError(400, "User not logged in")
  }

  loggedInUser.refreshToken = undefined;
  await loggedInUser.save({validateBeforeSave: false})

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken", options).json(new ApiResponse(200, {loggedInUser}, "User logged out successfully"))

});

const getCurrentUser = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  return res.status(200).json(new ApiResponse(200, {currentUser}, "Current user fetched"))
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const {oldPassword, newPassword} = req.body;

  if(!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password or New password is missing")
  }
  if(!req.user) {
    throw new ApiError(409, "Unauthorized access")
  }

  const loggedInUser  = req.user

  const user = await User.findById(loggedInUser?._id).select("+password")

  if(!user) {
    throw new ApiError(404, "User does not found")
  }

  const isPasswordValid = await user.isPasswordCorrect(oldPassword)
  
  if(!isPasswordValid) {
    throw new ApiError(400, " Old Password in not valid")
  }

  user.password = newPassword;
  user.refreshToken = undefined 
  await user.save();

  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"))
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.headers["authorization"]?.replace("Bearer ", "");
  if(!incomingRefreshToken) {
    throw new ApiError(400, "Refresh token is missing")
  }

  let decodedToken
  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
  } catch (error) {
    throw new ApiError(401, "Refresh token is invalid or expired")
  }

  if(!decodedToken) {
    throw new ApiError(500, "Refresh Token is expired or invalid, please login again")
  }

  const user = await User.findById(decodedToken?._id)
  if(!user) {
    throw new ApiError(404, "User does not exist")
  }

  const accessToken = user.generateAccessToken()
  const newRefreshToken = user.generateRefreshToken()

  user.refreshToken = newRefreshToken

  await user.save({validateBeforeSave: false})

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newRefreshToken, options).json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken}, "Access Token refreshed Successfuly"))


});

const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  if(!verificationToken) {
    throw new ApiError(400, "Verification Token is missing")
  }

  const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

  if(!hashedToken) {
    throw new ApiError(500, "token hashing failed")
  }

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Token is invalid or expired');
  }

  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { isEmailVerified: true }, 'Email is verified'),
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const {email} = req.body;

  if(!email) {
    throw new ApiError(400, "Email is required")
  }

  const user = await User.findOne(
    {email}
  )

  if(!user) {
    throw new ApiError(404, "User does not found")
  }

  const {unHashedToken, hashedToken, tokenExpiry} =  user.generateTemporaryToken();

  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;

  await user.save({validateBeforeSave: false});


  await sendEmail({
    email: user?.email,
    subject: 'Forgot Password',
    mailgenContent: forgotPasswordMailgenContent(
      user.username,
      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`,
    ),
  });

  return res.status(200).json(new ApiResponse(200, {}, "forgot password mail is sent to your registered email"))

});

const resetForgotPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const {newPassword} = req.body;

  if(!resetToken) {
    throw new ApiError(400, "Reset token is missing..")
  }

  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  const user = await User.findOne(
    {
      forgotPasswordToken: hashedToken,
      forgotPasswordExpiry: {$gt: Date.now()}
    }
  ).select("+password")

  if(!user) {
    throw new ApiError(400, " Reset Token is invalid or expired")
  }

  user.password = newPassword;
  await user.save();

  return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"))


});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;

  const {unHashedToken, hashedToken, tokenExpiry} = loggedInUser.generateTemporaryToken();

  const user = await User.findById(loggedInUser?._id);

  if(!user) {
    throw new ApiError(404, "User not found");
  }

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({validateBeforeSave: false});

  await sendEmail(
    {
      email: user?.email,
      subject: "please verify your email",
      mailgenContent: emailVerificationMailgenContent(
        user.username,
        `${req.protocol}://${req.host}/api/v1/users/verify-email/${unHashedToken}`
      )
    }
  )

  return res.status(200).json(new ApiResponse(200, {}, "email verification link has been sent"))

});

//controller for avatar image

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path

  if(!avatarLocalPath) {
    throw new ApiError(400, "File is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if(!avatar.url) {
    throw new ApiError(500, "Something went wrong while uplaoding")
  }

  const user = await User.findByIdAndUpdate(req.user?._id, {$set: {avatar: avatar.url}}, {new: true}).select("-password -refreshToken")
  
  return res.status(200).json(new ApiResponse(200, user, "avatar updated successfully"))
})
export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  changeCurrentPassword,
  verifyEmail,
  forgotPassword,
  resetForgotPassword,
  resendEmailVerification,
  refreshAccessToken,
  updateAvatar
}