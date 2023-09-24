import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../../db/models/user";
import { JWT_SECRET } from "../../lib/constants";
import { AuthenticatedRequest } from "../../types";

export const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).send({
      message: "No auth token present",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Authentication failed",
      });
    }
    req.userId = (decoded as JwtPayload).id;
    next();
  });
};

export const checkExistingUsernameOrEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email } = req.body;

    // Username
    let user = await User.findOne({
      where: {
        username,
      },
    });
    if (user) {
      return res.status(409).send({
        message: "Username already exists",
      });
    }

    // Email
    user = await User.findOne({
      where: {
        email,
      },
    });
    if (user) {
      return res.status(409).send({
        message: "Email is already in use",
      });
    }

    next();
  } catch (error) {
    return res.status(500).send({
      message: "Unable to validate username or email!",
    });
  }
};