const passport = require('passport');

// Middleware để xác thực token JWT
exports.protect = passport.authenticate('jwt', { session: false });

// Middleware để kiểm tra vai trò người dùng
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log(typeof req.user.role);
    console.log(roles);
    
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập chức năng này.',
      });
    }
    next();
  };
};

// Middleware để kiểm tra phong ban của người dùng
exports.authorizeDept = (...depts) => {
  return (req, res, next) => {
    console.log(typeof req.user.role);
    console.log(depts);

    if (!req.user || !depts.includes(req.user.dept)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập chức năng này.',
      });
    }
    next();
  };
};