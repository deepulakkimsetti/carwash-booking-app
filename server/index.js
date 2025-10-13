const express = require('express');
const sql = require('mssql');
const swaggerUi = require('swagger-ui-express');
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

// Professional Swagger documentation setup - using hardcoded specification for better control
console.log('🔧 Setting up professional Swagger UI with standards-compliant documentation...');

// Create a professional, standards-compliant Swagger spec
const simpleSwaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'CarWash Booking API',
    version: '1.0.0',
    description: 'Professional API documentation for CarWash Booking System - Comprehensive car wash service management platform',
    contact: {
      name: 'API Support',
      email: 'support@carwash-booking.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [{
    url: 'https://carwash-booking-api-ameuafauczctfndp.eastasia-01.azurewebsites.net',
    description: 'Production server'
  }, {
    url: 'http://localhost:3001',
    description: 'Development server'
  }],
  components: {
    schemas: {
      Error: {
        type: 'object',
        required: ['error', 'message'],
        properties: {
          error: {
            type: 'string',
            description: 'Error type',
            example: 'ValidationError'
          },
          message: {
            type: 'string',
            description: 'Human-readable error message',
            example: 'The provided data is invalid'
          },
          details: {
            type: 'string',
            description: 'Additional error details',
            example: 'Missing required field: service_name'
          }
        }
      },
      Service: {
        type: 'object',
        required: ['service_name', 'service_type', 'base_price', 'duration_minutes'],
        properties: {
          service_id: {
            type: 'integer',
            description: 'Unique service identifier',
            example: 1
          },
          service_name: {
            type: 'string',
            description: 'Name of the car wash service',
            example: 'Premium Wash',
            minLength: 2,
            maxLength: 100
          },
          description: {
            type: 'string',
            description: 'Detailed service description',
            example: 'Complete exterior and interior cleaning with wax protection',
            maxLength: 500
          },
          service_type: {
            type: 'string',
            description: 'Category of service',
            example: 'Premium',
            enum: ['Basic', 'Standard', 'Premium', 'Deluxe']
          },
          base_price: {
            type: 'number',
            format: 'float',
            description: 'Base price in currency units',
            example: 29.99,
            minimum: 0
          },
          duration_minutes: {
            type: 'integer',
            description: 'Service duration in minutes',
            example: 45,
            minimum: 15,
            maximum: 300
          }
        }
      },
      Car: {
        type: 'object',
        required: ['car_type'],
        properties: {
          car_id: {
            type: 'integer',
            description: 'Unique car identifier',
            example: 1
          },
          car_type: {
            type: 'string',
            description: 'Type/model of the car',
            example: 'Sedan',
            minLength: 2,
            maxLength: 50
          }
        }
      },
      Booking: {
        type: 'object',
        required: ['customer_id', 'service_id', 'scheduled_time', 'location_address'],
        properties: {
          booking_id: {
            type: 'integer',
            description: 'Unique booking identifier',
            example: 1
          },
          customer_id: {
            type: 'integer',
            description: 'Customer identifier',
            example: 123,
            minimum: 1
          },
          service_id: {
            type: 'integer',
            description: 'Service identifier',
            example: 1,
            minimum: 1
          },
          booking_status: {
            type: 'string',
            description: 'Current booking status',
            example: 'confirmed',
            enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
            default: 'pending'
          },
          scheduled_time: {
            type: 'string',
            format: 'date-time',
            description: 'Scheduled service time (ISO 8601 format)',
            example: '2025-10-15T14:30:00Z'
          },
          location_address: {
            type: 'string',
            description: 'Service location address',
            example: '123 Main Street, City, State 12345',
            minLength: 10,
            maxLength: 200
          }
        }
      },
      HealthCheck: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'success'
          },
          message: {
            type: 'string',
            example: 'CarWash Booking API is running!'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2025-10-13T10:30:00Z'
          },
          environment: {
            type: 'string',
            example: 'production'
          }
        }
      }
    },
    responses: {
      BadRequest: {
        description: 'Bad Request - Invalid input data',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              error: 'ValidationError',
              message: 'Invalid input data provided',
              details: 'Missing required field: service_name'
            }
          }
        }
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              error: 'NotFoundError',
              message: 'The requested resource was not found',
              details: 'No service found with ID: 999'
            }
          }
        }
      },
      InternalServerError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              error: 'InternalServerError',
              message: 'An unexpected error occurred',
              details: 'Database connection failed'
            }
          }
        }
      }
    }
  },
  paths: {
    '/': {
      get: {
        summary: 'Health check endpoint',
        description: 'Check if the API server is running and responsive',
        tags: ['Health'],
        responses: {
          '200': {
            description: 'API is running successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthCheck'
                }
              }
            }
          },
          '500': {
            $ref: '#/components/responses/InternalServerError'
          }
        }
      }
    },
    '/api/services': {
      get: {
        summary: 'Get all services',
        description: 'Retrieve a comprehensive list of all available car wash services',
        tags: ['Services'],
        responses: {
          '200': {
            description: 'Successfully retrieved list of services',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Service'
                  }
                }
              }
            }
          },
          '500': {
            $ref: '#/components/responses/InternalServerError'
          }
        }
      },
      post: {
        summary: 'Create a new service',
        description: 'Add a new car wash service to the system',
        tags: ['Services'],
        requestBody: {
          required: true,
          description: 'Service details to create',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['service_name', 'service_type', 'base_price', 'duration_minutes'],
                properties: {
                  service_name: { 
                    type: 'string',
                    description: 'Name of the service',
                    example: 'Premium Wash'
                  },
                  description: { 
                    type: 'string',
                    description: 'Service description',
                    example: 'Complete wash with wax protection'
                  },
                  service_type: { 
                    type: 'string',
                    description: 'Service category',
                    example: 'Premium'
                  },
                  base_price: { 
                    type: 'number',
                    description: 'Price in currency units',
                    example: 29.99
                  },
                  duration_minutes: { 
                    type: 'integer',
                    description: 'Duration in minutes',
                    example: 45
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Service created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Service'
                }
              }
            }
          },
          '400': {
            $ref: '#/components/responses/BadRequest'
          },
          '500': {
            $ref: '#/components/responses/InternalServerError'
          }
        }
      }
    },
    '/api/car-details': {
      get: {
        summary: 'Get car details',
        description: 'Retrieve car information including car_id and car_type for all registered vehicles',
        tags: ['Cars'],
        responses: {
          '200': {
            description: 'Successfully retrieved list of cars',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Car'
                  }
                }
              }
            }
          },
          '500': {
            $ref: '#/components/responses/InternalServerError'
          }
        }
      }
    },
    '/api/bookings': {
      get: {
        summary: 'Get all bookings',
        description: 'Retrieve a comprehensive list of all car wash service bookings',
        tags: ['Bookings'],
        responses: {
          '200': {
            description: 'Successfully retrieved list of bookings',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Booking'
                  }
                }
              }
            }
          },
          '500': {
            $ref: '#/components/responses/InternalServerError'
          }
        }
      },
      post: {
        summary: 'Create a new booking',
        description: 'Schedule a new car wash service booking',
        tags: ['Bookings'],
        requestBody: {
          required: true,
          description: 'Booking details to create',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['customer_id', 'service_id', 'scheduled_time', 'location_address'],
                properties: {
                  customer_id: { 
                    type: 'integer',
                    description: 'Customer identifier',
                    example: 123,
                    minimum: 1
                  },
                  service_id: { 
                    type: 'integer',
                    description: 'Service identifier',
                    example: 1,
                    minimum: 1
                  },
                  booking_status: { 
                    type: 'string',
                    description: 'Initial booking status (optional)',
                    example: 'pending',
                    enum: ['pending', 'confirmed'],
                    default: 'pending'
                  },
                  scheduled_time: { 
                    type: 'string',
                    format: 'date-time',
                    description: 'Scheduled service time (ISO 8601 format)',
                    example: '2025-10-15T14:30:00Z'
                  },
                  location_address: { 
                    type: 'string',
                    description: 'Service location address',
                    example: '123 Main Street, City, State 12345'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Booking created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Booking'
                }
              }
            }
          },
          '400': {
            $ref: '#/components/responses/BadRequest'
          },
          '404': {
            $ref: '#/components/responses/NotFound'
          },
          '500': {
            $ref: '#/components/responses/InternalServerError'
          }
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

