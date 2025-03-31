import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Additional application routes can be added here
  // All routes are prefixed with /api

  const httpServer = createServer(app);

  return httpServer;
}
