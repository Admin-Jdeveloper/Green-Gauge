"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, CloudRain, ThermometerSun, MapPin } from "lucide-react";
import {regions} from "@/regions";

type Prediction = {
  id: number;
  region_id: string;
  output: {
    rainfall: number;
    maxTemp: number;
    risk: string;
  };
  created_at: string;
};


export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedRegion, setSelectedRegion] = useState(regions[0]);

  // Load past predictions from Supabase
  useEffect(() => {
    const fetchPredictions = async () => {
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        setPredictions(data as Prediction[]);
      }
    };
    fetchPredictions();
  }, []);

  // Request prediction from backend
  const requestPrediction = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        body: JSON.stringify({
          region_id: selectedRegion.id,
          latitude: selectedRegion.lat,
          longitude: selectedRegion.lon,
          requested_by: "farmer-123", // static for now
        }),
      });

      const data = await res.json();

      if (data.prediction) {
        setPredictions((prev) => [data.prediction, ...prev]);
      }
    } catch (err) {
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-green-800 drop-shadow-sm">
            🌾 Agri Loss Prediction
          </h1>
          <p className="mt-2 text-gray-600">
            Region-wise rainfall, temperature, and risk forecasts for farmers
          </p>
        </header>

        {/* Region Selector */}
        <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="w-full md:w-2/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Region
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
              <select
                className="w-full text-black border rounded-xl px-10 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={selectedRegion.id}
                onChange={(e) =>
                  setSelectedRegion(
                    regions.find((r) => r.id === e.target.value) || regions[0]
                  )
                }
              >
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={requestPrediction}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Predicting...
              </>
            ) : (
              "Request Prediction"
            )}
          </button>
        </div>

        {/* Predictions List */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-green-700">
            📊 Recent Predictions
          </h2>
          {predictions.length === 0 ? (
            <p className="text-gray-500">
              No predictions yet. Try requesting one!
            </p>
          ) : (
            <ul className="space-y-4">
              {predictions.map((p) => (
                <li
                  key={p.id}
                  className="border rounded-xl p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-3 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-gray-800">
                      Region:{" "}
                      <span className="text-green-700 font-semibold">
                        {p.region_id}
                      </span>
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <CloudRain className="h-4 w-4 text-blue-500" />
                        {p.output.rainfall} mm
                      </span>
                      <span className="flex items-center gap-1">
                        <ThermometerSun className="h-4 w-4 text-orange-500" />
                        {p.output.maxTemp}°C
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-1.5 text-sm font-bold rounded-full shadow-sm ${
                      p.output.risk === "High"
                        ? "bg-red-100 text-red-700"
                        : p.output.risk === "Moderate"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {p.output.risk}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
