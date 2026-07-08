import nodemailer from "nodemailer";
import { env } from "../config/env";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export const transporter = nodemailer.createTransport({
  host: env.emailHost,
  port: env.emailPort,
  auth: {
    user: env.emailUser,
    pass: env.emailPass,
  },
});

const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailParams): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: env.emailFrom,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error("Failed to send email:", err);
    return false;
  }
};

export default sendEmail;
