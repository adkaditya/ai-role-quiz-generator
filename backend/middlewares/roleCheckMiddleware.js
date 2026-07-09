export const roleCheckMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!req.user.role) {
    return res.status(401).json({
      success: false,
      message: "Role not assigned",
    });
  }

  if (req.user.role.name !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only Admin can access this API",
    });
  }

  next();
};