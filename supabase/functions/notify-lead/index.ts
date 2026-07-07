import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

serve(async (req) => {
  try {
    const payload = await req.json();
    const lead = payload.record;

    const SMTP_USER  = Deno.env.get("SMTP_USER")!;
    const SMTP_PASS  = Deno.env.get("SMTP_PASS")!;
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL")!;

    const time = new Date(lead.created_at).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const client = new SmtpClient();
    await client.connectTLS({ hostname: "smtp.gmail.com", port: 465, username: SMTP_USER, password: SMTP_PASS });

    await client.send({
      from: `Madras City Plots <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `🏠 New Lead: ${lead.name} — ${lead.mobile}`,
      content: `
New enquiry received on Madras City Plots
─────────────────────────────────────────
Name     : ${lead.name}
Mobile   : ${lead.mobile}
Email    : ${lead.email}
Message  : ${lead.message || "—"}
Property : ${lead.property_id || "General Enquiry"}
Received : ${time}
─────────────────────────────────────────
View & manage: https://www.madrascityplots.com/admin/leads
      `.trim(),
    });

    await client.close();
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
