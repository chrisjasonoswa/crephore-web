import type { GetMeResponse, LoginRequest, LoginResponse, SignupRequest, SignupResponse } from './auth.type'
import type { ApiResponse } from '~/types/api'
import { get, post } from '~/lib/axios'

export const AuthApiRoutes = {
  signup: '/auth/signup',
  login: '/auth/login',
  logout: '/auth/logout',
  getMe: '/auth/me',
}

export const signup = (payload: SignupRequest) => {
  return post<ApiResponse<SignupResponse>>(AuthApiRoutes.signup, payload)
}

export const login = (payload: LoginRequest) => {
  return post<ApiResponse<LoginResponse>>(AuthApiRoutes.login, payload)
}

export const logout = () => {
  return post<ApiResponse<null>>(AuthApiRoutes.logout)
}

export const getMe = () => {
  return get<ApiResponse<GetMeResponse>>(AuthApiRoutes.getMe)
}
