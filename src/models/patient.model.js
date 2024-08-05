import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { genderEnum, addressSchema } from "../constants.js";

const patientSchema = new mongoose.Schema(
    {
        username: {
            unique: true,
            type: String,
            required: true,
            minlength: [3, "Username must be at least 3 characters long"],
            maxlength: [100, "Username must be less than 100 characters long"],
        },
        password: {
            type: String,
            required: true,
        },
        bloodgroup: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
            required: true
        },
        refreshToken: {
            type: String,
        },
        isInactive: {
            type: Boolean,
            default: false,
        },
        firstName: {
            type: String,
            required: true,
            minlength: 1,
        },
        lastName: {
            type: String,
            required: true,
            minlength: 1,
        },
        dateOfBirth: {
            type: Date,
            required: true,
        },
        gender: {
            type: String,
            enum: genderEnum,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /^\+?\d{10,15}$/.test(v);
                },
                message: (props) =>
                    `${props.value} is not a valid phone number!`,
            },
        },
        alternatePhoneNumber: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /^\+?\d{10,15}$/.test(v);
                },
                message: (props) =>
                    `${props.value} is not a valid phone number!`,
            },
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        alternateEmail: {
            type: String,
            required: false,
            trim: true,
        },
        address: {
            type: addressSchema,
            required: true,
        },
        emergencyContactName: {
            type: String,
            required: true,
            minlength: 3,
        },
        emergencyContactRelationship: {
            type: String,
            required: false,
            minlength: 3,
        },
        emergencyContactPhoneNumber: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /^\+?\d{10,15}$/.test(v);
                },
                message: (props) =>
                    `${props.value} is not a valid phone number!`,
            },
        },
        profilePicture: {
            type: String,
        },
        chronicConditions: [
            {
                type: String,
                minlength: 3,
                maxlength: 100,
            },
        ],
        pastSurgeries: [
            {
                type: String,
            },
        ],
        allergies: [
            {
                type: String,
                minlength: 3,
            },
        ],
        medications: [
            {
                type: String,
            },
        ],
        insuranceProvider: {
            type: String,
        },
        policyNumber: {
            type: String,
        },
        coverageDetails: {
            type: String,
        },
        primaryCarePhysician: {
            type: String,
        },
        physicianContactInfo: {
            type: String,
        },

        nurseNotes: {
            type: String,
        },
        aadharCard: {
            type: String,
            required: true,
            unique: true,
            minlength: 12,
            maxlength: 12,
        },
        panCard: {
            type: String,
            required: true,
            unique: true,
            minlength: 10,
            maxlength: 10,
        },
        // previousAppointments: [{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "Appointment",
        // }],
        // upcomingAppointments: [{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "Appointment",
        // }],
        // physicianNotes: [String],
        // immunizationRecords: [String],
        labResults: [String],
        // radiologyReports: [String],
    },
    { timestamps: true }
);

patientSchema.pre("save", async function (next) {
    if (!this.isModified("password")) next();
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

patientSchema.post("find", async function (docs) {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    await Promise.all(
        docs.map(async (doc) => {
            if (doc.updatedAt < fiveYearsAgo) {
                doc.isInactive = true;
                await doc.save();
            }
        })
    )
        .then(() => {
            logger.info("patient updated");
        })
        .catch((err) => {
            logger.error("At patient model: " + err);
        });
});

patientSchema.methods.isPasswordCorrect = async function (password) {
    // logger.info(password);
    // logger.info(this.password);
    return bcrypt.compareSync(password, this.password);
};

patientSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this._id,
            username: this.username,
            role: "patient",
            firstName: this.firstName,
            lastName: this.lastName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

patientSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const Patient = mongoose.model("Patient", patientSchema);
