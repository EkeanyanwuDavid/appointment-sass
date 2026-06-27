import { Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/index";
import User from "../models/User";
import { env } from "../config/env";

const protect: RequestHandler = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res
        .status(401)
        .json({ success: false, message: "Not authorized, no token" });
      return;
    }

    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res
      .status(401)
      .json({ success: false, message: "Not authorized, invalid token" });
  }
};

export default protect;
