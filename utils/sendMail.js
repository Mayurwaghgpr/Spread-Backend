import nodemailer from "nodemailer";

export const mailTransporter = nodemailer.createTransport({
    secure: true,
    host: "smtp.gmail.com",
    port:465,
  auth: {
    user: 'spreadsocial393@gmail.com',
    pass: 'rkcvyajjjbydnwht'
  }
});
