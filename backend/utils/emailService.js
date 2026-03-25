import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER) {
    console.log('[Email] No EMAIL_USER set — skipping email to', to);
    return;
  }
  try {
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
