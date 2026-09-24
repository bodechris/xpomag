export class AccountApiError extends Error {
  status?: number
  code?: string
  detail?: unknown

  constructor(
    message: string,
    options?: {
      status?: number
      code?: string
      detail?: unknown
    },
  ) {
    super(message)
    this.name = "AccountApiError"
    this.status = options?.status
    this.code = options?.code
    this.detail = options?.detail
  }
}

export async function accountFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const normalized = path.startsWith("/") ? path : `/${path}`

  const response = await fetch(`/api/account${normalized}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  })

  const text = await response.text()
  let data: any = {}

  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { message: text }
  }

  if (!response.ok) {
    throw new AccountApiError(
      data?.message ||
        data?.error ||
        `${response.status} ${response.statusText}`,
      {
        status: response.status,
        code: data?.code || data?.error,
        detail: data,
      },
    )
  }

  return data as T
}
