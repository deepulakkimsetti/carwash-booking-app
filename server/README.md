# CarWash Booking App Server

This is an Express.js server for the CarWash Booking App. It connects to an Azure SQL database and provides RESTful APIs for CRUD operations on all tables.

## Setup

1. Install dependencies:
   ```powershell
   npm install
   ```
2. Configure your Azure SQL credentials in `index.js`.
3. Start the server:
   ```powershell
   npm run dev
   ```

## API Endpoints

The server provides comprehensive REST APIs for:
- Bookings management
- Service catalog
- Professional assignments
- Location and city data
- **PowerPoint presentation generation** (NEW! ✨)

For complete API documentation, visit `/api-docs` when the server is running.

## Features

### PowerPoint Presentation Generation
The server now supports automatic generation of PowerPoint presentations:

- **Booking Summary Reports**: Generate professional presentations with booking statistics and details
  - Endpoint: `GET /api/generateBookingSummaryPPT`
  - Optional filtering by customer ID
  - Includes overview statistics, status breakdown, and detailed booking information
  
- **Service Catalog Presentations**: Create marketing materials with all available services
  - Endpoint: `GET /api/generateServiceCatalogPPT`
  - Categorized service listings
  - Professional formatting with pricing and details

See [PPT_GENERATION_README.md](./PPT_GENERATION_README.md) for detailed documentation.

### Testing PPT Generation
Run the test suite to verify PowerPoint generation functionality:
```bash
node test-ppt-generation.js
```

## Dependencies
- express - Web framework
- mssql - Azure SQL database connector
- cors - Cross-origin resource sharing
- swagger-ui-express - API documentation
- firebase-admin - Firebase integration
- pptxgenjs - PowerPoint generation (NEW! ✨)
- nodemon (dev) - Development server

## Documentation
- Swagger UI: Visit `/api-docs` for interactive API documentation
- PowerPoint Generation: See `PPT_GENERATION_README.md` for detailed PPT feature docs

---

Feel free to extend the API for all tables in your database.
