/**
 * ログインフォームの Zod スキーマ。
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/form/LoginForm.java
 */
import { z } from "zod";

export const loginFormSchema = z.object({
  loginId: z.string().min(1).max(20).regex(/^[0-9]*$/, "半角数字で入力してください"),
  userPassword: z.string().min(1),
});

export type LoginForm = z.infer<typeof loginFormSchema>;
