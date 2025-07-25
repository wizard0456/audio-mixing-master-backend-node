import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;
let emailServiceAvailable = false;

// Helper function to strip HTML tags
const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

export const getEmailServiceStatus = () => {
  return {
    available: emailServiceAvailable,
    configured: !!(process.env['SMTP_HOST'] && process.env['SMTP_USER'] && process.env['SMTP_PASS']),
    smtpHost: process.env['SMTP_HOST'] || 'Not configured',
    smtpUser: process.env['SMTP_USER'] || 'Not configured',
    smtpPort: process.env['SMTP_PORT'] || '587',
  };
};

export const initializeEmailService = async () => {
  try {
    // Check if SMTP configuration is provided
    const smtpHost = process.env['SMTP_HOST'];
    const smtpUser = process.env['SMTP_USER'];
    const smtpPass = process.env['SMTP_PASS'];


    if (!smtpHost || !smtpUser || !smtpPass) {
      console.log('⚠️  SMTP configuration not provided, email service will be disabled');
      emailServiceAvailable = false;
      return;
    }

    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env['SMTP_PORT'] || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      // Add connection timeout settings
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000, // 10 seconds
      socketTimeout: 10000, // 10 seconds
    });

    // Verify connection configuration with timeout
    const verifyPromise = transporter.verify();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 15000); // 15 second timeout
    });

    await Promise.race([verifyPromise, timeoutPromise]);
    emailServiceAvailable = true;
    console.log('✅ Email service initialized successfully');
  } catch (error) {
    console.error('❌ Email service initialization failed:', error);
    console.log('⚠️  Email service will be disabled, emails will be logged to console');
    emailServiceAvailable = false;
    transporter = null;
  }
};

