import { Router } from "express";
import asyncHandler from "express-async-handler";

const userRoute = Router();

import { 
	registerUser,
	loginUser,
	refreshToken,
	existUser,
} from "../services/userService.js";

// API routes dont required any auth in headers (check auth middleware)
userRoute.post("/login", asyncHandler((req, res, next) => { return loginUser(req, res); }));
userRoute.post("/register", asyncHandler((req, res, next) => { return registerUser(req, res); }));
userRoute.post("/refresh", asyncHandler((req, res, next) => { return refreshToken(req, res); }));
userRoute.post("/exist", asyncHandler((req, res, next) => { return existUser(req, res); }));

// API routes required auth in headers  (check auth middleware)

userRoute.post("/me", asyncHandler((req, res, next) => { return existUser(req, res); }));

export default userRoute;
