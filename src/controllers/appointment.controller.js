import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Appointment } from "../models/appointment.model.js";
import { User } from "../models/user.model.js";
import logger from "../logger/index.js";
import { sendReminderEmail } from "../utils/emailService.js";

const addAppointment = asyncHandler(async (req, res) => {
    try {
        logger.info("addAppointment", req.body);
        // how to get patient_id and doctor_id from user collection************
        const {
            doctor_id,
            appointmentDate,
            reason,
            location,
            followUp,
            notes,
        } = req.body;

        if (
            [doctor_id, appointmentDate, reason, location].some(
                (field) => !field || field.trim() === ""
            )
        ) {
            throw new ApiError(400, "Invalid Appointment Data");
        }

        const docID = await User.findById(doctor_id);
        if (!docID || docID.role !== "doctor") {
            throw new ApiError(400, "Doctor Not Found");
        }

        const appointment = await Appointment.create({
            patient_id: req.user._id,
            doctor_id,
            appointmentDate: new Date(appointmentDate),
            reason,
            location,
            ...(followUp && { followUp }),
            ...(notes && { notes }),
        });
        if (!appointment) {
            throw new ApiError(400, "Appointment Addition Failed");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    appointment,
                    "Appointment Added Successfully"
                )
            );
    } catch (error) {
        throw new ApiError(400, "Appointment Addition Failed" + error.message);
    }
});
// get appointment with and without query parameters
const getAppointment = asyncHandler(async (req, res) => {
    try {
        logger.info("getAppointment", req.body);

        // Extract query parameters
        const { doctor_id, patient_id, status, startDate, endDate } = req.query;

        // Build the query object
        const query = {};

        if (doctor_id) {
            query.doctor_id = doctor_id;
        }

        if (patient_id) {
            query.patient_id = patient_id;
        }

        if (status) {
            query.status = status;
        }

        if (startDate && endDate) {
            query.appointmentDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        } else if (startDate) {
            query.appointmentDate = {
                $gte: new Date(startDate),
            };
        } else if (endDate) {
            query.appointmentDate = {
                $lte: new Date(endDate),
            };
        }

        // Fetch appointments from the database
        const appointments = await Appointment.find(query);

        if (!appointments || appointments.length === 0) {
            throw new ApiError(404, null, "No Appointments Found");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    appointments,
                    "Appointments Retrieved Successfully"
                )
            );
    } catch (error) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    "Appointment Details Fetching Failed" + error.message
                )
            );
    }
});

const updateAppointment = asyncHandler(async (req, res) => {
    try {
        logger.info("updateAppointment", req.body);
        const { id } = req.params;
        const {
            doctor_id,
            appointmentDate,
            reason,
            location,
            status,
            followUp,
            notes,
        } = req.body;

        // Find the appointment by ID
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            throw new ApiError(404, "Appointment Not Found");
        }

        // Validate the doctor_id if it's provided
        if (doctor_id) {
            const doctor = await User.findById(doctor_id);
            if (!doctor || doctor.role !== "doctor") {
                throw new ApiError(400, "Invalid Doctor");
            }
            appointment.doctor_id = doctor_id;
        }

        // Validate the appointmentDate if it's provided
        if (appointmentDate) {
            const newAppointmentDate = new Date(appointmentDate);
            if (newAppointmentDate <= Date.now()) {
                throw new ApiError(
                    400,
                    "Appointment date must be in the future"
                );
            }
            appointment.appointmentDate = newAppointmentDate;
        }

        if (reason) appointment.reason = reason;
        if (location) appointment.location = location;
        if (status) appointment.status = status;
        if (followUp) appointment.followUp = followUp;
        if (notes) appointment.notes = notes;

        const updatedAppointment = await appointment.save();
        if (!updatedAppointment) {
            throw new ApiError(400, "Appointment Update Failed");
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedAppointment,
                    "Appointment Updated Successfully"
                )
            );
    } catch (error) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    500,
                    "Failed to Update Appointment: " + error.message
                )
            );
    }
});