export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) => {
  try {
    if (!emailServiceAvailable || !transporter) {
      // Log email to console when email service is not available
      console.log('📧 Email would be sent (email service disabled):', {
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return { messageId: 'console-log' };
    }

    const mailOptions = {
      from: process.env['SMTP_USER'],
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtmlTags(options.html),
    };

    // Add timeout to email sending
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timeout')), 30000); // 30 second timeout
    });

    const info = await Promise.race([sendPromise, timeoutPromise]);
    console.log('✅ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    // Log the email content to console as fallback
    console.log('📧 Email content (sending failed):', {
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    
    // Don't throw error, just log it and return a fallback response
    return { error: 'Email sending failed', messageId: 'failed' };
  }
};

export const sendWelcomeEmail = async (user: { name: string; email: string }) => {
  const html = `
    <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
              
              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <img src="https://i.postimg.cc/tJv1Z8Sx/logo.png" alt="Audio Mixing Logo" style="max-width: 150px;" />
                </td>
              </tr>

              <!-- Header -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <h1 style="color: #333333; font-size: 28px; margin: 0;">Welcome to Audio Mixing Services!</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="font-size: 16px; color: #555555;">
                  <p style="margin: 0 0 20px;">Hi ${user.name},</p>
                  <p style="margin: 0 0 20px;">Thank you for registering with us. We're excited to have you on board and look forward to helping you create amazing audio experiences.</p>
                  <p style="margin: 0 0 40px;">If you have any questions or need assistance, feel free to reach out to our support team anytime.</p>
                  <p style="margin: 0;">Best regards,<br><strong>The Audio Mixing Team</strong></p>
                </td>
              </tr>

              <!-- Button -->
              <tr>
                <td align="center" style="padding-top: 40px;">
                  <a href="https://your-audio-service.com" style="background-color: rgb(75, 197, 0); color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:4px; font-size:16px;">Visit Your Dashboard</a>
                </td>
              </tr>
            </table>
        

            <!-- Footer -->
            <p style="font-size:12px; color:#aaaaaa; margin-top:20px;">© 2025 Audio Mixing Services. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Welcome to Audio Mixing Services',
    html,
  });
};

export const sendPasswordResetEmail = async (user: { name: string; email: string }, resetToken: string) => {
  const resetUrl = `${process.env['FRONTEND_URL']}/reset-password/${user.email}/${resetToken}`;
  
  const html = `
    <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
              
              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <img src="https://i.postimg.cc/tJv1Z8Sx/logo.png" alt="Audio Mixing Logo" style="max-width: 150px;" />
                </td>
              </tr>

              <!-- Header -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <h1 style="color: #333333; font-size: 28px; margin: 0;">Password Reset Request</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="font-size: 16px; color: #555555;">
                  <p style="margin: 0 0 20px;">Hi ${user.name},</p>
                  <p style="margin: 0 0 20px;">You requested a password reset. Click the button below to reset your password:</p>

                  <!-- Reset Button -->
                  <p style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #4bc500; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-size: 16px;">Reset Password</a>
                  </p>

                  <p style="margin: 0 0 20px;">If you didn't request this, you can safely ignore this email.</p>
                  <p style="margin: 0;">Best regards,<br><strong>The Audio Mixing Team</strong></p>
                </td>
              </tr>
            </table>

            <!-- Footer -->
            <p style="font-size:12px; color:#aaaaaa; margin-top:20px;">© 2025 Audio Mixing Services. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html,
  });
};

export const sendOrderConfirmationEmail = async (user: { name: string; email: string }, order: any) => {
  const html = `
    <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">

              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <img src="https://i.postimg.cc/tJv1Z8Sx/logo.png" alt="Audio Mixing Logo" style="max-width: 150px;" />
                </td>
              </tr>

              <!-- Header -->
              <tr>
                <td style="padding-bottom: 20px; text-align: center;">
                  <h1 style="color: #333; margin: 0;">Order Confirmation</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="font-size: 16px; color: #555;">
                  <p>Hi ${user.name},</p>
                  <p>Your order <strong>#${order.orderNumber}</strong> has been confirmed.</p>
                  <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
                  <p>We'll start working on your audio files soon!</p>
                  <p style="margin-top: 30px;">Best regards,<br><strong>The Audio Mixing Team</strong></p>
                </td>
              </tr>

            </table>

            <p style="font-size:12px; color:#aaa; margin-top: 20px;">© 2025 Audio Mixing Mastering. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
  `;

  return sendEmail({
    to: user.email,
    subject: `Order Confirmation - #${order.orderNumber}`,
    html,
  });
};

export const sendOrderCompletedEmail = async (user: { name: string; email: string }, order: any) => {
  const html = `
    <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">

              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <img src="https://i.postimg.cc/tJv1Z8Sx/logo.png" alt="Audio Mixing Logo" style="max-width: 150px;" />
                </td>
              </tr>

              <!-- Header -->
              <tr>
                <td style="padding-bottom: 20px; text-align: center;">
                  <h1 style="color: #333; margin: 0;">Order Completed</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="font-size: 16px; color: #555;">
                  <p>Hi ${user.name},</p>
                  <p>Your order <strong>#${order.orderNumber}</strong> has been completed!</p>
                  <p>You can download your processed audio files from your dashboard.</p>

                  <p style="margin-top: 30px;">Best regards,<br><strong>The Audio Mixing Team</strong></p>
                </td>
              </tr>

            </table>

            <p style="font-size:12px; color:#aaa; margin-top: 20px;">© 2025 Audio Mixing Mastering. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
  `;

  return sendEmail({
    to: user.email,
    subject: `Order Completed - #${order.orderNumber}`,
    html,
  });
};

export const sendOrderSuccessEmail = async (data: {
  name: string;
  order_id: number;
  message: string;
  items: any[];
  url: string;
  email?: string;
}) => {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>$${item.price}</td>
      <td>${item.quantity}</td>
      <td>$${item.total_price}</td>
    </tr>
  `).join('');

  const html = `
    <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">

              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <img src="https://i.postimg.cc/tJv1Z8Sx/logo.png" alt="Audio Mixing Logo" style="max-width: 150px;" />
                </td>
              </tr>

              <!-- Header -->
              <tr>
                <td style="padding-bottom: 20px; text-align: center;">
                  <h1 style="color: #333; margin: 0;">Order Success</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="font-size: 16px; color: #555;">
                  <p>Hi ${data.name},</p>
                  <p>${data.message}</p>

                  <h2 style="color: #333; border-bottom: 2px solid #4bc500; padding-bottom: 8px;">Order Details:</h2>

                  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; text-align: left;">
                    <thead style="background-color: #4bc500; color: white;">
                      <tr>
                        <th>Service</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>

                  <p style="margin-top: 20px; text-align: center;">
                    <a href="${data.url}" style="background-color: rgb(75, 197, 0); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order Details</a>
                  </p>

                  <p>Best regards,<br>The Audio Mixing Team</p>
                </td>
              </tr>

            </table>
            <p style="font-size:12px; color:#aaa; margin-top: 20px;">© 2025 Audio Mixing Mastering. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
  `;

  return sendEmail({
    to: data.email || 'user@example.com',
    subject: `Order Success - #${data.order_id}`,
    html,
  });
};

