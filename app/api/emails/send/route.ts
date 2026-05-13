import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { resend, EMAIL_FROM } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "BUSINESS_MANAGER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { to, subject, body } = await req.json();
  if (!to || !subject || !body) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html: `
        <div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
          <div style="background:#0f172a;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="color:white;margin:0;font-size:18px;">Apex Store</h1>
          </div>
          <div style="background:white;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
            ${body.replace(/\n/g, "<br/>")}
          </div>
          <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:16px;">© ${new Date().getFullYear()} Apex Store</p>
        </div>`,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
