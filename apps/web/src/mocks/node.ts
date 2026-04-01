import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/**
 * Node 用 MSW Server（テスト・SSR など）。
 */
export const server = setupServer(...handlers);
