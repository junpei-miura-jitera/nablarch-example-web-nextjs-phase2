/**
 * プロジェクト一括更新フォームの Zod スキーマ。
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/form/ProjectBulkForm.java
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/form/InnerProjectForm.java
 */
import { z } from "zod";

export const innerProjectFormSchema = z.object({
  projectId: z.string().min(1),
  projectName: z.string().min(1),
  projectType: z
    .enum(["development", "maintenance"])
    .describe(
      "プロジェクト種別を定義したEnum。 (source: ProjectType.java) — development: 新規開発PJ, maintenance: 保守PJ",
    ),
  projectStartDate: z.optional(z.string()),
  projectEndDate: z.optional(z.string()),
});

export type InnerProjectForm = z.infer<typeof innerProjectFormSchema>;

export const projectBulkFormSchema = z.object({
  projectList: z.array(innerProjectFormSchema).optional(),
});

export type ProjectBulkForm = z.infer<typeof projectBulkFormSchema>;
