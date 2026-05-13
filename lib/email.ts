import { resend, EMAIL_FROM } from "@/lib/resend";

// ── Welcome Email ─────────────────────────────────────────────────────────────
export async function sendWelcomeEmail({ name, email }: { name: string; email: string }) {
  return resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: "Welcome to Apex Store 🎉",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #0f172a; padding: 32px; text-align: center;">
      <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: white; border-radius: 12px; margin-bottom: 16px;">
        <span style="font-size: 20px; font-weight: 900; color: #0f172a;">A</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Welcome to Apex</h1>
    </div>
    <div style="padding: 40px 32px;">
      <h2 style="margin: 0 0 16px; font-size: 20px; color: #0f172a;">Hey ${name}! 👋</h2>
      <p style="color: #64748b; line-height: 1.6; margin: 0 0 24px;">
        We're thrilled to have you on board. Your account is all set and ready to go. Start exploring our collection of premium products and digital services.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/shop" style="display: inline-block; background: #0f172a; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">
        Start Shopping →
      </a>
    </div>
    <div style="padding: 24px 32px; border-top: 1px solid #f1f5f9; background: #f8fafc;">
      <p style="margin: 0; font-size: 13px; color: #94a3b8; text-align: center;">
        © ${new Date().getFullYear()} Apex Store. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`,
  });
}

// ── Order Confirmation ─────────────────────────────────────────────────────────
export async function sendOrderConfirmationEmail({
  email,
  name,
  orderId,
  items,
  total,
}: {
  email: string;
  name: string;
  orderId: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}) {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${item.name}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; text-align: center;">×${item.quantity}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; text-align: right; font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  return resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: `Order Confirmed — #${orderId.slice(-8).toUpperCase()}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #0f172a; padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 22px;">Order Confirmed ✓</h1>
      <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 14px;">Order #${orderId.slice(-8).toUpperCase()}</p>
    </div>
    <div style="padding: 32px;">
      <p style="color: #64748b; margin: 0 0 24px;">Hi ${name}, thank you for your order! We'll notify you when it ships.</p>
      <table style="width: 100%; border-collapse: collapse;">
        ${itemsHtml}
        <tr>
          <td colspan="2" style="padding: 16px 0 0; font-weight: 700; color: #0f172a;">Total</td>
          <td style="padding: 16px 0 0; text-align: right; font-weight: 700; color: #0f172a; font-size: 18px;">$${total.toFixed(2)}</td>
        </tr>
      </table>
      <div style="margin-top: 32px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" style="display: inline-block; background: #0f172a; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
          View Order →
        </a>
      </div>
    </div>
  </div>
</body>
</html>`,
  });
}

// ── Virtual Request Received ──────────────────────────────────────────────────
export async function sendVirtualRequestEmail({
  customerName,
  customerEmail,
  serviceName,
  message,
  requestId,
}: {
  customerName: string;
  customerEmail: string;
  serviceName: string;
  message: string;
  requestId: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@store.com";

  // Email to customer
  await resend.emails.send({
    from: EMAIL_FROM,
    to: customerEmail,
    subject: `Service Request Received — ${serviceName}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #0f172a; padding: 32px;">
      <h1 style="color: white; margin: 0; font-size: 22px;">Request Received ⚡</h1>
    </div>
    <div style="padding: 32px;">
      <p style="color: #64748b;">Hi ${customerName}, we've received your service request for <strong>${serviceName}</strong>. Our team will review it and get back to you shortly.</p>
      <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; font-size: 13px; color: #64748b; font-weight: 500;">Your message:</p>
        <p style="margin: 8px 0 0; color: #0f172a; line-height: 1.6;">${message}</p>
      </div>
      <p style="color: #64748b; font-size: 14px;">Request ID: <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${requestId.slice(-8).toUpperCase()}</code></p>
    </div>
  </div>
</body>
</html>`,
  });

  // Email to admin
  await resend.emails.send({
    from: EMAIL_FROM,
    to: adminEmail,
    subject: `New Service Request: ${serviceName}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #dc2626; padding: 32px;">
      <h1 style="color: white; margin: 0; font-size: 22px;">New Service Request 🔔</h1>
    </div>
    <div style="padding: 32px;">
      <p><strong>Service:</strong> ${serviceName}</p>
      <p><strong>From:</strong> ${customerName} (${customerEmail})</p>
      <p><strong>Message:</strong></p>
      <div style="background: #f8fafc; border-radius: 8px; padding: 16px;">${message}</div>
      <div style="margin-top: 24px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/virtual-requests" style="display: inline-block; background: #0f172a; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
          View Request →
        </a>
      </div>
    </div>
  </div>
</body>
</html>`,
  });
}

// ── Contact Form ──────────────────────────────────────────────────────────────
export async function sendContactEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@store.com";
  return resend.emails.send({
    from: EMAIL_FROM,
    to: adminEmail,
    replyTo: email,
    subject: `Contact Form: ${subject}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #0f172a; padding: 32px;">
      <h1 style="color: white; margin: 0; font-size: 22px;">Contact Form Message</h1>
    </div>
    <div style="padding: 32px;">
      <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-top: 16px; line-height: 1.6; color: #0f172a;">${message}</div>
    </div>
  </div>
</body>
</html>`,
  });
}
