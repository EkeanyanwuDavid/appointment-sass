import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/index";

type AsyncController = (
  req: Request | AuthRequest,
  res: Response,
  next: NextFunction,
) => Promise<void>;

const asyncHandler = (fn: AsyncController) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default asyncHandler;
