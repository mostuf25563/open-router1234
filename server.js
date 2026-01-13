import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import os from 'os';
import { generateScreenplay, getScreenplayFormat } from './routes/screenplay.js';
import { getModels } from './routes/models.js';

const app = express();
const PORT = 3000;

// Get local IP address (fallback)
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Get server's domain/hostname, fallback to IP
function getServerAddress() {
  const hostname = os.hostname();
  // Only fall back to IP if hostname is literally 'localhost'
  // Otherwise use the domain/hostname as-is
  if (hostname === 'localhost') {
    return getLocalIP();
  }
  return hostname;
}

app.use(express.json());

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Debug middleware - logs request/response when debug=true parameter is present
app.use((req, res, next) => {
  const isDebug = req.query.debug === 'true' || req.body?.debug === true;
  
  if (isDebug) {
    req.isDebug = true;
    
    // Log incoming request
    console.log('\n=== DEBUG: Incoming Request ===');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Query:', req.query);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Headers:', req.headers);
    console.log('==============================\n');
    
    // Intercept response
    const originalJson = res.json;
    const originalStatus = res.status;
    let statusCode = 200;
    
    res.status = function(code) {
      statusCode = code;
      return originalStatus.call(this, code);
    };
    
    res.json = function(data) {
      console.log('\n=== DEBUG: Response ===');
      console.log('Status:', statusCode);
      console.log('Data:', JSON.stringify(data, null, 2));
      console.log('======================\n');
      return originalJson.call(this, data);
    };
  }
  
  next();
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Screenplay API', version: '1.0.0' },
    servers: [{ url: '/' }],
  },
  apis: ['./routes/screenplay.js', './routes/models.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Serve swagger-ui static files
app.use('/api-docs', swaggerUi.serve);

// Serve swagger UI with dynamic host injection
app.get('/api-docs/', (req, res, next) => {
  const protocol = req.protocol || 'http';
  const host = req.get('host') || `localhost:${PORT}`;
  const specWithServers = {
    ...swaggerDocs,
    servers: [{ url: `${protocol}://${host}` }],
  };
  swaggerUi.setup(specWithServers)(req, res, next);
});

// Redirect root to /api-docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Screenplay routes
app.post('/api/screenplay/generate', generateScreenplay);
app.get('/api/screenplay/format', getScreenplayFormat);

// Models route
app.get('/api/models', getModels);

const serverAddress = getServerAddress();
app.listen(PORT, () => {
  console.log(`Server running on http://${serverAddress}:${PORT}`);
  console.log(`Swagger UI: http://${serverAddress}:${PORT}/api-docs`);
});

