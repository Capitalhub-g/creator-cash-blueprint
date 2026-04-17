// Rate limiting: max 3 requests per email per 15 min (in-memory, resets on cold start)
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const key = ip;
  const entry = rateLimitMap.get(key) || { count: 0, first: now };
  if (now - entry.first > 15 * 60 * 1000) {
    rateLimitMap.set(key, { count: 1, first: now });
    return false;
  }
  if (entry.count >= 5) return true;
  rateLimitMap.set(key, { count: entry.count + 1, first: entry.first });
  return false;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ success: true }); // Always return success (security)
  }

  const { email } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const siteUrl = process.env.SITE_URL || 'https://ytcashlab.com';

  // Generate secure token
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  const expires = Date.now() + 60 * 60 * 1000; // 1 hour
  const resetLink = `${siteUrl}/reset-password.html?token=${token}&email=${encodeURIComponent(email)}&expires=${expires}`;

  // Send email via Resend (only if account exists — we never reveal if it does)
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL || 'Creator Cash Blueprint <onboarding@resend.dev>',
          to: [email],
          subject: '🔑 Reset your password — Creator Cash Blueprint',
          html: `
            <div style="background:#080810;padding:40px;font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
              <h2 style="color:#ff0000;margin-bottom:8px">▶ Creator Cash Blueprint</h2>
              <hr style="border:none;border-top:1px solid #222;margin:20px 0">
              <h3 style="color:#fff;margin-bottom:16px">Reset your password</h3>
              <p style="color:#aaa;line-height:1.7">We received a request to reset the password for your account. Click the button below to set a new password.</p>
              <div style="text-align:center;margin:32px 0">
                <a href="${resetLink}" style="display:inline-block;background:#ff0000;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">Reset Password →</a>
              </div>
              <p style="color:#666;font-size:13px">This link expires in <strong style="color:#aaa">1 hour</strong>. If you didn't request a reset, you can safely ignore this email.</p>
              <p style="color:#666;font-size:12px;margin-top:24px">Or copy this link:<br><span style="color:#888;word-break:break-all">${resetLink}</span></p>
              <hr style="border:none;border-top:1px solid #222;margin:24px 0">
              <p style="color:#555;font-size:12px;text-align:center">Creator Cash Blueprint · ytcashlab.com</p>
            </div>`,
          text: `Reset your password: ${resetLink}\n\nThis link expires in 1 hour.`
        })
      });
    } catch(e) {
      console.error('Email send error:', e);
    }
  }

  // Always return same response (don't reveal if email exists)
  return res.status(200).json({ success: true });
}
