export const roleCheckMiddleware = (req, resp, next) => {
  if (req.user.role.name === "admin") {
    next();
  } else {
    resp.status(401).json({
      message: "Unauthorized, you dont have permission to access this api.",
    });
  }
};