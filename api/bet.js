import { Router } from "express";
import asyncHandler from "express-async-handler";

const betRoute = Router();

import { 
	makeBet,
	cancelBet
} from "../services/betService.js";

// API routes dont required any auth in headers (check auth middleware)

// API routes required auth in headers  (check auth middleware)
betRoute.post("/make", asyncHandler((req, res, next) => { return makeBet(req, res); }));
betRoute.post("/cancel", asyncHandler((req, res, next) => { return cancelBet(req, res); }));

export default betRoute;
