import nodemailer from "nodemailer";

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration is incomplete");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  return transporter;
};

const sendMail = async ({ to, subject, text, html }) => {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  if (String(process.env.EMAIL_MOCK || "false").toLowerCase() === "true") {
    console.log(`[EMAIL_MOCK] to=${to} subject=${subject}`);
    console.log(text);
    return;
  }

  const tx = await getTransporter();
  await tx.sendMail({ from, to, subject, text, html });
};

export const sendVerificationEmail = async ({ toEmail, name, code }) => {
  const webUrl = process.env.CLIENT_URL || "http://localhost:5173";

  await sendMail({
    to: toEmail,
    subject: "Verify your ManageX account",
    text: `Hi ${name}, your verification code is ${code}. This code expires in 15 minutes. Verify at ${webUrl}/verify-email`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Verify your ManageX account</h2>
        <p>Hi ${name},</p>
        <p>Your verification code is:</p>
        <p style="font-size:24px;font-weight:700;letter-spacing:2px">${code}</p>
        <p>This code expires in 15 minutes.</p>
        <p>You can verify at: <a href="${webUrl}/verify-email">${webUrl}/verify-email</a></p>
      </div>
    `
  });
};

export const sendPasswordResetEmail = async ({ toEmail, name, token }) => {
  const webUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const link = `${webUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(toEmail)}`;

  await sendMail({
    to: toEmail,
    subject: "Reset your ManageX password",
    text: `Hi ${name}, reset your password using this link: ${link}. The link expires in 30 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Password reset request</h2>
        <p>Hi ${name},</p>
        <p>Click the button below to reset your password.</p>
        <p><a href="${link}" style="display:inline-block;padding:10px 16px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px">Reset Password</a></p>
        <p>This link expires in 30 minutes.</p>
      </div>
    `
  });
};