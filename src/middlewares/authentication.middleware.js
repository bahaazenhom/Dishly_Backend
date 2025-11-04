import User from "../models/user.model.js";
import { verifyAccessToken } from "../utils/jwt.util.js";
import { ErrorClass } from "../utils/error.util.js";

export const auth = () => {
  return async (req, res, next) => {
    // destruct token from headers
    const { authorization } = req.headers;

    // print headers for debugging (masking token)
    console.log("headers:", JSON.stringify(req.headers, null, 2));
    
    const auth = req.headers.authorization;
    // check if token is exists 
    if (!authorization) {
      return next(
        new ErrorClass("Token is required", 404, "Token is required")
      );
    } 
    
    // check if token starts with prefix
    if (!authorization.startsWith(process.env.PREFIX_SECRET)) {
      return next(new ErrorClass("Invalid token", 400, "Invalid token"));
    }
    // retrieve original token after adding the prefix
    const originalToken = authorization.split(" ")[1];

    // verify token
    const data = verifyAccessToken(originalToken);
    // check if token payload has userId
    if (!data?.userId) {
      return next(
        new ErrorClass("Invalid token payload", 400, "Invalid token payload")
      );
    }
    // find user by userId
    const isUserExists = await User.findById(data?.userId);
    if (!isUserExists) {
      return next(new ErrorClass("User not found", 404, "User not found"));
    }
    // add the user data in req object
    req.authUser = isUserExists;
    next();
  };
};
