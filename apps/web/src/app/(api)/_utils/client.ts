/**
 * Client Component 向け fetch ラッパー。
 *
 * 相対 URL で fetch するため、baseUrl は不要。
 * ブラウザの Cookie は自動的に送信される。
 */

// ---------------------------------------------------------------------------
// ApiError
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`API error ${status}`);
    this.name = "ApiError";
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildUrl(path: string, params?: Record<string, unknown>): string {
  if (!params) return path;

  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        qs.append(key, String(v));
      }
    } else {
      qs.append(key, String(value));
    }
  }
  const query = qs.toString();
  return query ? `${path}?${query}` : path;
}

async function parseJsonOrNull(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await parseJsonOrNull(res);
    throw new ApiError(res.status, body);
  }
  return (await parseJsonOrNull(res)) as T;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function apiGet<T>(
  path: string,
  params?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(buildUrl(path, params), {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return handleResponse<T>(res);
}

export async function apiPost<T>(
  path: string,
  body: unknown,
): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  return handleResponse<T>(res);
}

/**
 * GET でバイナリ (Blob) を取得する。
 * ダウンロード用途など、JSON 以外のレスポンスが必要なケースで使う。
 */
export async function apiGetBlob(
  path: string,
  params?: Record<string, unknown>,
): Promise<Response> {
  const res = await fetch(buildUrl(path, params), {
    method: "GET",
  });
  if (!res.ok) {
    const body = await parseJsonOrNull(res);
    throw new ApiError(res.status, body);
  }
  return res;
}

/**
 * multipart/form-data で POST する。
 * ファイルアップロード用途で使う。
 */
export async function apiPostFormData<T>(
  path: string,
  formData: FormData,
): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    body: formData,
  });
  return handleResponse<T>(res);
}
