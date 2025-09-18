const express = require('express');
const sql = require('mssql');
const app = express();
app.use(express.json());

// Azure SQL config - using provided credentials
const dbConfig = {
  user: 'sqladmin',
  password: 'Haneesh@77',
  server: 'carwashservicesqlserver.database.windows.net',
  database: 'CarwashserviceDB',
  options: {
    encrypt: true
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


// Helper: Table schemas
const tableSchemas = {
  Bookings: ['booking_id','customer_id','service_id','subscription_id','booking_status','scheduled_time','location_address','created_at','updated_at'],
  database_firewall_rules: ['id','name','start_ip_address','end_ip_address','create_date','modify_date'],
  Notifications: ['notification_id','user_id','message','type','is_read','created_at'],
  Payments: ['payment_id','booking_id','amount','payment_method','payment_status','transaction_date'],
  Products: ['ProductID','ProductName','Price','ProductDescription'],
  ProfessionalAllocation: ['allocation_id','booking_id','professional_id','assigned_at','status'],
  ProfessionalSkills: ['skill_id','professional_id','service_id','proficiency_level'],
  Services: ['service_id','service_name','description','service_type','base_price','duration_minutes','created_at'],
  Subscriptions: ['subscription_id','name','description','price','frequency','duration_months','created_at'],
  Users: ['user_id','full_name','email','phone_number','password_hash','role','created_at','updated_at']
};

// Helper: Primary keys for each table
const tablePKs = {
  Bookings: 'booking_id',
  database_firewall_rules: 'id',
  Notifications: 'notification_id',
  Payments: 'payment_id',
  Products: 'ProductID',
  ProfessionalAllocation: 'allocation_id',
  ProfessionalSkills: 'skill_id',
  Services: 'service_id',
  Subscriptions: 'subscription_id',
  Users: 'user_id'
};

// Generic CRUD routes for each table
Object.keys(tableSchemas).forEach(table => {
  const pk = tablePKs[table];
  const columns = tableSchemas[table];

  // GET all
  app.get(`/api/${table}`, async (req, res) => {
    try {
      const result = await sql.query(`SELECT * FROM ${table}`);
      res.json(result.recordset);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET by id
  app.get(`/api/${table}/:${pk}`, async (req, res) => {
    try {
      const result = await sql.query(`SELECT * FROM ${table} WHERE ${pk} = @id`, {
        id: req.params[pk]
      });
      res.json(result.recordset[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST (create)
  app.post(`/api/${table}`, async (req, res) => {
    try {
      const values = columns.map(col => req.body[col]);
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

  // PUT (update)
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

  // DELETE
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
