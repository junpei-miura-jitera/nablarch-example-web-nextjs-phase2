import { apiLoginUserSchema, type ApiLoginUser } from ':/shared/api/authentication'

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:9090'

/**
 * mock server の認証状態から現在ユーザーを取得する。
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
