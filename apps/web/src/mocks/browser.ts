import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

/**
 * ブラウザ用 MSW Worker。
 */
export const worker = setupWorker(...handlers);
