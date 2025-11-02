# PowerPoint Generation - Usage Examples

## Quick Start Guide

This guide shows you how to use the new PowerPoint presentation generation endpoints.

## Prerequisites

- Server must be running (`npm start` or `npm run dev`)
- Database connection configured
- Browser or API client (curl, Postman, etc.)

## Example 1: Generate Booking Summary for All Bookings

### Using Browser
Simply navigate to:
```
http://localhost:3001/api/generateBookingSummaryPPT
```

The browser will automatically download a file named `all-bookings-summary-[timestamp].pptx`

### Using curl
```bash
curl -O -J http://localhost:3001/api/generateBookingSummaryPPT
```

### Using Postman
1. Create a new GET request
2. URL: `http://localhost:3001/api/generateBookingSummaryPPT`
3. Click "Send and Download"
4. File will be saved to your downloads folder

## Example 2: Generate Booking Summary for Specific Customer

### Using Browser
Navigate to:
```
http://localhost:3001/api/generateBookingSummaryPPT?customer_id=CUST001
```

### Using curl
```bash
curl -O -J "http://localhost:3001/api/generateBookingSummaryPPT?customer_id=CUST001"
```

### Using JavaScript/Fetch
```javascript
async function downloadBookingSummary(customerId) {
  const url = customerId 
    ? `http://localhost:3001/api/generateBookingSummaryPPT?customer_id=${customerId}`
    : 'http://localhost:3001/api/generateBookingSummaryPPT';
    
  const response = await fetch(url);
  const blob = await response.blob();
  
  // Create download link
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `booking-summary-${customerId || 'all'}.pptx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(downloadUrl);
}

// Usage
downloadBookingSummary('CUST001');  // For specific customer
downloadBookingSummary();            // For all bookings
```

## Example 3: Generate Service Catalog

### Using Browser
Navigate to:
```
http://localhost:3001/api/generateServiceCatalogPPT
```

### Using curl
```bash
curl -O -J http://localhost:3001/api/generateServiceCatalogPPT
```

### Using Python
```python
import requests

def download_service_catalog():
    url = 'http://localhost:3001/api/generateServiceCatalogPPT'
    response = requests.get(url)
    
    if response.status_code == 200:
        filename = 'service-catalog.pptx'
        with open(filename, 'wb') as f:
            f.write(response.content)
        print(f"✅ Downloaded: {filename}")
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.json())

# Usage
download_service_catalog()
```

## Example 4: Integration with React Application

```jsx
import React, { useState } from 'react';

function BookingSummaryDownloader() {
  const [customerId, setCustomerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const downloadSummary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = customerId 
        ? `http://localhost:3001/api/generateBookingSummaryPPT?customer_id=${customerId}`
        : 'http://localhost:3001/api/generateBookingSummaryPPT';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to generate presentation');
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `booking-summary-${customerId || 'all'}-${Date.now()}.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      
      alert('✅ Presentation downloaded successfully!');
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Download Booking Summary</h2>
      <input
        type="text"
        placeholder="Customer ID (optional)"
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
      />
      <button onClick={downloadSummary} disabled={loading}>
        {loading ? 'Generating...' : 'Download PPT'}
      </button>
      {error && <p style={{color: 'red'}}>Error: {error}</p>}
    </div>
  );
}

export default BookingSummaryDownloader;
```

## Example 5: Express.js Route for Proxy

If you need to serve PPTs through your own API:

```javascript
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/download-booking-summary/:customerId?', async (req, res) => {
  try {
    const { customerId } = req.params;
    const apiUrl = customerId 
      ? `http://localhost:3001/api/generateBookingSummaryPPT?customer_id=${customerId}`
      : 'http://localhost:3001/api/generateBookingSummaryPPT';
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }
    
    const buffer = await response.buffer();
    const filename = customerId 
      ? `booking-summary-${customerId}.pptx`
      : 'all-bookings-summary.pptx';
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate presentation' });
  }
});

module.exports = router;
```

## What's Inside the Generated PPT?

### Booking Summary PPT Contains:
1. **Title Slide** - Branding and generation date
2. **Overview Slide** - Total bookings, revenue, average price, status breakdown
3. **Detail Slides** - Up to 10 most recent bookings with:
   - Booking ID and status (color-coded)
   - Customer information
   - Service details
   - Car type and location
   - Scheduled time and duration
   - Pricing information

### Service Catalog PPT Contains:
1. **Title Slide** - Professional branding
2. **Overview Slide** - Service statistics and categories
3. **Category Slides** - Services grouped by type with pricing tables
4. **Detail Slides** - Individual service descriptions (up to 10)
5. **Call-to-Action Slide** - Booking information

## Testing the Endpoints

### Test with Swagger UI
1. Navigate to `http://localhost:3001/api-docs`
2. Expand the "Reports" section
3. Try out either endpoint:
   - `GET /api/generateBookingSummaryPPT`
   - `GET /api/generateServiceCatalogPPT`
4. Click "Download file" button

### Verify Generated File
After downloading:
1. Open the `.pptx` file in PowerPoint, Google Slides, or LibreOffice
2. Verify all slides are present and properly formatted
3. Check that data matches your database records

## Error Handling

If you receive an error response:

```json
{
  "error": "Internal Server Error",
  "message": "Failed to generate PowerPoint presentation",
  "details": "Database connection failed"
}
```

**Common Issues:**
- Database not connected → Check DB credentials
- No data available → Add some bookings/services to database
- Server not running → Start the server with `npm start`

## Tips for Production

1. **Add Authentication**: Protect these endpoints with API keys or OAuth
2. **Implement Rate Limiting**: Prevent abuse (see SECURITY_SUMMARY.md)
3. **Add Caching**: Cache presentations that don't change frequently
4. **Async Processing**: For large datasets, consider async job processing
5. **Cloud Storage**: Store generated files in Azure Blob Storage or S3

## Next Steps

- Customize the presentation templates in `server/index.js`
- Add more endpoints for different report types
- Implement email delivery of generated presentations
- Add charts and graphs for visual analytics
