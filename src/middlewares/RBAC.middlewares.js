import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const roleBasedAuthorize = (roles) => {
  return asyncHandler(async (req, res, next) => {
    const loggedInUser = req?.user;

    if(!loggedInUser) {
      throw new ApiError(401, "Authentication required")
    }

    if(!roles.includes(loggedInUser.role)) {
      throw new ApiError(403, "Unauthorized action")
    }

    next();
  })
};

export default roleBasedAuthorize;