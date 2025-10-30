# Firebase Professional Assignment Setup

## Overview
The `saveBookings` API now automatically assigns professionals to bookings based on:
- Location proximity (Firebase Realtime Database)
- Booking count (lowest booking count first)
- Availability (no time conflicts)

## Firebase Configuration

### Current Configuration
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAfMucPwlt4AizXe7DGQWMtvPzMBxeYX_Q",
  authDomain: "carwashbookingapp-2020wa15536.firebaseapp.com",
  projectId: "carwashbookingapp-2020wa15536",
  storageBucket: "carwashbookingapp-2020wa15536.firebasestorage.app",
  messagingSenderId: "570399238161",
  appId: "1:570399238161:web:be8871216c5934f35f29b0",
  measurementId: "G-B4BPMGQQ26",
  databaseURL: "https://carwashbookingapp-2020wa15536-default-rtdb.firebaseio.com"
};
```

### Required Firebase Realtime Database Structure

Your Firebase Realtime Database should have a `professionals` node with this structure:

```json
{
  "professionals": {
    "professional_id_1": {
      "name": "John Doe",
      "phone": "+91-9876543210",
      "email": "john@example.com",
      "nearestLocations": [1, 2, 5, 10],
      "skills": ["car_wash", "detailing"],
      "rating": 4.5
    },
    "professional_id_2": {
      "name": "Jane Smith",
      "phone": "+91-9876543211",
      "email": "jane@example.com",
      "nearestLocations": [3, 4, 6],
      "skills": ["car_wash", "polishing"],
      "rating": 4.8
    }
  }
}
```

**Important**: The `nearestLocations` field must be an array of LocationIDs (integers) that match your SQL `Locations` table.

## Authentication Setup

### Option 1: Using Google Cloud Application Default Credentials (Recommended for Development)

1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
2. Run: `gcloud auth application-default login`
3. The application will automatically use your credentials

### Option 2: Using Service Account Key File (Recommended for Production)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `carwashbookingapp-2020wa15536`
3. Go to **Project Settings** (gear icon) → **Service Accounts**
4. Click **"Generate new private key"**
5. Download the JSON file
6. Save it securely (e.g., `firebase-service-account.json`)

7. Update `index.js` to use the service account:

```javascript
// Replace this line in index.js:
credential: admin.credential.applicationDefault(),

// With this:
credential: admin.credential.cert(require('./firebase-service-account.json')),
```

**Security Note**: Never commit service account keys to Git! Add to `.gitignore`:
```
firebase-service-account.json
```

### Option 3: Using Environment Variables (Best for Production/Azure)

1. Download service account JSON
2. Set environment variables:

```bash
# Windows PowerShell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\firebase-service-account.json"

# Linux/Mac
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/firebase-service-account.json"
```

3. On Azure App Service:
   - Go to Azure Portal → Your App Service
   - Configuration → Application Settings
   - Add new setting: `GOOGLE_APPLICATION_CREDENTIALS` = (paste JSON content as string)

## How It Works

### Workflow

1. **Customer creates booking** with `LocationID`
2. **Fetch professionals** from Firebase where `nearestLocations` includes the `LocationID`
3. **Get booking counts** for each professional from SQL `ProfessionalAllocation` table
4. **Sort professionals** by booking count (lowest first)
5. **Check availability** for each professional:
   - Query `ProfessionalAllocation` → `Bookings` → `Services`
   - Calculate time range: `scheduled_time` to `scheduled_time + duration_minutes`
   - Check for overlapping bookings
6. **Assign first available professional** to the booking
7. **If no professionals available**:
   - Update booking status to `'not_serviceable'` OR
   - Update booking status to `'No Professionals available at requested time'`

### Response Examples

#### Success with Professional Assignment
```json
{
  "success": true,
  "message": "Booking saved and professional assigned successfully",
  "booking_id": 1001,
  "data": {
    "booking_id": 1001,
    "customer_id": "CUST001",
    "service_id": 1,
    "booking_status": "pending",
    "scheduled_time": "2025-11-20T14:30:00.000Z",
    "location_address": "123 Main St, Mumbai",
    "LocationID": 5,
    "created_at": "2025-10-30T10:00:00.000Z",
    "updated_at": "2025-10-30T10:00:00.000Z"
  },
  "professional_allocation": {
    "allocation_id": 201,
    "professional_id": "professional_id_1",
    "professional_name": "John Doe",
    "assigned_at": "2025-10-30T10:00:00.000Z",
    "status": "assigned"
  },
  "professional_details": {
    "id": "professional_id_1",
    "name": "John Doe",
    "total_bookings": 5,
    "phone": "+91-9876543210",
    "email": "john@example.com"
  }
}
```

#### Area Not Serviceable
```json
{
  "success": true,
  "message": "Booking saved but area is not serviceable",
  "booking_id": 1002,
  "booking_status": "not_serviceable",
  "data": {
    "booking_id": 1002,
    "customer_id": "CUST002",
    "booking_status": "not_serviceable",
    ...
  }
}
```

#### All Professionals Busy
```json
{
  "success": true,
  "message": "Booking saved but no professionals available at the requested time",
  "booking_id": 1003,
  "booking_status": "No Professionals available at requested time",
  "professionals_checked": 3,
  "data": {
    ...
  }
}
```

## Testing

### 1. Test Firebase Connection

Create a test script `test-firebase.js`:

```javascript
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://carwashbookingapp-2020wa15536-default-rtdb.firebaseio.com"
});

