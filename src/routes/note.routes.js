import { Router } from "express"
import { createNote, deleteNote, getNoteDetails, listProjectNotes, updateNote } from "../controllers/Note.controllers.js";
import roleBasedAuthorize from "../middlewares/RBAC.middlewares.js";
import { auth } from "../middlewares/auth.middlewares.js";

const router = Router()

router.route('/:projectId').get(auth, roleBasedAuthorize(['admin', 'project-admin', 'member']), listProjectNotes);
router.route('/:projectId').post(auth, roleBasedAuthorize(['admin']), createNote);
router.route('/:projectId/n/:noteId').get(auth, roleBasedAuthorize(['admin', 'project-admin', 'member']), getNoteDetails);
router.route('/:projectId/n/:noteId').put(auth, roleBasedAuthorize(['admin']), updateNote);
router.route('/:projectId/n/:noteId').delete(auth, roleBasedAuthorize(['admin']), deleteNote);

export default router