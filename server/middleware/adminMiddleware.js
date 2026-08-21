import AppError from '../utils/AppError.js';

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return next(new AppError('Access denied. Admin only.', 403));
  }
};

export default admin;
