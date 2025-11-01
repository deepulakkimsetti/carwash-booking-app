const brevo = require('@getbrevo/brevo');

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();
const apiKey = apiInstance.authentications['apiKey'];

// SECURITY: API key MUST be set via Azure environment variables
// Never hardcode API keys in source code!
if (!process.env.BREVO_API_KEY) {
  console.error('❌ CRITICAL: BREVO_API_KEY environment variable is not set!');
  console.error('📋 Add it in Azure Portal → App Service → Configuration → Application Settings');
} else {
  apiKey.apiKey = process.env.BREVO_API_KEY;
  console.log('✅ Brevo API key loaded from environment variables');
}

// Configuration - loaded from environment variables
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'deepulakkimsetti@gmail.com';
const SENDER_NAME = process.env.SENDER_NAME || 'CarWash Booking App';

/**
 * Send booking confirmation email to customer
 */
async function sendBookingConfirmationEmail(bookingDetails) {
  try {
    const {
      customer_email,
      customer_name,
      booking_id,
      service_name,
      car_type,
      scheduled_time,
      location_address,
      base_price,
      duration_minutes,
      booking_status,
      professional_name,
      professional_phone,
      professional_email
    } = bookingDetails;

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: SENDER_NAME,
      email: SENDER_EMAIL
    };

    sendSmtpEmail.to = [{
      email: customer_email,
      name: customer_name || 'Customer'
    }];

    // Dynamic subject based on booking status
    const subjectPrefix = booking_status === 'unavailable' 
      ? 'Booking Cancelled - Professionals Unavailable' 
      : 'Booking Confirmation';
    sendSmtpEmail.subject = `${subjectPrefix} - CarWash Service #${booking_id}`;

    // Format date for display
    const formattedDate = new Date(scheduled_time).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    sendSmtpEmail.htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border: 1px solid #e0e0e0;
    }
    .booking-details {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #667eea;
    }
    .detail-value {
      text-align: right;
      color: #333;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-assigned {
      background: #d4edda;
      color: #155724;
    }
    .status-pending {
      background: #fff3cd;
      color: #856404;
    }
    .status-unavailable {
      background: #f8d7da;
      color: #721c24;
    }
    .professional-info {
      background: #e8f4f8;
      padding: 15px;
      border-left: 4px solid #667eea;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      background: #f0f0f0;
      padding: 20px;
      text-align: center;
      border-radius: 0 0 10px 10px;
      font-size: 12px;
      color: #666;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${booking_status === 'unavailable' ? '❌ Booking Cancelled' : '🚗 Booking Confirmed!'}</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px;">${booking_status === 'unavailable' ? 'We apologize for the inconvenience' : 'Thank you for choosing CarWash Booking App'}</p>
  </div>
  
  <div class="content">
    <p>Dear <strong>${customer_name || 'Customer'}</strong>,</p>
    
    <p>${booking_status === 'unavailable' ? 'Unfortunately, we had to cancel your booking request.' : 'Your car wash service has been successfully booked.'} Here are your booking details:</p>
    
    <div class="booking-details">
      <div class="detail-row">
        <span class="detail-label">Booking ID:</span>
        <span class="detail-value"><strong>#${booking_id}</strong></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Service:</span>
        <span class="detail-value">${service_name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Car Type:</span>
        <span class="detail-value">${car_type}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Scheduled Time:</span>
        <span class="detail-value">${formattedDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Duration:</span>
        <span class="detail-value">${duration_minutes} minutes</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Location:</span>
        <span class="detail-value">${location_address}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Price:</span>
        <span class="detail-value"><strong>₹${base_price}</strong></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span class="detail-value">
          <span class="status-badge status-${booking_status}">${booking_status}</span>
        </span>
      </div>
    </div>
    
    ${booking_status === 'assigned' && professional_name ? `
    <div class="professional-info">
      <h3 style="margin-top: 0; color: #667eea;">👨‍🔧 Your Assigned Professional</h3>
      <p style="margin: 8px 0;"><strong>Name:</strong> ${professional_name}</p>
      <p style="margin: 8px 0;"><strong>Phone:</strong> ${professional_phone}</p>
      <p style="margin: 8px 0;"><strong>Email:</strong> ${professional_email}</p>
    </div>
    ` : ''}
    
    ${booking_status === 'unavailable' ? `
    <div style="background: #f8d7da; padding: 20px; border-left: 4px solid #dc3545; margin: 20px 0; border-radius: 4px;">
      <h3 style="margin-top: 0; color: #721c24;">❌ Booking Cancelled - Professionals Unavailable</h3>
      <p style="margin: 8px 0 0 0; color: #721c24;">
        We're sorry, but we had to cancel your booking because <strong>all professionals in your selected location were busy</strong> during your requested time slot.
      </p>
      <p style="margin: 8px 0 0 0; color: #721c24;">
        Please try booking again with a different time or contact our support team to find an alternative slot.
      </p>
    </div>
    ` : ''}
    
    <p style="margin-top: 30px;">If you have any questions or need to make changes to your booking, please contact us.</p>
    
    <p>Thank you for choosing our service!</p>
    
    <p style="margin-top: 30px;">
      <strong>Best regards,</strong><br>
      CarWash Booking App Team
    </p>
  </div>
  
  <div class="footer">
    <p>This is an automated email. Please do not reply to this message.</p>
    <p>© ${new Date().getFullYear()} CarWash Booking App. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Booking confirmation email sent successfully:', result);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending booking confirmation email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send booking status update email to customer
 */
async function sendStatusUpdateEmail(statusDetails) {
  try {
    const {
      customer_email,
      customer_name,
      booking_id,
      old_status,
      new_status,
      service_name,
      scheduled_time
    } = statusDetails;

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: SENDER_NAME,
      email: SENDER_EMAIL
    };

    sendSmtpEmail.to = [{
      email: customer_email,
      name: customer_name || 'Customer'
    }];

    sendSmtpEmail.subject = `Booking Status Updated - #${booking_id}`;

    // Format date for display
    const formattedDate = new Date(scheduled_time).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    // Status-specific messages
    const statusMessages = {
      confirmed: {
        icon: '✅',
        title: 'Booking Confirmed',
        message: 'Your booking has been confirmed. Our professional will arrive at the scheduled time.',
        color: '#28a745'
      },
      'in-progress': {
        icon: '🔄',
        title: 'Service In Progress',
        message: 'Our professional has started working on your car. The service is currently in progress.',
        color: '#17a2b8'
      },
      completed: {
        icon: '🎉',
        title: 'Service Completed',
        message: 'Your car wash service has been completed successfully. Thank you for choosing us!',
        color: '#28a745'
      },
      cancelled: {
        icon: '❌',
        title: 'Booking Cancelled',
        message: 'Your booking has been cancelled. If you have any questions, please contact us.',
        color: '#dc3545'
      },
      assigned: {
        icon: '👨‍🔧',
        title: 'Professional Assigned',
        message: 'A professional has been assigned to your booking.',
        color: '#667eea'
      },
      pending: {
        icon: '⏳',
        title: 'Booking Pending',
        message: 'Your booking is pending confirmation.',
        color: '#ffc107'
      }
    };

    const statusInfo = statusMessages[new_status] || {
      icon: '🔔',
      title: 'Status Updated',
      message: `Your booking status has been updated to: ${new_status}`,
      color: '#6c757d'
    };

    sendSmtpEmail.htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: ${statusInfo.color};
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border: 1px solid #e0e0e0;
    }
    .status-update {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    .status-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .status-change {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 20px 0;
      gap: 15px;
    }
    .status-box {
      padding: 10px 20px;
      border-radius: 5px;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 14px;
    }
    .old-status {
      background: #e0e0e0;
      color: #666;
      text-decoration: line-through;
    }
    .new-status {
      background: ${statusInfo.color};
      color: white;
    }
    .arrow {
      font-size: 24px;
      color: #667eea;
    }
    .booking-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      background: #f0f0f0;
      padding: 20px;
      text-align: center;
      border-radius: 0 0 10px 10px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${statusInfo.icon} ${statusInfo.title}</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px;">Booking #${booking_id}</p>
  </div>
  
  <div class="content">
    <p>Dear <strong>${customer_name || 'Customer'}</strong>,</p>
    
    <div class="status-update">
      <div class="status-icon">${statusInfo.icon}</div>
      <p style="font-size: 18px; margin: 15px 0;">${statusInfo.message}</p>
      
      <div class="status-change">
        <span class="status-box old-status">${old_status || 'Previous'}</span>
        <span class="arrow">→</span>
        <span class="status-box new-status">${new_status}</span>
      </div>
    </div>
    
    <div class="booking-info">
      <p style="margin: 8px 0;"><strong>Service:</strong> ${service_name || 'Car Wash Service'}</p>
      <p style="margin: 8px 0;"><strong>Scheduled Time:</strong> ${formattedDate}</p>
      <p style="margin: 8px 0;"><strong>Booking ID:</strong> #${booking_id}</p>
    </div>
    
    ${new_status === 'completed' ? `
    <div style="background: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #155724;"><strong>🌟 Thank you for your business!</strong> We hope you're satisfied with our service. Your feedback is valuable to us.</p>
    </div>
    ` : ''}
    
    ${new_status === 'cancelled' ? `
    <div style="background: #f8d7da; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #721c24;">If you didn't request this cancellation or have any questions, please contact us immediately.</p>
    </div>
    ` : ''}
    
    <p style="margin-top: 30px;">If you have any questions, feel free to contact us.</p>
    
    <p style="margin-top: 30px;">
      <strong>Best regards,</strong><br>
      CarWash Booking App Team
    </p>
  </div>
  
  <div class="footer">
    <p>This is an automated email. Please do not reply to this message.</p>
    <p>© ${new Date().getFullYear()} CarWash Booking App. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Status update email sent successfully:', result);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending status update email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send professional assignment notification to professional
 */
async function sendProfessionalAssignmentEmail(assignmentDetails) {
  try {
    const {
      professional_email,
      professional_name,
      booking_id,
      customer_name,
      service_name,
      car_type,
      scheduled_time,
      location_address,
      duration_minutes
    } = assignmentDetails;

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: SENDER_NAME,
      email: SENDER_EMAIL
    };

    sendSmtpEmail.to = [{
      email: professional_email,
      name: professional_name || 'Professional'
    }];

    sendSmtpEmail.subject = `New Assignment - Booking #${booking_id}`;

    const formattedDate = new Date(scheduled_time).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    sendSmtpEmail.htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border: 1px solid #e0e0e0;
    }
    .assignment-details {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .detail-row {
      padding: 12px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .footer {
      background: #f0f0f0;
      padding: 20px;
      text-align: center;
      border-radius: 0 0 10px 10px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>👨‍🔧 New Job Assignment</h1>
    <p style="margin: 10px 0 0 0;">Booking #${booking_id}</p>
  </div>
  
  <div class="content">
    <p>Dear <strong>${professional_name || 'Professional'}</strong>,</p>
    
    <p>You have been assigned a new car wash service:</p>
    
    <div class="assignment-details">
      <div class="detail-row">
        <strong>Customer:</strong> ${customer_name || 'N/A'}
      </div>
      <div class="detail-row">
        <strong>Service:</strong> ${service_name}
      </div>
      <div class="detail-row">
        <strong>Car Type:</strong> ${car_type}
      </div>
      <div class="detail-row">
        <strong>Scheduled Time:</strong> ${formattedDate}
      </div>
      <div class="detail-row">
        <strong>Duration:</strong> ${duration_minutes} minutes
      </div>
      <div class="detail-row" style="border-bottom: none;">
        <strong>Location:</strong> ${location_address}
      </div>
    </div>
    
    <p>Please ensure you arrive on time and complete the service professionally.</p>
    
    <p>
      <strong>Best regards,</strong><br>
      CarWash Booking App Team
    </p>
  </div>
  
  <div class="footer">
    <p>© ${new Date().getFullYear()} CarWash Booking App. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Professional assignment email sent successfully:', result);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending professional assignment email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendBookingConfirmationEmail,
  sendStatusUpdateEmail,
  sendProfessionalAssignmentEmail
};
