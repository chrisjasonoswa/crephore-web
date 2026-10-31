// Response envelope returned by every crephore-backend endpoint.
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]> | null
}

// Query of a paged list endpoint (crephore-backend ApiPaginationRequestDto).
export interface ApiPaginatedRequest {
  searchKey?: string
  // Each entry is "field", "field:asc" or "field:desc", e.g. ['name:asc']
  sort: string[]

  page: number
  pageSize: number
}

export interface ApiPaginatedResponse<T> extends Omit<ApiResponse<T>, 'data'> {
  data: {
    items: T[]
    page: number
    pageSize: number
    totalCount: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}
