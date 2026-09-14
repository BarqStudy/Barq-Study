export async function onRequest(context) {
  const { request, env } = context;
  
  // 1. إعدادات الأمان (CORS)
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response("Only POST allowed", { status: 405, headers: corsHeaders });
  }

  // 2. قراءة المفتاح السري بأمان من إعدادات Cloudflare
  const GEMINI_API_KEY = env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: "المفتاح السري مفقود" }), { status: 500, headers: corsHeaders });
  }

  try {
    const body = await request.json();
    
    // 3. الاتصال السري بـ Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "فشل التحليل السري" }), { status: 500, headers: corsHeaders });
  }
}
