import dotenv from "dotenv";
import { app } from "./app.js";
import dbConnect from "./database/dbConnect.js";

dotenv.config({
    path: "./.env",
});

dbConnect()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(
                `Server running successfully on port ${process.env.PORT}`
            );
        });
    })
    .catch((error) => {
        console.log("Server failed to start: ", error);
        process.exit(1);
    });

