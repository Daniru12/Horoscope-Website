import { NextResponse } from "next/server";

// Helper to translate English text to Sinhala using the Google Translate API
async function translateToSinhala(text: string) {
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=si&dt=t&q=${encodeURIComponent(
        text
      )}`
    );
    const data = await res.json();
    let translatedText = "";
    if (data && data[0]) {
      data[0].forEach((item: any) => {
        if (item[0]) translatedText += item[0];
      });
    }
    return translatedText || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

// Generate deterministic values based on sign and date to make the details feel real and dynamic
function getDeterministicDetails(sign: string, dateStr: string) {
  const hashString = `${sign}-${dateStr}`;
  let hash = 0;
  for (let i = 0; i < hashString.length; i++) {
    hash = hashString.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const colors = [
    "රතු (Red)",
    "තද නිල් (Dark Blue)",
    "කහ (Yellow)",
    "කොළ (Green)",
    "සුදු (White)",
    "දම් (Purple)",
    "රන්වන් (Gold)",
    "තැඹිලි (Orange)",
    "රෝස (Pink)",
    "ලා නිල් (Light Blue)",
  ];

  const moods = [
    "සන්සුන් (Calm)",
    "උද්‍යෝගිමත් (Energetic)",
    "නිර්මාණශීලී (Creative)",
    "සන්තෝෂවත් (Happy)",
    "අවධානයෙන් (Focused)",
    "ආදරණීය (Loving)",
    "ශුභවාදී (Optimistic)",
    "ධෛර්යසම්පන්න (Courageous)",
    "ප්‍රබෝධමත් (Refreshed)",
  ];

  const luckyColor = colors[hash % colors.length];
  const luckyNumber = (hash % 9) + 1; // 1 to 9
  const mood = moods[hash % moods.length];

  return { luckyColor, luckyNumber, mood };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sign = searchParams.get("sign")?.toLowerCase();

    if (!sign) {
      return NextResponse.json({ message: "Sign parameter is required" }, { status: 400 });
    }

    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Fetch daily horoscope
    let englishHoroscope = "";
    try {
      const apiRes = await fetch(
        `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${sign}&day=today`,
        { next: { revalidate: 3600 } } // Cache for 1 hour
      );
      
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        englishHoroscope = apiData?.data?.horoscope || "";
      }
    } catch (e) {
      console.error("External horoscope API call failed:", e);
    }

    // Fallback if API is offline or returns empty
    if (!englishHoroscope) {
      englishHoroscope = `Today is a day of dynamic changes for ${sign}. The alignment of planets suggests focusing on personal growth and key relationships. Trust your intuition when making financial decisions and communicate clearly to resolve any ongoing misunderstandings.`;
    }

    // Translate to Sinhala
    const sinhalaHoroscope = await translateToSinhala(englishHoroscope);

    // Get deterministic lucky properties for the day
    const details = getDeterministicDetails(sign, todayStr);

    return NextResponse.json(
      {
        horoscope: sinhalaHoroscope,
        date: todayStr,
        ...details,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Daily horoscope API handler error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
