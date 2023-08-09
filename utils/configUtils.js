import morgan from "morgan";
import cors from "cors";
import path from "path";
import { config } from "dotenv";
import mongoose from "mongoose";

import dbConfig from "../config/db.js";

const dev = process.env.NODE_ENV !== "production";

const configuration = (app) => {
    if (dev) {
        // Allow api call from any origin on dev 
        app.use(cors())
        app.options("*", cors())
    
        // Enable logs in dev environment
        app.use(morgan("dev"));
    } else {
        // disabling all console.logs in prod environment
        console.log = function () {};
    
        // Allow api call only from trusted website on production, in this case it will be your app server(react/ angular) url
        // var whitelist = ["https://google.com"]
        const corsOptions = {
            origin: function (origin, callback) {
                if (whitelist.indexOf(origin) !== -1) {
                    callback(null, true)
                } else {
                    callback(new Error("Not allowed by CORS"))
                }
            }
        };
        app.use(cors());
        app.options(corsOptions, cors());
    }
};

const dbConnect = () => {
    mongoose.connect(dbConfig.url, dbConfig.options);

    mongoose.connection.on("connected", () => {
        console.log("Connected to database sucessfully");
    });

    mongoose.connection.on("error", (err) => {
        console.log("Error while connecting to database :" + err);
    });

    mongoose.connection.on("disconnected", () => {
        console.log("Mongodb connection disconnected");
    });

    // safely disconnecting db when server is stopped
    process.on('SIGINT', () => {
        mongoose.disconnect().then(() => {
            console.log("exit")
            process.exit();
        });
    });
};

const loadEnvConfig = () => {
    if (dev) {
        // loading environment variable from different path in case of dev server
        config({path : path.resolve(process.cwd(), ".env.development.local")});
    } else {
        // loading environment variable from default file ".env"
        config();
    }
};

export {
    configuration,
    dbConnect,
    loadEnvConfig,
};