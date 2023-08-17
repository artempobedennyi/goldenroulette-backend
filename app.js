import express from "express";
import helmet from "helmet";
import events from "events";
import { createServer } from "http";
import { Server } from "socket.io";
import gameConfig from "./config/game.js";

const app = express();

import { 
	configuration,
	dbConnect,
} from "./utils/configUtils.js";

// initial configuration
configuration(app);

// connect to mongodb
dbConnect();

// helmet helps you secure your Express apps by setting various HTTP headers 
app.use(helmet());

// used to parse the incoming requests with JSON payloads and is based upon the bodyparser
app.use(express.json());

// loading middlewares
import apiResponseMiddleware from "./middlewares/response.js";
import authMiddleware from "./middlewares/auth.js";
import { 
	notFound, 
	errorHandler 
} from "./middlewares/error.js";

// adding response middleware to structure all API responses in specific format
app.use(apiResponseMiddleware);

// adding auth middleware to check if user token is valid or not before running protected apis
app.all("*", authMiddleware);

// adding all api routes to app
import defaultRoutes from "./api/index.js";
app.use("/", defaultRoutes);

// adding error middleware that will return error message in case of server error
app.use(notFound);
app.use(errorHandler);

// Setting single event-emitter instance applicationwide
// access it inside any routes by req.app.get("eventEmitter")
const eventEmitter = new events.EventEmitter();
app.set("eventEmitter", eventEmitter);

// loading all event subscribers
import defaultSubscriber from "./subscribers/index.js";
// defaultSubscriber(app);

// loading schedulers aka all cron jobs to be in this file
import defaultScheduler from "./schedulers/index.js";
// defaultScheduler();

// socketio
// const httpServer = createServer(app);
// const io = new Server(httpServer, { cors: { origin: "*" } });


// io.on("connection", (socket) => {
// 	console.log("Connected");

// 	socket.on("message", (data) => {
// 		console.log("Your message: ", data);
// 		io.emit("message", data);
// 	})

// 	socket.on("USER_ONLINE", (data) => {
// 		console.log("Your message: ", data);
// 		io.emit("USER_ONLINE", data);
// 	})

// 	socket.on("SEND_JOIN_REQUEST", (data) => {
// 		console.log("Your message: ", data);
// 		io.emit("JOIN_REQUEST_ACCEPTED", data);
// 	})
// });

// socket handler



// starts a server and listens on port [5000] for connections.
const { SERVER_PORT: port = 5000 } = process.env;
// httpServer.listen( { port }, () => {
//     console.log(`Listening: http://localhost:${port}`);
// });

import * as SocketService from "./socket.js";

try {
	const httpServer = app.listen({ port });
	SocketService.socketInit(httpServer);
	console.log(`Listening: http://localhost:${port}`);
} catch (err) {
	console.log(err);
}

// let gameIndex = 0;
// let datetime;

// const interVal = setInterval(function () {
// 	// prepare new round
// 	datetime = new Date();
// 	gameIndex += 1;
// 	console.log(datetime.toISOString() + ' game started! index = ' + gameIndex);
// }, 10000);

import { startGame } from "./services/gameService.js";
import Game from "./models/Game.js";

const finishTime = gameConfig.finishTime;
const runTime = gameConfig.runTime;
const waitTime = gameConfig.waitTime;

startGame();

let startFlag = false;

const interVal = setInterval(async function () {
	const lastGame = await Game.findOne().sort({ _id: -1 });
	if (lastGame && lastGame.state === 'finished' && !startFlag) {
		startFlag = true;
		setTimeout(async () => {			
			await startGame();
			startFlag = false;			
		}, finishTime);
	}
}, 1000);

// setTimeout(() => {
// 	clearInterval(interVal);
// }, (finishTime + runTime + waitTime) + waitTime);


export default app;