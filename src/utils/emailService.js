import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export const sendReminderEmail = (appointment) => {
    const mailOptions = {
        from: "your-email@gmail.com",
        to: appointment.patient.email,
        subject: "Appointment Reminder",
        text: `Dear ${appointment.patient.name}, this is a reminder for your appointment with Dr. ${appointment.doctor.name} on ${appointment.appointmentDate}.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(`Error sending reminder email: ${error}`);
        } else {
            console.log(`Reminder email sent: ${info.response}`);
        }
    });
};
