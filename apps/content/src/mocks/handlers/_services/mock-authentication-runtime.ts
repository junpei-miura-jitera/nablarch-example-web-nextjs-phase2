import type { ApiLoginUser } from ':/utils/api/authentication'
import { readMockCsvRows } from './mock-csv'

const DEFAULT_PASSWORD = 'pass123-'

export type MockLoginCredential = {
  loginId: string
  userPassword: string
}

const userRows = readMockCsvRows(import.meta.url, '../authentication/_data/USERS.csv')
const userNameById = new Map(userRows.map((row) => [Number(row.USER_ID), row.KANJI_NAME]))

const systemAccountRows = readMockCsvRows(
  import.meta.url,
  '../authentication/_data/SYSTEM_ACCOUNT.csv',
)

export const mockLoginUsers: ApiLoginUser[] = systemAccountRows.map((row) => ({
  userId: Number(row.USER_ID),
  kanjiName: userNameById.get(Number(row.USER_ID)) ?? '',
  admin: row.ADMIN_FLAG === '1',
  lastLoginDateTime: row.LAST_LOGIN_DATE_TIME,
}))

const mockLoginUsersByUserId = new Map(mockLoginUsers.map((user) => [user.userId, user]))
const mockLoginUsersByLoginId = new Map(
  systemAccountRows.map((row) => [
    row.LOGIN_ID,
    mockLoginUsersByUserId.get(Number(row.USER_ID)) ?? {
      userId: Number(row.USER_ID),
      kanjiName: '',
      admin: row.ADMIN_FLAG === '1',
      lastLoginDateTime: row.LAST_LOGIN_DATE_TIME,
    },
  ]),
)

export const validMockCredentials: readonly MockLoginCredential[] = systemAccountRows.map(
  (row) => ({
    loginId: row.LOGIN_ID,
    userPassword: DEFAULT_PASSWORD,
  }),
)

export const defaultMockLoginUser = mockLoginUsers.find((user) => user.admin) ?? mockLoginUsers[0]

if (!defaultMockLoginUser) {
  throw new Error('Mock login users could not be loaded.')
}

export const mockLoginUserFixtures = {
  admin: mockLoginUsers.find((user) => user.admin) ?? defaultMockLoginUser,
  member: mockLoginUsers.find((user) => !user.admin) ?? defaultMockLoginUser,
} as const

export function findMockLoginUserByLoginId(loginId: string): ApiLoginUser | null {
  return mockLoginUsersByLoginId.get(loginId) ?? null
}
