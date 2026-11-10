/**
 * RUVEXI AI Client — Powered by Google Gemini 1.5 Flash
 */

export async function generateGeminiAI(
  prompt: string,
  systemInstruction?: string
): Promise<{ text?: string; error?: string }> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (typeof window !== "undefined") {
      try {
        const token = localStorage.getItem("Ruvexi_token");
        if (token) headers["Authorization"] = `Bearer ${token}`;
      } catch {}
    }
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers,
      body: JSON.stringify({ prompt, systemInstruction }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { error: data.error || "Failed to generate AI response" };
    }

    return { text: data.text };
  } catch (err: any) {
    return { error: err.message || "Network error while calling Gemini AI" };
  }
}

/**
 * Feature 2: AI Treatment Menu & Description Generator
 */
export async function generateTreatmentDescription(
  serviceName: string,
  category: string
): Promise<{ description?: string; error?: string }> {
  const prompt = `Write a luxury, bespoke salon & spa menu description for a treatment called "${serviceName}" under the "${category}" category. 
Keep it concise (2-3 sensory, elegant sentences), highlighting therapeutic benefits, bespoke technique, and luminous client results suitable for a high-end atelier like Ruvexi.`;

  const systemInstruction = "You are an elite creative copywriter for ultra-luxury five-star salons and wellness spas. Write evocative, sophisticated treatment descriptions without clichés.";

  const result = await generateGeminiAI(prompt, systemInstruction);
  return { description: result.text, error: result.error };
}

/**
 * Feature 3: AI Smart WhatsApp Retention & Review Response
 */
export async function generateWhatsAppRetentionMessage(
  clientName: string,
  lastService: string,
  daysAgo: number
): Promise<{ message?: string; error?: string }> {
  const prompt = `Generate a warm, exclusive VIP WhatsApp re-engagement message for a salon guest named ${clientName} who had a "${lastService}" ${daysAgo} days ago.
Include a subtle invitation for a refresh with priority booking. Keep it under 50 words, include 2 elegant emojis, and make it sound bespoke and VIP.`;

  const systemInstruction = "You are a luxury salon concierge. Your tone is warm, polite, personal, and exclusive.";

  const result = await generateGeminiAI(prompt, systemInstruction);
  return { message: result.text, error: result.error };
}

export async function generateReviewReply(
  reviewerName: string,
  rating: number,
  reviewComment: string
): Promise<{ reply?: string; error?: string }> {
  const prompt = `Write a professional, warm, and gracious response from the Salon Director to this ${rating}-star review from ${reviewerName}:
"${reviewComment}"
Keep it under 3-4 sentences, expressing gratitude for their visit to the atelier and welcoming them back.`;

  const systemInstruction = "You are the Salon General Manager of a high-end salon atelier responding to client reviews.";

  const result = await generateGeminiAI(prompt, systemInstruction);
  return { reply: result.text, error: result.error };
}

/**
 * Feature 4: AI Salon Copilot & Revenue Optimizer
 */
export async function generateSalonCopilotInsights(salonMetrics: {
  revenue: number;
  invoicesCount: number;
  topServices: string[];
  slowDay: string;
}): Promise<{ insight?: string; error?: string }> {
  const prompt = `Analyze these salon operational numbers and give 3 bullet-point high-impact revenue optimization recommendations:
- Today's Revenue: ₹${salonMetrics.revenue}
- Invoices: ${salonMetrics.invoicesCount}
- Popular Treatments: ${salonMetrics.topServices.join(", ")}
- Historically Slower Day: ${salonMetrics.slowDay}

Focus on practical actions: chair occupancy optimization, cross-selling backbar treatments, and flash WhatsApp VIP invites.`;

  const systemInstruction = "You are a Principal Salon Business Consultant & Revenue Architect specializing in high-margin salon operations.";

  const result = await generateGeminiAI(prompt, systemInstruction);
  return { insight: result.text, error: result.error };
}

export async function askSalonCopilot(
  question: string,
  context: {
    salonName: string;
    revenue: number;
    appointments: number;
    staffInfo: string;
    topServices: string;
    lowStockInfo: string;
    repeatRate: number;
  }
): Promise<{ answer?: string; error?: string }> {
  const prompt = `Salon Name: ${context.salonName}
Current Period Revenue: ₹${context.revenue}
Total Appointments: ${context.appointments}
Repeat Client Rate: ${context.repeatRate}%
Staff Overview: ${context.staffInfo}
Top Performing Services: ${context.topServices}
Inventory / Low Stock: ${context.lowStockInfo}

Owner Question: "${question}"

Provide a direct, analytical, and highly actionable answer for the salon owner. Keep it structured with clear insights and bullet points where helpful.`;

  const systemInstruction =
    "You are the Ruvexi AI Executive Advisor for salon directors. You analyze salon operations, staff productivity, pricing, retention, and inventory to give concise, data-backed guidance.";

  const result = await generateGeminiAI(prompt, systemInstruction);
  return { answer: result.text, error: result.error };
}
