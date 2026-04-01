/**
 * スタンドアロン HTTP モックサーバー。
 *
 * @mswjs/http-middleware を使い、MSW ハンドラーを実際の HTTP サーバーとして起動する。
 * Next.js の fetch パッチに依存せず、サーバー側の fetch を確実にインターセプトする。
 */
import { createServer } from "@mswjs/http-middleware";
import { handlers } from "./handlers";

const PORT = Number(process.env.MOCK_SERVER_PORT ?? 9090);

const app = createServer(...handlers);

app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
});
