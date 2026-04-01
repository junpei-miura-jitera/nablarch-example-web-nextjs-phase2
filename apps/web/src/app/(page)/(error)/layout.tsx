import { ProjectHeaderLayout } from "../projects/_layouts/project-header-layout";

/**
 * エラーページ用レイアウト。
 *
 * 元の JSP ではエラーページにも menu.jsp / header.jsp / footer.jsp を含むため、
 * ProjectHeaderLayout でヘッダー・ナビゲーション・フッターをラップする。
 */
export default function ErrorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProjectHeaderLayout>{children}</ProjectHeaderLayout>;
}
