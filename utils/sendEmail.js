import nodemailer from "nodemailer"
import validator from "email-validator"
import { fileURLToPath } from 'url';
import {config} from "dotenv"
import path from "path";
config();

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_PORT === "465", // false for 587
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
  pool: true,
  maxConnections: 5,
});

const sendEmail = async (email, subject, message) => {
  try {
    // Validate inputs
    if (!email ) {
      throw new Error("Invalid or missing email address");
    }
    if (!subject || typeof subject !== "string" || subject.trim() === "") {
      throw new Error("Invalid or missing subject");
    }
    if (!message || typeof message !== "string" || message.trim() === "") {
      throw new Error("Invalid or missing message");
    }

    // Debug email details
    console.log("Sending email:", { to: email, subject });

    // Send email
    const info = await transporter.sendMail({
      from: `"Snip Story" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: subject,
      html: message,
      text: message.replace(/<[^>]+>/g, ""),
      attachments: [
        {
          filename: 'logo.png',
          path: path.join(__dirname, '../assets/logo.png'), // Path to image
          cid: 'logo@blogapp', // Unique Content-ID for HTML reference
        },
      ],
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send email:", {
      message: error.message,
      code: error.code,
      response: error.response,
      command: error.command,
      stack: error.stack,
    });
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

export default sendEmail;