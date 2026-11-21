export interface WaslaEmailOptions {
  titleAr: string;
  titleEn: string;
  bodyHtmlAr: string;
  bodyHtmlEn?: string;
  ctaTextAr?: string;
  ctaTextEn?: string;
  ctaUrl?: string;
}

export interface WaslaSingleLangEmailOptions {
  langCode: string;
  isRtl?: boolean;
  title: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  footerContactEmail?: string;
}

export function buildSingleLangWaslaEmailHtml(options: WaslaSingleLangEmailOptions): string {
  const {
    langCode,
    isRtl = false,
    title,
    bodyHtml,
    ctaText,
    ctaUrl,
    footerContactEmail = 'booking@waslatravel.com',
  } = options;
  const year = new Date().getFullYear();
  const dir = isRtl ? 'rtl' : 'ltr';
  const textAlign = isRtl ? 'right' : 'left';

  const brandHeader = isRtl
    ? '<span style="font-size:25px;font-weight:800;color:#FFFFFF;">وصلة</span>' +
      '<span style="font-size:16px;font-weight:700;color:#EE5426;margin-right:6px;">ترافيل</span>' +
      '<div style="margin-top:6px;font-size:12px;color:#CBD5E1;letter-spacing:0.3px;" dir="ltr">' +
      footerContactEmail +
      '</div>'
    : '<span style="font-size:26px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;">Wasla</span>' +
      '<span style="font-size:12px;font-weight:700;color:#EE5426;letter-spacing:4px;margin-left:6px;">TRAVEL</span>' +
      '<div style="margin-top:6px;font-size:12px;color:#CBD5E1;letter-spacing:0.3px;">' +
      footerContactEmail +
      '</div>';

  const ctaSection =
    ctaUrl && ctaText
      ? '<tr><td align="center" style="padding:8px 32px 32px 32px;">' +
        '<a href="' +
        ctaUrl +
        '" style="display:inline-block;background-color:#EE5426;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;">' +
        ctaText +
        '</a></td></tr>'
      : '';

  const footerText = isRtl
    ? '© ' + year + ' وصلة ترافيل · ' + footerContactEmail + ' — جميع الحقوق محفوظة.'
    : '© ' + year + ' Wasla Travel · ' + footerContactEmail + ' — All rights reserved.';

  return [
    '<!DOCTYPE html>',
    '<html lang="' + langCode + '" dir="' + dir + '">',
    '<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    '<title>' + title + '</title></head>',
    '<body style="margin:0;padding:0;background-color:#FAF4ED;font-family:Segoe UI,Tahoma,Arial,sans-serif;color:#0F2233;">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#FAF4ED;padding:32px 16px;">',
    '<tr><td align="center">',
    '<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E5DFD5;">',
    '<tr><td align="center" dir="' + dir + '" style="background-color:#0F2233;padding:24px 32px;">',
    brandHeader,
    '</td></tr>',
    '<tr><td dir="' + dir + '" style="padding:32px 32px 24px 32px;text-align:' + textAlign + ';">',
    '<h1 style="margin:0 0 14px 0;font-size:21px;line-height:1.35;color:#0F2233;">' + title + '</h1>',
    '<div style="font-size:14px;line-height:1.7;color:#334155;">' + bodyHtml + '</div>',
    '</td></tr>',
    ctaSection,
    '<tr><td align="center" dir="' +
      dir +
      '" style="background-color:#FAF4ED;padding:20px 32px;font-size:12px;color:#64748B;border-top:1px solid #E5DFD5;">',
    footerText,
    '</td></tr>',
    '</table></td></tr></table></body></html>',
  ].join('\n');
}

export function buildWaslaEmailHtml(options: WaslaEmailOptions): string {
  const { titleAr, titleEn, bodyHtmlAr, bodyHtmlEn, ctaTextAr, ctaTextEn, ctaUrl } = options;
  const year = new Date().getFullYear();

  const englishSection = bodyHtmlEn
    ? '<tr><td style="padding:8px 32px;"><hr style="border:none;border-top:1px solid #E5DFD5;margin:0;" /></td></tr>' +
      '<tr><td dir="ltr" style="padding:16px 32px 24px 32px;text-align:left;">' +
      '<h2 style="margin:0 0 10px 0;font-size:18px;color:#0F2233;">' + titleEn + '</h2>' +
      '<div style="font-size:14px;line-height:1.6;color:#334155;">' + bodyHtmlEn + '</div>' +
      '</td></tr>'
    : '';

  const buttonLabel = (ctaTextAr || 'عرض التفاصيل') + (ctaTextEn ? ' • ' + ctaTextEn : '');
  const ctaSection = ctaUrl
    ? '<tr><td align="center" style="padding:12px 32px 32px 32px;">' +
      '<a href="' + ctaUrl + '" style="display:inline-block;background-color:#EE5426;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;">' +
      buttonLabel +
      '</a></td></tr>'
    : '';

  return [
    '<!DOCTYPE html>',
    '<html lang="ar" dir="rtl">',
    '<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    '<title>' + titleEn + ' | ' + titleAr + '</title></head>',
    '<body style="margin:0;padding:0;background-color:#FAF4ED;font-family:Segoe UI,Tahoma,Arial,sans-serif;color:#0F2233;">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#FAF4ED;padding:32px 16px;">',
    '<tr><td align="center">',
    '<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E5DFD5;">',
    '<tr><td align="center" dir="ltr" style="background-color:#0F2233;padding:24px 32px;">',
    '<span style="font-size:26px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;">Wasla</span>',
    '<span style="font-size:12px;font-weight:700;color:#EE5426;letter-spacing:4px;margin-left:6px;">TRAVEL</span>',
    '<span style="color:#334155;margin:0 14px;font-size:22px;">|</span>',
    '<span style="font-size:24px;font-weight:700;color:#FFFFFF;">وصلة</span>',
    '<span style="font-size:16px;font-weight:700;color:#EE5426;margin-right:4px;">ترافيل</span>',
    '</td></tr>',
    '<tr><td dir="rtl" style="padding:32px 32px 16px 32px;text-align:right;">',
    '<h1 style="margin:0 0 12px 0;font-size:22px;color:#0F2233;">' + titleAr + '</h1>',
    '<div style="font-size:15px;line-height:1.7;color:#334155;">' + bodyHtmlAr + '</div>',
    '</td></tr>',
    englishSection,
    ctaSection,
    '<tr><td align="center" style="background-color:#FAF4ED;padding:20px 32px;font-size:12px;color:#64748B;border-top:1px solid #E5DFD5;">',
    '© ' + year + ' Wasla Travel (وصلة ترافيل). All rights reserved.',
    '</td></tr>',
    '</table></td></tr></table></body></html>',
  ].join('\n');
}
