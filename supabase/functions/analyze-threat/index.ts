import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { threatTitle, threatDescription, severity, source, affectedSystems } = await req.json();

    const prompt = `You are a cybersecurity incident response expert for an offline/air-gapped network SIEM tool called SENTINEL. Analyze the following threat and provide a structured response.

Threat: ${threatTitle}
Description: ${threatDescription}
Severity: ${severity}
Source: ${source}
Affected Systems: ${affectedSystems?.join(', ') || 'Unknown'}

Respond in this exact JSON format (no markdown, just JSON):
{
  "analysis": "Brief 2-3 sentence analysis of the threat and its potential impact on an air-gapped network",
  "rootCause": "Most likely root cause in 1-2 sentences",
  "solution": {
    "title": "Short solution title",
    "description": "Brief solution description",
    "steps": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
    "priority": "immediate|high|medium|low",
    "automatable": true or false,
    "estimatedTime": "e.g. 10-20 min"
  },
  "mitreTactic": "Relevant MITRE ATT&CK tactic name",
  "riskScore": 1-10 number,
  "additionalRecommendations": ["Recommendation 1", "Recommendation 2"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a cybersecurity expert. Always respond with valid JSON only, no markdown formatting." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Parse the JSON from the AI response
    let parsed;
    try {
      // Try to extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch {
      parsed = { error: "Failed to parse AI response", raw: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
