export const DB_NAME = "ProjectManagement"

export const userRoleEnum = {
  ADMIN: "admin",
  PROJECT_ADMIN: "project-admin",
  MEMBER: "member",
  VIEWER: "viewer"
}

export const userRoleEnumValues = Object.values(userRoleEnum)

export const taskStatusEnum = {
  TODO: "todo",
  IN_PROGRESS: "in-progress",
  DONE: "done"
}

export const taskStatusEnumValues = Object.values(taskStatusEnum)