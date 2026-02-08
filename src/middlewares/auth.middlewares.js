import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"

export const auth = asyncHandler(async (req, res, next) => {
  const incomingAccessToken = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
  if(!incomingAccessToken) {
    throw new ApiError(401, "Access token is missing")
  }

  let decodedToken;
  try {
      decodedToken = jwt.verify(
        incomingAccessToken,
        process.env.ACCESS_TOKEN_SECRET,
      );
  } catch (error) {
    throw new ApiError(401, "Somthing wrong or Access token expired")
  }

  if(!decodedToken) {
    throw new ApiError(400, "Invalid access token")
  }

  const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

  if(!user) {
    throw new ApiError(400, "Invalid Access token")
  }

  req.user = user
  next();
})
