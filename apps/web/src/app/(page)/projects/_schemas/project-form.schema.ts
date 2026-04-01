/**
 * プロジェクト登録フォームの Zod スキーマ。
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/form/ProjectForm.java
 */
import { z } from "zod";

export const projectFormSchema = z.object({
  projectName: z.string().min(1),
  projectType: z
    .enum(["development", "maintenance"])
    .describe(
      "プロジェクト種別を定義したEnum。 (source: ProjectType.java) — development: 新規開発PJ, maintenance: 保守PJ",
    ),
  projectClass: z
    .enum(["ss", "s", "a", "b", "c", "d"])
    .describe(
      "プロジェクト規模を定義したEnum。 (source: ProjectClass.java) — ss: SS, s: S, a: A, b: B, c: C, d: D",
    ),
  projectManager: z.optional(z.string()),
  projectLeader: z.optional(z.string()),
  clientId: z.string().min(1),
  clientName: z.optional(z.string()),
  projectStartDate: z.optional(z.string()),
  projectEndDate: z.optional(z.string()),
  note: z.optional(z.string()),
  sales: z.optional(z.string()),
  costOfGoodsSold: z.optional(z.string()),
  sga: z.optional(z.string()),
  allocationOfCorpExpenses: z.optional(z.string()),
});

export type ProjectForm = z.infer<typeof projectFormSchema>;
