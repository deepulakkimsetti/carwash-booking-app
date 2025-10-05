const express = require('express');
const sql = require('mssql');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const app = express();
app.use(express.json());

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CarWash Booking API',
      version: '1.0.0',
      description: 'API documentation for CarWash Booking App',
    },
  },
  apis: ['./index.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Azure SQL config - using environment variables for production
const dbConfig = {
  user: process.env.DB_USER || 'sqladmin',
  password: process.env.DB_PASSWORD || 'Haneesh@77',
  server: process.env.DB_SERVER || 'carwashservicesqlserver.database.windows.net',
  database: process.env.DB_NAME || 'CarwashserviceDB',
  options: {
    encrypt: true,
    enableArithAbort: true
  }
};

// Connect to Azure SQL
sql.connect(dbConfig).then(pool => {
  if (pool.connected) {
    console.log('Connected to Azure SQL Database');
  }
}).catch(err => {
  console.error('Database connection failed:', err);
});


// Helper: Table schemas (updated)
const tableSchemas = {
  Bookings: ['booking_id','customer_id','service_id','booking_status','scheduled_time','location_address','created_at','updated_at'],
  database_firewall_rules: ['id','name','start_ip_address','end_ip_address','create_date','modify_date'],
  Notifications: ['notification_id','user_id','message','type','is_read','created_at'],
  Payments: ['payment_id','booking_id','amount','payment_method','payment_status','transaction_date'],
  Products: ['ProductID','ProductName','Price','ProductDescription'],
  ProfessionalAllocation: ['allocation_id','booking_id','professional_id','assigned_at','status'],
  ProfessionalSkills: ['skill_id','professional_id','service_id','proficiency_level'],
  Services: ['service_id','service_name','description','service_type','base_price','duration_minutes','created_at']
};

// Helper: Primary keys for each table (updated)
const tablePKs = {
  Bookings: 'booking_id',
  database_firewall_rules: 'id',
  Notifications: 'notification_id',
  Payments: 'payment_id',
  Products: 'ProductID',
  ProfessionalAllocation: 'allocation_id',
  ProfessionalSkills: 'skill_id',
  Services: 'service_id'
};

// Generic CRUD routes for each table (updated)
Object.keys(tableSchemas).forEach(table => {
  const pk = tablePKs[table];
  const columns = tableSchemas[table];

  /**
   * @swagger
   * /api/{table}:
   *   get:
   *     summary: Get all records from {table}
   *     tags: [{table}]
   *     responses:
   *       200:
   *         description: List of records
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   */
  app.get(`/api/${table}`, async (req, res) => {
    try {
      const result = await sql.query(`SELECT * FROM ${table}`);
      res.json(result.recordset);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * @swagger
   * /api/{table}/:{pk}:
   *   get:
   *     summary: Get a record by ID from {table}
   *     tags: [{table}]
   *     parameters:
   *       - in: path
   *         name: {pk}
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Record object
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   */
  app.get(`/api/${table}/:${pk}`, async (req, res) => {
    try {
      const request = new sql.Request();
      request.input('id', req.params[pk]);
      const result = await request.query(`SELECT * FROM ${table} WHERE ${pk} = @id`);
      res.json(result.recordset[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * @swagger
   * /api/{table}:
   *   post:
   *     summary: Create a new record in {table}
   *     tags: [{table}]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       201:
   *         description: Created
   */
  app.post(`/api/${table}`, async (req, res) => {
    try {
      const colsStr = columns.join(', ');
      const paramsStr = columns.map((_, i) => `@param${i}`).join(', ');
      const request = new sql.Request();
      columns.forEach((col, i) => request.input(`param${i}`, req.body[col]));
      await request.query(`INSERT INTO ${table} (${colsStr}) VALUES (${paramsStr})`);
      res.status(201).json({ message: 'Created' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * @swagger
   * /api/{table}/:{pk}:
   *   put:
   *     summary: Update a record by ID in {table}
   *     tags: [{table}]
   *     parameters:
   *       - in: path
   *         name: {pk}
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Updated
   */
  app.put(`/api/${table}/:${pk}`, async (req, res) => {
    try {
      const setStr = columns.filter(col => col !== pk).map((col, i) => `${col} = @param${i}`).join(', ');
      const request = new sql.Request();
      columns.filter(col => col !== pk).forEach((col, i) => request.input(`param${i}`, req.body[col]));
      request.input('id', req.params[pk]);
      await request.query(`UPDATE ${table} SET ${setStr} WHERE ${pk} = @id`);
      res.json({ message: 'Updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * @swagger
   * /api/{table}/:{pk}:
   *   delete:
   *     summary: Delete a record by ID from {table}
   *     tags: [{table}]
   *     parameters:
   *       - in: path
   *         name: {pk}
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Deleted
   */
  app.delete(`/api/${table}/:${pk}`, async (req, res) => {
    try {
      const request = new sql.Request();
      request.input('id', req.params[pk]);
      await request.query(`DELETE FROM ${table} WHERE ${pk} = @id`);
      res.json({ message: 'Deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

// Custom API endpoint for car details (only car_id and car_type)
/**
 * @swagger
 * /api/car-details:
 *   get:
 *     summary: Get car details with only car_id and car_type
 *     tags: [Car Details]
 *     responses:
 *       200:
 *         description: List of cars with car_id and car_type only
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   car_id:
 *                     type: integer
 *                     description: Unique identifier for the car
 *                   car_type:
 *                     type: string
 *                     description: Type of the car (e.g., Sedan, SUV, Hatchback)
 *       500:
 *         description: Server error
 */
app.get('/api/car-details', async (req, res) => {
  try {
    const result = await sql.query('SELECT id, type FROM cars');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
