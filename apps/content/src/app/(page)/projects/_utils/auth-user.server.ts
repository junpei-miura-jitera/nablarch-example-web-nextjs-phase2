import { apiLoginUserSchema, type ApiLoginUser } from ':/utils/api/authentication'
import { API_BASE_URL } from ':/bases/env.server'

/**
 * Mock server の認証状態から現在ユーザーを取得する。
 */
export async function getAuthUserServer(): Promise<ApiLoginUser | null> {
  const res = await fetch(`${API_BASE_URL}/api/authentication/index`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) return null

  const data = await res.json()
  const parsed = apiLoginUserSchema.safeParse(data)
  return parsed.success ? parsed.data : null
}