export const sendOrderStatusEmail = async (data: {
  name: string;
  order_id: number;
  status: string;
  message: string;
  url: string;
  email?: string;
}) => {
  const html = `
    <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">

              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <img src="https://i.postimg.cc/tJv1Z8Sx/logo.png" alt="Audio Mixing Logo" style="max-width: 150px;" />
                </td>
              </tr>

              <!-- Header -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <h1 style="color: #333; margin: 0;">Order Status Update</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="font-size: 16px; color: #555;">
                  <p>Hi ${data.name},</p>
                  <p>Your order <strong>#${data.order_id}</strong> status has been updated to: <strong>${data.status}</strong></p>
                  <p>${data.message}</p>
                  <p style="text-align: center; margin: 30px 0;">
                    <a href="${data.url}" style="background-color: rgb(75, 197, 0); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order Details</a>
                  </p>
                  <p>Best regards,<br>The Audio Mixing Team</p>
                </td>
              </tr>

            </table>
            <p style="font-size:12px; color:#aaa; margin-top: 20px;">© 2025 Audio Mixing Mastering. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
  `;

  return sendEmail({
    to: data.email || 'user@example.com',
    subject: `Order Status Update - #${data.order_id}`,
    html,
  });
};

export const sendGiftCardEmail = async (data: {
  name: string;
  message: string;
  code: string;
  email?: string;
}) => {
  const html = `
    <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">

              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <img src="https://i.postimg.cc/tJv1Z8Sx/logo.png" alt="Audio Mixing Logo" style="max-width: 150px;" />
                </td>
              </tr>

              <!-- Header -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <h1 style="color: #333; margin: 0;">Gift Card Purchase</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="font-size: 16px; color: #555;">
                  <p>Hi ${data.name},</p>
                  <p>${data.message}</p>
                  <p><strong>Your Gift Card Code: <span style="color: #e74c3c;">${data.code}</span></strong></p>
                  <p>You can use this code for future purchases.</p>

                  <p>Best regards,<br>The Audio Mixing Team</p>
                </td>
              </tr>

            </table>
            <p style="font-size:12px; color:#aaa; margin-top: 20px;">© 2025 Audio Mixing Mastering. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
  `;

  return sendEmail({
    to: data.email || 'user@example.com',
    subject: 'Gift Card Purchase Confirmation',
    html,
  });
};

