import express from 'express';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import apiRoutes from './routes/api.routes';
import { errorMiddleware } from './middleware/error.middleware';
import { initDbPool } from '../services/database.service';

// Get directory name for serving static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Start the Express server
 */
export async function startServer(port: number): Promise<void> {
  // Initialize database pool
  initDbPool();
  
  // Create Express application
  const app = express();
  
  // Middleware
  app.use(express.json());
  
  // Serve static files
  app.use(express.static(join(__dirname, '../../public')));
  
  // CORS headers - 更严格的配置
  app.use((req, res, next) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://sql-dqn-front-end-sigma.vercel.app' 
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
  
  // API routes
  app.use(apiRoutes);
  
  // Error handling middleware
  app.use(errorMiddleware);
  
  // Start server
  return new Promise((resolve) => {
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${port}`);
      resolve();
    });
  });
}