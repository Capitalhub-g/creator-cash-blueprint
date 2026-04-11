// ═══════════════════════════════════════════════════════════════
// Creator Cash Blueprint — Purchase Confirmation Email
// Netlify Serverless Function
//
// Setup:
//   1. npm install @netlify/functions in project root
//   2. Add RESEND_API_KEY to Netlify environment variables
//   3. Add FROM_EMAIL to Netlify environment variables
//   4. Deploy to Netlify
//
// Endpoint: POST /.netlify/functions/send-confirmation
// ═══════════════════════════════════════════════════════════════

const PACKAGE_DETAILS = {
  basic: {
    name: 'Basic Package',
    price: 29,
    pdfs: ['Faceless Content Starter Blueprint (28 pages)']
  },
  medium: {
    name: 'Medium Package',
    price: 65,
    pdfs: [
      'Faceless Content Starter Blueprint (28 pages)',
      'Faceless Growth & Monetization Guide (60 pages)'
    ]
  },
  premium: {
    name: 'Premium Package',
    price: 95,
    pdfs: [
      'Faceless Content Starter Blueprint (28 pages)',
      'Faceless Growth & Monetization Guide (60 pages)',
      'Faceless Automation & Profit Blueprint (100 pages)'
    ]
  }
};

exports.handler = async (event) => {
  // ── CORS headers ──────────────────────────────────────────────
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // ── Parse body ────────────────────────────────────────────────
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { customerName, customerEmail, packageKey, orderNumber } = body;

  // ── Validate inputs ───────────────────────────────────────────
  if (!customerEmail || !packageKey || !orderNumber) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing required fields: customerEmail, packageKey, orderNumber' })
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid email address' }) };
  }

  const pkg = PACKAGE_DETAILS[packageKey];
  if (!pkg) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid package key' }) };
  }

  // ── Generate download token ───────────────────────────────────
  const token = Buffer.from(`${packageKey}:${Date.now()}:ccb2026`).toString('base64').replace(/=/g, '');
  const downloadUrl = `${process.env.SITE_URL || 'https://creatorcashblueprint.com'}/download.html?token=${token}&pkg=${packageKey}`;

  // ── Build email HTML ──────────────────────────────────────────
  const firstName = customerName ? customerName.split(' ')[0] : 'there';
  const pdfListHtml = pkg.pdfs.map(pdf =>
    `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #1a1a2e;font-size:14px;color:#e0e0e0;">
        <span style="color:#ff4444;margin-right:8px;">▶</span>${pdf}
      </td>
    </tr>`
  ).join('');

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Purchase Confirmation — Creator Cash Blueprint</title>
</head>
<body style="margin:0;padding:0;background-color:#080810;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080810;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0e0e1a,#1a0000);border-radius:14px 14px 0 0;padding:36px 40px;text-align:center;border:1px solid rgba(255,0,0,0.2);border-bottom:none;">
              <div style="font-size:28px;margin-bottom:8px;">▶</div>
              <h1 style="margin:0;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">
                Creator<span style="color:#ff0000;">Cash</span> Blueprint
              </h1>
              <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.4);font-family:monospace;letter-spacing:1px;">
                PURCHASE CONFIRMATION
              </p>
            </td>
          </tr>

          <!-- Green success bar -->
          <tr>
            <td style="background:#0a2e12;padding:14px 40px;text-align:center;border-left:1px solid rgba(255,0,0,0.2);border-right:1px solid rgba(255,0,0,0.2);">
              <p style="margin:0;font-size:14px;color:#4ade80;font-weight:600;">
                ✅ &nbsp;Payment successful — your PDFs are ready!
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#0e0e1a;border-radius:0 0 14px 14px;padding:36px 40px;border:1px solid rgba(255,0,0,0.2);border-top:none;">

              <!-- Greeting -->
              <p style="margin:0 0 24px;font-size:16px;color:#e0e0e0;line-height:1.6;">
                Hey ${firstName} 👋,
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.7;">
                Thank you for your purchase! Your guides are ready to download. You'll find your personal download link below — it's yours to keep.
              </p>

              <!-- Order summary box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#13131f;border:1px solid rgba(255,255,255,0.08);border-radius:10px;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.3);font-family:monospace;letter-spacing:2px;font-weight:700;">ORDER SUMMARY</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:12px;color:rgba(255,255,255,0.4);font-family:monospace;padding-bottom:4px;">ORDER NUMBER</td>
                        <td style="font-size:12px;color:rgba(255,255,255,0.4);font-family:monospace;padding-bottom:4px;text-align:right;">DATE</td>
                      </tr>
                      <tr>
                        <td style="font-size:14px;color:#ff6666;font-weight:700;font-family:monospace;">${orderNumber}</td>
                        <td style="font-size:14px;color:#e0e0e0;font-weight:600;text-align:right;">${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 20px 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:12px;color:rgba(255,255,255,0.4);font-family:monospace;padding-bottom:8px;">PRODUCT</td>
                        <td style="font-size:12px;color:rgba(255,255,255,0.4);font-family:monospace;padding-bottom:8px;text-align:right;">TOTAL</td>
                      </tr>
                      <tr>
                        <td style="font-size:15px;color:#ffffff;font-weight:700;">${pkg.name}</td>
                        <td style="font-size:20px;color:#ff0000;font-weight:900;font-family:monospace;text-align:right;">$${pkg.price}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- PDFs included -->
              <p style="margin:0 0 12px;font-size:12px;color:rgba(255,255,255,0.4);font-family:monospace;letter-spacing:2px;font-weight:700;">INCLUDED PDF GUIDES</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                ${pdfListHtml}
              </table>

              <!-- Download CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${downloadUrl}"
                       style="display:inline-block;background:#ff0000;color:#ffffff;text-decoration:none;font-size:15px;font-weight:800;padding:16px 36px;border-radius:10px;letter-spacing:-0.2px;box-shadow:0 4px 20px rgba(255,0,0,0.3);">
                      ↓ &nbsp;Download Your PDFs
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:10px;">
                    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);font-family:monospace;">
                      Link is active · Access anytime from your account
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:28px 0;" />

              <!-- Getting started tips -->
              <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#ffffff;letter-spacing:-0.2px;">Quick start tips:</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:8px 0;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6;">
                    <span style="color:#ff4444;">1.</span> &nbsp;Click the download button above to access your PDF guides
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6;">
                    <span style="color:#ff4444;">2.</span> &nbsp;Read the Starter Blueprint first — it covers the complete foundation
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6;">
                    <span style="color:#ff4444;">3.</span> &nbsp;Follow the 30-day launch plan in Chapter 7 step by step
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6;">
                    <span style="color:#ff4444;">4.</span> &nbsp;Save this email — you can re-download anytime from your account
                  </td>
                </tr>
              </table>

              <!-- Support note -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#13131f;border:1px solid rgba(255,255,255,0.06);border-radius:10px;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.7;">
                    Questions? Reply to this email or contact us at
                    <a href="mailto:support@creatorcashblueprint.com" style="color:#ff6666;text-decoration:none;">support@creatorcashblueprint.com</a>.
                    We reply within 24 hours.
                  </td>
                </tr>
              </table>

              <!-- Closing -->
              <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.7;">
                You've made a great investment in your content journey. Now go build something — we're rooting for you.
              </p>
              <p style="margin:16px 0 0;font-size:14px;color:rgba(255,255,255,0.6);">
                — The Creator Cash Blueprint Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0;text-align:center;">
              <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.2);font-family:monospace;">
                © 2026 Creator Cash Blueprint. All rights reserved.
              </p>
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15);font-family:monospace;">
                You received this because you made a purchase at creatorcashblueprint.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // ── Plain text fallback ───────────────────────────────────────
  const emailText = `
Creator Cash Blueprint — Purchase Confirmation

Hi ${firstName},

Thank you for your purchase! Your order has been confirmed.

ORDER DETAILS
─────────────────────────────
Order Number : ${orderNumber}
Date         : ${new Date().toLocaleDateString('en-US')}
Product      : ${pkg.name}
Total        : $${pkg.price}

INCLUDED PDFs
─────────────────────────────
${pkg.pdfs.map(pdf => `• ${pdf}`).join('\n')}

DOWNLOAD YOUR PDFS
─────────────────────────────
${downloadUrl}

Your download link is active and available anytime from your account.

Questions? Email us: support@creatorcashblueprint.com

— The Creator Cash Blueprint Team
  `.trim();

  // ── Send via Resend ───────────────────────────────────────────
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || 'Creator Cash Blueprint <orders@creatorcashblueprint.com>',
        to: [customerEmail],
        subject: `✅ Your order is confirmed — ${pkg.name} | ${orderNumber}`,
        html: emailHtml,
        text: emailText,
        tags: [
          { name: 'package', value: packageKey },
          { name: 'order', value: orderNumber }
        ]
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', result);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Email delivery failed', details: result })
      };
    }

    // Also send internal notification to owner
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || 'Creator Cash Blueprint <orders@creatorcashblueprint.com>',
        to: [process.env.OWNER_EMAIL || 'support@creatorcashblueprint.com'],
        subject: `💰 New sale: ${pkg.name} — $${pkg.price} from ${customerEmail}`,
        text: `New purchase!\n\nCustomer: ${customerName}\nEmail: ${customerEmail}\nPackage: ${pkg.name}\nAmount: $${pkg.price}\nOrder: ${orderNumber}\nDate: ${new Date().toISOString()}`
      })
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        messageId: result.id,
        orderNumber,
        downloadUrl
      })
    };

  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
};
