import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiGet } from ":/app/(api)/_utils/server";
import type { ProjectDto } from "../../_schemas/project.types";

export const metadata: Metadata = { title: "プロジェクト変更画面" };
import { parseProjectIdFromRouteSegment } from "../../_utils/route-params";
import { EditProjectForm } from "./edit-project-form";
import { ProjectSidemenuLayout } from "../../_layouts/project-sidemenu-layout";

/**
 * プロジェクト変更画面。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/update.jsp
 */
export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = parseProjectIdFromRouteSegment(id);
  if (projectId === null) notFound();

  const project = await apiGet<ProjectDto>("/api/project/show", {
    projectId: String(projectId),
  });

  return <ProjectSidemenuLayout><EditProjectForm project={project} projectId={projectId} /></ProjectSidemenuLayout>;
}
