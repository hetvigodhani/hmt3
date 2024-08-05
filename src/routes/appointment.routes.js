import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
    addAppointment,
    getAppointment,
    updateAppointment,
    cancelAppointment,
    rescheduleAppointment,
    addFollowUp,
    // sendReminders,
} from "../controllers/appointment.controller.js";
const router = Router();
router.use(verifyJwt);

// contains appointment related routes
router.route("/add-appointment").post(addAppointment);
router.route("/get-appointment").get(getAppointment);
router.route("/update-appointment/:id").put(updateAppointment);
router.route("/cancel-appointment/:id").delete(cancelAppointment);
router.route("/reschedule-appointment/:id").put(rescheduleAppointment);
router.route("/follow-up/:id").post(addFollowUp);

// router.route("/send-reminders").post(sendReminders);

export default router;
