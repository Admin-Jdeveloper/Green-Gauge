import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { region_id, requested_by, latitude, longitude } = await req.json();
    const supabase = supabaseServer;

    // ✅ Call Open-Meteo API
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=precipitation_sum,temperature_2m_max&timezone=auto`
    );
    const weatherData = await weatherRes.json();

    // Simple "loss risk" model (example only)
    const rainfall = weatherData.daily.precipitation_sum[0];
    const maxTemp = weatherData.daily.temperature_2m_max[0];

    let risk = "Low";
    if (rainfall > 100 || maxTemp > 40) {
      risk = "High";
    } else if (rainfall > 50 || maxTemp > 35) {
      risk = "Moderate";
    }

    const output = {
      rainfall,
      maxTemp,
      risk,
    };

    // ✅ Save into Supabase
    const { data, error } = await supabase
      .from("predictions")
      .insert([
        {
          region_id,
          model_id: "open-meteo",
          requested_by,
          output,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ prediction: data }), { status: 200 });
  } catch (err: any) {
    console.error("API error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
