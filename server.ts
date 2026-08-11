import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client lazily
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Marine & Weather proxy route to aggregate Open-Meteo weather + marine APIs
app.get("/api/weather-tides", async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 36.5298; // Default Cádiz
    const lon = parseFloat(req.query.lon as string) || -6.2927;

    // Fetch weather from Open-Meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum&timezone=auto`;

    // Fetch marine/wave data from Open-Meteo Marine
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,ocean_current_velocity&hourly=wave_height,wave_period,wave_direction&daily=wave_height_max&timezone=auto`;

    // Reverse geocode location
    const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12`;

    const [weatherRes, marineRes, geocodeRes] = await Promise.allSettled([
      fetch(weatherUrl).then((r) => r.json()),
      fetch(marineUrl).then((r) => r.json()),
      fetch(geocodeUrl, { headers: { "User-Agent": "MareasWatchApp/1.0" } }).then((r) => r.json()),
    ]);

    const weatherData = weatherRes.status === "fulfilled" ? weatherRes.value : null;
    const marineData = marineRes.status === "fulfilled" ? marineRes.value : null;
    const geocodeData = geocodeRes.status === "fulfilled" ? geocodeRes.value : null;

    // Determine location name
    let locationName = "Ubicación Costera";
    if (geocodeData && geocodeData.address) {
      const addr = geocodeData.address;
      locationName = addr.amenity || addr.suburb || addr.town || addr.city || addr.municipality || addr.county || "Costa";
      if (addr.state || addr.country) {
        locationName += `, ${addr.state || addr.country}`;
      }
    }

    res.json({
      latitude: lat,
      longitude: lon,
      locationName,
      weather: weatherData,
      marine: marineData,
    });
  } catch (err: any) {
    console.error("Error fetching weather/tides:", err);
    res.status(500).json({ error: "Failed to fetch marine weather data", message: err.message });
  }
});

// AI Marine & Tide Assistant endpoint using Gemini
app.post("/api/ai-insights", async (req, res) => {
  try {
    const gemini = getGeminiClient();
    if (!gemini) {
      return res.status(503).json({
        error: "GEMINI_API_KEY no configurado",
        insights: {
          summary: "API Key de Gemini no configurada. Configúrala en la sección de secretos para obtener recomendaciones personalizadas con IA.",
          surf: "Olas adecuadas para navegación estándar. Revisa la marea alta local.",
          fishing: "Condiciones óptimas cerca del cambio de marea (Pleamar/Bajamar).",
          sailing: "Atención a la racha máxima de viento.",
          safety: "Precaución en zonas de rocas con mareas vivas.",
        },
      });
    }

    const { location, temperature, windSpeed, windDirection, waveHeight, tideState, tideTrend, moonPhase } = req.body;

    const prompt = `Eres un experto en meteorología marina, mareas y deportes acuáticos para smartwatch (OnePlus Watch 3).
Analiza estas condiciones en la ubicación "${location || "Costa"}":
- Temperatura: ${temperature}°C
- Viento: ${windSpeed} km/h (Dirección: ${windDirection}°)
- Altura de Olas (Swell): ${waveHeight} m
- Estado de Marea: ${tideState} (${tideTrend})
- Fase Lunar: ${moonPhase}

Proporciona una respuesta en formato JSON estrictamente válido sin bloques Markdown extra, con las siguientes claves en español:
1. "summary": resumen ultra-conciso (máx 20 palabras) optimizado para pantalla redonda de OnePlus Watch 3.
2. "surf": recomendación para Surf/Bodyboard (máx 25 palabras).
3. "fishing": recomendación para Pesca deportiva (máx 25 palabras).
4. "sailing": recomendación para Navegación/Vela (máx 25 palabras).
5. "safety": aviso de seguridad marina (máx 20 palabras).`;

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const insights = JSON.parse(text);

    res.json({ insights });
  } catch (error: any) {
    console.error("Error with AI insights:", error);
    res.status(500).json({
      error: "Error al generar análisis con IA",
      insights: {
        summary: "Análisis no disponible en este momento.",
        surf: "Consulta el gráfico de olas y viento.",
        fishing: "Aprovecha el repunte de marea.",
        sailing: "Comprueba las rachas de viento.",
        safety: "Respeta las banderas de seguridad marítima.",
      },
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
