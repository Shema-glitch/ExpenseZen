import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertExpenseSchema } from "@shared/schema";
import { generateSpendingInsights, parseVoiceExpense } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Expense routes
  app.post('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const expenseData = insertExpenseSchema.parse(req.body);
      
      const expense = await storage.createExpense({
        ...expenseData,
        userId,
      });
      
      res.json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(400).json({ message: "Failed to create expense" });
    }
  });

  app.get('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { category, search, startDate, endDate } = req.query;
      
      const expenses = await storage.getUserExpenses(userId, {
        category: category as string,
        search: search as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.put('/api/expenses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const expenseId = parseInt(req.params.id);
      const expenseData = insertExpenseSchema.partial().parse(req.body);
      
      const expense = await storage.updateExpense(expenseId, userId, expenseData);
      
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json(expense);
    } catch (error) {
      console.error("Error updating expense:", error);
      res.status(400).json({ message: "Failed to update expense" });
    }
  });

  app.delete('/api/expenses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const expenseId = parseInt(req.params.id);
      
      const success = await storage.deleteExpense(expenseId, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      
      const categoryData = await storage.getUserExpensesByCategory(
        userId,
        startDate as string,
        endDate as string
      );
      
      res.json(categoryData);
    } catch (error) {
      console.error("Error fetching category analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/analytics/monthly/:year/:month', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      const stats = await storage.getUserMonthlyStats(userId, year, month);
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching monthly stats:", error);
      res.status(500).json({ message: "Failed to fetch monthly stats" });
    }
  });

  // AI insights route
  app.get('/api/insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get current month expenses
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
      const endDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-31`;
      
      const currentExpenses = await storage.getUserExpenses(userId, {
        startDate,
        endDate,
      });
      
      // Get previous month for comparison
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const prevStartDate = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-01`;
      const prevEndDate = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-31`;
      
      const previousExpenses = await storage.getUserExpenses(userId, {
        startDate: prevStartDate,
        endDate: prevEndDate,
      });
      
      const insights = await generateSpendingInsights(currentExpenses, previousExpenses);
      
      res.json(insights);
    } catch (error) {
      console.error("Error generating insights:", error);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  // Voice input route
  app.post('/api/voice/parse', isAuthenticated, async (req: any, res) => {
    try {
      const { voiceText } = req.body;
      
      if (!voiceText) {
        return res.status(400).json({ message: "Voice text is required" });
      }
      
      const parsed = await parseVoiceExpense(voiceText);
      
      res.json(parsed);
    } catch (error) {
      console.error("Error parsing voice input:", error);
      res.status(500).json({ message: "Failed to parse voice input" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
