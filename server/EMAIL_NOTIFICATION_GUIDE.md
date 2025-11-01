# Email Notification System - Implementation Guide

## 📧 Overview

The CarWash Booking App now has integrated email notifications using **Brevo (formerly Sendinblue)**. Customers and professionals receive automated emails for booking confirmations and status updates.

## 🎯 Features

### 1. **Booking Confirmation Emails**
Sent when a new booking is created via `/api/saveBookings`:
- Booking details (ID, service, time, location, price)
- Professional assignment information
- Status indicators (assigned/unavailable)
- Professional contact details (when assigned)

### 2. **Status Update Emails**
Sent when booking status changes via `/api/updateBookingStatus`:
- Old status → New status transition
- Status-specific messages and icons
- Booking information reminder
- Special messages for completed/cancelled bookings

### 3. **Professional Assignment Emails**
Sent to professionals when assigned a new job:
- Customer details
- Service requirements
- Location and timing
- Job duration

## 🚀 Setup Instructions

### Prerequisites
✅ Brevo account created  
✅ API key generated  
✅ Sender email verified  
✅ Package installed: `@getbrevo/brevo`

### Configuration

**⚠️ SECURITY NOTICE: API credentials MUST be set via Azure environment variables!**

See `SECURITY_SETUP.md` for detailed instructions on configuring environment variables.

**Environment Variables** (Required for production):
```env
BREVO_API_KEY=your_brevo_api_key_from_azure_portal
SENDER_EMAIL=deepulakkimsetti@gmail.com
SENDER_NAME=CarWash Booking App
```

**Configuration in Azure:**
- Azure Portal → App Service → Configuration → Application Settings
- Add all credentials as environment variables
- Never hardcode API keys in source code!

## 📝 API Changes

### `/api/saveBookings` - New Fields

**Request Body (Added):**
```json
{
  "customer_id": "CUST001",
  "service_id": 1,
  "scheduled_time": "2025-11-15T14:30:00",
  "location_address": "123 Main Street",
  "LocationID": 1,
  "customer_email": "customer@example.com",      // NEW - Required for emails
  "customer_name": "John Doe"                    // NEW - Optional but recommended
}
```

**Behavior:**
- ✅ Sends confirmation email to customer after successful booking
- ✅ Sends assignment notification to assigned professional
- ✅ Sends unavailability notice if no professionals available
- ⚠️ If `customer_email` is not provided, booking still works but no email sent

### `/api/updateBookingStatus` - New Fields

**Request Body (Added):**
```json
{
  "booking_id": 1,
  "booking_status": "confirmed",
  "customer_email": "customer@example.com",      // NEW - Required for emails
  "customer_name": "John Doe"                    // NEW - Optional but recommended
}
```

**Behavior:**
- ✅ Sends status update email to customer
- ✅ Includes old status → new status transition
- ✅ Context-specific messages based on new status
- ⚠️ If `customer_email` is not provided, status updates but no email sent

## 📨 Email Templates

### 1. Booking Confirmation Email
**Subject:** `Booking Confirmation - CarWash Service #123`

**Content Includes:**
- Welcome header with gradient design
- Complete booking details in table format
- Professional information (if assigned)
- Status badge (assigned/unavailable/pending)
- Warning message if unavailable
- Professional footer

### 2. Status Update Email
**Subject:** `Booking Status Updated - #123`

**Content Includes:**
- Status-specific header color and icon
- Visual status transition (old → new)
- Booking reminder information
- Context messages:
  - ✅ **Confirmed:** "Professional will arrive at scheduled time"
  - 🔄 **In Progress:** "Service is currently in progress"
  - 🎉 **Completed:** "Thank you for your business!"
  - ❌ **Cancelled:** "Contact us if you have questions"

### 3. Professional Assignment Email
**Subject:** `New Assignment - Booking #123`

**Content Includes:**
- Professional-focused design
- Customer contact information
- Service requirements
- Location and timing details
- Duration information

## 🎨 Email Design Features

- **Responsive Design:** Works on desktop and mobile
- **Professional Layout:** Clean, modern design with gradients
- **Color-Coded Status:** Different colors for different statuses
- **Icon-Based:** Visual icons for better UX (✅ 🔄 🎉 ❌ 👨‍🔧)
- **Indian Localization:** Dates formatted in IST timezone
- **Currency:** Prices shown in ₹ (Rupees)

## 🔧 Technical Implementation

