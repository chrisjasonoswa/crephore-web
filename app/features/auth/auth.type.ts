// Mirrors crephore-backend Features/AppUsers/Dtos/AppUserDto.cs
export interface AuthUser {
  id: number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  timezone: string
  isSuperAdmin: boolean
  createdAt: string
}

export interface SignupRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  phoneNumber?: string
  // IANA timezone id, e.g. "Asia/Manila"
  timezone?: string
}

export type SignupResponse = AuthUser

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  sessionId: string
  accessTokenExpiresAt: string
  user: AuthUser
}

export type GetMeResponse = AuthUser
