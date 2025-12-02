class ApiResponse {
  constructor(status, message, data = null, meta = null) {
    this.status = status
    this.message = message
    this.data = data
    if (meta) this.meta = meta
  }
}

const successResponse = (message, data = null, meta = null) => {
  return new ApiResponse(true, message, data, meta)
}

const errorResponse = (message, data = null) => {
  return new ApiResponse(false, message, data)
}

module.exports = {
  successResponse,
  errorResponse,
}
