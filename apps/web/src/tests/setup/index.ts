/**
 * Vitest グローバルセットアップ。
 *
 * Next.js のサーバーサイドモジュールをモックする。
 */
import { vi } from "vitest";

// next/headers モック
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

// next/cache モック
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));
