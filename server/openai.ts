import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

export interface SpendingInsight {
  message: string;
  suggestions: string[];
  budgetAlert?: string;
  trend: "increasing" | "decreasing" | "stable";
  confidence: number;
}

export async function generateSpendingInsights(
  expenses: Array<{
    category: string;
    amount: string;
    date: string;
    description: string;
  }>,
  previousPeriodExpenses?: Array<{
    category: string;
    amount: string;
    date: string;
    description: string;
  }>
): Promise<SpendingInsight> {
  try {
    const prompt = `
    Analyze the following spending data and provide insights:

    Current period expenses:
    ${JSON.stringify(expenses, null, 2)}

    ${previousPeriodExpenses ? `Previous period expenses for comparison:
    ${JSON.stringify(previousPeriodExpenses, null, 2)}` : ""}

    Please provide a JSON response with:
    1. A friendly, helpful message about spending patterns (max 100 words)
    2. 2-3 practical suggestions for improvement
    3. Budget alert if spending seems high in any category
    4. Trend analysis (increasing/decreasing/stable)
    5. Confidence score (0-1) for the analysis

    Focus on being encouraging and actionable. Use Nigerian Naira (₦) in examples.
    
    Response format:
    {
      "message": "string",
      "suggestions": ["string", "string", "string"],
      "budgetAlert": "string or null",
      "trend": "increasing|decreasing|stable",
      "confidence": number
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful financial advisor that provides spending insights. Always respond in valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      message: result.message || "Your spending patterns look normal this period.",
      suggestions: result.suggestions || ["Consider tracking your daily expenses", "Set a budget for each category"],
      budgetAlert: result.budgetAlert,
      trend: result.trend || "stable",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.7)),
    };
  } catch (error) {
    console.error("Failed to generate spending insights:", error);
    
    // Fallback insights
    return {
      message: "Unable to generate AI insights at the moment. Keep tracking your expenses for better financial awareness!",
      suggestions: ["Review your largest expense categories", "Set spending limits for discretionary categories"],
      trend: "stable",
      confidence: 0.5,
    };
  }
}

export async function parseVoiceExpense(voiceText: string): Promise<{
  amount?: number;
  category?: string;
  description?: string;
  success: boolean;
  error?: string;
}> {
  try {
    const prompt = `
    Parse this voice input for expense tracking: "${voiceText}"
    
    Extract:
    - Amount (number only, no currency symbol)
    - Category (one of: Food & Dining, Transport, Shopping, Entertainment, Bills & Utilities, Health, Education, Other)
    - Description (brief description of the expense)
    
    Common patterns:
    - "Add 5000 to Transport" 
    - "Spent 2500 on lunch"
    - "3000 for shopping at mall"
    
    Response format:
    {
      "amount": number or null,
      "category": "string or null",
      "description": "string or null",
      "success": boolean
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a voice input parser for expense tracking. Always respond in valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      amount: result.amount,
      category: result.category,
      description: result.description || `Voice expense: ${voiceText}`,
      success: result.success && result.amount && result.category,
    };
  } catch (error) {
    console.error("Failed to parse voice expense:", error);
    return {
      success: false,
      error: "Failed to parse voice input. Please try again.",
    };
  }
}
