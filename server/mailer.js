const nodemailer = require('nodemailer');

const ready = process.env.SMTP_USER && process.env.SMTP_PASS;
const transport = ready && nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// never throws: a failed email must not break a booking
async function sendMail(to, subject, html) {
  if (!ready) return console.log('Email skipped (SMTP_USER / SMTP_PASS not set)');
  try {
    await transport.sendMail({ from: `RentGo <${process.env.SMTP_USER}>`, to, subject, html });
    console.log('Email sent to', to);
  } catch (e) { console.error('Email error:', e.message); }
}

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const money = n => '₱' + Number(n || 0).toLocaleString();
const day = d => new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });

function bookingEmail({ name, vehicle, r }) {
  const days = Math.round((new Date(r.endDate) - new Date(r.startDate)) / 864e5);
  const row = (a, b) => `<tr><td style="padding:6px 12px;color:#64748b">${a}</td><td style="padding:6px 12px"><b>${esc(b)}</b></td></tr>`;
  return `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
    <h2 style="color:#4f46e5">🚗 Booking confirmed</h2>
    <p>Hi ${esc(name)}, thanks for booking with RentGo! Here are your details:</p>
    <table style="border-collapse:collapse;background:#f8fafc;width:100%">
      ${row('Reference', '#' + String(r._id).slice(-6).toUpperCase())}
      ${row('Vehicle', `${vehicle.name} (${vehicle.plate})`)}
      ${row('Pick up', day(r.startDate))}${row('Return', day(r.endDate))}
      ${row('Days', days)}${row('Payment method', r.method || 'cash')}
      ${row('Total', money(r.totalPrice))}
    </table>
    <p style="color:#64748b;font-size:13px">You can view or print your receipt anytime from the Reservations page.</p></div>`;
}

module.exports = { sendMail, bookingEmail };