/**
 * アプリ直下のルートレイアウト。
 *
 * 実体の HTML は `(page)/layout.tsx` に委譲する。
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
