const express = require('express');
const sql = require('mssql');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const app = express();

// Optimizations for Azure Free Tier
app.use(express.json({ limit: '1mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Basic security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve static files with caching for efficiency
app.use('/public', express.static('public', {
  maxAge: '1d', // Cache static files for 1 day
  etag: false   // Disable ETags to save CPU
}));

// Swagger setup - Fixed for Azure
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
          ? `https://${process.env.WEBSITE_HOSTNAME || 'carwash-booking-api-ameuafauczctfndp.eastasia-01.azurewebsites.net'}` 
          : 'http://localhost:3001',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
  },
  apis: [
    __filename,
    './index.js',
    path.join(__dirname, 'index.js')
  ]
};

// Generate Swagger specification with enhanced debugging
let swaggerSpec;
console.log('🔧 Generating Swagger specification...');
console.log('📁 Current directory:', __dirname);
console.log('📄 Current filename:', __filename);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

try {
  swaggerSpec = swaggerJsdoc(swaggerOptions);
  const pathCount = Object.keys(swaggerSpec.paths || {}).length;
  console.log('✅ Swagger spec generated with', pathCount, 'paths');
  
  if (pathCount === 0) {
    console.log('⚠️ Warning: No API paths found in Swagger spec');
    console.log('🔍 Available paths should include:', Object.keys(swaggerSpec.paths || {}));
  }
} catch (error) {
  console.error('❌ Error generating Swagger spec:', error);
  swaggerSpec = {
    openapi: '3.0.0',
    info: { title: 'CarWash API', version: '1.0.0', description: 'Fallback spec' },
    servers: [{
      url: process.env.NODE_ENV === 'production' 
        ? `https://${process.env.WEBSITE_HOSTNAME || 'carwash-booking-api-ameuafauczctfndp.eastasia-01.azurewebsites.net'}` 
        : 'http://localhost:3001'
    }],
    paths: {}
  };
}

// SIMPLE Swagger UI that WILL work on Azure
console.log('🔧 Setting up SIMPLE Swagger UI...');

// Create a simple, guaranteed-to-work Swagger spec
const simpleSwaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'CarWash Booking API',
    version: '1.0.0',
    description: 'API documentation for CarWash Booking App - Student Project'
  },
  servers: [{
    url: 'https://carwash-booking-api-ameuafauczctfndp.eastasia-01.azurewebsites.net',
    description: 'Production server'
  }, {
    url: 'http://localhost:3001',
    description: 'Development server'
  }],
  paths: {
    '/': {
      get: {
        summary: 'Health check endpoint',
        tags: ['Health'],
        responses: {
          '200': {
            description: 'API is running',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/Services': {
      get: {
        summary: 'Get all services',
        tags: ['Services'],
        responses: {
          '200': {
            description: 'List of services',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      service_id: { type: 'integer' },
                      service_name: { type: 'string' },
                      description: { type: 'string' },
                      service_type: { type: 'string' },
                      base_price: { type: 'number' },
                      duration_minutes: { type: 'integer' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a new service',
        tags: ['Services'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  service_name: { type: 'string' },
                  description: { type: 'string' },
                  service_type: { type: 'string' },
                  base_price: { type: 'number' },
                  duration_minutes: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Service created successfully' }
        }
      }
    },
    '/api/car-details': {
      get: {
        summary: 'Get car details (car_id and car_type only)',
        tags: ['Car Details'],
        responses: {
          '200': {
            description: 'List of cars with car_id and car_type',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      car_id: { type: 'integer' },
                      car_type: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/Bookings': {
      get: {
        summary: 'Get all bookings',
        tags: ['Bookings'],
        responses: {
          '200': {
            description: 'List of bookings',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      booking_id: { type: 'integer' },
                      customer_id: { type: 'integer' },
                      service_id: { type: 'integer' },
                      booking_status: { type: 'string' },
                      scheduled_time: { type: 'string' },
                      location_address: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a new booking',
        tags: ['Bookings'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  customer_id: { type: 'integer' },
                  service_id: { type: 'integer' },
                  booking_status: { type: 'string' },
                  scheduled_time: { type: 'string' },
                  location_address: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Booking created successfully' }
        }
      }
    }
  }
};

// SIMPLE Swagger UI setup - this WILL work
app.get('/api-docs', (req, res) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>CarWash API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
  <style>
    html { 
      box-sizing: border-box; 
      overflow: -moz-scrollbars-vertical; 
      overflow-y: scroll; 
    }
    *, *:before, *:after { 
      box-sizing: inherit; 
    }
    body { 
      margin: 0; 
      background: #fafafa; 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .swagger-ui .topbar { 
      display: none; 
    }
    .swagger-ui .info { 
      margin: 50px 0; 
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      try {
        const ui = SwaggerUIBundle({
          spec: ${JSON.stringify(simpleSwaggerSpec)},
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.presets.standalone
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          // Remove layout specification - let Swagger UI use default
          defaultModelsExpandDepth: 1,
          defaultModelExpandDepth: 1,
          docExpansion: "list",
          filter: true,
          showExtensions: true,
          showCommonExtensions: true,
          tryItOutEnabled: true
        });
        
        console.log('✅ Swagger UI loaded successfully');
      } catch (error) {
        console.error('❌ Error loading Swagger UI:', error);
        document.getElementById('swagger-ui').innerHTML = 
          '<div style="padding: 20px; text-align: center;">' +
          '<h1>CarWash API Documentation</h1>' +
          '<p style="color: red;">Error loading Swagger UI: ' + error.message + '</p>' +
          '<p><a href="/swagger.json">View Raw API Specification</a></p>' +
          '</div>';
      }
    };
  </script>
</body>
</html>`;
  res.send(html);
});

// Simple JSON endpoint
app.get('/swagger.json', (req, res) => {
  const dynamicSpec = {
    ...simpleSwaggerSpec,
    servers: [{
      url: `${req.protocol}://${req.get('host')}`,
      description: 'Current server'  
    }]
  };
  res.json(dynamicSpec);
});

// Alternative routes
app.get('/docs', (req, res) => res.redirect('/api-docs'));
app.get('/documentation', (req, res) => res.redirect('/api-docs'));

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

// Optimized Azure SQL connection for free tier
const connectWithRetry = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    if (pool.connected) {
      console.log('✅ Connected to Azure SQL Database');
      // Set connection pool settings for free tier
      pool.config.pool = {
        max: 5,  // Reduced from default 10
        min: 1,  // Keep minimum connections
        idleTimeoutMillis: 30000 // 30 seconds timeout
      };
    }
    return pool;
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    // Retry after 5 seconds on free tier
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Table schemas
const tableSchemas = {
  Bookings: ['booking_id','customer_id','service_id','booking_status','scheduled_time','location_address','created_at','updated_at'],
  Cars: ['car_id','car_type','customer_id','make','model','year','license_plate','color','created_at','updated_at'],
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
  Cars: 'car_id',
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
    environment: process.env.NODE_ENV || 'development',
    host: req.get('host'),
    protocol: req.protocol,
    url: `${req.protocol}://${req.get('host')}`,
    documentation: '/api-docs',
    swaggerJson: '/swagger.json',
    debugInfo: '/debug',
    swaggerPaths: Object.keys(swaggerSpec?.paths || {}).length
  });
});

/**
 * @swagger
 * /debug:
 *   get:
 *     summary: Debug information endpoint
 *     tags: [Debug]
 *     responses:
 *       200:
 *         description: Debug information
 */
app.get('/debug', (req, res) => {
  res.json({
    server: {
      environment: process.env.NODE_ENV || 'development',
      host: req.get('host'),
      protocol: req.protocol,
      url: `${req.protocol}://${req.get('host')}`,
      websiteHostname: process.env.WEBSITE_HOSTNAME,
      currentDirectory: __dirname,
      currentFilename: __filename
    },
    azure: {
      accountType: 'Azure Student Free Account',
      tier: 'F1 Free',
      limitations: {
        cpuTime: '60 minutes/day',
        memory: '165 MB',
        storage: '1 GB',
        customDomains: false,
        alwaysOn: false
      },
      optimizations: [
        'Connection pooling enabled',
        'Static file caching enabled',
        'Payload size limited to 1MB',
        'Basic security headers added'
      ]
    },
    swagger: {
      method: 'Simple static spec (guaranteed to work)',
      specExists: !!simpleSwaggerSpec,
      pathsCount: Object.keys(simpleSwaggerSpec?.paths || {}).length,
      availablePaths: Object.keys(simpleSwaggerSpec?.paths || {}),
      servers: simpleSwaggerSpec?.servers || [],
      info: simpleSwaggerSpec?.info || {}
    },
    routes: {
      documentation: '/api-docs',
      swaggerJson: '/swagger.json',
      health: '/',
      test: '/test',
      studentInfo: '/student-account-info'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /student-account-info:
 *   get:
 *     summary: Azure Student Account Information
 *     tags: [Azure Student]
 *     responses:
 *       200:
 *         description: Student account usage and limits
 */
app.get('/student-account-info', (req, res) => {
  res.json({
    accountType: 'Azure Student Free Account',
    benefits: {
      credit: '$100 USD for 12 months',
      appService: 'Free F1 tier included',
      sqlDatabase: '250GB free',
      storage: '5GB LRS hot block blob',
      bandwidth: '15GB outbound data transfer'
    },
    currentUsage: {
      appService: 'F1 Free (FREE)',
      sqlDatabase: 'Basic tier (FREE within 250GB)',
      estimatedMonthlyCost: '$0.00'
    },
    limitations: {
      regions: 'Limited to specific regions',
      performance: 'Shared resources, limited CPU time',
      customDomains: 'Not available on free tier',
      ssl: 'Only *.azurewebsites.net SSL included'
    },
    recommendations: [
      'Monitor CPU usage to stay within 60 min/day limit',
      'Use connection pooling for database efficiency',
      'Cache static files to reduce bandwidth',
      'Consider upgrading to B1 Basic if you need more resources'
    ],
    upgradeOptions: {
      basicB1: {
        cost: '~$13/month',
        benefits: ['Custom domains', 'SSL certificates', 'More CPU time', 'More memory']
      }
    },
    timestamp: new Date().toISOString()
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
    timestamp: new Date().toISOString(),
    swaggerWorking: true,
    availableEndpoints: [
      '/ - Health check',
      '/api-docs - Swagger documentation',
      '/swagger.json - API specification',
      '/debug - Debug information',
      '/test - This test endpoint',
      '/api/Services - Services CRUD',
      '/api/car-details - Car details',
      '/api/Bookings - Bookings CRUD'
    ]
  });
});

// Custom car details endpoint
// Test route to verify routing is working
app.get('/api/test-route', (req, res) => {
  res.json({ 
    message: 'Test route is working!', 
    timestamp: new Date().toISOString(),
    note: 'If you see this, routing is functional'
  });
});

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
  console.log('🚗 /api/car-details route hit at:', new Date().toISOString());
  try {
    // Query the Cars table (confirmed table name)
    const result = await sql.query('SELECT id, type FROM Cars');
    console.log('✅ Query successful, returning', result.recordset.length, 'records');
    res.json(result.recordset);
  } catch (err) {
    res.status(503).json({ 
      error: 'Database error',
      message: err.message,
      tip: 'Add your IP (106.222.232.56) to Azure SQL firewall rules',
      sampleData: [
        { car_id: 1, car_type: 'Sedan' },
        { car_id: 2, car_type: 'SUV' }
      ]
    });
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
    const result = await request.query('SELECT id, type FROM Cars WHERE id = @car_id');
    
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
   *       503:
   *         description: Database connection unavailable
   */
  app.get(`/api/${table}`, async (req, res) => {
    try {
      const result = await sql.query(`SELECT * FROM ${table}`);
      res.json(result.recordset);
    } catch (err) {
      res.status(503).json({ 
        error: 'Database error',
        message: err.message,
        table: table,
        tip: 'Check Azure SQL firewall rules if connection is denied'
      });
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
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction 
    ? `https://${process.env.WEBSITE_HOSTNAME || 'carwash-booking-api-ameuafauczctfndp.eastasia-01.azurewebsites.net'}` 
    : `http://localhost:${PORT}`;
  
  console.log('🚀 CarWash Booking API Server Started');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Server: ${baseUrl}`);
  console.log(`📚 Swagger Documentation: ${baseUrl}/api-docs`);
  console.log(`📄 Swagger JSON: ${baseUrl}/swagger.json`);
  console.log(`🔍 Debug Info: ${baseUrl}/debug`);
  console.log(`❤️  Health Check: ${baseUrl}/`);
  console.log(`📊 API Paths: ${Object.keys(swaggerSpec?.paths || {}).length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (isProduction) {
    console.log('🔧 Azure Environment Variables:');
    console.log(`   WEBSITE_HOSTNAME: ${process.env.WEBSITE_HOSTNAME || 'NOT SET'}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
  }
});