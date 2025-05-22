import {
  users,
  expenses,
  type User,
  type UpsertUser,
  type Expense,
  type InsertExpense,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, ilike, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Expense operations
  createExpense(expense: InsertExpense & { userId: string }): Promise<Expense>;
  getUserExpenses(userId: string, filters?: {
    category?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Expense[]>;
  updateExpense(id: number, userId: string, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number, userId: string): Promise<boolean>;
  
  // Analytics operations
  getUserExpensesByCategory(userId: string, startDate?: string, endDate?: string): Promise<{
    category: string;
    total: string;
    count: number;
  }[]>;
  getUserMonthlyStats(userId: string, year: number, month: number): Promise<{
    totalExpenses: string;
    totalIncome: string;
    expenseCount: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Expense operations
  async createExpense(expense: InsertExpense & { userId: string }): Promise<Expense> {
    const [newExpense] = await db
      .insert(expenses)
      .values(expense)
      .returning();
    return newExpense;
  }

  async getUserExpenses(userId: string, filters?: {
    category?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Expense[]> {
    let query = db.select().from(expenses).where(eq(expenses.userId, userId));
    
    const conditions = [eq(expenses.userId, userId)];
    
    if (filters?.category && filters.category !== "all") {
      conditions.push(eq(expenses.category, filters.category));
    }
    
    if (filters?.search) {
      conditions.push(ilike(expenses.description, `%${filters.search}%`));
    }
    
    if (filters?.startDate) {
      conditions.push(gte(expenses.date, filters.startDate));
    }
    
    if (filters?.endDate) {
      conditions.push(lte(expenses.date, filters.endDate));
    }
    
    const userExpenses = await db
      .select()
      .from(expenses)
      .where(and(...conditions))
      .orderBy(desc(expenses.date), desc(expenses.createdAt));
    
    return userExpenses;
  }

  async updateExpense(id: number, userId: string, expense: Partial<InsertExpense>): Promise<Expense | undefined> {
    const [updatedExpense] = await db
      .update(expenses)
      .set({ ...expense, updatedAt: new Date() })
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();
    return updatedExpense;
  }

  async deleteExpense(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Analytics operations
  async getUserExpensesByCategory(userId: string, startDate?: string, endDate?: string): Promise<{
    category: string;
    total: string;
    count: number;
  }[]> {
    const conditions = [eq(expenses.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(expenses.date, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(expenses.date, endDate));
    }
    
    const result = await db
      .select({
        category: expenses.category,
        total: sql<string>`sum(${expenses.amount})`,
        count: sql<number>`count(*)::int`,
      })
      .from(expenses)
      .where(and(...conditions))
      .groupBy(expenses.category)
      .orderBy(sql`sum(${expenses.amount}) desc`);
    
    return result;
  }

  async getUserMonthlyStats(userId: string, year: number, month: number): Promise<{
    totalExpenses: string;
    totalIncome: string;
    expenseCount: number;
  }> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
    
    const result = await db
      .select({
        totalExpenses: sql<string>`coalesce(sum(${expenses.amount}), 0)`,
        expenseCount: sql<number>`count(*)::int`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate)
        )
      );
    
    return {
      totalExpenses: result[0]?.totalExpenses || "0",
      totalIncome: "0", // This would need to be implemented if income tracking is added
      expenseCount: result[0]?.expenseCount || 0,
    };
  }
}

export const storage = new DatabaseStorage();
