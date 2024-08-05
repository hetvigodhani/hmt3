import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// const followUpSchema = new mongoose.Schema(
//     {
//         date: {
//             type: Date,
//             required: true,
//             validate: {
//                 validator: function (v) {
//                     return v > Date.now();
//                 },
//                 message: (props) =>
//                     `Follow up date ${props.value} should be in the future!`,
//             },
//         },
//         reason: {
//             type: String,
//             required: true,
//         },
//         notes: {
//             type: String,
//         },
//         status: {
//             type: String,
//             enum: ["pending", "completed", "cancelled", "rescheduled"],
//             default: "pending",
//         },
//     },
//     { timestamps: true }
// );

const appointmentSchema = new mongoose.Schema(
    {
        patient_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
        },
        doctor_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Doctor is required"],
        },
        appointmentDate: {
            type: Date,
            required: [true, "Date is required"],
            validate: {
                validator: function (v) {
                    return v > Date.now();
                },
                message: (props) =>
                    `Appointment date ${props.value} should be in the future!`,
            },
        },
        status: {
            type: String,
            enum: ["pending", "completed", "cancelled", "rescheduled"],
            default: "pending",
        },
        reason: {
            type: String,
            required: true,
            // trim: true,
        },
        location: {
            type: String,
            enum: ["online", "clinic"],
            required: true,
            // trim: true,
        },
        followUp: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
        }],
        notes: {
            type: String,
            // trim: true,
        },
    },
    { timestamps: true }
);

appointmentSchema.plugin(mongooseAggregatePaginate);
export const Appointment = mongoose.model("Appointment", appointmentSchema);
