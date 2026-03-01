import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { ProjectMember } from "../models/projectmember.model.js";

const roleBasedAuthorize = (roles) => {
  return asyncHandler(async (req, res, next) => {

    const userId = req.user?._id;
    const projectId = req.params.projectId || req.body.projectId;

    if (!userId) {
      throw new ApiError(401, "Authentication required");
    }

    const member = await ProjectMember.findOne({
      user: userId,
      project: projectId
    });

    if (!member) {
      throw new ApiError(403, "You are not a project member");
    }

    if (!roles.includes(member.role)) {
      throw new ApiError(403, "Insufficient project permissions");
    }

    next();
  });
};

export default roleBasedAuthorize;