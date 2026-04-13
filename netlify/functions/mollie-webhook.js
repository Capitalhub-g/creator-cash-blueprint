// ═══════════════════════════════════════════════════════════════
// Mollie Webhook — verwerkt betaalbevestiging
// Wordt aangeroepen door Mollie zodra betaling geslaagd is
// ═══════════════════════════════════════════════════════════════

const PDF_CATALOG = {
  basic:   ['Faceless Content Starter Blueprint (28 paginas)'],
  medium:  ['Faceless Content Starter Blueprint (28 paginas)', 'Faceless Growth & Monetization Blueprint (60 paginas)'],
  premium: ['Faceless Content Starter Blueprint (28 paginas)', 'Faceless Growth & Monetization Blueprint (60 paginas)', 'Faceless Automation & Profit Blueprint (100 paginas)']
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  // Mollie sends the payment ID as form data
  let paymentId;
  try {
    const params = new URLSearchParams(event.body);
    paymentId = params.get('id');
  } catch {
    return { statusCode: 400, body: 'Bad request' };
  }

  if (!paymentId) return { statusCode: 400, body: 'No payment ID' };

  try {
    // Fetch payment status from Mollie
    const res = await fetch('https://api.mollie.com/v2/payments/' + paymentId, {
      headers: { 'Authorization': 'Bearer ' + process.env.MOLLIE_API_KEY }
    });
    const payment = await res.json();

    // Only process if payment is truly successful
    if (payment.status !== 'paid') {
      return { statusCode: 200, body: 'Status: ' + payment.status };
    }

    const { orderNumber, packageKey, packageName, customerEmail, customerName } = payment.metadata;
    const siteUrl = process.env.SITE_URL || 'https://capitalhub-g.github.io/creator-cash-blueprint';
    const token = Buffer.from(packageKey + ':' + Date.now() + ':ccb2026').toString('base64').replace(/=/g, '');
    const downloadUrl = siteUrl + '/download.html?token=' + token + '&pkg=' + packageKey;
    const firstName = customerName ? customerName.split(' ')[0] : 'there';
    const pdfs = PDF_CATALOG[packageKey] || [];
    const pdfListHtml = pdfs.map(p => '<tr><td style="padding:8px 0;border-bottom:1px solid #1a1a2e;font-size:14px;color:#e0e0e0;"><span style="color:#ff4444;margin-right:8px;">▶</span>' + p + '</td></tr>').join('');

    const emailHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#080810;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080810;padding:40px 16px;">
<tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
<tr><td style="background:linear-gradient(135deg,#0e0e1a,#1a0000);border-radius:14px 14px 0 0;padding:36px 40px;text-align:center;border:1px solid rgba(255,0,0,0.2);border-bottom:none;">
<div style="font-size:28px;margin-bottom:8px;">▶</div>
<h1 style="margin:0;font-size:20px;font-weight:800;color:#fff;">Creator<span style="color:#ff0000;">Cash</span> Blueprint</h1>
<p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.4);font-family:monospace;letter-spacing:1px;">PAYMENT CONFIRMED</p>
</td></tr>
<tr><td style="background:#0a2e12;padding:14px 40px;text-align:center;border-left:1px solid rgba(255,0,0,0.2);border-right:1px solid rgba(255,0,0,0.2);">
<p style="margin:0;font-size:14px;color:#4ade80;font-weight:600;">✅ &nbsp;Payment successful — your Blueprints are ready to download!</p>
</td></tr>
<tr><td style="background:#0e0e1a;border-radius:0 0 14px 14px;padding:36px 40px;border:1px solid rgba(255,0,0,0.2);border-top:none;">
<p style="margin:0 0 24px;font-size:16px;color:#e0e0e0;line-height:1.6;">Hey ${firstName} 👋,</p>
<p style="margin:0 0 28px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.7;">Thank you for your purchase! Your Blueprints are ready to download.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#13131f;border:1px solid rgba(255,255,255,0.08);border-radius:10px;margin-bottom:28px;">
<tr><td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);"><p style="margin:0;font-size:10px;color:rgba(255,255,255,0.3);font-family:monospace;letter-spacing:2px;font-weight:700;">ORDER SUMMARY</p></td></tr>
<tr><td style="padding:16px 20px;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="font-size:12px;color:rgba(255,255,255,0.4);font-family:monospace;padding-bottom:4px;">ORDER NUMBER</td><td style="font-size:12px;color:rgba(255,255,255,0.4);font-family:monospace;padding-bottom:4px;text-align:right;">DATE</td></tr>
<tr><td style="font-size:14px;color:#ff6666;font-weight:700;font-family:monospace;">${orderNumber}</td><td style="font-size:14px;color:#e0e0e0;font-weight:600;text-align:right;">${new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'})}</td></tr>
</table></td></tr>
<tr><td style="padding:0 20px 16px;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="font-size:12px;color:rgba(255,255,255,0.4);font-family:monospace;padding-bottom:8px;">PRODUCT</td><td style="font-size:12px;color:rgba(255,255,255,0.4);font-family:monospace;padding-bottom:8px;text-align:right;">TOTAL</td></tr>
<tr><td style="font-size:15px;color:#fff;font-weight:700;">${packageName}</td><td style="font-size:20px;color:#ff0000;font-weight:900;font-family:monospace;text-align:right;">$${payment.amount.value}</td></tr>
</table></td></tr></table>
<p style="margin:0 0 12px;font-size:12px;color:rgba(255,255,255,0.4);font-family:monospace;letter-spacing:2px;font-weight:700;">INCLUDED BLUEPRINTS</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">${pdfListHtml}</table>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
<tr><td align="center"><a href="${downloadUrl}" style="display:inline-block;background:#ff0000;color:#fff;text-decoration:none;font-size:15px;font-weight:800;padding:16px 36px;border-radius:10px;letter-spacing:-0.2px;box-shadow:0 4px 20px rgba(255,0,0,0.3);">↓ &nbsp;Download your Blueprints</a></td></tr>
<tr><td align="center" style="padding-top:10px;"><p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);font-family:monospace;">Link is altijd available in your account</p></td></tr>
</table>
<hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:28px 0;"/>
<p style="margin:0;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.7;">Questions? Email us at <a href="mailto:support@creatorcashblueprint.com" style="color:#ff6666;text-decoration:none;">support@creatorcashblueprint.com</a></p>
<p style="margin:16px 0 0;font-size:14px;color:rgba(255,255,255,0.6);">— The Creator Cash Blueprint Team</p>
</td></tr>
<tr><td style="padding:24px 0;text-align:center;">
<p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);font-family:monospace;">© 2026 Creator Cash Blueprint. All rights reserved.</p>
</td></tr>
</table></td></tr></table>
</body></html>`;

    // Send confirmation email via Resend
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || 'Creator Cash Blueprint <orders@creatorcashblueprint.com>',
        to: [customerEmail],
        subject: '✅ Order confirmed — ' + packageName + ' | ' + orderNumber,
        html: emailHtml,
        text: 'Thank you for your purchase! ORDER NUMBER: ' + orderNumber + '. Download je Blueprints via: ' + downloadUrl
      })
    });

    // Send notification to owner
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || 'Creator Cash Blueprint <orders@creatorcashblueprint.com>',
        to: [process.env.OWNER_EMAIL || 'support@creatorcashblueprint.com'],
        subject: '💰 Nieuwe verkoop: ' + packageName + ' — $' + payment.amount.value,
        text: 'New payment!\n\nCustomer: ' + customerName + '\nEmail: ' + customerEmail + '\nPackage: ' + packageName + '\nAmount: $' + payment.amount.value + '\nORDER NUMBER: ' + orderNumber + '\nMollie ID: ' + paymentId
      })
    });

    return { statusCode: 200, body: 'OK' };

  } catch (err) {
    console.error('Webhook error:', err);
    return { statusCode: 500, body: 'Error: ' + err.message };
  }
};
