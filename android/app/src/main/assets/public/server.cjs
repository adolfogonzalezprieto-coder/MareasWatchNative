var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new import_genai.GoogleGenAI({ apiKey });
}
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/weather-tides", async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 36.5298;
    const lon = parseFloat(req.query.lon) || -6.2927;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum&timezone=auto`;
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,ocean_current_velocity&hourly=wave_height,wave_period,wave_direction&daily=wave_height_max&timezone=auto`;
    const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12`;
    const [weatherRes, marineRes, geocodeRes] = await Promise.allSettled([
      fetch(weatherUrl).then((r) => r.json()),
      fetch(marineUrl).then((r) => r.json()),
      fetch(geocodeUrl, { headers: { "User-Agent": "MareasWatchApp/1.0" } }).then((r) => r.json())
    ]);
    const weatherData = weatherRes.status === "fulfilled" ? weatherRes.value : null;
    const marineData = marineRes.status === "fulfilled" ? marineRes.value : null;
    const geocodeData = geocodeRes.status === "fulfilled" ? geocodeRes.value : null;
    let locationName = "Ubicaci\xF3n Costera";
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
      marine: marineData
    });
  } catch (err) {
    console.error("Error fetching weather/tides:", err);
    res.status(500).json({ error: "Failed to fetch marine weather data", message: err.message });
  }
});
app.post("/api/ai-insights", async (req, res) => {
  try {
    const gemini = getGeminiClient();
    if (!gemini) {
      return res.status(503).json({
        error: "GEMINI_API_KEY no configurado",
        insights: {
          summary: "API Key de Gemini no configurada. Config\xFArala en la secci\xF3n de secretos para obtener recomendaciones personalizadas con IA.",
          surf: "Olas adecuadas para navegaci\xF3n est\xE1ndar. Revisa la marea alta local.",
          fishing: "Condiciones \xF3ptimas cerca del cambio de marea (Pleamar/Bajamar).",
          sailing: "Atenci\xF3n a la racha m\xE1xima de viento.",
          safety: "Precauci\xF3n en zonas de rocas con mareas vivas."
        }
      });
    }
    const { location, temperature, windSpeed, windDirection, waveHeight, tideState, tideTrend, moonPhase } = req.body;
    const prompt = `Eres un experto en meteorolog\xEDa marina, mareas y deportes acu\xE1ticos para smartwatch (OnePlus Watch 3).
Analiza estas condiciones en la ubicaci\xF3n "${location || "Costa"}":
- Temperatura: ${temperature}\xB0C
- Viento: ${windSpeed} km/h (Direcci\xF3n: ${windDirection}\xB0)
- Altura de Olas (Swell): ${waveHeight} m
- Estado de Marea: ${tideState} (${tideTrend})
- Fase Lunar: ${moonPhase}

Proporciona una respuesta en formato JSON estrictamente v\xE1lido sin bloques Markdown extra, con las siguientes claves en espa\xF1ol:
1. "summary": resumen ultra-conciso (m\xE1x 20 palabras) optimizado para pantalla redonda de OnePlus Watch 3.
2. "surf": recomendaci\xF3n para Surf/Bodyboard (m\xE1x 25 palabras).
3. "fishing": recomendaci\xF3n para Pesca deportiva (m\xE1x 25 palabras).
4. "sailing": recomendaci\xF3n para Navegaci\xF3n/Vela (m\xE1x 25 palabras).
5. "safety": aviso de seguridad marina (m\xE1x 20 palabras).`;
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text || "{}";
    const insights = JSON.parse(text);
    res.json({ insights });
  } catch (error) {
    console.error("Error with AI insights:", error);
    res.status(500).json({
      error: "Error al generar an\xE1lisis con IA",
      insights: {
        summary: "An\xE1lisis no disponible en este momento.",
        surf: "Consulta el gr\xE1fico de olas y viento.",
        fishing: "Aprovecha el repunte de marea.",
        sailing: "Comprueba las rachas de viento.",
        safety: "Respeta las banderas de seguridad mar\xEDtima."
      }
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