export const sendRevisionSuccessEmail = async (data: {
  name: string;
  order_id: number;
  service_id: number;
  amount: number;
  message: string;
  url: string;
  email?: string;
}) => {
  const html = `
    <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">

              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <img src="https://i.postimg.cc/tJv1Z8Sx/logo.png" alt="Audio Mixing Logo" style="max-width: 150px;" />
                </td>
              </tr>

              <!-- Header -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <h1 style="color: #333; margin: 0;">Revision Purchase Success</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="font-size: 16px; color: #555;">
                  <p>Hi ${data.name},</p>
                  <p>${data.message}</p>

                  <p><strong>Order ID:</strong> ${data.order_id}</p>
                  <p><strong>Service ID:</strong> ${data.service_id}</p>
                  <p><strong>Amount:</strong> $${data.amount}</p>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${data.url}" style="background-color: rgb(75, 197, 0); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order Details</a>
                  </div>

                  <p>Best regards,<br>The Audio Mixing Team</p>
                </td>
              </tr>

            </table>
            <p style="font-size:12px; color:#aaa; margin-top: 20px;">© 2025 Audio Mixing Mastering. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
  `;

  return sendEmail({
    to: data.email || 'user@example.com',
    subject: `Revision Purchase - Order #${data.order_id}`,
    html,
  });
};

// New email templates
export const sendSubscriptionDiscountEmail = async (data: {
  name: string;
  email: string;
  couponCode: string;
}) => {
  const html = `
    <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">

              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <img src="https://i.postimg.cc/tJv1Z8Sx/logo.png" alt="Audio Mixing Mastering Logo" style="max-width: 150px;" />
                </td>
              </tr>

              <!-- Header -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <h1 style="color: #333; margin: 0;">🎁 Your 10% OFF Coupon Code!</h1>
                </td>
              </tr>

              <tr>
                <td style="color: #333; font-size: 20px; font-weight: bold; padding-bottom: 15px;">
                  Your 10% Off Coupon Code!
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="font-size: 16px; color: #555;">
                  <p>Thank you for subscribing!</p>

                  <p>Here's your exclusive coupon code: <strong style="color: #e74c3c; font-size: 18px;">${data.couponCode}</strong></p>

                  <p>To redeem, simply copy the code and paste it at checkout to receive your discount. Enjoy 10% off on any of our services and include as many songs as you'd like for this first order.</p>

                  <p><strong>Note:</strong> This code is valid for a single use only. Don't miss the chance to maximize your savings on your initial purchase.</p>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://audiomixingmastering.com/services" style="background-color: rgb(75, 197, 0); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Use Coupon Now</a>
                  </div>

                  <p style="margin-top: 30px; color: #666;">Audio Mixing Mastering</p>
                </td>
              </tr>

            </table>
            <p style="font-size:12px; color:#aaa; margin-top: 20px;">© 2025 Audio Mixing Mastering. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
  `;

  return sendEmail({
    to: data.email,
    subject: '🎁 Your 10% OFF Coupon Code!',
    html,
  });
};

export const sendOrderStatusUpdateEmail = async (data: {
  name: string;
  email: string;
  order_id: number;
  status: string;
  url: string;
}) => {
  const html = `
    <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">

              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <img src="https://i.postimg.cc/tJv1Z8Sx/logo.png" alt="Audio Mixing Mastering Logo" style="max-width: 150px;" />
                </td>
              </tr>

              <!-- Header -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <h1 style="color: #333; font-size: 28px; margin: 0;">Update on Your Order Status!</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="font-size: 16px; color: #555;">
                  <p>Your project is now <strong style="color: #e74c3c;">${data.status}</strong>! You can view the latest changes or additions in your panel.</p>
                  <p><strong>Order ID:</strong> ${data.order_id}</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${data.url}" style="background-color: rgb(75, 197, 0); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order Details</a>
                  </div>
                  <p>If you have any questions or need further clarification, feel free to reach out.</p>
                  <p>Thank you for your continued trust - We're making great progress!</p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="padding-top: 30px; color: #666; font-size: 14px;">
                  Audio Mixing Mastering
                </td>
              </tr>

            </table>

            <p style="font-size:12px; color:#aaa; margin-top: 20px;">© 2025 Audio Mixing Mastering. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
  `;

  return sendEmail({
    to: data.email,
    subject: 'Update on Your Order Status!',
    html,
  });
};

