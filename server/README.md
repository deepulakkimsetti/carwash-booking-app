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

Replace `TableName` in `index.js` with your actual table names and add logic for POST, PUT, DELETE as needed.

## Dependencies
- express
- mssql
- nodemon (dev)

---

Feel free to extend the API for all tables in your database.
