import { config } from "dotenv";

config();

// Config file for authorization
const gameConfig = {
    waitTime: process.env.GAME_WAIT_TIME,
    runTime: process.env.GAME_RUN_TIME,
    socketUrl: process.env.SOCKET_IO_URL,
};

export default gameConfig;