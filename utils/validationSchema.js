import Joi from "joi";
import passwordComplexity from "joi-password-complexity";

const signUpBodyValidation = (body) => {
    const schema = Joi.object({
        userName: Joi.string().required().label("Username"),
        email: Joi.string().email().required().label("Email"),
        password: passwordComplexity().required().label("Password"),
    });
    return schema.validate(body);
};

const logInBodyValidation = (body) => {
    const schema = Joi.object({
        userName: Joi.string().required().label("Username"),
        password: Joi.string().required().label("Password"),
    });
    return schema.validate(body);
};

const refreshTokenBodyValidation = (body) => {
    const schema = Joi.object({
        refreshToken: Joi.string().required().label("Refresh Token"),
    });
    return schema.validate(body);
};

const existCheckBodyValidation = (body) => {
    const schema = Joi.object({
        userName: Joi.string().required().label("Username"),
    });
    return schema.validate(body);
};

export {
    signUpBodyValidation,
    logInBodyValidation,
    refreshTokenBodyValidation,
    existCheckBodyValidation,
};