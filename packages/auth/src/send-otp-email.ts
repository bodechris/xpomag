type Purpose = "email-verification" | "password-reset" | "sign-in"

export async function sendOtpEmail({
  email,
  otp,
  purpose,
}: {
  email: string
  otp: string
  purpose: Purpose
}) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.AUTH_EMAIL_FROM

  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n[XPOMAG AUTH OTP] ${email} -> ${otp}\n`)
      return
    }

    throw new Error(
      "RESEND_API_KEY and AUTH_EMAIL_FROM are required in production.",
    )
  }

  const subject =
    purpose === "password-reset"
      ? "Reset your XPOMAG password"
      : purpose === "sign-in"
        ? "Your XPOMAG sign-in code"
        : "Verify your XPOMAG email"

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px">
          <div style="font-weight:900;font-size:20px;margin-bottom:34px">XpoMag</div>
          <div style="font-size:12px;letter-spacing:.12em;font-weight:700">EMAIL VERIFICATION</div>
          <h1 style="font-size:34px;line-height:1.05;margin:12px 0 14px">${subject}</h1>
          <p style="color:#666;line-height:1.6">Enter this code in XPOMAG to continue.</p>
          <div style="font-size:42px;font-weight:700;letter-spacing:.18em;margin:28px 0">${otp}</div>
          <p style="font-size:12px;color:#777">This code expires in 10 minutes.</p>
        </div>
      `,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Resend failed (${response.status}): ${body}`)
  }
}
