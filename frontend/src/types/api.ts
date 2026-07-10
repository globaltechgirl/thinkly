export interface ApiResponse<T = undefined> {
  data: T;
  statusCode: number;
  message: boolean;
  status?: string;
}

export type Param = string | number | boolean | null | undefined;

export interface BaseParams {
  [key: string]: Param;
}

export interface PaginationMeta {
  page: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse {
  meta?: PaginationMeta;
  page?: number;
  total?: number;
  totalPages?: number;
}
