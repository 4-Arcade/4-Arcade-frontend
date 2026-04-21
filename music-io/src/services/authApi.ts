const BASE_URL = 'https://four-arcade-backend.onrender.com'

export interface AuthUser {
  id: string
  nickname: string
  profileImg: string
}

export interface AuthData {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface AuthResponse {
  success: boolean
  data: AuthData | null
  error: {
    code: string
    message: string
    status: number
    details: Record<string, string>[]
  } | null
  path: string
}

async function request<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return data as T
}

export function register(email: string, password: string, nickname: string) {
  return request<AuthResponse>('/auth/register', { email, password, nickname })
}

export function login(email: string, password: string) {
  return request<AuthResponse>('/auth/login', { email, password })
}

export function refresh() {
  return request<AuthResponse>('/auth/refresh', {})
}
