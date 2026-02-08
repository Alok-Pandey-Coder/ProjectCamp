class ApiError extends Error {
  constructor(
    statusCode, 
    data = null,
    message = "Something went wrong",
    success = false,
    stack = "",
  ) {
    super(message)

    this.statusCode = statusCode
    this.data = data
    this.success = success

    if(stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }

  }
}

export {ApiError};