export const sendOrderDeliveredEmail = async (data: {
  name: string;
  email: string;
  order_id: number;
  url: string;
}) => {
  const html = `
    <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">

              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <img src="https://i.postimg.cc/tJv1Z8Sx/logo.png" alt="Audio Mixing Mastering Logo" style="max-width: 150px;" />
                </td>
              </tr>

              <!-- Header -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <h1 style="color: #333; font-size: 28px; margin: 0;">Hooray! Your Order Has Been Successfully Delivered!</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="font-size: 16px; color: #555;">
                  <p>Hi ${data.name},</p>
                  <p>We are pleased to inform you that your order has been delivered successfully! You can view the full details of your order by clicking the button below:</p>
                  <p><strong>Order ID:</strong> ${data.order_id}</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${data.url}" style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order Details</a>
                  </div>
                  <p>If you have any questions or need assistance, feel free to reach out to us. We appreciate your trust in us and hope you enjoy your new radio ready banger! ;)</p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="padding-top: 30px; color: #666; font-size: 14px;">
                  Audio Mixing Mastering
                </td>
              </tr>

            </table>

            <p style="font-size:12px; color:#aaa; margin-top: 20px;">© 2025 Audio Mixing Mastering. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
  `;

  return sendEmail({
    to: data.email,
    subject: 'Hooray! Your Order Has Been Successfully Delivered!',
    html,
  });
};

export const sendRevisionProgressEmail = async (data: {
  name: string;
  email: string;
  order_id: number;
}) => {
  const html = `
    <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">

              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <img src="https://i.postimg.cc/tJv1Z8Sx/logo.png" alt="Audio Mixing Logo" style="max-width: 150px;" />
                </td>
              </tr>
          
              <!-- Header -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <h1 style="color: #333; font-size: 28px; margin: 0;">Your Revision is in Progress</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="font-size: 16px; color: #555;">
                  <p style="margin: 0 0 20px;">Hi ${data.name},</p>
                  <p style="margin: 0 0 20px;">Your revision request has been successfully received, and our engineering team is actively working on it.</p>
                  <p style="margin: 0 0 20px;"><strong>Order ID:</strong> ${data.order_id}</p>
                  <p style="margin: 0 0 20px;">We'll keep you updated on the progress and notify you promptly once the revision is completed.</p>
                  <p style="margin: 0;">Thank you for your patience and trust in our team!</p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="padding-top: 30px; color: #666; font-size: 14px;">
                  Audio Mixing Mastering
                </td>
              </tr>

            </table>

            <p style="font-size:12px; color:#aaa; margin-top: 20px;">© 2025 Audio Mixing Mastering. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
  `;

  return sendEmail({
    to: data.email,
    subject: 'Your Revision is in Progress',
    html,
  });
};

export const sendPasswordResetEmailUpdated = async (data: {
  name: string;
  email: string;
  resetUrl: string;
}) => {
  const html = `
    <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">

              <!-- Header -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <h1 style="color: #333; font-size: 28px; margin: 0;">Password Reset Request</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="font-size: 16px; color: #555;">
                  <p style="margin: 0 0 20px;">Hi ${data.name},</p>
                  <p style="margin: 0 0 20px;">It looks like you've requested a password reset. If you did not make this request, please disregard this email.</p>
                  <p style="margin: 0 0 30px;">To reset your password, simply click the link below:</p>

                  <div style="text-align: center; margin-bottom: 30px;">
                    <a href="${data.resetUrl}" style="background-color: rgb(75, 197, 0); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                  </div>

                  <p style="margin: 0;">Thank you,<br /><strong>Audio Mixing Mastering Team</strong></p>
                </td>
              </tr>

            </table>

            <!-- Footer -->
            <p style="font-size:12px; color:#aaa; margin-top: 20px;">© 2025 Audio Mixing Mastering. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
  `;

  return sendEmail({
    to: data.email,
    subject: 'Password Reset Request',
    html,
  });
};

