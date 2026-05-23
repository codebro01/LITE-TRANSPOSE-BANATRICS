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
              <h1>Welcome to Banatrics!</h1>
            </div>
            <div class="content">
              <h2>Hi ${data.name}! 👋</h2>
              <p>Thank you for joining us. We're excited to have you on board!</p>
              <p>Your account has been successfully created with email: <strong>${data.email}</strong></p>
              <a href="https://" class="button">Get Started</a>
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
              <h1>Campaign Approved!</h1>
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

  getPasswordResetTemplate(data: { resetCode: string }): string {
    return `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2>Reset Your Password</h2>
            <p>You requested to reset your password. Here is your OTP:</p>
            <a style="display: inline-block; padding: 12px 24px; background: #111111ff; color: white; text-decoration: none; margin: 20px 0;">
${data.resetCode}            </a>
            <p>This code will expire in 15 Minutes</p>
            <p><small>If you didn't request this, please ignore this email.</small></p>
          </div>
        </body>
      </html>
    `;
  }

  getEmailVerificationTemplate(data: {
    verificationCode: string;
    name: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2>Verify Your Email Address</h2>
            <p>Hi ${data.name},</p>
            <p>Use the OTP Below to verify your email</p>
            <h1 style="display: inline-block; padding: 12px 24px; background: #0e0e0fff; color: white; text-decoration: none; margin: 20px 0;">
              ${data.verificationCode}
            </h1>
            <p><small>If you didn't create an account, please ignore this email.</small></p>
          </div>
        </body>
      </html>
    `;
  }

  getCampaignStartedTemplate(data: {
    campaignName: string;
    startDate: Date;
    endDate: Date;
  }): string {
    const formattedStart = data.startDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const formattedEnd = data.endDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return `
    <!DOCTYPE html>
    <html>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background: #1a1a2e; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 26px;">🚀 Your Campaign is Live!</h1>
          </div>

          <div style="padding: 28px; background: #f9f9f9; border: 1px solid #e0e0e0;">
            <h2 style="color: #1a1a2e;">Congratulations!</h2>
            <p style="color: #444; line-height: 1.6;">
              Your campaign <strong>"${data.campaignName}"</strong> has officially kicked off.
              Drivers are hitting the road with your brand right now.
            </p>

            <div style="background: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px; padding: 16px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #777; font-size: 13px;">Start Date</td>
                  <td style="padding: 8px 0; color: #1a1a2e; font-weight: bold; text-align: right;">${formattedStart}</td>
                </tr>
                <tr style="border-top: 1px solid #f0f0f0;">
                  <td style="padding: 8px 0; color: #777; font-size: 13px;">End Date</td>
                  <td style="padding: 8px 0; color: #1a1a2e; font-weight: bold; text-align: right;">${formattedEnd}</td>
                </tr>
              </table>
            </div>
          </div>

          <div style="padding: 16px; text-align: center; color: #999; font-size: 12px; background: #f0f0f0; border-radius: 0 0 8px 8px;">
            <p style="margin: 0;">You're receiving this because you launched a campaign on Banatrics.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  }

  getCampaignCompletedTemplate(data: {
    campaignName: string;
    startDate: Date;
    endDate: Date;
  }): string {
    const formattedStart = data.startDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const formattedEnd = data.endDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return `
    <!DOCTYPE html>
    <html>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background: #1a1a2e; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 26px;">🎉 Campaign Completed!</h1>
          </div>

          <div style="padding: 28px; background: #f9f9f9; border: 1px solid #e0e0e0;">
            <h2 style="color: #1a1a2e;">That's a wrap!</h2>
            <p style="color: #444; line-height: 1.6;">
              Your campaign <strong>"${data.campaignName}"</strong> has successfully run its course.
              Thank you for advertising with Banatrics — we hope it delivered great results for your brand.
            </p>

            <div style="background: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px; padding: 16px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #777; font-size: 13px;">Start Date</td>
                  <td style="padding: 8px 0; color: #1a1a2e; font-weight: bold; text-align: right;">${formattedStart}</td>
                </tr>
                <tr style="border-top: 1px solid #f0f0f0;">
                  <td style="padding: 8px 0; color: #777; font-size: 13px;">End Date</td>
                  <td style="padding: 8px 0; color: #1a1a2e; font-weight: bold; text-align: right;">${formattedEnd}</td>
                </tr>
              </table>
            </div>

            <p style="color: #444; line-height: 1.6;">
              Ready to keep the momentum going? Launch your next campaign and keep your brand on the move.
            </p>
          </div>

          <div style="padding: 16px; text-align: center; color: #999; font-size: 12px; background: #f0f0f0; border-radius: 0 0 8px 8px;">
            <p style="margin: 0;">You're receiving this because you ran a campaign on Banatrics.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  }

  getDriverCampaignCompletedTemplate(data: {
    campaignName: string;
    startDate: Date;
    endDate: Date;
  }): string {
    const formattedStart = data.startDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const formattedEnd = data.endDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return `
  <!DOCTYPE html>
  <html>
    <body>
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: #1a1a2e; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 26px;">🏁 Campaign Ride Complete!</h1>
        </div>

        <div style="padding: 28px; background: #f9f9f9; border: 1px solid #e0e0e0;">
          <h2 style="color: #1a1a2e;">Great work out there!</h2>
          <p style="color: #444; line-height: 1.6;">
            Your participation in the <strong>"${data.campaignName}"</strong> campaign has officially wrapped up.
            Thank you for representing this brand on the road — your miles helped make this campaign a success.
          </p>

          <div style="background: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #777; font-size: 13px;">Start Date</td>
                <td style="padding: 8px 0; color: #1a1a2e; font-weight: bold; text-align: right;">${formattedStart}</td>
              </tr>
              <tr style="border-top: 1px solid #f0f0f0;">
                <td style="padding: 8px 0; color: #777; font-size: 13px;">End Date</td>
                <td style="padding: 8px 0; color: #1a1a2e; font-weight: bold; text-align: right;">${formattedEnd}</td>
              </tr>
            </table>
          </div>

          <p style="color: #444; line-height: 1.6;">
            Keep an eye out for new campaigns you can join and keep earning on the road with Banatrics.
          </p>
        </div>

        <div style="padding: 16px; text-align: center; color: #999; font-size: 12px; background: #f0f0f0; border-radius: 0 0 8px 8px;">
          <p style="margin: 0;">You're receiving this because you participated in a campaign on Banatrics.</p>
        </div>
      </div>
    </body>
  </html>
`;
  }
}
