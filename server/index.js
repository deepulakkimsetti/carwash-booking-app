const express = require('express');
const sql = require('mssql');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const app = express();
app.use(express.json());

// Serve static files
app.use('/public', express.static('public'));

// Swagger setup
const path = require('path');

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
          ? `https://${process.env.WEBSITE_HOSTNAME || 'localhost'}` 
          : 'http://localhost:3001',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
  },
  // Fix for Azure: Use absolute path and multiple path patterns
  apis: [
    path.join(__dirname, 'index.js'),
    __filename,
    './index.js',
    './*.js'
  ],
};

let swaggerSpec;
try {
  console.log('🔄 Attempting to generate Swagger spec...');
  swaggerSpec = swaggerJsdoc(swaggerOptions);
  console.log('✅ Swagger spec generated, paths found:', Object.keys(swaggerSpec.paths || {}).length);
  
  // Fallback for Azure: if no paths found, use manual spec
  if (!swaggerSpec.paths || Object.keys(swaggerSpec.paths).length === 0) {
    console.log('⚠️  No paths found in auto-generated spec, using manual fallback');
    try {
      const manualSwaggerSpec = require('./swagger-manual');
      swaggerSpec = manualSwaggerSpec;
      console.log('✅ Manual Swagger spec loaded');
    } catch (manualError) {
      console.error('❌ Failed to load manual spec:', manualError);
      // Create a basic fallback spec
      swaggerSpec = {
        openapi: '3.0.0',
        info: {
          title: 'CarWash Booking API',
          version: '1.0.0',
          description: 'API documentation for CarWash Booking App',
        },
        paths: {}
      };
    }
  }
} catch (error) {
  console.error('❌ Error generating Swagger spec:', error);
  console.log('🔄 Using manual Swagger specification');
  try {
    const manualSwaggerSpec = require('./swagger-manual');
    swaggerSpec = manualSwaggerSpec;
    console.log('✅ Manual Swagger spec loaded as fallback');
  } catch (manualError) {
    console.error('❌ Failed to load manual spec:', manualError);
    // Create a minimal working spec
    swaggerSpec = {
      openapi: '3.0.0',
      info: {
        title: 'CarWash Booking API',
        version: '1.0.0',
        description: 'API documentation for CarWash Booking App - Minimal fallback',
      },
      servers: [{
        url: process.env.NODE_ENV === 'production' 
          ? `https://${process.env.WEBSITE_HOSTNAME}` 
          : 'http://localhost:3001',
        description: 'API Server'
      }],
      paths: {
        '/': {
          get: {
            summary: 'Health check endpoint',
            responses: {
              '200': { description: 'API is running' }
            }
          }
        }
      }
    };
    console.log('✅ Minimal fallback spec created');
  }
}

// Debug logging for Azure
console.log('🔍 Swagger Debug Info:');
console.log('- Current directory:', __dirname);
console.log('- Current filename:', __filename);
console.log('- Swagger paths found:', Object.keys(swaggerSpec.paths || {}).length);
console.log('- Available paths:', Object.keys(swaggerSpec.paths || {}));

// Swagger UI setup - Fixed for Azure
console.log('🔧 Setting up Swagger UI routes...');

// Method 1: Standard setup
try {
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'CarWash API Documentation'
  }));
  console.log('✅ Standard Swagger UI setup complete');
} catch (error) {
  console.error('❌ Error setting up standard Swagger UI:', error);
}

// Alternative Swagger UI route (fallback)
app.get('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'CarWash API Documentation - Alternative'
}));

// Manual backup route for Swagger UI
app.get('/swagger-ui', (req, res) => {
  try {
    if (!swaggerSpec) {
      return res.status(500).send('Swagger specification not available');
    }
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CarWash API Documentation</title>
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-bundle.js"></script>
      <script>
        SwaggerUIBundle({
          url: '/swagger.json',
          dom_id: '#swagger-ui',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.presets.standalone
          ]
        });
      </script>
    </body>
    </html>`;
    
    res.send(html);
  } catch (error) {
    console.error('❌ Error in /swagger-ui route:', error);
    res.status(500).send('Error loading Swagger UI: ' + error.message);
  }
});

// Static Swagger HTML page (backup method)
app.get('/api-docs-static', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'swagger.html'));
});

// Redirect /api-docs to static version if dynamic fails
app.get('/api-docs-fallback', (req, res) => {
  res.redirect('/api-docs-static');
});

console.log('✅ Swagger UI routes configured');

// Debug endpoint to check swagger spec
app.get('/swagger.json', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    
    // Ensure we have a valid swagger spec
    if (!swaggerSpec) {
      console.log('📝 Swagger spec is null, creating basic spec');
      const basicSpec = {
        openapi: '3.0.0',
        info: {
          title: 'CarWash Booking API',
          version: '1.0.0',
          description: 'API documentation for CarWash Booking App',
        },
        servers: [{
          url: `https://${req.get('host')}`,
          description: 'Production server'
        }],
        paths: {
          '/': {
            get: {
              summary: 'Health check',
              responses: { '200': { description: 'OK' } }
            }
          }
        }
      };
      return res.json(basicSpec);
    }
    
    console.log('📤 Sending swagger spec with', Object.keys(swaggerSpec.paths || {}).length, 'paths');
    res.json(swaggerSpec);
  } catch (error) {
    console.error('❌ Error in /swagger.json route:', error);
    res.status(500).json({ 
      error: 'Failed to generate Swagger specification',
      message: error.message 
    });
  }
});

// Health check endpoint
/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 */
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'CarWash Booking API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    host: req.get('host'),
    url: `${req.protocol}://${req.get('host')}`,
    documentation: '/api-docs',
    swaggerJson: '/swagger.json',
    swaggerPathsCount: Object.keys(swaggerSpec?.paths || {}).length,
    swaggerSpecExists: !!swaggerSpec
  });
});

// Simple test route
app.get('/test', (req, res) => {
  res.json({
    message: 'Test route working!',
    timestamp: new Date().toISOString()
  });
});

// Debug route to check all registered routes
app.get('/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
      routes.push({
        method: Object.keys(r.route.methods)[0].toUpperCase(),
        path: r.route.path
      });
    }
  });
  res.json({
    message: 'All registered routes',
    routes: routes,
    swaggerSpecExists: !!swaggerSpec,
    swaggerPathsCount: Object.keys(swaggerSpec?.paths || {}).length
  });
});

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
