import { ProjectHeaderLayout } from "./_layouts/project-header-layout";

/**
 * プロジェクト画面共通レイアウト。
 *
 * ヘッダー・フッターで子ページをラップする。
 * サイドメニューの有無は各ページコンポーネント側で制御する。
 */
export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProjectHeaderLayout>{children}</ProjectHeaderLayout>;
}
