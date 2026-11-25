import nodemailer from "nodemailer";

// Email configuration - uses environment variables
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Default recipient for all form submissions
const DEFAULT_RECIPIENT = process.env.CONTACT_EMAIL || "contact@kidsaligarh.com";

// Create transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Verify connection lazily on first send (avoids DNS noise during builds).
let verified = false;
async function ensureVerified() {
  if (verified || process.env.NODE_ENV !== "production") return;
  try {
    await transporter.verify();
    verified = true;
    console.log("Email transporter verified");
  } catch (err) {
    console.error("Email transporter error:", err);
  }
}

export interface EmailOptions {
  to?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await ensureVerified();
    const recipients = options.to || DEFAULT_RECIPIENT;
    const from = options.from || `"Kids Island School" <${process.env.SMTP_USER || DEFAULT_RECIPIENT}>`;
    
    await transporter.sendMail({
      from,
      to: Array.isArray(recipients) ? recipients.join(", ") : recipients,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    
    console.log("Email sent successfully to:", recipients);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

// Specific email templates
export async function sendInquiryNotification(inquiry: {
  id: number;
  type: "admission" | "contact";
  name: string;
  parentName?: string;
  email?: string;
  phone?: string;
  classApplying?: string;
  message: string;
}): Promise<boolean> {
  const typeLabel = inquiry.type === "admission" ? "Admission Enquiry" : "Contact Form";
  const reference = `KI-${String(inquiry.id).padStart(5, "0")}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f2a3d 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">New ${typeLabel}</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Reference: ${reference}</p>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151; width: 140px;">Type:</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;">${typeLabel}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Reference:</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937; font-family: monospace;">${reference}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Student Name:</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;">${inquiry.name}</td>
          </tr>
          ${inquiry.parentName ? `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Parent/Guardian:</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;">${inquiry.parentName}</td>
          </tr>
          ` : ""}
          ${inquiry.email ? `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Email:</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;"><a href="mailto:${inquiry.email}" style="color: #2563eb;">${inquiry.email}</a></td>
          </tr>
          ` : ""}
          ${inquiry.phone ? `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Phone:</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;"><a href="tel:${inquiry.phone}" style="color: #2563eb;">${inquiry.phone}</a></td>
          </tr>
          ` : ""}
          ${inquiry.classApplying ? `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Class Applying:</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;">${inquiry.classApplying}</td>
          </tr>
          ` : ""}
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #374151; vertical-align: top;">Message:</td>
            <td style="padding: 12px 0; color: #1f2937; white-space: pre-wrap;">${inquiry.message}</td>
          </tr>
        </table>
        
        <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">This enquiry was submitted via the Kids Island website.</p>
          <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">Reply directly to this email to respond to the enquirer.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New ${typeLabel} - ${reference}

Student Name: ${inquiry.name}
${inquiry.parentName ? `Parent/Guardian: ${inquiry.parentName}` : ""}
${inquiry.email ? `Email: ${inquiry.email}` : ""}
${inquiry.phone ? `Phone: ${inquiry.phone}` : ""}
${inquiry.classApplying ? `Class Applying: ${inquiry.classApplying}` : ""}

Message:
${inquiry.message}

---
Reference: ${reference}
This enquiry was submitted via the Kids Island website.
Reply directly to this email to respond to the enquirer.
  `;

  return sendEmail({
    to: DEFAULT_RECIPIENT,
    subject: `New ${typeLabel} - ${reference} - ${inquiry.name}`,
    text,
    html,
  });
}

export async function sendContactFormNotification(contact: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f2a3d 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">New Contact Form Submission</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151; width: 140px;">Name:</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;">${contact.name}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Email:</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;"><a href="mailto:${contact.email}" style="color: #2563eb;">${contact.email}</a></td>
          </tr>
          ${contact.phone ? `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Phone:</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;"><a href="tel:${contact.phone}" style="color: #2563eb;">${contact.phone}</a></td>
          </tr>
          ` : ""}
          ${contact.subject ? `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Subject:</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;">${contact.subject}</td>
          </tr>
          ` : ""}
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #374151; vertical-align: top;">Message:</td>
            <td style="padding: 12px 0; color: #1f2937; white-space: pre-wrap;">${contact.message}</td>
          </tr>
        </table>
        
        <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">This message was sent via the Kids Island contact form.</p>
          <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">Reply directly to this email to respond.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: DEFAULT_RECIPIENT,
    subject: `Contact Form: ${contact.name} - ${contact.subject || "General Inquiry"}`,
    text: `
Name: ${contact.name}
Email: ${contact.email}
${contact.phone ? `Phone: ${contact.phone}` : ""}
${contact.subject ? `Subject: ${contact.subject}` : ""}

Message:
${contact.message}
    `,
    html,
  });
}