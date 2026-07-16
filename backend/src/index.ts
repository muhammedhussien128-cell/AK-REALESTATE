import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import apiRouter from './routes/api';
import { resolveTenant } from './middleware/tenant';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Global Tenant Resolution Middleware
app.use(resolveTenant as any);

// Apply rate limiter to auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: 'لقد قمت بمحاولات كثيرة جداً، يرجى المحاولة لاحقاً.' }
});

app.use('/api/auth/', authLimiter);
app.use('/api', apiRouter);

app.get('/', (req: any, res) => {
  res.json({ 
    message: 'مرحباً بك في واجهة برمجة تطبيقات أوتاد.',
    tenant: req.tenantConfig
  });
});

app.listen(PORT, () => {
  console.log(`Server is running in development mode on port ${PORT}`);
});
