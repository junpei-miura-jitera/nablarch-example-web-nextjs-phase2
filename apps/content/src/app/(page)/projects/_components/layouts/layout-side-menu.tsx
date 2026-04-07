import { ProjectSearchSideMenu } from '../../_fragments/project-search-side-menu'

/**
 * sidemenu.jsp をそのまま React 化したサイドメニュー部品。
 *
 * children を抱えず、各 page.tsx が wrapper 構造を明示的に組み立てる。
 */
export function LayoutSideMenu({ projectNameError }: { projectNameError?: string }) {
  return <ProjectSearchSideMenu projectNameError={projectNameError} />
}
