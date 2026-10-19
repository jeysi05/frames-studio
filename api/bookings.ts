// api/bookings.ts
import { createPayMongoCheckout } from './_lib/paymongo';

const DEFAULT_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbyuzT8GENvan-lWxsZ088Qn6fjKIkkUzulKZZFdXVngMS-o5Bl7VjYpbpFSTnPgzhifSQ/exec';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const {
      roomName,
      dateFormatted,
      slotLabel,
      rateType,
      guests,
      hasPets,
      payChannel,
      total,
      customer,
      originUrl,
    } = body;

    const baseSite = originUrl || process.env.SITE_URL || 'http://localhost:5173';
    const dateTime = `${dateFormatted} · ${slotLabel}`;
    const totalStr = `₱${Number(total).toLocaleString('en-PH')}`;

    const pm = await createPayMongoCheckout({
      amountPHP: Number(total),
      description: `FRAMES Studio — ${roomName} (${dateTime})`,
      channel: payChannel || 'GCash',
      successUrl: `${baseSite}/?pm_status=success`,
      failedUrl: `${baseSite}/?pm_status=failed`,
      billing: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
      metadata: {
        room: roomName,
        dateTime,
        guests: String(guests),
        pets: hasPets ? 'Yes' : 'No',
        channel: payChannel || 'GCash',
      },
    });

    // Forward to Google Apps Script Webhook so your Google Sheet logs the row immediately
    const sheetPayload = {
      timestamp: new Date().toLocaleString('en-PH'),
      room: roomName,
      dateTime,
      date: dateFormatted,
      slot: slotLabel,
      rateType,
      guests: `${guests} pax${hasPets ? ' + Pet' : ''}`,
      pets: hasPets ? 'Yes' : 'No',
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      paymentMethod: payChannel,
      total: totalStr,
      totalAmount: Number(total),
      paymongoRef: pm.id,
      ref: pm.id,
      status: 'PAID & G-CAL SYNCED',
    };

    await fetch(process.env.VITE_SHEETS_WEBHOOK_URL || DEFAULT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(sheetPayload),
    }).catch(() => {});

    return res.status(200).json({
      id: pm.id,
      checkoutUrl: pm.checkoutUrl,
      mode: pm.mode,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Booking creation failed' });
  }
}