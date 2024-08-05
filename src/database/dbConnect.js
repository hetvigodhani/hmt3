import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import "dotenv/config";

const dbConnect = async () => {
    try {
        const connectionString = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`
        );
        console.log(
            "MongoDB connected..! DB_Host: ",
            connectionString.connection._connectionString
        );
    } catch (error) {
        console.log("MongoDB connection failed: ", error);
        process.exit(1);
    }
};

export default dbConnect;
