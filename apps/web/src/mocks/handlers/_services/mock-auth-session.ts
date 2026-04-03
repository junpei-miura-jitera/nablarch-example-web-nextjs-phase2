import type { ApiLoginUser } from ':/shared/api/authentication'
import { findMockLoginUserByLoginId, validMockCredentials } from './mock-authentication-runtime'

export function authenticateMockUser(loginId: string, userPassword: string): ApiLoginUser | null {
  const match = validMockCredentials.find(
    (credential) => credential.loginId === loginId && credential.userPassword === userPassword,
  )
  if (!match) return null
  return findMockLoginUserByLoginId(match.loginId)
}

export const authenticate = authenticateMockUser
