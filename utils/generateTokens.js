import jwt from "jsonwebtoken";
import UserToken from "../models/UserToken.js";
import authConfig from "../config/auth.js";

const generateTokens = async (user) => {
    try {
        const payload = { 
            userId: user._id, 
            userName: user.userName, 
            time : new Date().getTime(),
        };

        const accessToken = jwt.sign(
            payload,
            authConfig.accessTokenSecret,
            { expiresIn: authConfig.jwtExpiration }
        );
        
        const refreshToken = jwt.sign(
            payload,
            authConfig.refreshTokenSecret,
            { expiresIn: authConfig.jwtRefreshExpiration }
        );

        const userToken = await UserToken.findOne({ userId: user._id });
        if (userToken) await userToken.deleteOne();

        await new UserToken({ userId: user._id, token: refreshToken }).save();
        return Promise.resolve({ accessToken, refreshToken });
    } catch (err) {
        return Promise.reject(err);
    }
};

export default generateTokens;