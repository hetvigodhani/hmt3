import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const recordSchema = new mongoose.Schema(
    {
        recordUrl: [
            {
                type: String,
                required: true,
            },
        ],
        recordName: {
            type: String,
            required: true,
            minlength: [3, "Record name must be at least 3 characters long"],
            maxlength: [
                100,
                "Record name must be less than 100 characters long",
            ],
        },
        diagnosis: {
            type: String,
            required: true,
            // trim: true,
        },
        treatment: {
            type: String,
            // required: true,
            // trim: true,
        },
        medication: {
            type: String,
            // trim: true,
        },
        notes: {
            type: String,
            // trim: true,
        },
        treatmentStartDate: {
            type: Date,
            // required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
        },
        // connect patient and doctor with record, approval of admin or doctor when record is updated by patient
    },
    { timestamps: true }
);
recordSchema.pre("save", function (next) {
    if (this.isNew) {
        this.updatedBy = this.createdBy;
    }
    // this.updatedBy = ***************;
    next();
});

recordSchema.plugin(mongooseAggregatePaginate);
export const Record = mongoose.model("Record", recordSchema);
