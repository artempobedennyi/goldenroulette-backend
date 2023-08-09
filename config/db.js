import { config } from "dotenv";

config();

// Config file for mongo db to connect via mongoose library
const dbConfig = {
    url : process.env.MONGO_URL,
    options : {
        useNewUrlParser: true,  useUnifiedTopology: true
    }
};

export default dbConfig;