export const sendEmailVerificationRequest = async (data: {
  name: string;
  email: string;
  verificationUrl: string;
}) => {
    const html = `
      <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
                
                <!-- Logo -->
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <img src="https://i.postimg.cc/tJv1Z8Sx/logo.png" alt="Audio Mixing Logo" style="max-width: 150px;" />
                  </td>
                </tr>

                <!-- Header -->
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <h1 style="color: #333333; font-size: 26px; margin: 0;">Action Required: Verify Your Email</h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="font-size: 16px; color: #555555;">
                    <p style="margin: 0 0 20px;">Dear ${data.name},</p>
                    <p style="margin: 0 0 20px;">To complete your registration, please click the button below to verify your email address:</p>

                    <!-- Button -->
                    <p style="text-align: center; margin: 30px 0;">
                      <a href="${data.verificationUrl}" style="background-color: rgb(75 197 0); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify My Email</a>
                    </p>

                    <p style="margin: 0 0 20px;">If you did not initiate this request, please disregard this email.</p>
                    <p style="margin: 0 0 20px;">Thank you for joining us at <strong>AudioMixingMastering.com</strong>!</p>
                    <p style="margin: 0;">Best regards,<br><strong>The Audio Mixing Mastering Team</strong></p>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <p style="font-size:12px; color:#aaaaaa; margin-top:20px;">© 2025 Audio Mixing Mastering. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
    `;

  return sendEmail({
    to: data.email,
    subject: 'Action Required: Verify Your Email Address',
    html,
  });
};

export const sendEmailVerificationSuccess = async (data: {
  name: string;
  email: string;
}) => {
  const html = `
    <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
              
              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <img src="https://i.postimg.cc/tJv1Z8Sx/logo.png" alt="Audio Mixing Logo" style="max-width: 150px;" />
                </td>
              </tr>
              
              <!-- Header -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <h1 style="color: #333333; font-size: 28px; margin: 0;">Email Verification Successful</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="font-size: 16px; color: #555555;">
                  <p style="margin: 0 0 20px;">Dear ${data.name},</p>
                  <p style="margin: 0 0 20px;">We are pleased to inform you that your email address has been successfully verified. You can now enjoy full access to all features of our services.</p>
                  <p style="margin: 0 0 20px;">If you have any questions or need further assistance, please don't hesitate to reach out.</p>
                  <p style="margin: 0 0 40px;">Thank you for being a valued member of our community!</p>
                  <p style="margin: 0;">Best regards,<br /><strong>The Audio Mixing Mastering Team</strong></p>
                </td>
              </tr>
              
            </table>
            
            <!-- Footer -->
            <p style="font-size:12px; color:#aaaaaa; margin-top:20px;">© 2025 Audio Mixing Mastering. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
  `;

  return sendEmail({
    to: data.email,
    subject: 'Email Verification Successful',
    html,
  });
};

export const sendCartReminderEmail = async (data: {
  name: string;
  email: string;
}) => {
  const html = `
    <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
              
              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <img src="https://i.postimg.cc/tJv1Z8Sx/logo.png" alt="Audio Mixing Logo" style="max-width: 150px;" />
                </td>
              </tr>
              
              <!-- Header -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <h1 style=" color: #555555;font-size: 28px; margin: 0;">Don't Forget! Your Services Are Waiting in Your Cart!</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="font-size: 16px; color: #555555;">
                  <p style="margin: 0 0 20px;">Hi ${data.name},</p>
                  <p style="margin: 0 0 20px;">It looks like you've left some services in your shopping cart. Don't miss out!</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://audiomixingmastering.com/services" style="background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Your Order Now</a>
                  </div>
                  
                  <p style="margin: 0 0 20px;">Complete your order now at <a href="https://audiomixingmastering.com/" style=" text-decoration:none;">audiomixingmastering.com</a> before it's gone.</p>
                  
                  <p style="margin: 0;">Thank you,<br /><strong>The Audio Mixing Mastering Team</strong></p>
                </td>
              </tr>

            </table>

            <!-- Footer -->
            <p style="font-size:12px; color:#aaaaaa; margin-top:20px;">© 2025 Audio Mixing Mastering. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
  `;

  return sendEmail({
    to: data.email,
    subject: "Don't Forget! Your Services Are Waiting in Your Cart!",
    html,
  });
}; 