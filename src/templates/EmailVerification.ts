import { ITemplateEmail } from '@/interfaces/ITemplateEmail';
import { UserDocument } from '@/modules/users/schemas/user.schema';
import { VALID_VERIFICATION_EMAIL } from '@/constants/ValidVerificationEmail';

export const createEmailVerification = (
  brandEmail: string,
  brandName: string,
  url: string,
  user: UserDocument,
): ITemplateEmail => ({
  subject: `${brandName.trim()} Email Verification`,
  text: `Hello ${
    user.fullname
  },\n\nPlease verify your email address by clicking the link below.\n\n${url}\n\nThank you,\n${brandName.trim()}`,
  html: `<p>Hello ${user.fullname},</p>
  <p>Please verify your email address by clicking the link below.</p>
  <p>
    <a href="${url}"
      style="color:#fff;background:#1890ff;border-color:#1890ff;text-decoration:none;padding:10px 15px;text-transform:uppercase"
      target="_blank" data-saferedirecturl="https://www.google.com/url?q=${url}">
      Activate Account
    </a>
  </p>
  <p>
    If the link above doesn't work, you can copy and paste the following URL into your web browser:
  </p>
  <p>
    <a href="${url}" target="_blank" data-saferedirecturl="https://www.google.com/url?q=${url}">${url}</a>
  </p>
  <p>
    We recommend activating your account within ${VALID_VERIFICATION_EMAIL} of receiving this email.
  </p>
  <p>If you have any questions, please contact us at 
    <a style="color:#1890ff" href="mailto:${brandEmail}">
      ${brandEmail}
    </a>.
  </p>
  <p>Thank you,</p>
  <p>${brandName.trim()}</p>`,
});
