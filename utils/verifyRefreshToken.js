import UserToken from "../models/UserToken.js";
import jwt from "jsonwebtoken";
import authConfig from "../config/auth.js";

const { TokenExpiredError } = jwt;

const verifyRefreshToken = (refreshToken) => {
    const privateKey = authConfig.refreshTokenSecret;

    return new Promise((resolve, reject) => {
        UserToken.findOne({ token: refreshToken })
        .then((userToken) => {
            if (!userToken)
                return reject({ error: true, message: "Invalid refresh token!" });

            jwt.verify(refreshToken, privateKey, (err, tokenDetails) => {
                if (err) {
                    console.log(err);

                    if (err instanceof TokenExpiredError) {
                        return reject({ message: "Refresh Token was expired!" });
                    }
                    
                    return reject({ error: true, message: "Invalid refresh token!" });
                }
                
                resolve({
                    tokenDetails,
                    error: false,
                    message: "Valid refresh token",
                });
            });
        })
        .catch((err) => {
            return reject({ error: true, message: err.message });
        });
    });
};

export default verifyRefreshToken;