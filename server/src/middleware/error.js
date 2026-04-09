export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  const status = res.statusCode !== 200 ? res.statusCode : 500;
  const method = req?.method || "UNKNOWN";
  const url = req?.originalUrl || req?.url || "UNKNOWN_URL";

  console.error(`[${method} ${url}]`, err);

  res.status(status).json({
    message: err.message || "Server error"
  });
};
