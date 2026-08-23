export function buildConfirmationEmail(confirmUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#0A0A0A;border:1px solid #1A1A1A;">
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:1px solid #1A1A1A;">
              <span style="color:#4C5634;font-size:11px;letter-spacing:4px;font-weight:600;">
                VERSUS TATTOO STUDIO
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="color:#E8E4DF;font-size:22px;font-weight:300;letter-spacing:1px;margin:0 0 16px;">
                Confirm Your Email
              </h1>
              <p style="color:#A09B95;font-size:14px;line-height:1.7;margin:0 0 24px;">
                You're one step away from trying on tattoo designs virtually.
                Click the button below to confirm your email and unlock the
                Virtual Try-On experience. You get 3 sessions per month.
              </p>
              <a href="${confirmUrl}"
                 style="display:inline-block;background-color:#4C5634;color:#E8E4DF;
                        text-decoration:none;padding:14px 32px;font-size:13px;
                        letter-spacing:2px;font-weight:500;">
                CONFIRM EMAIL
              </a>
              <p style="color:#5C5955;font-size:12px;line-height:1.6;margin:24px 0 0;">
                This link expires in 24 hours. If you didn't request this,
                you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #1A1A1A;">
              <p style="color:#3A4228;font-size:11px;letter-spacing:1px;margin:0;">
                VERSUS · Dublin, Ireland
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
