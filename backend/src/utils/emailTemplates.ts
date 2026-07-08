interface BookingEmailData {
  customerName: string;
  businessName: string;
  serviceName: string;
  date: string;
  startTime: string;
  price: number;
  currency: string;
}

const wrapper = (title: string, bodyHtml: string): string => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
    <h2 style="margin-bottom: 8px;">${title}</h2>
    ${bodyHtml}
    <p style="margin-top: 24px; font-size: 13px; color: #777;">— Bkly</p>
  </div>
`;

export const bookingConfirmationTemplate = (data: BookingEmailData): string =>
  wrapper(
    "Your booking is confirmed",
    `
    <p>Hi ${data.customerName},</p>
    <p>Your booking with <strong>${data.businessName}</strong> has been confirmed.</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
      <tr><td style="padding: 6px 0; color: #555;">Service</td><td style="text-align: right;">${data.serviceName}</td></tr>
      <tr><td style="padding: 6px 0; color: #555;">Date</td><td style="text-align: right;">${data.date}</td></tr>
      <tr><td style="padding: 6px 0; color: #555;">Time</td><td style="text-align: right;">${data.startTime}</td></tr>
      <tr><td style="padding: 6px 0; color: #555;">Amount Paid</td><td style="text-align: right;">${data.currency} ${data.price.toLocaleString()}</td></tr>
    </table>
    <p style="margin-top: 16px;">See you then!</p>
  `,
  );

export const bookingCancellationTemplate = (
  data: Omit<BookingEmailData, "price" | "currency">,
): string =>
  wrapper(
    "Your booking has been cancelled",
    `
    <p>Hi ${data.customerName},</p>
    <p>Your booking with <strong>${data.businessName}</strong> for <strong>${data.serviceName}</strong> on ${data.date} at ${data.startTime} has been cancelled.</p>
    <p style="margin-top: 16px;">If this wasn't you, or you'd like to rebook, just head back to the booking page.</p>
  `,
  );

export const passwordResetTemplate = (data: {
  name: string;
  resetUrl: string;
}): string =>
  wrapper(
    "Reset your password",
    `
    <p>Hi ${data.name},</p>
    <p>We got a request to reset your Bkly password. This link expires in 30 minutes.</p>
    <p style="margin-top: 16px;">
      <a href="${data.resetUrl}" style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: 500;">
        Reset password
      </a>
    </p>
    <p style="margin-top: 16px; font-size: 13px; color: #777;">If you didn't request this, you can safely ignore this email.</p>
  `,
  );

interface NewBookingNotificationData {
  ownerName: string;
  customerName: string;
  serviceName: string;
  date: string;
  startTime: string;
  price: number;
  currency: string;
}

export const newBookingNotificationTemplate = (
  data: NewBookingNotificationData,
): string =>
  wrapper(
    "You've got a new paid booking",
    `
    <p>Hi ${data.ownerName},</p>
    <p><strong>${data.customerName}</strong> just paid for a booking.</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
      <tr><td style="padding: 6px 0; color: #555;">Service</td><td style="text-align: right;">${data.serviceName}</td></tr>
      <tr><td style="padding: 6px 0; color: #555;">Date</td><td style="text-align: right;">${data.date}</td></tr>
   <tr><td style="padding: 6px 0; color: #555;">Time</td><td style="text-align: right;">${data.startTime}</td></tr>
      <tr><td style="padding: 6px 0; color: #555;">Amount</td><td style="text-align: right;">${data.currency} ${data.price.toLocaleString()}</td></tr>
    </table>
    <p style="margin-top: 16px;">Log in to your dashboard to view the full booking.</p>
  `,
  );
