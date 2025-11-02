# PowerPoint Presentation Generation Feature

## Overview
The CarWash Booking API now supports automatic generation of PowerPoint presentations for booking summaries and service catalogs. This feature enables users to download professionally formatted presentations with booking data and service information.

## New API Endpoints

### 1. Generate Booking Summary Presentation
**Endpoint:** `GET /api/generateBookingSummaryPPT`

**Description:** Generates a PowerPoint presentation containing booking details and statistics.

**Query Parameters:**
- `customer_id` (optional): Filter bookings for a specific customer

**Response:** Binary PPTX file download

**Example Usage:**
```bash
# Generate presentation for all bookings
curl -O -J http://localhost:3001/api/generateBookingSummaryPPT

# Generate presentation for specific customer
curl -O -J "http://localhost:3001/api/generateBookingSummaryPPT?customer_id=CUST001"
```

**Presentation Content:**
- Title slide with generation date
- Overview slide with booking statistics (total bookings, revenue, status breakdown)
- Individual slides for up to 10 most recent bookings with full details
- Professional formatting with color-coded status indicators

### 2. Generate Service Catalog Presentation
**Endpoint:** `GET /api/generateServiceCatalogPPT`

**Description:** Generates a PowerPoint presentation containing all available services with detailed information.

**Response:** Binary PPTX file download

**Example Usage:**
```bash
curl -O -J http://localhost:3001/api/generateServiceCatalogPPT
```

**Presentation Content:**
- Title slide with company branding
- Overview slide with service statistics
- Category slides grouping services by type
- Detailed slides for individual services (up to 10)
- Professional formatting with tables and badges

## Technical Details

### Library Used
- **pptxgenjs** (v3.12.0): A JavaScript library for creating PowerPoint presentations

### Features
- Dynamic content generation from database
- Professional slide templates
- Color-coded status indicators
- Statistical summaries
- Responsive table layouts
- Branded title slides

### File Format
- Output format: PPTX (PowerPoint Open XML)
- Compatible with Microsoft PowerPoint, Google Slides, LibreOffice Impress

## Integration with Swagger
Both endpoints are fully documented in the Swagger UI:
- Navigate to `/api-docs` on your server
- Find endpoints under the "Reports" tag
- Test directly from the Swagger interface

## Error Handling
If presentation generation fails, the API returns a JSON error response:
```json
{
  "error": "Internal Server Error",
  "message": "Failed to generate PowerPoint presentation",
  "details": "Specific error details"
}
```

## Use Cases
1. **Business Reports**: Generate booking summaries for management review
2. **Customer Reports**: Provide customers with their booking history
3. **Marketing Materials**: Create service catalog presentations for sales
4. **Data Sharing**: Export data in a presentation format for stakeholders

## Future Enhancements
Potential improvements for future versions:
- Custom branding/logo support
- Date range filtering for booking summaries
- Charts and graphs for visual analytics
- Export to PDF format
- Email delivery of generated presentations
- Customizable templates
