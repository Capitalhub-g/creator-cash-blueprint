// ═══════════════════════════════════════════════════════════════
// Creator Cash Blueprint — Mollie Payment Function
// Netlify Serverless Function
//
// Flow:
//   1. Frontend roept POST /.netlify/functions/create-payment aan
//   2. Deze functie maakt een Mollie betaling aan via de API
//   3. Mollie geeft een checkoutUrl terug
//   4. Frontend stuurt klant door naar die URL
//   5. Klant betaalt bij Mollie (iDEAL, creditcard, etc.)
//   6. Mollie roept webhook aan na betaling
//   7. Webhook stuurt bevestigingsmail + geeft downloadlink
//
// Omgevingsvariabelen in Netlify:
//   MOLLIE_API_KEY     = live_xxxxxxxxxxxxxxxxxxxx
//   SITE_URL           = https://jouwsite.netlify.app
// ═══════════════════════════════════════════════════════════════

const PACKAGES = {
  basic:   { name: 'Faceless Content Starter Blueprint',        price: '29.00', currency: 'USD' },
  medium:  { name: 'Faceless Growth & Monetization Blueprint',  price: '65.00', currency: 'USD' },
  premium: { name: 'Faceless Automation & Profit Blueprint',    price: '95.00', currency: 'USD' }
};

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { packageKey, customerEmail, customerName } = body;

  if (!packageKey || !PACKAGES[packageKey]) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid package' }) };
  }
  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid email' }) };
  }

  const pkg = PACKAGES[packageKey];
  const siteUrl = process.env.SITE_URL || 'https://capitalhub-g.github.io/creator-cash-blueprint';
  const orderNumber = 'CCB-' + new Date().getFullYear() + '-' + (Math.floor(Math.random() * 90000) + 10000);

  try {
    // Maak betaling aan via Mollie API
    const mollieResponse = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.MOLLIE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: {
          currency: pkg.currency,
          value: pkg.price
        },
        description: pkg.name + ' — ' + orderNumber,
        redirectUrl: siteUrl + '/download.html?order=' + orderNumber + '&pkg=' + packageKey + '&status=paid',
        cancelUrl: siteUrl + '/?payment=cancelled',
        webhookUrl: siteUrl + '/.netlify/functions/mollie-webhook',
        metadata: {
          orderNumber,
          packageKey,
          packageName: pkg.name,
          customerEmail,
          customerName: customerName || ''
        },
        billingEmail: customerEmail
      })
    });

    const payment = await mollieResponse.json();

    if (!mollieResponse.ok) {
      console.error('Mollie error:', payment);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Payment creation failed', detail: payment.detail })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        checkoutUrl: payment._links.checkout.href,
        paymentId: payment.id,
        orderNumber
      })
    };

  } catch (err) {
    console.error('Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error', message: err.message }) };
  }
};