### File Structure
```
server/
├── index.js              # Main API file (updated with email integration)
├── emailService.js       # NEW - Email service module
├── package.json          # Updated with @getbrevo/brevo dependency
└── .env                  # Environment variables (optional)
```

### Email Service Module (`emailService.js`)

**Functions:**
1. `sendBookingConfirmationEmail(bookingDetails)` - Customer confirmation
2. `sendStatusUpdateEmail(statusDetails)` - Status change notification
3. `sendProfessionalAssignmentEmail(assignmentDetails)` - Professional notification

**Error Handling:**
- All email operations are **non-blocking**
- Failures are logged but don't affect API responses
- Email errors don't cause booking/update operations to fail

## 📊 Brevo Dashboard

**Monitor emails at:** https://app.brevo.com/

**Features Available:**
- Real-time email delivery tracking
- Open rates and click rates
- Bounce management
- Email activity logs
- API usage statistics

**Free Tier Limits:**
- ✅ 300 emails/day
- ✅ Unlimited contacts
- ✅ Transactional emails
- ✅ Email templates
- ✅ API access

## 🧪 Testing

### Test Booking Creation with Email:
```bash
POST https://your-api.azurewebsites.net/api/saveBookings

{
  "customer_id": "TEST001",
  "service_id": 1,
  "scheduled_time": "2025-11-15T14:30:00",
  "location_address": "123 Test Street, Mumbai",
  "LocationID": 1,
  "customer_email": "your-test-email@gmail.com",
  "customer_name": "Test User"
}
```

### Test Status Update with Email:
```bash
PUT https://your-api.azurewebsites.net/api/updateBookingStatus

{
  "booking_id": 1,
  "booking_status": "confirmed",
  "customer_email": "your-test-email@gmail.com",
  "customer_name": "Test User"
}
```

### Verify Emails:
1. Check inbox of provided email address
2. Check Brevo dashboard for delivery status
3. Review server logs for email sending confirmation

## 📝 Console Logs

**Email-related logs to watch for:**
```
📧 Sending email notifications...
✅ Customer confirmation email sent
✅ Professional assignment email sent
✅ Status update email sent
⚠️ No customer email provided, skipping email notifications
❌ Error sending customer email: [error message]
```

## 🚨 Troubleshooting

### Issue: Emails not being sent

**Check:**
1. ✅ Is `customer_email` included in request body?
2. ✅ Is email address valid?
3. ✅ Is Brevo API key correct in `emailService.js`?
4. ✅ Is sender email verified in Brevo dashboard?
5. ✅ Check server logs for error messages
6. ✅ Check Brevo dashboard for API errors

### Issue: Emails going to spam

**Solution:**
- Brevo has good deliverability, but check:
  - Email content isn't flagged by spam filters
  - Sender email domain has good reputation
  - Add your domain to Brevo's verified senders list

### Issue: API key not working

**Solution:**
1. Generate new API key in Brevo dashboard
2. Update `emailService.js` line 5 with new key
3. Restart server

## 🎓 Best Practices

1. **Always provide customer email** when available
2. **Include customer name** for personalization
3. **Test with your own email** before going live
4. **Monitor Brevo dashboard** regularly
5. **Keep sender email verified**
6. **Handle email errors gracefully** (they're non-blocking)
7. **Don't expose API key** in public repositories

## 📈 Production Deployment

### Azure App Service Configuration:

1. Add environment variables (optional):
   ```
   BREVO_API_KEY=your_api_key
   SENDER_EMAIL=deepulakkimsetti@gmail.com
   SENDER_NAME=CarWash Booking App
   ```

2. Deploy updated code
3. Verify emails work in production
4. Monitor Brevo dashboard

### Scaling Considerations:

- Free tier: 300 emails/day
- If you exceed: Upgrade to paid plan (~₹400/month for 20K emails)
- For M.Tech demo: Free tier is sufficient

## ✅ Checklist

Before going live:
- [ ] Brevo account created and verified
- [ ] API key generated and added to code
- [ ] Sender email verified in Brevo
- [ ] `@getbrevo/brevo` package installed
- [ ] Test booking with email successful
- [ ] Test status update with email successful
- [ ] Emails arriving in inbox (not spam)
- [ ] Emails display correctly on mobile
- [ ] Error handling tested
- [ ] Production deployment complete

## 🎉 Success!

Your CarWash Booking App now has professional email notifications! Customers will receive beautiful, informative emails for all their bookings.

---

**Need Help?**
- Brevo Documentation: https://developers.brevo.com/
- Brevo Support: https://help.brevo.com/
- Contact: deepulakkimsetti@gmail.com
