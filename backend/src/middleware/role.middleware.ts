import { Response, NextFunction, RequestHandler } from "express";
import { IUser } from "../models/User";

const authorize = (...roles: string[]): RequestHandler => {
  return (req, res, next) => {
    const user = req.user as IUser;

    if (!user) {
      res.status(401).json({ success: false, message: "Not authorized" });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: `Role ${user.role} is not authorized to access this route`,
      });
      return;
    }

    next();
  };
};

export default authorize;
