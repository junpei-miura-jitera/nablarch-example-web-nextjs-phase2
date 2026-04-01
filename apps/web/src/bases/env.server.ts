/**
 * サーバー専用環境変数定義。
 *
 * サーバーサイドでのみ使用する環境変数。
 * API の Base URL など、サーバーサイド fetch に必要な設定を管理する。
 */
import { z } from "zod";

/**
 * Java API (MSW) のベース URL。
 * サーバーサイド fetch で使用する。デフォルト: http://localhost:9090
 */
export const API_BASE_URL = /*#__PURE__*/ z
  .string()
  .default("http://localhost:9090")
  .parse(process.env.API_BASE_URL);
