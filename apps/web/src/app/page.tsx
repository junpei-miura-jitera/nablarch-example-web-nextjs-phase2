import { redirect } from "next/navigation";

/**
 * ルートページ。
 *
 * `/projects` へリダイレクトする。
 */
export default function HomePage() {
  redirect("/projects");
}
