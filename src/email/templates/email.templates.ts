export class EmailTemplate {
  getWelcomeTemplate(data: { name: string; email: string }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Our Platform!</h1>
            </div>
            <div class="content">
              <h2>Hi ${data.name}! 👋</h2>
              <p>Thank you for joining us. We're excited to have you on board!</p>
              <p>Your account has been successfully created with email: <strong>${data.email}</strong></p>
              <a href="https://yourapp.com/dashboard" class="button">Get Started</a>
              <p>If you have any questions, feel free to reach out to our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getCampaignCreatedTemplate(data: {
    campaignName: string;
    packageType: string;
    startDate: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2196F3; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Campaign Created Successfully! 🚀</h1>
            </div>
            <div class="content">
              <h2>Campaign Details</h2>
              <div class="info-box">
                <p><strong>Campaign Name:</strong> ${data.campaignName}</p>
                <p><strong>Package Type:</strong> ${data.packageType.toUpperCase()}</p>
                <p><strong>Start Date:</strong> ${new Date(data.startDate).toLocaleDateString()}</p>
              </div>
              <p>Your campaign is now under review. We'll notify you once it's approved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getCampaignApprovedTemplate(data: {
    campaignName: string;
    campaignId: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="background: #4CAF50; color: white; padding: 20px; text-align: center;">
              <h1>Campaign Approved! ✅</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <h2>Great News!</h2>
              <p>Your campaign <strong>"${data.campaignName}"</strong> has been approved and is now live!</p>
              <a href="https://yourapp.com/campaigns/${data.campaignId}" style="display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                View Campaign
              </a>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getPasswordResetTemplate(data: {
    resetLink: string;
    expiresIn: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2>Reset Your Password</h2>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <a href="${data.resetLink}" style="display: inline-block; padding: 12px 24px; background: #f44336; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Reset Password
            </a>
            <p>This link will expire in ${data.expiresIn}.</p>
            <p><small>If you didn't request this, please ignore this email.</small></p>
          </div>
        </body>
      </html>
    `;
  }

  getEmailVerificationTemplate(data: {
    verificationLink: string;
    name: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2>Verify Your Email Address</h2>
            <p>Hi ${data.name},</p>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="${data.verificationLink}" style="display: inline-block; padding: 12px 24px; background: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Verify Email
            </a>
            <p><small>If you didn't create an account, please ignore this email.</small></p>
          </div>
        </body>
      </html>
    `;
  }
}
