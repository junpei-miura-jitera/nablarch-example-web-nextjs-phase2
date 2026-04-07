/**
 * 共有環境変数定義。
 *
 * クライアント・サーバー双方で使用する環境変数。
 */
import { z } from 'zod'

/**
 * 環境の種類。
 */
export const ENVIRONMENT = /*#__PURE__*/ z
  .enum(['development', 'production', 'test'])
  .parse(process.env.NODE_ENV)
