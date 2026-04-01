/**
 * 認証モジュールの公開 API。
 */

export { authUserSchema, type AuthUser } from "./index.schema";

/**
 * 認証セッション Cookie の名前。
 */
export const AUTH_COOKIE_NAME = "auth_session";
