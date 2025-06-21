"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


const WeatherDisplay = ({ data }: { data: string }) => {

  let parsed;

  try {
    parsed = JSON.parse(data);
  } catch {
    return <p>Invalid weather data format.</p>;
  }
  const { request, location, current, date, notes } = parsed;
  const { astro, air_quality, weather_icons, weather_descriptions } = current;

  return (
    <div className="weather-container">
      <h2>🌤️ Weather for {location} on {date}</h2>

      <h3>📍 Request Info</h3>
      <ul>
        <li>Query: {request.query}</li>
        <li>Language: {request.language}</li>
        <li>Units: {request.unit}</li>
      </ul>

      <h3>🌡️ Current Weather</h3>
      <img src={weather_icons[0]} alt={weather_descriptions[0]} width="64" />
      <ul>
        <li>Description: {weather_descriptions[0]}</li>
        <li>Temperature: {current.temperature}°C</li>
        <li>Feels Like: {current.feelslike}°C</li>
        <li>Humidity: {current.humidity}%</li>
        <li>Wind: {current.wind_speed} km/h {current.wind_dir}</li>
        <li>Pressure: {current.pressure} hPa</li>
        <li>Cloud Cover: {current.cloudcover}%</li>
        <li>UV Index: {current.uv_index}</li>
        <li>Visibility: {current.visibility} km</li>
        <li>Is Day: {current.is_day === "yes" ? "☀️ Day" : "🌙 Night"}</li>
      </ul>

      <h3>🌌 Astronomy</h3>
      <ul>
        <li>Sunrise: {astro.sunrise}</li>
        <li>Sunset: {astro.sunset}</li>
        <li>Moonrise: {astro.moonrise}</li>
        <li>Moonset: {astro.moonset}</li>
        <li>Moon Phase: {astro.moon_phase}</li>
        <li>Moon Illumination: {astro.moon_illumination}%</li>
      </ul>

      <h3>🌫️ Air Quality</h3>
      <ul>
        <li>CO: {air_quality.co}</li>
        <li>NO₂: {air_quality.no2}</li>
        <li>O₃: {air_quality.o3}</li>
        <li>SO₂: {air_quality.so2}</li>
        <li>PM2.5: {air_quality.pm2_5}</li>
        <li>PM10: {air_quality.pm10}</li>
        <li>US EPA Index: {air_quality["us-epa-index"]}</li>
        <li>UK DEFRA Index: {air_quality["gb-defra-index"]}</li>
      </ul>

      {notes && notes.trim() !== "" && (
        <div>
          <h3>📝 Notes</h3>
          <p>{notes}</p>
        </div>
      )}
    </div>
  );
};




export function WeatherFormGet() {

  const [formData, setFormData] = useState({
    ID: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    id?: string;
  } | null>(null);


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch(`http://localhost:8000/weather/${formData.ID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          success: true,
          message: "Weather lookup successful!",
          id: JSON.stringify(data),
        });
        console.log(JSON.stringify(data))
        // Reset form after successful submission
        setFormData({
          ID: ""
        });
      } else {
        const errorData = await response.json();
        setResult({
          success: false,
          message: errorData.detail || "Failed to submit weather lookup",
        });
      }
    } catch {
      setResult({
        success: false,
        message: "Network error: Could not connect to the server",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Weather Data Lookup</CardTitle>
        <CardDescription>
          Submit an ID to retrieve
                  stored weather data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">ID</Label>
            <Input
              id="ID"
              name="ID"
              type="text"
              placeholder="Please input an ID"
              value={formData.ID}
              onChange={handleInputChange}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Weather Lookup"}
          </Button>

          {result && (
            <div
              className={`p-3 rounded-md ${
                result.success
                  ? "bg-green-900/20 text-green-500 border border-green-500"
                  : "bg-red-900/20 text-red-500 border border-red-500"
              }`}
            >
              <p className="text-sm font-medium">{result.message}</p>
              {result.success && result.id && (
                <WeatherDisplay data={result.id} />
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
