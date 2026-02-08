import mongoose from "mongoose"
import { Project } from "../models/project.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { ProjectMember } from "../models/projectmember.model.js"

const listUserProject = asyncHandler(async (req, res) => {
  // find all ProjectMember documents for the user (not just one)
  const projectMembers = await ProjectMember.find(
    {
      user: req.user?._id,
    }
  ).populate({
    path: "project",
    select: "name description createdAt",
  });

  if (!projectMembers || !projectMembers.length) {
    throw new ApiError(404, "Projects not found");
  }

  // extract populated projects from the membership documents
  const projects = projectMembers.map((pm) => pm.project).filter(Boolean);

  return res
    .status(200)
    .json(new ApiResponse(200, { projects }, "Projects fetched succesfully"));
});//tested

const createProject = asyncHandler(async (req, res) => {
  const {name, description} = req.body

  if(!name) {
    throw new ApiError(400, "Project Name is Required")
  }

  if(!description) {
    throw new ApiError(400, "Description of Project is required")
  }

  const loggedInUser = req.user;
  if(!loggedInUser) {
    throw new ApiError(401, "Authentication is needed")
  }

    const member = await ProjectMember.create({
      user: loggedInUser?._id,
      role: 'admin',
    })

    if(!member) {
      throw new ApiError(500, "Member creation failed")
    }
  

  const members = []
  members.push(member?._id)
  const project = await Project.create(
    {
      name,
      description,
      createdBy: new mongoose.Types.ObjectId(loggedInUser?._id),
      members,//
    }
  )

  if(!project) {
    throw new ApiError(500, "Project creation Error")
  }

  // if we created a ProjectMember before creating the project, link it to
  // the newly created project so population works correctly
  if (member?._id) {
    await ProjectMember.findByIdAndUpdate(member._id, { project: project._id });
  }

  return res.status(200).json(new ApiResponse(200, {project}, "Project is created Successfully"))
})//tested

const getProjectById = asyncHandler(async (req, res) => {
  const {projectId} = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  if(!projectId) {
    throw new ApiError(400, "Project id is required")
  }

  const project = await Project.findById(projectId);

  if(!project) {
    throw new ApiError(404, "Project not found")
  }

  return res.status(200).json(new ApiResponse(200, {project}, "Project details fetched Successfully"))

})//tested

const updateProjectById = asyncHandler(async (req, res) => {
  const {newName, newDescription, newStatus, newVisibility} = req.body
  if (
    newName === undefined &&
    newDescription === undefined &&
    newStatus === undefined &&
    newVisibility === undefined
  ) {
    throw new ApiError(400, "No value is given to update");
  }
  const {projectId} = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  if(!projectId) {
    throw new ApiError(400, "Project id is required")
  }

  //  const updateData = {};

  // if (newName !== undefined) updateData.name = newName;
  // if (newDescription !== undefined) updateData.description = newDescription;
  // if (newStatus !== undefined) updateData.status = newStatus;
  // if (newVisibility !== undefined) updateData.visibility = newVisibility;

  // const project = await Project.findByIdAndUpdate(
  //   projectId,
  //   { $set: updateData },
  //   { new: true, runValidators: true }
  // );

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      $set: {
        name: newName ?? undefined,
        description: newDescription ?? undefined,
        status: newStatus ?? undefined,
        visibility: newVisibility ?? undefined
      }
    },
    {
      new: true,
    }
  )

  if(!project) {
    throw new ApiError(403, "Project not found or updation failed")
  }

  return res.status(200).json(new ApiResponse(200, {project}, "Project details updated Successfully"))
  
})//tested

const deleteProjectById = asyncHandler(async (req, res) => {
  const {projectId} = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  if(!projectId) {
    throw new ApiError(400, "Project id is required")
  }

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      $set: {
        isDeleted: true,
      }
    },
    {
      new: true
    }
  ).select("-visibility -status -members")

  return res.status(200).json(new ApiResponse(200, {project}, "Project deleted succesfully"))
})//tested

const listProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    throw new ApiError(400, "Project Id is required");
  }

  const members = await Project.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "projectmembers",
        localField: "members",
        foreignField: "_id",
        as: "members",
      },
    },
    { $unwind: "$members" },
    {
      $lookup: {
        from: "users",
        localField: "members.user",
        foreignField: "_id",
        as: "members.user",
      },
    },
    { $unwind: "$members.user" },
    {
      $project: {
        _id: 0,
        "members._id": 1,
        "members.role": 1,
        "members.user._id": 1,
        "members.user.username": 1,
        "members.user.email": 1,
      },
    },
  ]);

  if (!members.length) {
    throw new ApiError(404, "Project not found or has no members");
  }

  // extract only members (clean API response)
  const response = members.map(m => m.members);

  res.status(200).json(
    new ApiResponse(200, response, "Project members fetched successfully")
  );
});//tested


const addProjectMember = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { userId } = req.body;

  if (!projectId) {
    throw new ApiError(400, "ProjectId is required");
  }

  if (!userId) {
    throw new ApiError(400, "User id is required to add member");
  }


  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }


  const existingMember = await ProjectMember.findOne({
    project: projectId,
    user: userId,
  });

  if (existingMember) {
    throw new ApiError(409, "User is already a member of this project");
  }


  const member = await ProjectMember.create({
    user: userId,
    project: projectId,
    role: "member",
  });

  if (!member) {
    throw new ApiError(500, "Member addition failed");
  }

  await Project.findByIdAndUpdate(
    projectId,
    {
      $push: {
        members: member._id,
      },
    },
    { new: true }
  );


  const responseMember = await ProjectMember.findById(member._id)
    .select("-isActive -joinedAt")
    .populate("user", "username email");

  return res
    .status(201)
    .json(new ApiResponse(201, responseMember, "Project member added successfully"));
});//tested

const updateMemberRole = asyncHandler(async (req, res) => {
  const {projectId, userId} = req.params
  const {newRole} = req.body;

  if(!projectId) {
    throw new ApiError(400, "Project Id is required to update member role")
  }

  if(!userId) {
    throw new ApiError(400, "User id is required to update member role")
  }

  if(!newRole) {
    throw new ApiError(400, "New Role is required to update member role")
  }

  const member = await ProjectMember.findOne(
    {
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(userId),
    }
  ).select("-isActive -joinedAt")

  if(!member) {
    throw new ApiError(404, "Member not found")
  }

  member.role = newRole;
  await member.save({validateBeforeSave: true});

  return res.status(200).json(new ApiResponse(200, {member}, "Member role updated successfully"))
})//tested

const removeMember = asyncHandler(async (req, res) => {
  const {projectId, userId} = req.params;

  if(!projectId) {
    throw new ApiError(400, "Project id is required")
  }

  if(!userId) {
    throw new ApiError(400, "User id is required")
  }
  const projectMember = await ProjectMember.findOne({
    user: userId,
    project: projectId
  })

  if(!projectMember) {
    throw new ApiError(404, "Project member not found or exist")
  }

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      $pull: {
        members: new mongoose.Types.ObjectId(projectMember?._id)
      }
    },
    {
      new : true
    }
  )

  if(!project) {
    throw new ApiError(500, "Something went wrong while removing a member")
  }

  const member = await ProjectMember.findOneAndDelete(
    {
      user: userId,
      project: projectId
    }
  )
  

  if(!member) {
    throw new ApiError(500, "Something went wrong while deltion of project member")
  }

  return res.status(200).json(new ApiResponse(200, {}, "Project member has deleted"))
})//tested


export {
  listUserProject,
  createProject,
  getProjectById,
  updateMemberRole,
  updateProjectById,
  deleteProjectById,
  listProjectMembers,
  addProjectMember,
  removeMember
}