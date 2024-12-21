/**
 * Async error handler middleware
 */
export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    if (!res.headersSent) {
      next(error);
    }
  });
};
