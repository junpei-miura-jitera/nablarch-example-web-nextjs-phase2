/**
 * ログインユーザー fixture データ。
 *
 * Nablarch example アプリの SYSTEM_ACCOUNT テーブル初期データに対応。
 *
 * @see _references/nablarch-example-web/src/main/resources/data/data.sql
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/common/authentication/LoginUserPrincipal.java
 */

export type LoginUserPrincipal = {
  readonly userId: number;
  readonly kanjiName: string;
  readonly admin: boolean;
  readonly lastLoginDateTime: string;
};

export const userFixtures: Record<string, LoginUserPrincipal> = {
  admin: {
    userId: 105,
    kanjiName: "山田太郎",
    admin: true,
    lastLoginDateTime: "2025-03-28",
  },
  member: {
    userId: 106,
    kanjiName: "佐藤花子",
    admin: false,
    lastLoginDateTime: "2025-03-29",
  },
};

/**
 * Valid login credentials for the mock server.
 */
export const validCredentials = [
  { loginId: "10000001", userPassword: "pass123-" },
  { loginId: "10000002", userPassword: "pass123-" },
] as const;
