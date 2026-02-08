import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Task } from '../models/task.model.js';
import { Subtask } from '../models/subtask.model.js';
import { Project } from '../models/project.model.js';
import mongoose from 'mongoose';

const listProjectTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params

  if (!projectId) {
    throw new ApiError(400, "Project id is required")
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id")
  }

  const tasks = await Task.find({
    project: projectId,
    isDeleted: false,
  })
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })

  if (!tasks || tasks.length === 0) {
    throw new ApiError(404, "No tasks found for this project")
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      tasks,
      "Project tasks fetched successfully"
    )
  )
})//tested

const createTask = asyncHandler(async (req, res) => {
  const {projectId} = req.params;

  if(!projectId) {
    throw new ApiError(400, "Project Id is requird")
  }

  const {title, description} = req.body;

  if(!(title && description)) {
    throw new ApiError(400, "Title or description is missing");
  }

  const task = await Task.create(
    {
      title,
      description,
      project: projectId,
      createdBy: req.user?._id
    }
  )

  if(!task) {
    throw new ApiError(501, "Task creation failed")
  }

  return res.status(200).json(new ApiResponse(200, {task}, "Task created successfully"))
})//tested

const taskDetails = asyncHandler(async (req, res) => {
  const {projectId, taskId} = req.params

  if(!(projectId && taskId)) {
    throw new ApiError(400, "Project id and task id is required")
  }

  const task = await Task.findOne(
    {
      _id: taskId,
      project: projectId,
    }
  )

  if(!task) {
    throw new ApiError(404, "Task not found")
  }

  return res.status(200).json(new ApiResponse(200, {task}, "Task details fetched successfully"))

})//tested

const updateTask = asyncHandler(async (req, res) => {
  const {projectId, taskId} = req.params
  const {title, description, assignedTo, status, priority, dueDate} = req.body;

  const updateData = {};

  if(title !== undefined) updateData.title = title
  if(title !== undefined) updateData.description = description
  if(title !== undefined) updateData.assignedTo = assignedTo
  if(title !== undefined) updateData.status = status
  if(title !== undefined) updateData.priority = priority
  if(title !== undefined) updateData.dueDate = dueDate

  if(!(projectId && taskId)) {
    throw new ApiError(400, "Project id AND taskId is required")
  }

  const task = await Task.findByIdAndUpdate(
    taskId,
    {
      $set: updateData
    },
    {
      new: true,
    }
  )

  if(!task) {
    throw new ApiError(500, "task updation failed")
  }

  return res.status(200).json(new ApiResponse(200, {task}, "Task updated successfully"))
});//tested

const deleteTask = asyncHandler(async (req, res) => {
  const {projectId, taskId} = req.params;

  if(!(projectId, taskId)) {
    throw new ApiError(400, "Project id and task id is required")
  }

  const task = await Task.findOneAndDelete(
    {
      _id: taskId,
      project: projectId
    }
  )

  if(task) {
    throw new ApiError(500, "Task deletion failed")
  }

  return res.status(200).json(new ApiResponse(200, {}, "Task deletd successfully"))
});//tested

const createSubtask = asyncHandler(async (req, res) => {
  const {taskId, projectId} = req.params;
  const {title, description} = req.body

  if(!(taskId && projectId)) {
    throw new ApiError(400, "Task id and Project id is required")
  }

  if(!(title && description)) {
    throw new ApiError(400, "Title && Description id required")
  }

  const task = await Task.findOne({
    _id: taskId,
    project: projectId,
  });

  if (!task) {
    throw new ApiError(404, "Task not found in this project");
  }
  const subtask = await Subtask.create(
    {
      title,
      task: taskId,
      description,
      createdBy: req.user?._id
    }
  )

  if(!subtask) {
    throw new ApiError(500, "Subtask creation failed")
  }

  return res.status(200).json(new ApiResponse(200, {subtask}, "Substak created successfully"))
});//tested

const updateSubtask = asyncHandler(async (req, res) => {
  const {projectId, subtaskId, taskId} = req.params
  const {title, description, assignedTo, status, dueDate} = req.body

  if(!(projectId && subtaskId)) {
    throw new ApiError(400, "Project Id and Subtask id is required")
  }

  const project = await Project.findById(projectId);
  if(!project) {
    throw new ApiError(404, "Project not found")
  }

  const task = await Task.findOne(
    {
      _id: taskId,
      project: projectId
    }
  );
  if(!task) {
    throw new ApiError(404, "Task  not found")
  }
  const updateData = {}

  if(title !== undefined) updateData.title = title
  if(assignedTo !== undefined) updateData.assignedTo = assignedTo
  if(status !== undefined) updateData.status = status
  if(description !== undefined) updateData.description = description
  if(dueDate !== undefined) updateData.dueDate = dueDate

  const subtask = await Subtask.findOneAndUpdate(
    {
      _id: subtaskId,
      task: taskId
    },
    {
      $set: updateData,
    },
    {
      new: true
    }
  )

  if(!subtask) {
    throw new ApiError(404, "Subtask not found")
  }

  return res.status(200).json(new ApiResponse(200, {subtask}, "Subtask updated successfully"))

})//tested

const deleteSubtask = asyncHandler(async (req, res) => {
  const { projectId, taskId, subtaskId } = req.params;

  if (!(projectId && taskId && subtaskId)) {
    throw new ApiError(400, "Project Id, Task Id and Subtask id are required");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const task = await Task.findOne({
    _id: taskId,
    project: projectId
  });

  if (!task) {
    throw new ApiError(404, "Task not found in this project");
  }

  const subtask = await Subtask.findOneAndDelete({
    _id: subtaskId,
    task: taskId
  });

  if (!subtask) {
    throw new ApiError(404, "Subtask not found in this task");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Subtask deleted successfully"));
});//tested

export {
  listProjectTask,
  createTask,
  taskDetails,
  updateTask,
  deleteTask,
  createSubtask,
  updateSubtask,
  deleteSubtask
}