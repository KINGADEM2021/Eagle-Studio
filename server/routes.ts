import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Additional application routes can be added here
  // All routes are prefixed with /api

  const httpServer = createServer(app);

  return httpServer;
}
