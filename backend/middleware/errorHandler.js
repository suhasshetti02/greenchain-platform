function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || "Unexpected server error";

  if (process.env.NODE_ENV !== "test") {
    console.error("[GreenChain] Error:", {
      status,
      message,
      stack: err.stack,
    });
  }

  res.status(status).json({
    error: message,
    ...(err.details ? { details: err.details } : {}),
  });
}

module.exports = errorHandler;


