// backend/src/utils/catchAsync.js
/**
 * Higher-order function that wraps async route handlers
 * Automatically catches errors and passes them to error handling middleware
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Express middleware function
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;