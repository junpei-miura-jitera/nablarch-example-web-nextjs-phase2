import { authHandlers } from "./handlers/auth";
import { clientHandlers } from "./handlers/client";
import { projectHandlers } from "./handlers/project";
import { projectBulkHandlers } from "./handlers/project-bulk";
import { projectUploadHandlers } from "./handlers/project-upload";

export const handlers = [
  ...authHandlers,
  ...clientHandlers,
  ...projectHandlers,
  ...projectBulkHandlers,
  ...projectUploadHandlers,
];
