import jwt from "jsonwebtoken";
import authConfig from "../config/auth.js";

const { TokenExpiredError } = jwt;

const authMiddleware = (req, res, next) => {
    // check header or url parameters or post parameters for token
    const nonSecurePaths = [
      '/',
      '/auth/exist',
      '/auth/login', 
      '/auth/register',
      '/auth/refresh',
      '/socket.io'
    ];

    if (nonSecurePaths.includes(req.path)) 
      return next();

    if (req.path.substring(1,7) == "public" || req.path.substring(1,7) == "upload")
      return next();

    var token = req.body.token || 
      req.query.token || 
      req.headers['Authorization'] || 
      req.headers['authorization'];

    // decode token
    try {
        if (token && token.split(" ").length == 2 && token.split(" ")[1]) {
          // verifies secret and checks exp
          token = token.split(" ")[1];

          jwt.verify(token, authConfig.accessTokenSecret, (error, decoded) => {
            if (error) {
              if (error instanceof TokenExpiredError) {
                return res.apiError("Unauthorized! Access Token was expired!");
              } else {            
                return res.apiError("Unauthorized!");
              }
            }

            req.jwtPayload = decoded;
            next();
          });
        } else {
          return res.apiError("No token provided!");
        }
    } catch (error) {
      console.log(error);
      return res.apiError(error.message);
    }
}

export default authMiddleware;