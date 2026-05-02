// Frontend Proxy Service for AI
// Moving all AI logic to the backend to protect API keys

export async function analyzeIntake(input: string) {
  const response = await fetch("/api/ai/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: `You are an expert project manager. Analyze this input and extract tasks. Notes: "${input}"`,
      schema: {
        type: "object",
        properties: {
          tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                priority: { type: "string", enum: ["low", "medium", "high"] },
                dueDate: { type: "string" },
                assignee: { type: "string" },
                tags: { type: "array", items: { type: "string" } }
              },
              required: ["title", "priority"]
            }
          }
        },
        required: ["tasks"]
      }
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || "AI Analysis failed");
  }

  const result = await response.json();
  return result.tasks;
}

export async function generateDailyBriefing(tasks: any[], docs: any[]) {
  // Creating a simpler one for now, or I can add a specific server route if complex
  const response = await fetch("/api/ai/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: `Generate a daily briefing for a team member based on tasks: ${JSON.stringify(tasks)} and docs: ${JSON.stringify(docs)}.`,
      schema: {
        type: "object",
        properties: {
          briefing: { type: "string" }
        },
        required: ["briefing"]
      }
    })
  });

  if (!response.ok) return "Unable to generate AI briefing at this time.";
  const result = await response.json();
  return result.briefing;
}

export async function generateReport(query: string, data: any) {
  const response = await fetch("/api/ai/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: `Generate report for: "${query}". Context: ${JSON.stringify(data)}`,
      schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          achievements: { type: "array", items: { type: "string" } },
          risks: { type: "array", items: { type: "string" } },
          chartSuggestions: {
            type: "object",
            properties: {
              type: { type: "string" },
              data: { type: "array", items: { type: "object", properties: { name: { type: "string" }, value: { type: "number" } } } }
            }
          }
        },
        required: ["summary"]
      }
    })
  });

  if (!response.ok) throw new Error("Report generation failed");
  return await response.json();
}

export async function analyzeRisks(tasks: any[], workload: any) {
  const response = await fetch("/api/ai/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: `Analyze bottlenecks: ${JSON.stringify({ tasks, workload })}`,
      schema: {
        type: "object",
        properties: {
          risks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                project: { type: "string" },
                riskScore: { type: "number" },
                reason: { type: "string" },
                suggestion: { type: "string" }
              }
            }
          }
        },
        required: ["risks"]
      }
    })
  });

  if (!response.ok) return [];
  const result = await response.json();
  return result.risks;
}
