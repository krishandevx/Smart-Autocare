import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env } from '../config/env';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

export interface EmailOpts {
  to: string;
  subject: string;
  template: string;
  data: Record<string, string>;
}

export async function sendEmail(opts: EmailOpts): Promise<void> {
  const t = getTransporter();
  const body = renderTemplate(opts.template, opts.data);
  if (!t) {
    console.log(`[email:stub] to=${opts.to} subject="${opts.subject}"\n${body.slice(0, 400)}...`);
    return;
  }
  try {
    await t.sendMail({ from: env.SMTP_FROM, to: opts.to, subject: opts.subject, html: body });
  } catch (err) {
    console.error('[email:error]', (err as Error).message);
  }
}

export function renderTemplate(template: string, data: Record<string, string>): string {
  const title = data.subject || 'Smart AutoCare';
  const content = templates[template]?.(data) || `<p>${data.message || ''}</p>`;
  return `<!doctype html><html><body style="margin:0;background:#0f1115;font-family:Inter,Arial,sans-serif">
  <div style="max-width:560px;margin:auto;padding:32px 16px;color:#111;">
    <div style="background:linear-gradient(135deg,#1a1d24,#0f1115);color:#fff;padding:24px;border-radius:14px 14px 0 0;">
      <div style="font-size:18px;font-weight:800;">⚙ <span style="color:#3b82f6;">Smart</span> AutoCare</div>
    </div>
    <div style="background:#fff;padding:28px;border-radius:0 0 14px 14px;box-shadow:0 8px 30px rgba(0,0,0,.08);">
      <h2 style="margin:0 0 12px;font-size:20px;">${title}</h2>
      ${content}
      <p style="color:#6b7280;font-size:13px;margin-top:24px;border-top:1px solid #eee;padding-top:14px;">
        Smart AutoCare · Smart Service. Smarter Vehicle Care.</p>
    </div>
  </div></body></html>`;
}

const label = (k: string) => (data: Record<string, string>) =>
  `<p style="line-height:1.7;color:#374151;">${data[k] || ''}</p>`;

const cta = (data: Record<string, string>) =>
  data.link
    ? `<a href="${data.link}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;margin-top:8px;">${data.cta || 'Open'}</a>`
    : '';

export const templates: Record<string, (d: Record<string, string>) => string> = {
  welcome: (d) => `${label('message')(d)}${cta(d)}`,
  verifyEmail: (d) => `${label('message')(d)}${cta(d)}`,
  passwordReset: (d) => `${label('message')(d)}${cta(d)}`,
  bookingConfirmation: (d) => `<p>Hi ${d.name},</p>${label('message')(d)}${cta(d)}`,
  bookingReminder: (d) => `<p>Hi ${d.name},</p>${label('message')(d)}${cta(d)}`,
  estimate: (d) => `<p>Hi ${d.name},</p>${label('message')(d)}${cta(d)}`,
  vehicleReady: (d) => `<p>Hi ${d.name},</p>${label('message')(d)}${cta(d)}`,
  invoice: (d) => `<p>Hi ${d.name},</p>${label('message')(d)}${cta(d)}`,
  paymentConfirmation: (d) => `<p>Hi ${d.name},</p>${label('message')(d)}${cta(d)}`,
  serviceReminder: (d) => `<p>Hi ${d.name},</p>${label('message')(d)}${cta(d)}`,
};