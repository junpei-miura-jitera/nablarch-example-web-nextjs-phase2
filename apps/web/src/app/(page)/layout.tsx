import type { Metadata } from 'next'
import Providers from '../_fragments/providers'

/**
 * ページタイトルなどのメタデータ。
 */
export const metadata: Metadata = {
  title: 'プロジェクト管理システム',
}

/**
 * 移行元 JSP の CSS 読み込み順序を再現するレイアウト。
 *
 * Header.jsp では以下の順序で読み込む。
 *
 * 1. Bootstrap 5 CDN
 * 2. Google Fonts / Material Icons
 * 3. Jquery-ui.css（ローカル）
 * 4. Common.css（ローカル）
 * 5. Project.css（ローカル）
 *
 * Common.css が Bootstrap を上書きするため、この順序は必須。 Next.js の CSS import だと順序が保証されないため、全て link タグで制御する。
 */
export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      {/* eslint-disable @next/next/no-css-tags, @next/next/google-font-display, @next/next/no-page-custom-font -- 移行元 JSP の CSS 読み込み順序を維持 */}
      <head>
        {/* 1. Bootstrap CSS (CDN) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
          crossOrigin="anonymous"
        />
        {/* 2. Google Fonts */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700"
        />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        {/* 3-5. Local CSS (Bootstrap の後に読み込んで上書きする) */}
        <link rel="stylesheet" href="/styles/jquery-ui.css" />
        <link rel="stylesheet" href="/styles/common.css" />
        <link rel="stylesheet" href="/styles/project.css" />
      </head>
      {/* eslint-enable @next/next/no-css-tags, @next/next/google-font-display, @next/next/no-page-custom-font */}
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
