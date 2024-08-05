// imports
import mongoose from "mongoose";

// exports
// cookies setting
export const options = {
    httpOnly: true,
    secure: true,
};
// database constants
export const DB_NAME = "hmtDB";

export const addressSchema = new mongoose.Schema({
    street: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    zip: {
        type: String,
        minLength: 5,
        maxLength: 5,
        trim: true,
    },
    country: {
        type: String,
    },
});
// enums
export const roleEnum = {
    ADMIN: "admin",
    SUPER_ADMIN: "super_admin",
    STAFF: "staff",
    DOCTOR: "doctor",
    PATIENT: "patient",
};
export const genderEnum = {
    MALE: "male",
    FEMALE: "female",
    OTHER: "other",
};