const cancelAppointment = asyncHandler(async (req, res) => {
    try {
        logger.info("cancelAppointment", req.body);
        const appointmentCancelled = await Appointment.findById(req.params.id);
        if (!appointmentCancelled) {
            throw new ApiError(404, "Appointment Not Found");
        }
        appointmentCancelled.status = "cancelled";
        const appointment = await appointmentCancelled.save();
        if (!appointment) {
            throw new ApiError(400, "Appointment Cancellation Failed");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    appointment,
                    "Appointment Cancelled Successfully"
                )
            );
    } catch (error) {
        // console.error("Appointment Cancellation Failed", error);
        return res
            .status(400)
            .json(
                new ApiResponse(
                    500,
                    "Appointment Cancellation Failed: " + error.message
                )
            );
    }
});

const rescheduleAppointment = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { newAppointmentDate } = req.body;

        if (!newAppointmentDate) {
            throw new ApiError(400, "New appointment date is required");
        }

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            throw new ApiError(404, "Appointment Not Found");
        }

        const rescheduledDate = new Date(newAppointmentDate);
        if (rescheduledDate <= Date.now()) {
            throw new ApiError(
                400,
                "New appointment date must be in the future"
            );
        }

        appointment.appointmentDate = rescheduledDate;
        appointment.status = "rescheduled";

        const updatedAppointment = await appointment.save();
        if (!updatedAppointment) {
            throw new ApiError(400, "Appointment Rescheduling Failed");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedAppointment,
                    "Appointment Rescheduled Successfully"
                )
            );
    } catch (error) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    500,
                    "Appointment Rescheduling Failed: " + error.message
                )
            );
    }
});

const addFollowUp = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { appointmentDate, reason, location, notes } = req.body;

        // Validate the appointment ID
        const existingAppointment = await Appointment.findById(id);
        if (!existingAppointment) {
            throw new ApiError(404, "Appointment not found");
        }

        // Create a new follow-up appointment
        const followUpAppointment = new Appointment({
            patient_id: existingAppointment.patient_id,
            doctor_id: existingAppointment.doctor_id,
            appointmentDate,
            reason,
            location,
            notes,
        });

        // Save the follow-up appointment
        const newFollowUp = await followUpAppointment.save();
        if (!newFollowUp) {
            throw new ApiError(400, "Failed to create follow-up appointment");
        }

        // Add the follow-up appointment to the original appointment's follow-up array
        existingAppointment.followUp.push(followUpAppointment._id);
        const updatedExisting = await existingAppointment.save();
        if (!updatedExisting) {
            throw new ApiError(400, "Failed to update original appointment");
        }

        res.status(201).json({
            message: "Follow-up appointment created successfully",
            newFollowUp,
        });
    } catch (error) {
        // console.error("Error creating follow-up appointment: ", error);
        return res
            .status(400)
            .json(
                new ApiResponse(500, "Internal server error: " + error.message)
            );
    }
});

// const sendReminders = asyncHandler(async (req, res) => {
//     const upcomingAppointments = await Appointment.find({
//         appointmentDate: {
//             $gte: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
//             $lt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
//         },
//         status: "pending",
//     });
//     if (!upcomingAppointments || upcomingAppointments.length === 0) {
//         return res
//             .status(200)
//             .json(new ApiResponse(200, null, "No Appointments to Remind"));
//     }

//     upcomingAppointments.forEach((appointment) => {
//         sendReminderEmail(appointment);
//     });

//     res.status(200).json(
//         new ApiResponse(200, null, "Reminders Sent Successfully")
//     );
// });

export {
    addAppointment,
    getAppointment,
    updateAppointment,
    cancelAppointment,
    rescheduleAppointment,
    addFollowUp,
    // sendReminders,
};
