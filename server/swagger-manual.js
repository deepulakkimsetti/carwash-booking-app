// Manual Swagger definition for Azure deployment
const manualSwaggerSpec = {
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
                    message: { type: 'string' },
                    timestamp: { type: 'string' }
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
                      duration_minutes: { type: 'integer' },
                      created_at: { type: 'string', format: 'date-time' }
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
        summary: 'Get car details with only car_id and car_type',
        tags: ['Car Details'],
        responses: {
          '200': {
            description: 'List of cars with car_id and car_type only',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      car_id: { type: 'integer', description: 'Unique identifier for the car' },
                      car_type: { type: 'string', description: 'Type of the car (e.g., Sedan, SUV, Hatchback)' }
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
                      scheduled_time: { type: 'string', format: 'date-time' },
                      location_address: { type: 'string' },
                      created_at: { type: 'string', format: 'date-time' },
                      updated_at: { type: 'string', format: 'date-time' }
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

module.exports = manualSwaggerSpec;