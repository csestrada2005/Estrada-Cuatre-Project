import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Force HTTPs (Optional but good for Render)
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] === 'http') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// 2. Set Security Headers (CRITICAL for WebContainers)
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

// 3. Serve Static Files from 'dist'
app.use(express.static(path.join(__dirname, 'dist')));

// 4. Handle Client-Side Routing (SPA Fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
