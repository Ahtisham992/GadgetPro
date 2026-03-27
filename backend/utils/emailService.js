import nodemailer from 'nodemailer';

const getTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  console.log(`[Email] Attempting to send "${subject}" to ${to}...`);
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] Missing EMAIL_USER or EMAIL_PASS in .env — skipping email to', to);
    return;
  }
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"GadgetPro" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('[Email] Sent to', to, '—', subject);
  } catch (err) {
    console.error('[Email] Failed:', err.message);
  }
};

export const sendOrderAcceptedEmail = (email, order) =>
  sendEmail({
    to: email,
    subject: '✅ Your GadgetPro Order Has Been Accepted!',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
        <h2 style="color:#f97316">GadgetPro 🛒</h2>
        <h3>Great news! Your order has been accepted.</h3>
        <p>Order ID: <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong></p>
        <p>Total: <strong>PKR ${order.totalPrice?.toLocaleString()}</strong></p>
        <p>Your order is now being prepared for delivery. We'll notify you once it ships!</p>
        <hr/>
        <p style="color:#9ca3af;font-size:12px">GadgetPro — Premium Tech Store</p>
      </div>
    `,
  });

export const sendOrderDeliveredEmail = (email, order) =>
  sendEmail({
    to: email,
    subject: '📦 Your GadgetPro Order Has Been Delivered!',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
        <h2 style="color:#f97316">GadgetPro 🛒</h2>
        <h3>Your order has been delivered!</h3>
        <p>Order ID: <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong></p>
        <p>Total: <strong>PKR ${order.totalPrice?.toLocaleString()}</strong></p>
        <p>We hope you love your purchase! Please visit your <strong>My Orders</strong> page to leave a review.</p>
        <hr/>
        <p style="color:#9ca3af;font-size:12px">GadgetPro — Premium Tech Store</p>
      </div>
    `,
  });

export const sendOtpEmail = (email, otp, name = 'there') =>
  sendEmail({
    to: email,
    subject: '🔐 Your GadgetPro Verification Code',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
        <h2 style="color:#f97316">GadgetPro 🛒</h2>
        <h3>Hi ${name}, Welcome to GadgetPro!</h3>
        <p>Use the following one-time code to verify your email address:</p>
        <div style="text-align:center;margin:24px 0">
          <span style="font-size:2.5rem;font-weight:900;letter-spacing:12px;color:#111827;background:#fff;padding:16px 24px;border-radius:12px;border:2px solid #f97316;display:inline-block">${otp}</span>
        </div>
        <p style="color:#6b7280;font-size:0.9rem">This code expires in <strong>10 minutes</strong>. If you didn't create a GadgetPro account, you can safely ignore this email.</p>
        <hr/>
        <p style="color:#9ca3af;font-size:12px">GadgetPro — Premium Tech Store</p>
      </div>
    `,
  });

export const sendPasswordResetEmail = (email, resetToken, name = 'there') => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  return sendEmail({
    to: email,
    subject: '🔑 Reset Your GadgetPro Password',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
        <h2 style="color:#f97316">GadgetPro 🛒</h2>
        <h3>Hi ${name}, forgot your password?</h3>
        <p>No worries! Click the button below to set a new password for your account. This link will expire in <strong>15 minutes</strong>.</p>
        <div style="text-align:center;margin:32px 0">
          <a href="${resetUrl}" style="background:#f97316;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;display:inline-block">Reset My Password</a>
        </div>
        <p style="color:#6b7280;font-size:0.875rem">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break:break-all;color:#3b82f6;font-size:0.8125rem">${resetUrl}</p>
        <p style="color:#6b7280;font-size:0.875rem;margin-top:24px">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        <hr/>
        <p style="color:#9ca3af;font-size:12px">GadgetPro — Premium Tech Store</p>
      </div>
    `,
  });
};
