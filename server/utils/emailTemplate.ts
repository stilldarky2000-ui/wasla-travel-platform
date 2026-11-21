export interface WaslaEmailOptions {
  subject: string;
  headingEn: string;
  headingAr: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
}

export function renderWaslaEmail({
  subject,
  headingEn,
  headingAr,
  bodyHtml,
  ctaText,
  ctaUrl,
}: WaslaEmailOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF4ED;font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#0F2233;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E5DFD7;">
          <tr>
            <td style="background:#0F2233;padding:28px 32px;text-align:center;">
              <div style="font-size:26px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;">
                Wasla <span style="color:#EE5426;font-size:14px;letter-spacing:4px;">TRAVEL</span>
                <span style="color:#334155;margin:0 12px;">|</span>
                <span style="font-family:'Cairo',Tahoma,sans-serif;color:#FFFFFF;">وصلة</span>
                <span style="font-family:'Cairo',Tahoma,sans-serif;color:#EE5426;font-size:18px;">ترافيل</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 8px;font-size:22px;color:#0F2233;">${headingEn}</h1>
              <h2 dir="rtl" style="margin:0 0 20px;font-size:20px;color:#EE5426;font-family:'Cairo',Tahoma,sans-serif;">${headingAr}</h2>
              <div style="font-size:15px;line-height:1.7;color:#334155;">
                ${bodyHtml}
              </div>
              ${
                ctaText && ctaUrl
                  ? `<div style="margin-top:28px;text-align:center;">
                      <a href="${ctaUrl}" style="display:inline-block;padding:14px 28px;background:#EE5426;color:#FFFFFF;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;">
                        ${ctaText}
                      </a>
                    </div>`
                  : ''
              }
            </td>
          </tr>
          <tr>
            <td style="background:#FAF4ED;padding:20px 32px;text-align:center;font-size:12px;color:#64748B;border-top:1px solid #E5DFD7;">
              © ${new Date().getFullYear()} Wasla Travel | وصلة ترافيل. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
