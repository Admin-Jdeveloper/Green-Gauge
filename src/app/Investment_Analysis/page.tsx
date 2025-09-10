"use client";
import { useState } from "react";
import Header from "@/components/Header";
import { FileDown, Loader2, Search } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function TerrainAnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // User input
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");

  const runAnalysis = async () => {
    if (!lat || !lon || !name) {
      setError("⚠️ Please enter name, latitude, and longitude");
      return;
    }
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await fetch("/api/terrain-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locations: [
            {
              id: name.toLowerCase().replace(/\s+/g, "-"),
              display_name: name,
              lat: Number(lat),
              lon: Number(lon),
            },
          ],
        }),
      });
      const json = await res.json();
      if (json.ok) setResults(json.results || []);
      else setError(json.error || "Unknown error");
    } catch (err: any) {
      setError(err.message || "Fetch failed");
    }
    setLoading(false);
  };

  const fetchPrevious = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await fetch("/api/terrain-analysis");
      const json = await res.json();
      if (json.ok) setResults(json.results || []);
      else setError(json.error || "Unknown error");
    } catch (err: any) {
      setError(err.message || "Fetch failed");
    }
    setLoading(false);
  };

//   const exportPDF = () => {
//     const doc = new jsPDF();
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(16);
//     doc.text("🌍 Terrain Investment Analysis Report", 14, 20);

//     results.forEach((r, idx) => {
//       const yStart = idx === 0 ? 30 : (doc as any).lastAutoTable.finalY + 15;
//       doc.setFont("helvetica", "bold");
//       doc.setFontSize(14);
//       doc.text(`${idx + 1}. ${r.site_name}`, 14, yStart);

//       autoTable(doc, {
//         startY: yStart + 5,
//         theme: "grid",
//         head: [["Field", "Value"]],
//         body: [
//           ["Latitude", r.lat.toFixed(4)],
//           ["Longitude", r.lon.toFixed(4)],
//           ["Elevation (m)", r.elevation_m ?? "N/A"],
//           ["Slope (°)", r.slope_deg?.toFixed(2) ?? "N/A"],
//           ["Rainfall (3d)", `${r.rainfall_3d_mm} mm`],
//           [
//             "Nearest Road",
//             r.nearest_road_m ? r.nearest_road_m.toFixed(0) + " m" : "N/A",
//           ],
//           ["Landuse", r.landuse?.map((l: any) => l.value).join(", ") || "N/A"],
//           ["Suitability Score", r.suitability_score],
//         ],
//         headStyles: { fillColor: [40, 116, 166] },
//         bodyStyles: { textColor: 50 },
//       });

//       if (r.recommended_actions?.length) {
//         const lastY = (doc as any).lastAutoTable.finalY;
//         doc.setFont("helvetica", "bold");
//         doc.text("Recommended Actions:", 14, lastY + 10);
//         doc.setFont("helvetica", "normal");
//         r.recommended_actions.forEach((act: string, i: number) => {
//           doc.text(`- ${act}`, 18, lastY + 18 + i * 7);
//         });
//       }
//     });

//     doc.save("terrain_analysis.pdf");
//   };