// Non-blocking Azure SQL connection for startup stability
const connectWithRetry = async () => {
  try {
    console.log('🔄 Attempting to connect to Azure SQL Database...');
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
    console.error('❌ Database connection failed:', err.message);
    console.log('⏰ Will retry database connection in 5 seconds...');
    // Non-blocking retry - don't prevent app startup
    setTimeout(() => {
      connectWithRetry().catch(e => console.error('Retry failed:', e.message));
    }, 5000);
  }
};

// Start database connection attempt (non-blocking)
connectWithRetry().catch(err => {
  console.error('Initial database connection attempt failed:', err.message);
  console.log('🚀 Server will start anyway, database retries continue in background');
});

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

// Health check endpoint - documented in Swagger spec above
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
    swaggerPaths: Object.keys(simpleSwaggerSpec?.paths || {}).length
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

// Add global error handlers to prevent crashes
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err.message);
  console.error(err.stack);
  // Don't exit in production, just log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise);
  console.error('🚨 Reason:', reason);
  // Don't exit in production, just log the error
});

const server = app.listen(PORT, () => {
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
  console.log(`📊 API Paths: ${Object.keys(simpleSwaggerSpec?.paths || {}).length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (isProduction) {
    console.log('🔧 Azure Environment Variables:');
    console.log(`   WEBSITE_HOSTNAME: ${process.env.WEBSITE_HOSTNAME || 'NOT SET'}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
    console.log(`   PORT: ${PORT}`);
  }
});

server.on('error', (err) => {
  console.error('🚨 Server Error:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  }
});