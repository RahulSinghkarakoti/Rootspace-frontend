export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'object' && error !== null) {
    const maybeAxiosError = error as {
      response?: {
        data?: {
          message?: string
          error?: string
        }
      }
      message?: string
    }

    return (
      maybeAxiosError.response?.data?.message ||
      maybeAxiosError.response?.data?.error ||
      maybeAxiosError.message ||
      fallback
    )
  }

  if (typeof error === 'string' && error) {
    return error
  }

  return fallback
}
