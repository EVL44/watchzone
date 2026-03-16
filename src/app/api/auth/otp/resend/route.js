import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // 1. Rate Limiting (Max 3 per 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const rateLimit = await prisma.otpRateLimit.findUnique({ where: { email } });

    if (rateLimit) {
      if (rateLimit.windowStartsAt > tenMinutesAgo) {
        if (rateLimit.attempts >= 3) {
           return NextResponse.json({ message: 'Too many requests. Please try again in 10 minutes.' }, { status: 429 });
        }
        await prisma.otpRateLimit.update({
           where: { email },
           data: { attempts: { increment: 1 } }
        });
      } else {
        // Reset window if 10 mins passed
        await prisma.otpRateLimit.update({
           where: { email },
           data: { attempts: 1, windowStartsAt: new Date() }
        });
      }
    } else {
      await prisma.otpRateLimit.create({
         data: { email, attempts: 1, windowStartsAt: new Date() }
      });
    }

    // 2. Generate new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Clean up old ones for this email to prevent clutter
    await prisma.otpToken.deleteMany({
       where: { email }
    });

    await prisma.otpToken.create({
       data: { email, otp, expiresAt }
    });

    // 3. Send out via Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error: resendError } = await resend.emails.send({
      from: 'WatchZone <noreply@watchzone.dev>',
      to: email,
      subject: '🎬 Your New WatchZone Verification Code',
      html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0c0a09;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0c0a09;padding:32px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

<!-- ====== LOGO + HERO ====== -->
<tr><td style="background-color:#1c1917;border-radius:12px 12px 0 0;padding:40px 40px 32px;text-align:center;">
<img src="https://watchzone.dev/wzmax.png" alt="watchzone" width="48" style="display:inline-block;margin-bottom:12px;" />
<h1 style="margin:0;font-size:20px;font-weight:700;color:#8a2be2;letter-spacing:1px;">watchzone</h1>
<p style="margin:16px 0 0;font-size:11px;color:#78716c;text-transform:uppercase;letter-spacing:5px;">New Verification Code</p>
</td></tr>

<!-- ====== MAIN CONTENT ====== -->
<tr><td style="background-color:#0c0a09;padding:36px 40px 40px;">

<p style="margin:0 0 32px;font-size:15px;color:#a8a29e;line-height:1.7;">You requested a new verification code. Use it before it expires!</p>

<!-- OTP Code Card -->
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="background-color:#1c1917;border:1px solid #292524;border-left:4px solid #8a2be2;border-radius:8px;padding:24px 20px;text-align:center;">
<p style="margin:0 0 8px;font-size:10px;color:#78716c;text-transform:uppercase;letter-spacing:4px;">Verification Code</p>
<p style="margin:0;font-size:40px;font-weight:800;color:#8a2be2;letter-spacing:12px;font-family:system-ui,-apple-system,monospace;">${otp}</p>
</td></tr>
</table>

<!-- Expiry Notice -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
<tr><td style="background-color:#292524;border-radius:6px;padding:12px 16px;">
<p style="margin:0;font-size:13px;color:#a8a29e;">⏱ Expires in <strong style="color:#ededed;">10 minutes</strong> &nbsp;·&nbsp; Do not share this code with anyone.</p>
</td></tr>
</table>

<p style="margin:28px 0 0;font-size:13px;color:#57534e;line-height:1.6;">If you didn't request this, you can safely ignore this email.</p>
</td></tr>

<!-- ====== FOOTER ====== -->
<tr><td style="background-color:#1c1917;border-top:1px solid #292524;border-radius:0 0 12px 12px;padding:28px 32px;">

<!-- Quick Links -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
<tr><td align="center" style="font-size:13px;">
<a href="https://watchzone.dev" style="color:#a8a29e;text-decoration:none;">Home</a>
<span style="color:#292524;margin:0 10px;">·</span>
<a href="https://watchzone.dev/top-rated/movies" style="color:#a8a29e;text-decoration:none;">Top Movies</a>
<span style="color:#292524;margin:0 10px;">·</span>
<a href="https://watchzone.dev/top-rated/series" style="color:#a8a29e;text-decoration:none;">Top Series</a>
</td></tr>
</table>

<!-- Social Links -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
<tr><td align="center" style="font-size:13px;">
<a href="https://github.com/EVL44/" style="color:#8a2be2;text-decoration:none;margin:0 8px;">GitHub</a>
<a href="https://www.linkedin.com/in/abdelouahed-id" style="color:#8a2be2;text-decoration:none;margin:0 8px;">LinkedIn</a>
<a href="https://www.instagram.com/abdoidboubrik" style="color:#8a2be2;text-decoration:none;margin:0 8px;">Instagram</a>
<a href="https://x.com/evl_44" style="color:#8a2be2;text-decoration:none;margin:0 8px;">X</a>
</td></tr>
</table>

<!-- Copyright -->
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="border-top:1px solid #292524;padding-top:16px;">
<p style="margin:0 0 4px;font-size:11px;color:#57534e;">&copy; ${new Date().getFullYear()} watchzone. All Rights Reserved.</p>
<p style="margin:0;font-size:11px;color:#57534e;">Your ultimate destination for discovering and tracking movies and TV shows.</p>
</td></tr>
</table>

</td></tr>

</table>
</td></tr>
</table>
</body></html>`,
    });

    if (resendError) {
      console.error('Resend API Error:', resendError);
      return NextResponse.json({ message: `Email delivery failed: ${resendError.message}` }, { status: 500 });
    }

    return NextResponse.json({ message: 'A new verification code has been dispatched.' }, { status: 200 });

  } catch (error) {
    console.error('OTP Resend Error:', error);
    return NextResponse.json({ message: 'Internal server error while resending' }, { status: 500 });
  }
}
