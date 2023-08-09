import express from "express";
import helmet from "helmet";
import events from "events";

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
defaultSubscriber(app);

// loading schedulers aka all cron jobs to be in this file
import defaultScheduler from "./schedulers/index.js";
defaultScheduler();

// starts a server and listens on port [8080] for connections.
const { SERVER_PORT: port = 8080 } = process.env;
app.listen( { port }, () => {
    console.log(`Listening: http://localhost:${port}`);
});

export default app;