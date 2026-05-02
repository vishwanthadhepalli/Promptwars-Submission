import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const geminiModel = "gemini-3-flash-preview";

export async function analyzeIntake(input: string) {
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `You are an expert project manager. Analyze this input (could be messy notes, email, or a meeting transcript) and extract a list of actionable tasks. 
    If there are multiple deliverables mentioned, return multiple tasks. 
    Notes: "${input}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["low", "medium", "high"] },
                dueDate: { type: Type.STRING },
                assignee: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                dependencies: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "priority"]
            }
          }
        },
        required: ["tasks"]
      }
    }
  });

  const parsed = JSON.parse(response.text);
  return parsed.tasks;
}

export async function generateDailyBriefing(tasks: any[], docs: any[]) {
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `Generate a daily briefing for a team member based on these tasks: ${JSON.stringify(tasks)} and documents: ${JSON.stringify(docs)}. 
    Focus on top 3 priorities, blockers, and upcoming risks. Use a concise, professional tone.`,
  });

  return response.text;
}

export async function generateReport(query: string, data: any) {
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `Generate a professional report for the following request: "${query}". Use this data context: ${JSON.stringify(data)}.
    Include: Executive Summary, Key achievements, Blockers & Risks. 
    Also suggest a chart type (e.g., Pie, Bar, Line) and data points for visualization.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
          risks: { type: Type.ARRAY, items: { type: Type.STRING } },
          chartSuggestions: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              data: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } } } }
            }
          }
        },
        required: ["summary"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function analyzeRisks(tasks: any[], workload: any) {
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `Analyze team tasks and workload for potential bottlenecks and risks: ${JSON.stringify({ tasks, workload })}. 
    Predict delays and provide suggestions to reassign or de-prioritize.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            project: { type: Type.STRING },
            riskScore: { type: Type.NUMBER },
            reason: { type: Type.STRING },
            suggestion: { type: Type.STRING }
          }
        }
      }
    }
  });

  return JSON.parse(response.text);
}