const exportPDF = () => {
  const doc = new jsPDF();

  results.forEach((r, idx) => {
    if (idx > 0) doc.addPage(); // 👈 add new page for every result except first

    doc.text(" Terrain Investment Analysis", 14, 20);
    doc.text(`${idx + 1}. ${r.site_name}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [["Field", "Value"]],
      body: [
        ["Latitude", r.lat.toFixed(4)],
        ["Longitude", r.lon.toFixed(4)],
        ["Elevation (m)", r.elevation_m ?? "N/A"],
        ["Slope (°)", r.slope_deg?.toFixed(2) ?? "N/A"],
        ["Rainfall (3d)", `${r.rainfall_3d_mm} mm`],
        [
          "Nearest Road",
          r.nearest_road_m ? r.nearest_road_m.toFixed(0) + " m" : "N/A",
        ],
        ["Landuse", r.landuse?.map((l: any) => l.value).join(", ") || "N/A"],
        ["Suitability Score", r.suitability_score],
      ],
    });

    // Add recommended actions if any
    if (r.recommended_actions?.length) {
      const lastTable = (doc as any).lastAutoTable;
      const y = lastTable ? lastTable.finalY + 10 : 60;

      doc.text("Recommended Actions:", 14, y);

      r.recommended_actions.forEach((act: string, i: number) => {
        doc.text(`- ${act}`, 18, y + 10 + i * 8);
      });
    }
  });

  doc.save("terrain_analysis.pdf");
};


  return (
    <>
      <Header />
      <div className="min-h-screen p-6 bg-gradient-to-b text-black bg-blue-100 ">
        {/* Landing Section */}
        {/* <section className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-blue-800 mb-2">
            🌍 Terrain Investment Analysis
          </h1>
          <p className="text-gray-600 text-lg">
            Evaluate terrain suitability for investments based on geography,
            climate & infrastructure.
          </p>
        </section> */}

        {/* Form Section */}
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6 mb-8">
          <input
            type="text"
            placeholder="Location Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-lg p-3 w-full mb-4"
          />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="number"
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="border rounded-lg p-3 w-full"
            />
            <input
              type="number"
              placeholder="Longitude"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              className="border rounded-lg p-3 w-full"
            />
          </div>

         <div className="flex flex-wrap gap-4 justify-center">
  <button
    onClick={runAnalysis}
    disabled={loading}
    className="px-6 py-3 flex items-center gap-2 bg-green-200 text-black border-2 font-semibold rounded-lg hover:bg-green-400 disabled:opacity-50"
  >
    {loading ? (
      <>
        <Loader2 className="animate-spin" size={18} /> Analyzing...
      </>
    ) : (
      <>
        <Search size={18} /> Analyze Location
      </>
    )}
  </button>

  <button
    onClick={fetchPrevious}
    disabled={loading}
    className="px-6 py-3 bg-blue-200 text-black border-2 font-semibold rounded-lg hover:bg-blue-400 disabled:opacity-50"
  >
    {loading ? "Loading..." : "Show Previous"}
  </button>

  {/* keep space but only show when results available */}
  {results.length > 0 && (
    <button
      onClick={exportPDF}
      className="px-6 py-3 flex items-center gap-2 bg-purple-200 text-black border-2 font-semibold rounded-lg hover:bg-purple-400"
    >
      <FileDown size={18} /> Export PDF
    </button>
  )}
</div>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto text-red-600 font-semibold mb-4 bg-red-100 p-3 rounded-lg">
            ❌ {error}
          </div>
        )}

        {/* Results Section */}
        <div className="space-y-6 max-w-3xl mx-auto">
          {results.length === 0 && !loading && !error && (
            <p className="text-gray-600 text-center">
              Enter a location or view previous analyses to get started.
            </p>
          )}

          {results.map((r) => (
            <div
              key={r.id}
              className="bg-white p-6 rounded-xl shadow-md space-y-4"
            >
              <h2 className="text-xl font-bold text-blue-700">
                📍 {r.site_name}
              </h2>

              <div className="grid grid-cols-2 gap-3 text-gray-700">
                <p>
                  <strong>Latitude:</strong> {r.lat.toFixed(4)}
                </p>
                <p>
                  <strong>Longitude:</strong> {r.lon.toFixed(4)}
                </p>
                <p>
                  <strong>Elevation:</strong> {r.elevation_m ?? "N/A"} m
                </p>
                <p>
                  <strong>Slope:</strong> {r.slope_deg?.toFixed(2)}°
                </p>
                <p>
                  <strong>Rainfall (3d):</strong> {r.rainfall_3d_mm} mm
                </p>
                <p>
                  <strong>Nearest Road:</strong>{" "}
                  {r.nearest_road_m
                    ? r.nearest_road_m.toFixed(0) + " m"
                    : "N/A"}
                </p>
                <p className="col-span-2">
                  <strong>Landuse:</strong>{" "}
                  {r.landuse?.map((l: any) => l.value).join(", ") || "N/A"}
                </p>
                <p className="col-span-2">
                  <strong>Suitability Score:</strong> {r.suitability_score}
                </p>
              </div>

              {r.recommended_actions?.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-800">
                    ✅ Recommended Actions:
                  </p>
                  <ul className="list-disc ml-6 text-gray-700">
                    {r.recommended_actions.map((act: string, idx: number) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
