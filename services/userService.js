import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import generateTokens from "../utils/generateTokens.js";
import { 
    signUpBodyValidation,
    logInBodyValidation,
    refreshTokenBodyValidation,
    existCheckBodyValidation,
} from "../utils/validationSchema.js";
import verifyRefreshToken from "../utils/verifyRefreshToken.js";
import authConfig from "../config/auth.js";

const registerUser = async (req, res) => {
    console.log(req.body);
    
    const { error } = signUpBodyValidation(req.body);
    if (error) {
        return res.apiError(error.details[0].message);
    }        

    const uForEmail = await User.findOne({
        email : req.body.email.toLowerCase()
    });
    if (uForEmail)
        return res.apiError("This Email is already registered!");

    const uForName = await User.findOne({
        userName : req.body.userName.toLowerCase()
    })
    if (uForName)
        return res.apiError("This Username is already registered!");

    const salt = await bcrypt.genSalt(authConfig.salt);
    const hashPasswod = await bcrypt.hash(req.body.password, salt);
    const user = await User({ ...req.body, password: hashPasswod }).save();

    return res.apiSuccess({
        id: user._id,
        userName : user.userName,
        email : user.email,
    });
};

const loginUser =  async (req, res) => {
    try {
        const { error } = logInBodyValidation(req.body);
        if (error)
            return res.apiError(error.details[0].message);

        const user = await User.findOne({ userName: req.body.userName });
        if (!user) 
            return res.apiError("Unexisting username");

        const verifiedPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );

        if (!verifiedPassword)
            return res.apiError("Invalid Password");

        const { accessToken, refreshToken } = await generateTokens(user);

        req.app.get("eventEmitter").emit('login', 'Test event emitter');

        return res.apiSuccess({
            id: user._id,
            userName : user.userName,
            token: {
                accessToken,
                refreshToken,
                expiryTime: authConfig.jwtExpiration
            },
        })
    } catch (err) {
        console.log(err);
        return res.apiError("Internal Server Error");
    }
};

const refreshToken = async (req, res) => {
    try {
        const { error } = refreshTokenBodyValidation(req.body);
        if (error)
            return res.apiError(error.details[0].message);

            verifyRefreshToken(req.body.refreshToken)
            .then(({ tokenDetails }) => {
                generateTokens({
                    _id: tokenDetails._id,
                    userName: tokenDetails.name,
                })
                .then(({ accessToken, refreshToken}) => {
                    return res.apiSuccess({
                        id: tokenDetails._id,
                        userName : tokenDetails.name,
                        token: {
                            accessToken,
                            refreshToken,
                            expiryTime: authConfig.jwtExpiration
                        },
                    })
                })
                .catch((err) => {
                    console.log(err);
                    res.apiError(err.message);
                });;
            })
            .catch((err) => {
                console.log(err);
                res.apiError(err.message);
            });
    } catch (err) {
        console.log(err);
        return res.apiError("Internal Server Error");
    }
};

const existUser = async (req, res) => {
    try {
        const { error } = existCheckBodyValidation(req.body);
        if (error) 
            return res.apiError(error.details[0].message);

        const user = await User.findOne({ userName: req.body.userName.toLowerCase() });
        if (!user) {
            return res.apiError("Unexisting userName");
        }

        return res.apiSuccess({
            id: user._id,
            userName: user.userName
        });
    } catch (err) {
        console.log(err);
        return res.apiError("Internal Server Error");
    }
};

export {
    registerUser,
    loginUser,
    refreshToken,
    existUser,
};