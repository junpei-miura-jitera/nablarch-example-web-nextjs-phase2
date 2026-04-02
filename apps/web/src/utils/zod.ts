import { z } from 'zod'

/**
 * Zod のデフォルトエラーメッセージを日本語に設定する。
 *
 * アプリ初期化時に1回呼ぶ。
 */
export function setupZodJaLocale() {
  z.config(z.locales.ja())
}