const db = admin.database();
const ref = db.ref('professionals');

ref.once('value', (snapshot) => {
  console.log('Professionals in Firebase:', snapshot.val());
  process.exit(0);
}, (error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

Run: `node test-firebase.js`

### 2. Test Booking with Professional Assignment

```powershell
$booking = @{
    customer_id = "CUST001"
    service_id = 1
    scheduled_time = "2025-11-20T14:30:00"
    location_address = "123 Main St, Andheri West, Mumbai"
    LocationID = 5
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/saveBookings" `
    -Method POST -Body $booking -ContentType "application/json"
```

### 3. Check Logs

The endpoint provides detailed logging:
- ✅ Success indicators (green checkmarks)
- ⚠️ Warnings (yellow alerts)
- ❌ Errors (red X marks)
- 🔍 Query/search operations
- 📊 Data analysis operations

## Database Schema Requirements

### ProfessionalAllocation Table
```sql
CREATE TABLE ProfessionalAllocation (
    allocation_id BIGINT PRIMARY KEY IDENTITY(1,1),
    booking_id BIGINT NOT NULL,
    professional_id BIGINT NOT NULL,
    assigned_at DATETIME DEFAULT GETDATE(),
    status VARCHAR(20) DEFAULT 'assigned',
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
);
```

### Services Table (must have duration_minutes)
```sql
ALTER TABLE Services ADD duration_minutes INT NOT NULL DEFAULT 30;
```

## Troubleshooting

### Firebase Authentication Error
```
Error: Could not load the default credentials
```
**Solution**: Set up authentication using one of the options above.

### No Professionals Found
```
Found 0 professionals for LocationID X
```
**Solution**: 
1. Check Firebase Realtime Database has `professionals` node
2. Verify `nearestLocations` array includes the LocationID
3. Check Firebase database URL is correct

### Service Duration Not Found
```
Service not found with ID: X
```
**Solution**: Ensure the `Services` table has the `duration_minutes` column and the service exists.

### Professional Assignment Failed
```
Error assigning professional
```
**Solution**: Check:
1. `ProfessionalAllocation` table exists
2. Professional ID from Firebase is numeric or matches your table structure
3. Foreign key constraints are satisfied

## Security Considerations

1. **Never expose Firebase service account keys** in client-side code
2. **Add `.gitignore` entry** for credential files
3. **Use environment variables** in production
4. **Implement Firebase Database Rules** to restrict access:

```json
{
  "rules": {
    "professionals": {
      ".read": "auth != null",
      ".write": "auth != null && auth.uid == 'admin_uid'"
    }
  }
}
```

4. **Rotate credentials regularly** if exposed
5. **Use Azure Key Vault** for production secrets

## Performance Optimization

1. **Cache professional data** in memory (updates every 5 minutes)
2. **Index Firebase queries** for faster lookups
3. **Limit professional fetch** to specific region first
4. **Use connection pooling** for SQL queries (already configured)

## Future Enhancements

- [ ] Add professional rating-based sorting
- [ ] Implement skill matching (service type → professional skills)
- [ ] Add distance calculation (professional location → booking location)
- [ ] Cache professional availability checks
- [ ] Implement professional preference settings
- [ ] Add manual reassignment API endpoint
- [ ] Send push notifications to assigned professionals
- [ ] Implement professional acceptance/rejection workflow

## Support

For issues or questions:
1. Check logs for detailed error messages
2. Verify Firebase Realtime Database structure
3. Test Firebase connection separately
4. Ensure all database tables and columns exist
5. Check Azure SQL firewall rules for your IP
