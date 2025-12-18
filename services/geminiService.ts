import { GoogleGenAI, Type } from "@google/genai";
import { ParsedExpenseResponse, BudgetAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Extract expense details from text using gemini-3-flash-preview
export const parseExpenseText = async (text: string, categoryHint?: string): Promise<ParsedExpenseResponse | null> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Current Date: ${today}.
        ${categoryHint ? `User explicitly selected category: "${categoryHint}". Focus on this context.` : ''}
        Analyze the following text describing an expense (in Arabic or English).
        Extract the amount, currency (default to QAR if not specified), category, date (YYYY-MM-DD format), and a short description.
        If the date is "today", "yesterday", etc., convert it to the actual date based on the Current Date.
        
        Allowed categories: "سوبر ماركت", "طعام", "الجيم", "اتصالات ونت", "تبرع وصدقه", "خروجات", "تنقلات", "شوبينج", "أخرى".
        If a categoryHint is provided, use it as the category unless it's strictly incompatible. If not, infer from text.

        Text: "${text}"
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER, description: "The numeric amount spent" },
            currency: { type: Type.STRING, description: "The currency code like QAR, USD" },
            category: { type: Type.STRING, description: "The category from the allowed list" },
            date: { type: Type.STRING, description: "The date of expense in YYYY-MM-DD format" },
            description: { type: Type.STRING, description: "A brief description of what was bought in Arabic" },
          },
          required: ["amount", "category", "date", "description"],
        },
      },
    });

    // Access .text property directly from response
    if (response.text) {
      const parsed = JSON.parse(response.text) as ParsedExpenseResponse;
      if (categoryHint && categoryHint !== "أخرى") {
        parsed.category = categoryHint;
      }
      return parsed;
    }
    return null;
  } catch (error) {
    console.error("Error parsing expense with Gemini:", error);
    throw error;
  }
};

// Generate AI budget advice using gemini-3-flash-preview
export const getBudgetAnalysis = async (
  totalSpent: number,
  budgetLimit: number,
  currency: string,
  daysInMonth: number,
  daysRemaining: number,
  overBudgetCategories: string[]
): Promise<BudgetAnalysis | null> => {
  try {
    const prompt = `
أنت مساعد ذكي لإدارة المصاريف الشخصية.

المهمة:
حلّل حالة الميزانية الشهرية الحالية للمصروفات.

المعطيات:
- ميزانية المصروفات: ${budgetLimit} ${currency}
- المصروف الفعلي: ${totalSpent} ${currency}
- المتبقي للصرف: ${Math.max(0, budgetLimit - totalSpent)} ${currency}
- أيام الشهر: ${daysInMonth}
- المتبقي: ${daysRemaining} يوم
- الأقسام المتجاوزة:
${overBudgetCategories.length > 0 ? overBudgetCategories.map(c => `- ${c}`).join('\n') : '- لا يوجد'}

القواعد:
- كن مباشرًا وعمليًا.
- ركز على كيفية إكمال الشهر بأمان.
- أعط نصيحة يومية بالرقم.

Output JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            alertLevel: { 
              type: Type.STRING, 
              description: 'Urgency level: "warning", "critical", or "safe"' 
            },
            summary: { type: Type.STRING, description: "A concise summary of the status in Arabic" },
            dailyAdjustment: { type: Type.STRING, description: "Specific advice on daily spending limit" },
            topIssues: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
            },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
            },
          },
          required: ["alertLevel", "summary", "dailyAdjustment", "recommendations"],
        },
      },
    });

    // Access .text property directly from response
    if (response.text) {
      return JSON.parse(response.text) as BudgetAnalysis;
    }
    return null;

  } catch (error) {
    console.error("Error getting budget analysis:", error);
    return null;
  }
};
