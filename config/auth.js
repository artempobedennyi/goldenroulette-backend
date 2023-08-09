import { config } from "dotenv";

config();

// Config file for authorization
const authConfig = {
    accessTokenSecret: process.env.ACCESS_TOKEN_PRIVATE_KEY,
    refreshTokenSecret: process.env.REFRESH_TOKEN_PRIVATE_KEY,
    // jwtExpiration: 3600,           // 1 hour
    // jwtRefreshExpiration: 86400,   // 24 hours
    salt: Number(process.env.SALT),
  
    /* for test */
    jwtExpiration: 60,          // 1 minute
    jwtRefreshExpiration: 120,  // 2 minutes
};

export default authConfig;