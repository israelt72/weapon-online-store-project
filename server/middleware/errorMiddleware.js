// errorMiddleware.js
const notFound = (req, res, next) => {
  res.status(404).send({
    error: 'Not Found',
  });
};

const errorHandler = (err, req, res, next) => {
  // Log the error (consider integrating a logging library for better management)
  console.error(err.stack);

  // If `err` has a `statusCode`, use that; otherwise, default to 500
  res.status(err.statusCode || 500).send({
    error: err.message || 'Internal Server Error',
  });
};

export { notFound, errorHandler };


