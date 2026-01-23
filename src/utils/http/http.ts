/**
 * HTTP 模块统一导出
 *
 * @module utils/http/http
 */

// 请求取消
export {
  addPendingRequest,
  cancelAllPendingRequests,
  cancelRequestsByUrl,
  removePendingRequest
} from './cancel'
// 错误处理
export {
  type ErrorLogData,
  type ErrorResponse,
  handleError,
  HttpError,
  isHttpError,
  showError,
  showSuccess
} from './error'

// 核心功能
export { default as api, createHttpInstance, http, httpRaw } from './index'

export type {
  ApiRes,
  ExtendedAxiosRequestConfig,
  HttpInstanceConfig,
  PageQuery,
  PageRes
} from './index'

// 状态码
export { ApiStatus } from './status'
