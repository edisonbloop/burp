"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "BURP <noreply@updates.burp.ink>";

// -- Welcome email ---------------------------------------------------------
export async function sendWelcomeEmail(to: string, firstName: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to BURP",
    html: emailHtml({
      preheader: "You're in. The room is ready.",
      body: `
        <h1>Welcome, ${firstName || "friend"}.</h1>
        <p>
          You've joined <strong>BURP</strong> — the Berean Upper Room Platform.
          A community that feasts on Scripture, reflects honestly, asks hard questions,
          and grows together.
        </p>
        <p>Here's what you can do now:</p>
        <ul>
          <li>Browse the <a href="https://burp.ink/library">Content Library</a></li>
          <li>Join a <a href="https://burp.ink/burp-it">Burp It</a> plan and share your reflections</li>
          <li>Submit your own piece to the library</li>
          <li>Complete your <a href="https://burp.ink/dashboard/profile">profile</a></li>
        </ul>
        <p style="margin-top:2rem;">
          <a href="https://burp.ink/dashboard" class="btn">Go to my Dashboard →</a>
        </p>
      `,
    }),
  });
}

// -- Library item approved -------------------------------------------------
export async function sendApprovalEmail(to: string, firstName: string, itemTitle: string, itemId: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Your piece has been published — "${itemTitle}"`,
    html: emailHtml({
      preheader: "Your submission is now live on the BURP library.",
      body: `
        <h1>It's live, ${firstName || "friend"}.</h1>
        <p>
          Your piece <strong>"${itemTitle}"</strong> has been reviewed and published
          to the BURP Content Library.
        </p>
        <p>
          <a href="https://burp.ink/library/item/${itemId}" class="btn">View your piece →</a>
        </p>
        <p style="color:#A89A85; font-size:13px; margin-top:2rem;">
          Thank you for contributing to the community. Every voice adds weight to the room.
        </p>
      `,
    }),
  });
}

// -- Facilitator assigned --------------------------------------------------
export async function sendFacilitatorEmail(to: string, firstName: string, dayLabel: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `You're facilitating on ${dayLabel}`,
    html: emailHtml({
      preheader: `You've been added to the BURP facilitating timetable for ${dayLabel}.`,
      body: `
        <h1>You're facilitating, ${firstName || "friend"}.</h1>
        <p>
          You've been added to the BURP facilitating timetable for
          <strong>${dayLabel}</strong>. Thank you for serving the community. 🙏
        </p>
        <p>
          <a href="https://burp.ink/timetable" class="btn">View the timetable →</a>
        </p>
        <p style="color:#A89A85; font-size:13px; margin-top:2rem;">
          If you have any questions or can't make your day, please reach out to the coordinators.
        </p>
      `,
    }),
  });
}

// -- Worship RSVP confirmation ----------------------------------------------
export async function sendWorshipRsvpConfirmation(to: string, firstName: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "You're RSVP'd — From the Heart",
    html: emailHtml({
      preheader: "You're on the list for From the Heart, Friday 14th August 2026.",
      body: `
        <h1>You're on the list, ${firstName || "friend"}.</h1>
        <p>
          Thank you for RSVPing to <strong>From the Heart</strong> — a night of worship,
          testimony and ministration hosted by BURP.
        </p>
        <p>
          <strong>Friday, 14th August 2026 · 6:30 PM (GMT)</strong>
        </p>
        <p>
          We'll email your livestream link closer to the night, so keep an eye on your inbox.
        </p>
        <p style="margin-top:2rem;">
          <a href="https://burp.ink/worship" class="btn">View event details →</a>
        </p>
        <p style="color:#A89A85; font-size:13px; margin-top:2rem;">
          We have been feasting. August 14th is what comes out.
        </p>
      `,
    }),
  });
}

// -- Worship livestream link -------------------------------------------------
export async function sendWorshipLivestreamEmail(
  to: string,
  firstName: string,
  linkUrl: string,
  message?: string
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Your livestream link — From the Heart",
    html: emailHtml({
      preheader: "Here's your link to join From the Heart live.",
      body: `
        <h1>It's almost time, ${firstName || "friend"}.</h1>
        <p>
          Here's your livestream link for <strong>From the Heart</strong>,
          Friday 14th August 2026 at 6:30 PM (GMT).
        </p>
        ${message ? `<p>${message}</p>` : ""}
        <p style="margin-top:2rem;">
          <a href="${linkUrl}" class="btn">Join the livestream →</a>
        </p>
        <p style="color:#A89A85; font-size:13px; margin-top:2rem;">
          See you there. We have been feasting. August 14th is what comes out.
        </p>
      `,
    }),
  });
}

// -- Shared HTML template --------------------------------------------------
function emailHtml({ preheader, body }: { preheader: string; body: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>BURP</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #FBF8F1; font-family: Georgia, "Times New Roman", serif; color: #1A1714; }
  .wrap { max-width: 580px; margin: 0 auto; padding: 40px 20px; }
  .card { background: #F7F3EA; border: 1px solid #D6CCB8; border-radius: 16px; padding: 40px; }
  .logo { font-family: Georgia, serif; font-size: 22px; font-weight: 700; letter-spacing: 0.15em; color: #B8924A; text-decoration: none; display: block; margin-bottom: 32px; }
  h1 { font-size: 28px; font-weight: 700; color: #1A1714; margin-bottom: 16px; line-height: 1.25; }
  p { font-size: 15px; line-height: 1.7; color: #6B5F50; margin-bottom: 12px; }
  ul { padding-left: 20px; margin-bottom: 16px; }
  li { font-size: 15px; line-height: 1.7; color: #6B5F50; margin-bottom: 6px; }
  a { color: #B8924A; }
  .btn { display: inline-block; background: #1A1714; color: #FBF8F1 !important; text-decoration: none; padding: 12px 28px; border-radius: 100px; font-size: 13px; font-family: Georgia, serif; font-weight: 700; letter-spacing: 0.05em; }
  .footer { text-align: center; margin-top: 28px; font-size: 12px; color: #A89A85; }
  .footer a { color: #A89A85; }
  .pre { display: none; max-height: 0; overflow: hidden; }
</style>
</head>
<body>
<span class="pre">${preheader}</span>
<div class="wrap">
  <div class="card">
    <a href="https://burp.ink" class="logo">BURP</a>
    ${body}
  </div>
  <div class="footer">
    <p>The Berean Upper Room Platform · <a href="https://burp.ink">burp.ink</a></p>
    <p style="margin-top:6px;">You're receiving this because you have a BURP account.</p>
  </div>
</div>
</body>
</html>`;
}
