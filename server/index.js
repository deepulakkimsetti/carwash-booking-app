const express = require('express');
const sql = require('mssql');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const app = express();
app.use(express.json());

// Serve static files
app.use('/public', express.static('public'));

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CarWash Booking API',
      version: '1.0.0',
      description: 'API documentation for CarWash Booking App',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? `https://${process.env.WEBSITE_HOSTNAME}` 
          : 'http://localhost:3001',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
  },
  apis: [__filename]
};

// Generate Swagger specification
let swaggerSpec;
try {
  swaggerSpec = swaggerJsdoc(swaggerOptions);
  console.log('✅ Swagger spec generated with', Object.keys(swaggerSpec.paths || {}).length, 'paths');
} catch (error) {
  console.error('❌ Error generating Swagger spec:', error);
  swaggerSpec = {
    openapi: '3.0.0',
    info: { title: 'CarWash API', version: '1.0.0' },
    paths: {}
  };
}

// Swagger UI routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/swagger.json', (req, res) => res.json(swaggerSpec));

// Azure SQL config
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

// Table schemas
const tableSchemas = {
  Bookings: ['booking_id','customer_id','service_id','booking_status','scheduled_time','location_address','created_at','updated_at'],
  Car: ['car_id','car_type','customer_id','make','model','year','license_plate','color','created_at','updated_at'],
  database_firewall_rules: ['id','name','start_ip_address','end_ip_address','create_date','modify_date'],
  Notifications: ['notification_id','user_id','message','type','is_read','created_at'],
  Payments: ['payment_id','booking_id','amount','payment_method','payment_status','transaction_date'],
  Products: ['ProductID','ProductName','Price','ProductDescription'],
  ProfessionalAllocation: ['allocation_id','booking_id','professional_id','assigned_at','status'],
  ProfessionalSkills: ['skill_id','professional_id','service_id','proficiency_level'],
  Services: ['service_id','service_name','description','service_type','base_price','duration_minutes','created_at']
};

// Primary keys
const tablePKs = {
  Bookings: 'booking_id',
  Car: 'car_id',
  database_firewall_rules: 'id',
  Notifications: 'notification_id',
  Payments: 'payment_id',
  Products: 'ProductID',
  ProfessionalAllocation: 'allocation_id',
  ProfessionalSkills: 'skill_id',
  Services: 'service_id'
};

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 */
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'CarWash Booking API is running!',
    timestamp: new Date().toISOString(),
    documentation: '/api-docs',
    swaggerJson: '/swagger.json'
  });
});

/**
 * @swagger
 * /test:
 *   get:
 *     summary: Test endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Test successful
 */
app.get('/test', (req, res) => {
  res.json({
    message: 'Test route working!',
    timestamp: new Date().toISOString()
  });
});

// Custom car details endpoint
/**
 * @swagger
 * /api/car-details:
 *   get:
 *     summary: Get car details with only car_id and car_type
 *     tags: [Car Details]
 *     responses:
 *       200:
 *         description: List of cars with car_id and car_type only
 */
app.get('/api/car-details', async (req, res) => {
  try {
    const result = await sql.query('SELECT car_id, car_type FROM Car');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/car-details/{car_id}:
 *   get:
 *     summary: Get specific car details by car_id
 *     tags: [Car Details]
 *     parameters:
 *       - in: path
 *         name: car_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Car details
 *       404:
 *         description: Car not found
 */
app.get('/api/car-details/:car_id', async (req, res) => {
  try {
    const request = new sql.Request();
    request.input('car_id', sql.Int, req.params.car_id);
    const result = await request.query('SELECT car_id, car_type FROM Car WHERE car_id = @car_id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generic CRUD routes for each table
Object.keys(tableSchemas).forEach(table => {
  const pk = tablePKs[table];
  const columns = tableSchemas[table];

  /**
   * @swagger
   * /api/{table}:
   *   get:
   *     summary: Get all records from table
   *     tags: [{table}]
   *     responses:
   *       200:
   *         description: List of records
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
   * /api/{table}/{id}:
   *   get:
   *     summary: Get record by ID
   *     tags: [{table}]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Record found
   *       404:
   *         description: Record not found
   */
  app.get(`/api/${table}/:${pk}`, async (req, res) => {
    try {
      const request = new sql.Request();
      request.input('id', req.params[pk]);
      const result = await request.query(`SELECT * FROM ${table} WHERE ${pk} = @id`);
      
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Record not found' });
      }
      
      res.json(result.recordset[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * @swagger
   * /api/{table}:
   *   post:
   *     summary: Create new record
   *     tags: [{table}]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Record created
   */
  app.post(`/api/${table}`, async (req, res) => {
    try {
      const request = new sql.Request();
      const fields = columns.filter(col => col !== pk);
      const values = fields.map(field => req.body[field]);
      
      fields.forEach((field, index) => {
        request.input(field, values[index]);
      });
      
      const placeholders = fields.map(field => `@${field}`).join(', ');
      const query = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
      
      await request.query(query);
      res.json({ message: 'Created successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * @swagger
   * /api/{table}/{id}:
   *   put:
   *     summary: Update record
   *     tags: [{table}]
   *     parameters:
   *       - in: path
   *         name: id
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
   *         description: Record updated
   */
  app.put(`/api/${table}/:${pk}`, async (req, res) => {
    try {
      const request = new sql.Request();
      const fields = columns.filter(col => col !== pk);
      
      request.input('id', req.params[pk]);
      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          request.input(field, req.body[field]);
        }
      });
      
      const updates = fields
        .filter(field => req.body[field] !== undefined)
        .map(field => `${field} = @${field}`)
        .join(', ');
      
      if (updates) {
        await request.query(`UPDATE ${table} SET ${updates} WHERE ${pk} = @id`);
      }
      
      res.json({ message: 'Updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * @swagger
   * /api/{table}/{id}:
   *   delete:
   *     summary: Delete record
   *     tags: [{table}]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Record deleted
   */
  app.delete(`/api/${table}/:${pk}`, async (req, res) => {
    try {
      const request = new sql.Request();
      request.input('id', req.params[pk]);
      await request.query(`DELETE FROM ${table} WHERE ${pk} = @id`);
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Swagger Documentation: ${process.env.NODE_ENV === 'production' ? `https://${process.env.WEBSITE_HOSTNAME}` : `http://localhost:${PORT}`}/api-docs`);
});