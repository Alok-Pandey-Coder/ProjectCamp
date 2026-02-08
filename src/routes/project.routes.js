import { Router } from "express"
import { auth } from "../middlewares/auth.middlewares.js";
import roleBasedAuthorize from "../middlewares/RBAC.middlewares.js"
import { addProjectMember, createProject, deleteProjectById, getProjectById, listProjectMembers, listUserProject, removeMember, updateMemberRole, updateProjectById } from "../controllers/project.controllers.js";

const router = Router()

router.route("/").get(auth, listUserProject);
router.route('/').post(auth, roleBasedAuthorize(['admin']), createProject);
router.route('/:projectId').get(auth, roleBasedAuthorize(['admin', 'project-admin', 'member']), getProjectById);
router.route('/:projectId').put(auth, roleBasedAuthorize(['admin']), updateProjectById);
router.route('/:projectId').delete(auth, roleBasedAuthorize(['admin']), deleteProjectById);
router.route('/:projectId/members').get(auth,roleBasedAuthorize(['admin', 'project-admin', 'member']), listProjectMembers);
router.route('/:projectId/members').post(auth,roleBasedAuthorize(['admin']), addProjectMember);
router.route('/:projectId/members/:userId').put(auth, roleBasedAuthorize(['admin']), updateMemberRole);
router.route('/:projectId/members/:userId').delete(auth, roleBasedAuthorize(['admin']), removeMember);

export default router