import dotenv from "dotenv"
import app from "./app.js"
import { connectDB } from "./db/index.js";
import logger from './utils/logger.js';

// logger.info('This is an info message');
// logger.error('This is an error message');
// logger.warn('This is a warning message');
// logger.debug('This is a debug message');

dotenv.config({
    path: './.env'
})

const port = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(port, () => {
          logger.info(`Server is running on the port: ${port}`);
        });
    })
    .catch((err) => console.log("Database connection err", err))

