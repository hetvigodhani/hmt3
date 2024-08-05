import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import {
    rateLimiter,
    inputSaniziter,
    logRequest,
} from "./middlewares/security.middleware.js";
import cron from "node-cron";
// import { sendReminders } from "./controllers/appointment.controller.js";

const app = express();
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use(
    express.json({
        //  limit: "16kb"
    })
);
app.use(
    express.urlencoded({
        extended: true,
        //  limit: "16kb"
    })
);
app.use(express.static("public"));
app.use(cookieParser());
app.use(logRequest);
app.use(rateLimiter);
app.use(inputSaniziter);

// import routes
import userRoutes from "./routes/user.routes.js";
import recordRoutes from "./routes/record.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
// import patientRoutes from "./routes/patient.routes.js";

// use routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/record", recordRoutes);
app.use("/api/v1/appointment", appointmentRoutes);
app.use("/api/v1/doctor", doctorRoutes);
// app.use("/api/v1/patient", patientRoutes);

// app.use(errorHandler);
// export app

// cron.schedule("0 7 * * *", async () => {
//     try {
//         await sendReminders();
//         logger.log("Reminder emails sent successfully");
//     } catch (error) {
//         logger.error("Error sending reminder emails:", error);
//     }
// });

export { app };
