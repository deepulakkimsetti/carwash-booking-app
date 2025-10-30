const express = require('express');
const sql = require('mssql');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();

// Initialize Firebase Admin SDK
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

// Initialize Firebase (only once)
if (!admin.apps.length) {
  try {
    let credential;
    
    // Check if service account JSON is provided via environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.log('🔑 Using Firebase service account from environment variable');
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(serviceAccount);
    } else {
      console.log('🔑 Using Firebase application default credentials');
      credential = admin.credential.applicationDefault();
    }
    
    admin.initializeApp({
      credential: credential,
      databaseURL: firebaseConfig.databaseURL
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.log('⚠️ Continuing without Firebase - professional assignment will be disabled');
  }
}

const firebaseDB = admin.database();

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

// CORS support
app.use(cors({
  origin: ['http://localhost:5173', 'https://carwash-booking-api-ameuafauczctfndp.eastasia-01.azurewebsites.net', 'https://yellow-mud-03e0dd900.2.azurestaticapps.net'],
  credentials: true,
}));

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
            type: 'string',
            description: 'Customer identifier (alphanumeric)',
            example: 'CUST001'
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
    },
    '/api/getServiceDetails': {
      get: {
        summary: 'Get service details by car and product',
        description: 'Retrieve services filtered by specific car_id and product_id parameters',
        tags: ['Services'],
        parameters: [
          {
            name: 'car_id',
            in: 'query',
            required: true,
            description: 'Car identifier to filter services',
            schema: {
              type: 'integer',
              minimum: 1,
              example: 1
            }
          },
          {
            name: 'product_id',
            in: 'query',
            required: true,
            description: 'Product identifier to filter services',
            schema: {
              type: 'integer',
              minimum: 1,
              example: 1  
            }
          }
        ],
        responses: {
          '200': {
            description: 'Successfully retrieved service details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    count: {
                      type: 'integer',
                      description: 'Number of services found',
                      example: 3
                    },
                    filters: {
                      type: 'object',
                      properties: {
                        car_id: {
                          type: 'integer',
                          example: 1
                        },
                        product_id: {
                          type: 'integer', 
                          example: 1
                        }
                      }
                    },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Service'
                      }
                    }
                  }
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
    '/api/product-details': {
      get: {
        summary: 'Get all products',
        description: 'Retrieve a comprehensive list of all available products in the system',
        tags: ['Products'],
        responses: {
          '200': {
            description: 'Successfully retrieved list of products',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      ProductID: {
                        type: 'integer',
                        description: 'Unique product identifier',
                        example: 1
                      },
                      ProductName: {
                        type: 'string',
                        description: 'Name of the product',
                        example: 'Car Wash Premium'
                      },
                      Price: {
                        type: 'number',
                        format: 'float',
                        description: 'Product price in currency units',
                        example: 29.99
                      },
                      ProductDescription: {
                        type: 'string',
                        description: 'Detailed product description',
                        example: 'Complete car wash service with premium cleaning products'
                      }
                    }
                  }
                }
              }
            }
          },
          '503': {
            description: 'Database connection error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Database error'
                    },
                    message: {
                      type: 'string',
                      example: 'Connection failed'
                    },
                    tip: {
                      type: 'string',
                      example: 'Add your IP to Azure SQL firewall rules'
                    },
                    sampleData: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          product_id: {
                            type: 'integer',
                            example: 1
                          },
                          product_name: {
                            type: 'string',
                            example: 'Car Wash'
                          },
                          price: {
                            type: 'number',
                            example: 10.99
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/getCities': {
      get: {
        summary: 'Get all cities',
        description: 'Retrieve a list of all active cities with CityID and CityName',
        tags: ['Cities'],
        responses: {
          '200': {
            description: 'Successfully retrieved list of cities',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      CityID: {
                        type: 'integer',
                        description: 'Unique city identifier',
                        example: 1
                      },
                      CityName: {
                        type: 'string',
                        description: 'Name of the city',
                        example: 'Mumbai'
                      }
                    }
                  }
                }
              }
            }
          },
          '503': {
            description: 'Database connection error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Database error'
                    },
                    message: {
                      type: 'string',
                      example: 'Connection failed'
                    },
                    tip: {
                      type: 'string',
                      example: 'Add your IP to Azure SQL firewall rules'
                    },
                    sampleData: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          CityID: {
                            type: 'integer',
                            example: 1
                          },
                          CityName: {
                            type: 'string',
                            example: 'Mumbai'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/getLocations': {
      get: {
        summary: 'Get locations by city',
        description: 'Retrieve a list of active locations filtered by CityID with LocationID and LocationName',
        tags: ['Locations'],
        parameters: [
          {
            name: 'cityId',
            in: 'query',
            required: true,
            description: 'City identifier to filter locations',
            schema: {
              type: 'integer',
              minimum: 1,
              example: 1
            }
          }
        ],
        responses: {
          '200': {
            description: 'Successfully retrieved list of locations',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      LocationID: {
                        type: 'integer',
                        description: 'Unique location identifier',
                        example: 1
                      },
                      LocationName: {
                        type: 'string',
                        description: 'Name of the location',
                        example: 'Andheri West'
                      }
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad Request - Missing or invalid cityId parameter',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Missing required parameter'
                    },
                    message: {
                      type: 'string',
                      example: 'cityId parameter is required'
                    },
                    example: {
                      type: 'string',
                      example: '/api/getLocations?cityId=1'
                    }
                  }
                }
              }
            }
          },
          '503': {
            description: 'Database connection error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Database error'
                    },
                    message: {
                      type: 'string',
                      example: 'Connection failed'
                    },
                    tip: {
                      type: 'string',
                      example: 'Add your IP to Azure SQL firewall rules'
                    },
                    sampleData: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          LocationID: {
                            type: 'integer',
                            example: 1
                          },
                          LocationName: {
                            type: 'string',
                            example: 'Andheri West'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/saveBookings': {
      post: {
        summary: 'Save a new booking',
        description: 'Create a new car wash service booking with all required details',
        tags: ['Bookings'],
        requestBody: {
          required: true,
          description: 'Booking details to save',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['customer_id', 'service_id', 'scheduled_time', 'location_address'],
                properties: {
                  customer_id: {
                    type: 'string',
                    description: 'Customer identifier (alphanumeric)',
                    example: 'CUST001'
                  },
                  service_id: {
                    type: 'integer',
                    format: 'int64',
                    description: 'Service identifier',
                    example: 1,
                    minimum: 1
                  },
                  booking_status: {
                    type: 'string',
                    description: 'Booking status (optional, defaults to "pending")',
                    example: 'pending',
                    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
                    default: 'pending'
                  },
                  scheduled_time: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Scheduled service time (ISO 8601 format)',
                    example: '2025-10-20T14:30:00'
                  },
                  location_address: {
                    type: 'string',
                    description: 'Service location address',
                    example: '123 Main Street, Andheri West, Mumbai',
                    minLength: 5,
                    maxLength: 500
                  },
                  LocationID: {
                    type: 'integer',
                    description: 'Location identifier (optional)',
                    example: 1,
                    minimum: 1
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Booking saved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    message: {
                      type: 'string',
                      example: 'Booking saved successfully'
                    },
                    booking_id: {
                      type: 'integer',
                      format: 'int64',
                      description: 'Generated booking ID',
                      example: 1001
                    },
                    data: {
                      type: 'object',
                      properties: {
                        customer_id: {
                          type: 'string',
                          example: 'CUST001'
                        },
                        service_id: {
                          type: 'integer',
                          example: 1
                        },
                        booking_status: {
                          type: 'string',
                          example: 'pending'
                        },
                        scheduled_time: {
                          type: 'string',
                          example: '2025-10-20T14:30:00.000Z'
                        },
                        location_address: {
                          type: 'string',
                          example: '123 Main Street, Andheri West, Mumbai'
                        },
                        LocationID: {
                          type: 'integer',
                          example: 1
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad Request - Invalid input data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'ValidationError'
                    },
                    message: {
                      type: 'string',
                      example: 'Missing required fields'
                    },
                    details: {
                      type: 'string',
                      example: 'customer_id, service_id, scheduled_time, and location_address are required'
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Database error'
                    },
                    message: {
                      type: 'string',
                      example: 'Failed to save booking'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/getUserBookingDetails': {
      get: {
        summary: 'Get user booking details',
        description: 'Retrieve comprehensive booking details for a specific customer including service information, car type, location details, and booking status',
        tags: ['Bookings'],
        parameters: [
          {
            name: 'customer_id',
            in: 'query',
            required: true,
            description: 'Customer identifier (alphanumeric string) to fetch booking details',
            schema: {
              type: 'string',
              minLength: 1,
              example: 'CUST001'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Successfully retrieved user booking details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    message: {
                      type: 'string',
                      example: 'User booking details retrieved successfully'
                    },
                    customer_id: {
                      type: 'string',
                      example: 'CUST001'
                    },
                    count: {
                      type: 'integer',
                      description: 'Number of bookings found',
                      example: 2
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          service_name: {
                            type: 'string',
                            description: 'Name of the service',
                            example: 'Premium Wash'
                          },
                          car_type: {
                            type: 'string',
                            description: 'Type of car',
                            example: 'Sedan'
                          },
                          cityName: {
                            type: 'string',
                            description: 'City name',
                            example: 'Mumbai'
                          },
                          NearestLocation: {
                            type: 'string',
                            description: 'Nearest location name',
                            example: 'Andheri West'
                          },
                          FullAddress: {
                            type: 'string',
                            description: 'Complete service address',
                            example: '123 Main Street, Andheri West, Mumbai'
                          },
                          scheduled_time: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Scheduled service time',
                            example: '2025-10-20T14:30:00.000Z'
                          },
                          service_type: {
                            type: 'string',
                            description: 'Type of service',
                            example: 'Premium'
                          },
                          duration_minutes: {
                            type: 'integer',
                            description: 'Service duration in minutes',
                            example: 45
                          },
                          base_price: {
                            type: 'number',
                            format: 'decimal',
                            description: 'Service base price',
                            example: 29.99
                          },
                          booking_id: {
                            type: 'integer',
                            description: 'Booking identifier',
                            example: 1
                          },
                          booking_status: {
                            type: 'string',
                            description: 'Current booking status',
                            example: 'pending',
                            enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled']
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad Request - Missing or invalid customer_id parameter',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Missing required parameter'
                    },
                    message: {
                      type: 'string',
                      example: 'customer_id parameter is required'
                    },
                    example: {
                      type: 'string',
                      example: '/api/getUserBookingDetails?customer_id=CUST001'
                    }
                  }
                }
              }
            }
          },
          '404': {
            description: 'No bookings found for the customer',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: false
                    },
                    message: {
                      type: 'string',
                      example: 'No bookings found for this customer'
                    },
                    customer_id: {
                      type: 'string',
                      example: 'CUST001'
                    },
                    count: {
                      type: 'integer',
                      example: 0
                    },
                    data: {
                      type: 'array',
                      example: []
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Database error'
                    },
                    message: {
                      type: 'string',
                      example: 'Connection failed'
                    },
                    tip: {
                      type: 'string',
                      example: 'Check database connection and table structure'
                    }
                  }
                }
              }
            }
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

// Helper Functions for Professional Assignment

/**
 * Get professionals from Firebase by location ID
 */
async function getProfessionalsByLocation(locationId) {
  try {
    const usersRef = firebaseDB.ref('users');
    const snapshot = await usersRef.once('value');
    const professionals = [];
    
    snapshot.forEach((childSnapshot) => {
      const user = childSnapshot.val();
      const userId = childSnapshot.key;
      
      // Check if nearestLocations exists and contains the locationId
      if (user.nearestLocations) {
        // Convert nearestLocations object to array of values
        const locationIds = Object.values(user.nearestLocations);
        
        if (locationIds.includes(locationId)) {
          professionals.push({
            id: userId,
            name: user.fullName || 'N/A',
            phone: user.phone || 'N/A',
            email: user.email || 'N/A',
            address: user.address || 'N/A',
            city: user.city || 'N/A',
            nearestLocations: locationIds
          });
        }
      }
    });
    
    console.log(`✅ Found ${professionals.length} professionals for LocationID ${locationId}`);
    return professionals;
  } catch (error) {
    console.error('❌ Error fetching professionals from Firebase:', error.message);
    throw error;
  }
}

/**
 * Get total booking count for a professional
 * Excludes bookings with 'completed' or 'rejected' status
 */
async function getProfessionalBookingCount(professionalId) {
  try {
    const request = new sql.Request();
    request.input('professional_id', sql.VarChar, professionalId);
    
    const result = await request.query(`
      SELECT COUNT(*) as bookingCount 
      FROM ProfessionalAllocation 
      WHERE professional_id = @professional_id
        AND status NOT IN ('completed', 'rejected')
    `);
    
    return result.recordset[0].bookingCount || 0;
  } catch (error) {
    console.error('❌ Error getting booking count:', error.message);
    return 0;
  }
}

/**
 * Check if professional is available during the specified time range
 */
async function isProfessionalAvailable(professionalId, scheduledTime, durationMinutes) {
  try {
    const request = new sql.Request();
    request.input('professional_id', sql.VarChar, professionalId);
    request.input('scheduled_time', sql.DateTime, scheduledTime);
    
    // Calculate end time
    const endTime = new Date(scheduledTime);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);
    request.input('end_time', sql.DateTime, endTime);
    
    // Check for overlapping bookings
    const result = await request.query(`
      SELECT COUNT(*) as conflictCount
      FROM ProfessionalAllocation pa
      INNER JOIN Bookings b ON pa.booking_id = b.booking_id
      INNER JOIN Services s ON b.service_id = s.service_id
      WHERE pa.professional_id = @professional_id
        AND pa.status IN ('assigned', 'confirmed')
        AND b.booking_status NOT IN ('cancelled', 'completed')
        AND (
          -- Check if new booking overlaps with existing bookings
          (b.scheduled_time <= @scheduled_time AND 
           DATEADD(MINUTE, s.duration_minutes, b.scheduled_time) > @scheduled_time)
          OR
          (b.scheduled_time < @end_time AND 
           DATEADD(MINUTE, s.duration_minutes, b.scheduled_time) >= @end_time)
          OR
          (b.scheduled_time >= @scheduled_time AND 
           DATEADD(MINUTE, s.duration_minutes, b.scheduled_time) <= @end_time)
        )
    `);
    
    const isAvailable = result.recordset[0].conflictCount === 0;
    console.log(`${isAvailable ? '✅' : '⏭️'} Professional ${professionalId} ${isAvailable ? 'is available' : 'has conflicts'}`);
    return isAvailable;
  } catch (error) {
    console.error('❌ Error checking professional availability:', error.message);
    return false;
  }
}

/**
 * Assign professional to booking
 */
async function assignProfessionalToBooking(bookingId, professionalId) {
  try {
    const request = new sql.Request();
    request.input('booking_id', sql.BigInt, bookingId);
    request.input('professional_id', sql.VarChar, professionalId);
    request.input('assigned_at', sql.DateTime, new Date());
    request.input('status', sql.VarChar(20), 'assigned');
    
    const result = await request.query(`
      INSERT INTO ProfessionalAllocation (booking_id, professional_id, assigned_at, status)
      OUTPUT INSERTED.allocation_id, INSERTED.booking_id, INSERTED.professional_id, 
             INSERTED.assigned_at, INSERTED.status
      VALUES (@booking_id, @professional_id, @assigned_at, @status)
    `);
    
    console.log(`✅ Professional ${professionalId} assigned to booking ${bookingId}`);
    return result.recordset[0];
  } catch (error) {
    console.error('❌ Error assigning professional:', error.message);
    throw error;
  }
}

/**
 * Update booking status
 */
async function updateBookingStatus(bookingId, status) {
  try {
    const request = new sql.Request();
    request.input('booking_id', sql.BigInt, bookingId);
    request.input('booking_status', sql.VarChar, status);
    request.input('updated_at', sql.DateTime, new Date());
    
    await request.query(`
      UPDATE Bookings 
      SET booking_status = @booking_status, updated_at = @updated_at
      WHERE booking_id = @booking_id
    `);
    
    console.log(`✅ Booking ${bookingId} status updated to: ${status}`);
  } catch (error) {
    console.error('❌ Error updating booking status:', error.message);
    throw error;
  }
}

// Table schemas
const tableSchemas = {
  Bookings: ['booking_id','customer_id','service_id','booking_status','scheduled_time','location_address','created_at','updated_at'],
  Cars: ['car_id','car_type','customer_id','make','model','year','license_plate','color','created_at','updated_at'],
  Cities: ['CityID','CityName','StateCode','CountryCode','IsActive','CreatedDate','ModifiedDate'],
  database_firewall_rules: ['id','name','start_ip_address','end_ip_address','create_date','modify_date'],
  Locations: ['LocationID','CityID','LocationName','Area','Pincode','IsActive','CreatedDate','ModifiedDate'],
  Notifications: ['notification_id','user_id','message','type','is_read','created_at'],
  Payments: ['payment_id','booking_id','amount','payment_method','payment_status','transaction_date'],
  Products: ['ProductID','ProductName','Price','ProductDescription'],
  ProfessionalAllocation: ['allocation_id','booking_id','professional_id','assigned_at','status'],
  ProfessionalSkills: ['skill_id','professional_id','service_id','proficiency_level'],
  Services: ['service_id','service_name','description','service_type','base_price','duration_minutes','created_at','car_id','product_id']
};

// Primary keys
const tablePKs = {
  Bookings: 'booking_id',
  Cars: 'car_id',
  Cities: 'CityID',
  database_firewall_rules: 'id',
  Locations: 'LocationID',
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
 * /api/product-details:
 *  get:
 *    summary: Get product details
 *    tags: [Product Details]
 *    responses:
 *      200:
 *        description: Product details
 *      404:
 *        description: Product not found  
 */
app.get('/api/product-details', async (req, res) => {
  try {
    const result = await sql.query('SELECT * FROM Products');
    res.json(result.recordset);
  } catch (err) {
    res.status(503).json({
      error: 'Database error',
      message: err.message,
      tip: 'Add your IP (106.222.232.56) to Azure SQL firewall rules',
      sampleData: [
        { product_id: 1, product_name: 'Car Wash', price: 10.99 },
        { product_id: 2, product_name: 'Interior Cleaning', price: 15.99 }
      ]
    });
  }
});

/**
 * @swagger
 * /api/getCities:
 *   get:
 *     summary: Get all cities
 *     tags: [Cities]
 *     responses:
 *       200:
 *         description: List of cities with CityID and CityName
 *       503:
 *         description: Database connection error
 */
app.get('/api/getCities', async (req, res) => {
  console.log('🏙️ /api/getCities route hit at:', new Date().toISOString());
  try {
    // Query only CityID and CityName from Cities table where IsActive = 1
    const result = await sql.query('SELECT CityID, CityName FROM Cities WHERE IsActive = 1 ORDER BY CityName');
    console.log('✅ Query successful, returning', result.recordset.length, 'cities');
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Database error in getCities:', err.message);
    res.status(503).json({ 
      error: 'Database error',
      message: err.message,
      tip: 'Add your IP to Azure SQL firewall rules',
      sampleData: [
        { CityID: 1, CityName: 'Mumbai' },
        { CityID: 2, CityName: 'Delhi' },
        { CityID: 3, CityName: 'Bangalore' },
        { CityID: 4, CityName: 'Chennai' },
        { CityID: 5, CityName: 'Kolkata' }
      ]
    });
  }
});

/**
 * @swagger
 * /api/getLocations:
 *   get:
 *     summary: Get locations by city ID
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: cityId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of locations with LocationID and LocationName
 *       400:
 *         description: Missing or invalid cityId parameter
 *       503:
 *         description: Database connection error
 */
app.get('/api/getLocations', async (req, res) => {
  console.log('📍 /api/getLocations route hit at:', new Date().toISOString());
  try {
    const { cityId } = req.query;
    
    // Validate required parameter
    if (!cityId) {
      return res.status(400).json({ 
        error: 'Missing required parameter',
        message: 'cityId parameter is required',
        example: '/api/getLocations?cityId=1'
      });
    }

    // Validate parameter is a number
    if (isNaN(cityId)) {
      return res.status(400).json({ 
        error: 'Invalid parameter type',
        message: 'cityId must be a valid number'
      });
    }

    const request = new sql.Request();
    request.input('cityId', sql.Int, parseInt(cityId));
    
    // Query only LocationID and LocationName from Locations table where IsActive = 1 and matches CityID
    const result = await request.query(`
      SELECT LocationID, LocationName 
      FROM Locations 
      WHERE CityID = @cityId AND IsActive = 1 
      ORDER BY LocationName
    `);
    
    console.log('✅ Query successful, returning', result.recordset.length, 'locations for cityId:', cityId);
    res.json(result.recordset);
    
  } catch (err) {
    console.error('❌ Database error in getLocations:', err.message);
    res.status(503).json({ 
      error: 'Database error',
      message: err.message,
      tip: 'Add your IP to Azure SQL firewall rules',
      query: 'SELECT LocationID, LocationName FROM Locations WHERE CityID = ? AND IsActive = 1',
      sampleData: [
        { LocationID: 1, LocationName: 'Andheri West' },
        { LocationID: 2, LocationName: 'Bandra East' },
        { LocationID: 3, LocationName: 'Powai' },
        { LocationID: 4, LocationName: 'Thane West' }
      ]
    });
  }
});

/**
 * @swagger
 * /api/saveBookings:
 *   post:
 *     summary: Save a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer_id, service_id, scheduled_time, location_address]
 *             properties:
 *               customer_id:
 *                 type: string
 *               service_id:
 *                 type: integer
 *               booking_status:
 *                 type: string
 *               scheduled_time:
 *                 type: string
 *                 format: date-time
 *               location_address:
 *                 type: string
 *               LocationID:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Booking saved successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Database error
 */
app.post('/api/saveBookings', async (req, res) => {
  console.log('💾 /api/saveBookings route hit at:', new Date().toISOString());
  console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { 
      customer_id, 
      service_id, 
      booking_status = 'pending', 
      scheduled_time, 
      location_address,
      LocationID 
    } = req.body;
    
    // Validate required fields (now LocationID is required for professional assignment)
    const requiredFields = ['customer_id', 'service_id', 'scheduled_time', 'location_address', 'LocationID'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Missing required fields',
        details: `The following fields are required: ${missingFields.join(', ')}`,
        requiredFields: requiredFields,
        providedFields: Object.keys(req.body)
      });
    }

    // Validate data types
    if (!customer_id || typeof customer_id !== 'string' || customer_id.trim().length === 0) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid data types',
        details: 'customer_id must be a non-empty string (alphanumeric)'
      });
    }

    if (isNaN(service_id) || isNaN(LocationID)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid data types',
        details: 'service_id and LocationID must be valid numbers'
      });
    }

    // Validate scheduled_time format
    const scheduledDate = new Date(scheduled_time);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid scheduled_time format',
        details: 'scheduled_time must be a valid date-time string (ISO 8601 format)',
        example: '2025-10-20T14:30:00'
      });
    }

    // Validate future date
    if (scheduledDate <= new Date()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid scheduled_time',
        details: 'scheduled_time must be a future date and time'
      });
    }

    // STEP 1: Get service duration for availability check
    console.log('🔍 Fetching service duration...');
    const serviceRequest = new sql.Request();
    serviceRequest.input('service_id', sql.BigInt, parseInt(service_id));
    const serviceResult = await serviceRequest.query('SELECT duration_minutes FROM Services WHERE service_id = @service_id');
    
    if (serviceResult.recordset.length === 0) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Service not found',
        details: `No service found with ID: ${service_id}`
      });
    }
    
    const durationMinutes = serviceResult.recordset[0].duration_minutes;
    console.log(`✅ Service duration: ${durationMinutes} minutes`);

    // STEP 2: Save the booking first
    const request = new sql.Request();
    request.input('customer_id', sql.VarChar, customer_id);
    request.input('service_id', sql.BigInt, parseInt(service_id));
    request.input('booking_status', sql.VarChar, booking_status);
    request.input('scheduled_time', sql.DateTime, scheduledDate);
    request.input('location_address', sql.VarChar, location_address);
    request.input('created_at', sql.DateTime, new Date());
    request.input('updated_at', sql.DateTime, new Date());
    request.input('LocationID', sql.Int, parseInt(LocationID));

    const insertQuery = `
      INSERT INTO Bookings (customer_id, service_id, booking_status, scheduled_time, location_address, created_at, updated_at, LocationID) 
      OUTPUT INSERTED.booking_id
      VALUES (@customer_id, @service_id, @booking_status, @scheduled_time, @location_address, @created_at, @updated_at, @LocationID)
    `;

    console.log('🔍 Executing booking insert query...');
    const result = await request.query(insertQuery);
    const newBookingId = result.recordset[0].booking_id;
    console.log('✅ Booking saved successfully with ID:', newBookingId);

    // STEP 3: Get professionals from Firebase based on LocationID
    console.log(`🔍 Fetching professionals from Firebase for LocationID: ${LocationID}`);
    let professionals = [];
    let allocationResult = null;
    let assignedProfessional = null;
    
    try {
      professionals = await getProfessionalsByLocation(parseInt(LocationID));
    } catch (firebaseError) {
      console.error('❌ Firebase error:', firebaseError.message);
      // Continue without professionals - will update status below
    }

    if (professionals.length === 0) {
      // STEP 4a: No professionals available for this location
      console.log('⚠️ No professionals available for this location');
      await updateBookingStatus(newBookingId, 'not_serviceable');
      
      return res.status(201).json({
        success: true,
        message: 'Booking saved but area is not serviceable',
        booking_id: newBookingId,
        booking_status: 'not_serviceable',
        data: {
          booking_id: newBookingId,
          customer_id: customer_id,
          service_id: parseInt(service_id),
          booking_status: 'not_serviceable',
          scheduled_time: scheduledDate.toISOString(),
          location_address: location_address,
          LocationID: parseInt(LocationID),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });
    }

    // STEP 4b: Get booking counts for each professional and sort by lowest count
    console.log('📊 Getting booking counts for professionals...');
    const professionalsWithCounts = await Promise.all(
      professionals.map(async (prof) => {
        const bookingCount = await getProfessionalBookingCount(prof.id);
        return {
          ...prof,
          bookingCount
        };
      })
    );

    // Sort by booking count (lowest first)
    professionalsWithCounts.sort((a, b) => a.bookingCount - b.bookingCount);
    console.log('✅ Professionals sorted by booking count:', 
      professionalsWithCounts.map(p => `${p.id}: ${p.bookingCount} bookings`).join(', '));

    // STEP 5: Find first available professional
    console.log('🔍 Checking professional availability...');
    for (const professional of professionalsWithCounts) {
      const isAvailable = await isProfessionalAvailable(
        professional.id, 
        scheduledDate, 
        durationMinutes
      );
      
      if (isAvailable) {
        console.log(`✅ Professional ${professional.id} is available`);
        
        // Assign this professional
        const allocation = await assignProfessionalToBooking(newBookingId, professional.id);
        
        allocationResult = {
          allocation_id: allocation.allocation_id,
          professional_id: allocation.professional_id,
          professional_name: professional.name || 'N/A',
          assigned_at: allocation.assigned_at,
          status: allocation.status
        };
        
        assignedProfessional = professional;
        console.log('✅ Professional assigned successfully with allocation ID:', allocation.allocation_id);
        break;
      } else {
        console.log(`⏭️ Professional ${professional.id} is not available, checking next...`);
      }
    }

    // STEP 6: If no professional was assigned, update booking status
    if (!allocationResult) {
      console.log('⚠️ All professionals are busy during the requested time');
      await updateBookingStatus(newBookingId, 'No Professionals available at requested time');
      
      return res.status(201).json({
        success: true,
        message: 'Booking saved but no professionals available at the requested time',
        booking_id: newBookingId,
        booking_status: 'No Professionals available at requested time',
        professionals_checked: professionalsWithCounts.length,
        data: {
          booking_id: newBookingId,
          customer_id: customer_id,
          service_id: parseInt(service_id),
          booking_status: 'No Professionals available at requested time',
          scheduled_time: scheduledDate.toISOString(),
          location_address: location_address,
          LocationID: parseInt(LocationID),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });
    }

    // STEP 7: Update booking status to reflect professional assignment
    await updateBookingStatus(newBookingId, 'Professional Assigned');
    console.log('✅ Booking status updated to "Professional Assigned"');

    // STEP 8: Return success response with professional assignment
    res.status(201).json({
      success: true,
      message: 'Booking saved and professional assigned successfully',
      booking_id: newBookingId,
      data: {
        booking_id: newBookingId,
        customer_id: customer_id,
        service_id: parseInt(service_id),
        booking_status: 'Professional Assigned',
        scheduled_time: scheduledDate.toISOString(),
        location_address: location_address,
        LocationID: parseInt(LocationID),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      professional_allocation: allocationResult,
      professional_details: {
        id: assignedProfessional.id,
        name: assignedProfessional.name || 'N/A',
        total_bookings: assignedProfessional.bookingCount,
        phone: assignedProfessional.phone || 'N/A',
        email: assignedProfessional.email || 'N/A'
      }
    });
    
  } catch (err) {
    console.error('❌ Error in saveBookings:', err.message);
    console.error('📋 Error stack:', err.stack);
    
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to save booking',
      details: err.message
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

// API endpoint for getServiceDetails - Services filtered by car_id and product_id
app.get('/api/getServiceDetails', async (req, res) => {
  try {
    const { car_id, product_id } = req.query;
    
    // Validate required parameters
    if (!car_id || !product_id) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        message: 'Both car_id and product_id are required',
        example: '/api/getServiceDetails?car_id=1&product_id=1'
      });
    }

    // Validate parameters are numbers
    if (isNaN(car_id) || isNaN(product_id)) {
      return res.status(400).json({ 
        error: 'Invalid parameter types',
        message: 'car_id and product_id must be valid numbers'
      });
    }

    const request = new sql.Request();
    request.input('car_id', sql.Int, parseInt(car_id));
    request.input('product_id', sql.Int, parseInt(product_id));
    
    const result = await request.query(`SELECT * FROM [dbo].[Services] WHERE car_id = @car_id AND product_id = @product_id`);
    
    res.json({
      success: true,
      count: result.recordset.length,
      filters: {
        car_id: parseInt(car_id),
        product_id: parseInt(product_id)
      },
      data: result.recordset
    });
    
  } catch (err) {
    console.error('Error in /api/getServiceDetails:', err);
    res.status(500).json({ 
      error: 'Database error',
      message: err.message,
      query: 'SELECT * FROM [dbo].[Services] WHERE car_id = ? AND product_id = ?'
    });
  }
});

