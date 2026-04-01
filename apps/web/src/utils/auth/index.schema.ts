/**
 * 認証ユーザー情報の Zod スキーマ。
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/common/authentication/context/LoginUserPrincipal.java
 */
import { z } from "zod";

/**
 * LoginUserPrincipal のスキーマ定義。
 *
 * フィールド:
 *   - userId: ユーザー ID (0〜999999999)
 *   - kanjiName: 漢字氏名 (必須)
 *   - admin: 管理者フラグ
 *   - lastLoginDateTime: 最終ログイン日時 (ISO date)
 */
export const authUserSchema = z.object({
  userId: z.number().int().min(0).max(999999999),
  kanjiName: z.string().min(1),
  admin: z.boolean(),
  lastLoginDateTime: z.string().date(),
});

export type AuthUser = z.infer<typeof authUserSchema>;
