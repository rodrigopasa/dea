import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { type Express } from "express";
import session from "express-session";
import { PostgresStorage } from "./db-storage";

const scryptAsync = promisify(scrypt);

// Type definitions
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      isAdmin: boolean;
      isBlocked: boolean;
    }
  }
}

// Password hashing functions
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashedPassword, salt] = stored.split(".");
  const buf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return buf.toString("hex") === hashedPassword;
}

// Setup authentication
export function setupAuth(app: Express, storage: PostgresStorage) {
  // Session configuration
  const sessionSettings = {
    store: storage.sessionStore,
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
      secure: app.get("env") === "production",
      httpOnly: true,
      sameSite: "lax" as const,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  };

  // Apply middlewares
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local authentication strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !user.password || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid credentials" });
        }
        
        // Check if user is blocked
        if (user.isBlocked) {
          return done(null, false, { message: "Account blocked. Contact administrator." });
        }
        
        // Convert to Express.User type
        const expressUser: Express.User = {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin ?? false,
          isBlocked: user.isBlocked ?? false
        };
        
        return done(null, expressUser);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize/deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      
      const expressUser: Express.User = {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin ?? false,
        isBlocked: user.isBlocked ?? false
      };
      
      done(null, expressUser);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User, info: any) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({ error: "Authentication failed" });
      }
      
      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      
      req.logIn(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ error: "Login failed" });
        }
        
        return res.json({ 
          user: {
            id: user.id,
            username: user.username,
            isAdmin: user.isAdmin
          }
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ error: "Session cleanup failed" });
        }
        
        // Limpa o cookie de sessão com as mesmas configurações usadas na criação
        res.clearCookie("sessionId", {
          path: "/",
          secure: app.get("env") === "production",
          httpOnly: true,
          sameSite: "lax"
        });
        
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  app.get("/api/auth/status", (req, res) => {
    if (req.isAuthenticated() && req.user) {
      res.json({
        authenticated: true,
        user: {
          id: req.user.id,
          username: req.user.username,
          isAdmin: req.user.isAdmin
        }
      });
    } else {
      res.json({ authenticated: false });
    }
  });

  console.log("Authentication setup completed");
}