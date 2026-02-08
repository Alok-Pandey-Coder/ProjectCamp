import { Router } from "express"
import { createSubtask, createTask, deleteSubtask, deleteTask, listProjectTask, taskDetails, updateSubtask, updateTask } from "../controllers/task.controllers.js";
import { auth } from "../middlewares/auth.middlewares.js";
import roleBasedAuthorize from "../middlewares/RBAC.middlewares.js";

const router = Router()

router.route('/:projectId').get(auth, roleBasedAuthorize(['admin', 'project-admin', 'member']), listProjectTask);
router.route('/:projectId').post(auth, roleBasedAuthorize(['admin', 'project-admin']), createTask);
router.route('/:projectId/t/:taskId').get(auth, roleBasedAuthorize(['admin', 'project-admin', 'member']), taskDetails);
router.route('/:projectId/t/:taskId').put(auth, roleBasedAuthorize(['admin', 'project-admin']), updateTask);
router.route('/:projectId/t/:taskId').delete(auth, roleBasedAuthorize(['admin', 'project-admin']), deleteTask);
router.route('/:projectId/t/:taskId/subtasks').post(auth, roleBasedAuthorize(['admin', 'project-admin']), createSubtask);
router.route('/:projectId/:taskId/st/:subtaskId').put(auth, roleBasedAuthorize(['admin', 'project-admin']), updateSubtask);
router.route('/:projectId/:taskId/st/:subtaskId').delete(auth, roleBasedAuthorize(['admin', 'project-admin']), deleteSubtask);


export default router