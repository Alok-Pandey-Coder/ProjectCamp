import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Note } from '../models/notes.model.js';
import { Project } from '../models/project.model.js';
import mongoose from 'mongoose';

const listProjectNotes = asyncHandler(async (req, res) => {
  const { projectId } = req.params

  if (!projectId) {
    throw new ApiError(400, "Project id is required")
  }

  // optional but recommended
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id")
  }

  const notes = await Note.find({ project: projectId })
    .populate("project")
    .sort({ createdAt: -1 })

  if (!notes || notes.length === 0) {
    throw new ApiError(404, "No notes found for this project")
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      notes,
      "Project notes fetched successfully"
    )
  )
})//tested

const createNote = asyncHandler(async (req, res) => {
  const {projectId} = req.params

  const {title, content} = req.body

  if(!projectId) {
    throw new ApiError(400, "Project id is required")
  }

  if(!(title && content)) {
    throw new ApiError(400, "Title, content both are required")
  }

  const note = await Note.create(
    {
      title,
      content,
      project: projectId,
      createdBy: req.user?._id
    }
  )

  if(!note) {
    throw new ApiError(500, "Note creation failed")
  }

  return res.status(200).json(new ApiResponse(200, {note}, "Note created successfully"))
});//tested

const getNoteDetails = asyncHandler(async (req, res) => {
  const {projectId, noteId} = req.params

  if(!(projectId && noteId)) {
    throw new ApiError(400, "Project id and Note id is required")
  }
  const project = await Project.findById(projectId) ;

  if(!project) {
    throw new ApiError(404, "Project not found")
  }

  const note = await Note.findOne(
    {
      _id: noteId,
      project: projectId
    }
  )

  if(!note) {
    throw new ApiError(404, "Note not found ")
  }

  return res.status(200).json(new ApiResponse(200, {note}, "Note fetched successfully"))
});//tested

const updateNote = asyncHandler(async (req, res) => {
  const {projectId, noteId} = req.params
  const {title, content, isPinned, isDeleted} = req.body;

  if(!(projectId && noteId)) {
    throw new ApiError(400, "Project id and Note id is required")
  }

  const project = await Project.findById(projectId) ;

  if(!project) {
    throw new ApiError(404, "Project not found")
  }

  const updateNote = {};

  if(title != undefined) updateNote.title = title;
  if(content != undefined) updateNote.content = content;
  if(isPinned != undefined) updateNote.isPinned = isPinned;
  if(isDeleted != undefined) updateNote.isDeleted = isDeleted;

  const note =  await Note.findOneAndUpdate(
    {
      project: projectId,
      _id: noteId
    }, 
    {
      $set: updateNote,
    },
    {
      new: true
    }
  )

  if(!note) {
    throw new ApiError(500, "Note updation failed or Note not found")
  }

  return res.status(200).json(new ApiResponse(200, {note}, "Note updated successfully"))
});//tested

const deleteNote = asyncHandler(async (req, res) => {
  const {projectId, noteId} = req.params

  if(!(projectId && noteId)) {
    throw new ApiError(400, "Project Id and Note Id is required")
  }


  const project = await Project.findById(projectId) ;

  if(!project) {
    throw new ApiError(404, "Project not found")
  }

  const note = await Note.findOneAndDelete(
    {
      _id: noteId,
      project: projectId
    }
  )

  if(!note) {
    throw new ApiError(500, "Note deletion failed")
  }

  return res.status(200).json(new ApiResponse(200, {}, "Note deleted successfully"))
});




export {
  listProjectNotes,
  createNote,
  getNoteDetails,
  updateNote,
  deleteNote
}