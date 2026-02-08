import mongoose from "mongoose";
import { DB_NAME } from "../utils/constants.js";

const connectDB = async() =>  {
  try {
    const response = await  mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
    console.log(`Database connected on Host: ${response.connection.host}`)
  } catch (error) {
    console.log("Database connection failed !", error)
    process.exit(1);
  }
}

export {connectDB};