/**
 * @swagger
 * /api/getUserBookingDetails:
 *   get:
 *     summary: Get user booking details with comprehensive information
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer identifier to fetch booking details
 *         example: 123
 *     responses:
 *       200:
 *         description: Successfully retrieved user booking details
 *       400:
 *         description: Missing or invalid customer_id parameter
 *       404:
 *         description: No bookings found for the customer
 *       500:
 *         description: Database error
 */
app.get('/api/getUserBookingDetails', async (req, res) => {
  console.log('📋 /api/getUserBookingDetails route hit at:', new Date().toISOString());
  
  try {
    const { customer_id } = req.query;
    
    // Validate required parameter
    if (!customer_id) {
      return res.status(400).json({ 
        error: 'Missing required parameter',
        message: 'customer_id parameter is required',
        example: '/api/getUserBookingDetails?customer_id=CUST001'
      });
    }

    // Validate parameter is not empty
    if (typeof customer_id !== 'string' || customer_id.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid parameter type',
        message: 'customer_id must be a valid alphanumeric string'
      });
    }

    const request = new sql.Request();
    request.input('customer_id', sql.VarChar, customer_id.trim());
    
    // Execute the comprehensive query with joins and subqueries
    const result = await request.query(`
      SELECT 
        s.service_name,
        (SELECT type FROM [dbo].[Cars] WHERE id = s.car_id) as car_type,
        (SELECT CityName FROM [dbo].[Cities] WHERE CityID = (SELECT CityID FROM [dbo].[Locations] WHERE LocationID = b.LocationID)) as cityName,
        (SELECT LocationName FROM [dbo].[Locations] WHERE LocationID = b.LocationID) as NearestLocation,
        b.location_address as FullAddress,
        b.scheduled_time,
        s.service_type,
        s.duration_minutes,
        s.base_price,
        b.booking_id,
        b.booking_status,
        b.created_at
      FROM [dbo].[Services] as s 
      INNER JOIN [dbo].[Bookings] as b ON s.service_id = b.service_id 
      WHERE b.customer_id = @customer_id
      ORDER BY b.scheduled_time DESC
    `);
    
    console.log('✅ Query successful, returning', result.recordset.length, 'booking(s) for customer_id:', customer_id);
    
    // Check if any bookings found
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No bookings found for this customer',
        customer_id: customer_id,
        count: 0,
        data: []
      });
    }
    
    res.json({
      success: true,
      message: 'User booking details retrieved successfully',
      customer_id: customer_id,
      count: result.recordset.length,
      data: result.recordset
    });
    
  } catch (err) {
    console.error('❌ Database error in getUserBookingDetails:', err.message);
    res.status(500).json({ 
      error: 'Database error',
      message: err.message,
      tip: 'Check database connection and table structure',
      sampleData: [
        {
          service_name: 'Premium Wash',
          car_type: 'Sedan',
          cityName: 'Mumbai',
          NearestLocation: 'Andheri West',
          FullAddress: '123 Main Street, Andheri West, Mumbai',
          scheduled_time: '2025-10-20T14:30:00.000Z',
          service_type: 'Premium',
          duration_minutes: 45,
          base_price: 29.99,
          booking_id: 1,
          booking_status: 'pending'
        }
      ]
    });
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