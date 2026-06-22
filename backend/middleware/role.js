// Usage: authorize('admin'), authorize('admin', 'teacher'), etc.
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role '${req.user ? req.user.role : 'unknown'}' is not permitted to perform this action.`,
      });
    }
    next();
  };
};

module.exports = { authorize };
