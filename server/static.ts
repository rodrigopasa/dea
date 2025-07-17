import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// Esta é a forma correta de obter __dirname em Módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
  // Try multiple possible build directory locations
  const possiblePaths = [
    path.resolve(process.cwd(), "dist/public"),  // Vite build output (most likely)
    path.resolve(process.cwd(), "public"),       // Alternative location
    path.resolve(__dirname, "public"),           // Relative to server
    path.resolve(__dirname, "../public"),        // Parent directory
    path.resolve(__dirname, "../dist/public")    // Dist in parent
  ];
  
  let distPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      distPath = p;
      break;
    }
  }

  if (!distPath) {
    console.error("❌ Build directory not found. Tried paths:", possiblePaths);
    throw new Error(
      `Could not find the build directory. Tried: ${possiblePaths.join(', ')}. Make sure to build the client first with 'npm run build'`,
    );
  }

  console.log(`✅ Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res, next) => {
    // Ignore API calls
    if (req.originalUrl.startsWith('/api')) {
        return next();
    }
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send(`
        <h1>Application Error</h1>
        <p>Index.html not found at: ${indexPath}</p>
        <p>Available files: ${fs.readdirSync(distPath).join(', ')}</p>
      `);
    }
  });
}
