import express from "express";
const defaultRoutes = express.Router();

defaultRoutes.get("/", function(req, res, next) {
	return res.json({d : "Working User API"});
});

import userRoute from "./user.js";
defaultRoutes.use("/auth", userRoute);

export default defaultRoutes;
