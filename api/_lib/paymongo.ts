// api/_lib/paymongo.ts

const DEFAULT_PK = 'pk_test_BY7BSZ3PgAxHXaQybTr5CTi5';

export interface CreatePayMongoCheckoutInput {
  amountPHP: number;
  description: string;
  channel: string;
  successUrl: string;
  failedUrl: string;
  billing: {
    name: string;
    phone: string;
    email: string;
  };
  metadata: Record<string, string>;
}

export interface PayMongoCheckoutResult {
  id: string;
  checkoutUrl: string;
  mode: 'checkout_session' | 'source';
}

export async function createPayMongoCheckout(
  input: CreatePayMongoCheckoutInput
): Promise<PayMongoCheckoutResult> {
  const secretKey = process.env.PAYMONGO_SECRET_KEY?.trim();
  const publicKey = process.env.PAYMONGO_PUBLIC_KEY?.trim() || DEFAULT_PK;
  const amountCentavos = Math.round(input.amountPHP * 100);

  // 1. If PAYMONGO_SECRET_KEY (sk_test_...) is configured, use Checkout Sessions API
  if (secretKey) {
    const auth = Buffer.from(`${secretKey}:`).toString('base64');
    const res = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            billing: input.billing,
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            description: input.description,
            payment_method_types: ['gcash', 'paymaya', 'qrph', 'card'],
            success_url: input.successUrl,
            cancel_url: input.failedUrl,
            line_items: [
              {
                currency: 'PHP',
                amount: amountCentavos,
                name: input.description,
                quantity: 1,
              },
            ],
            metadata: input.metadata,
          },
        },
      }),
    });

    const json: any = await res.json();
    if (!res.ok) {
      throw new Error(json?.errors?.[0]?.detail || 'PayMongo Checkout Session failed');
    }

    return {
      id: json.data.id,
      checkoutUrl: json.data.attributes.checkout_url,
      mode: 'checkout_session',
    };
  }

  // 2. Otherwise use Public Key (pk_test_BY7BSZ3PgAxHXaQybTr5CTi5) via /v1/sources
  const pubAuth = Buffer.from(`${publicKey}:`).toString('base64');
  const sourceType = input.channel.toLowerCase() === 'gcash' ? 'gcash' : 'grab_pay';

  const res = await fetch('https://api.paymongo.com/v1/sources', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${pubAuth}`,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: amountCentavos,
          currency: 'PHP',
          type: sourceType,
          redirect: {
            success: input.successUrl,
            failed: input.failedUrl,
          },
          billing: input.billing,
          metadata: input.metadata,
        },
      },
    }),
  });

  const json: any = await res.json();
  if (!res.ok) {
    throw new Error(json?.errors?.[0]?.detail || 'PayMongo Source creation failed');
  }

  return {
    id: json.data.id,
    checkoutUrl: json.data.attributes.redirect.checkout_url,
    mode: 'source',
  };
}