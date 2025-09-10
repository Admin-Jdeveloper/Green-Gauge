// app/api/terrain-analysis/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

/**
 * NOTE:
 * - Uses OpenTopoData (SRTM), Overpass (OSM), Open-Meteo.
 * - For production, add caching and rate-limit handling (Overpass is rate-limited).
 */

// helper: fetch elevation from OpenTopoData
async function getElevation(lat:number, lon:number) {
  const url = `https://api.opentopodata.org/v1/srtm90m?locations=${lat},${lon}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Elevation fetch failed");
  const j = await r.json();
  return j.results?.[0]?.elevation ?? null;
}

// helper: fetch 3x3 grid elevations for slope estimate
async function getElevationGrid(lat:number, lon:number) {
  const offsets = [-0.01, 0, 0.01];
  const locs = [];
  for (const dy of offsets) {
    for (const dx of offsets) {
      locs.push(`${lat+dy},${lon+dx}`);
    }
  }
  const url = `https://api.opentopodata.org/v1/srtm90m?locations=${locs.join("|")}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Elevation grid fetch failed");
  const j = await r.json();
  return (j.results || []).map((it:any)=>it.elevation ?? 0);
}

// compute slope in degrees from 3x3 grid
function computeMeanSlopeDeg(grid:number[]) {
  if (!grid || grid.length < 9) return 0;
  const center = grid[4];
  const neighbors = [0,1,2,3,5,6,7,8];
  let total = 0;
  const cellDistMeters = 111000 * 0.01; // approx
  for (const i of neighbors) {
    const dz = Math.abs((grid[i] ?? center) - center);
    const slopeRad = Math.atan2(dz, cellDistMeters);
    total += (slopeRad * 180 / Math.PI);
  }
  return total / neighbors.length;
}

// Overpass: get landuse tags & nearest highway distance (meters)
async function getLanduseAndRoad(lat:number, lon:number, radius=1000) {
  const query = `
[out:json][timeout:25];
(
  way(around:${radius},${lat},${lon})["landuse"];
  relation(around:${radius},${lat},${lon})["landuse"];
  way(around:${radius},${lat},${lon})["natural"~"wood|water|wetland"];
  way(around:${radius},${lat},${lon})["highway"];
);
out center;`;
  const r = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query
  });
  if (!r.ok) throw new Error("Overpass query failed");
  const j = await r.json();
  const landuse:any[] = [];
  let nearestRoadDistMeters:number|null = null;

  if (j.elements && Array.isArray(j.elements)) {
    for (const el of j.elements) {
      if (el.tags && el.tags.landuse) landuse.push({ type: 'landuse', value: el.tags.landuse, tags: el.tags });
      if (el.tags && el.tags.highway) {
        const elLat = el.center?.lat ?? el.lat;
        const elLon = el.center?.lon ?? el.lon;
        if (elLat && elLon) {
          const d = haversineMeters(lat, lon, elLat, elLon);
          if (nearestRoadDistMeters === null || d < nearestRoadDistMeters) nearestRoadDistMeters = d;
        }
      }
    }
  }

  return { landuse, nearestRoad_m: nearestRoadDistMeters };
}

function haversineMeters(lat1:number, lon1:number, lat2:number, lon2:number) {
  const R = 6371000;
  const toRad = (x:number) => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Open-Meteo: 3-day rainfall sum
async function getRainfall3Day(lat:number, lon:number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum&timezone=auto`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Open-Meteo fetch failed");
  const j = await r.json();
  const arr = j.daily?.precipitation_sum ?? [];
  return arr.slice(0,3).reduce((s:number, v:number) => s + (v||0), 0);
}

// suitability scoring (customizable)
function computeSuitability({ elevation, slopeDeg, nearestRoad_m, landuse, rainfall_mm }:{
  elevation:number|null, slopeDeg:number, nearestRoad_m:number|null, landuse:any[], rainfall_mm:number
}) {
  let score = 0.5;
  if (elevation !== null) {
    if (elevation < 5) score -= 0.25;
    else if (elevation < 20) score -= 0.05;
    else score += 0.05;
  }
  if (slopeDeg < 3) score += 0.1;
  else if (slopeDeg >= 8) score -= 0.15;
  if (nearestRoad_m !== null) {
    if (nearestRoad_m < 100) score += 0.12;
    else if (nearestRoad_m < 500) score += 0.04;
    else score -= 0.08;
  }
  const lu = (landuse || []).map((l:any)=>String(l.value||'').toLowerCase());
  if (lu.includes('farmland') || lu.includes('farmland')) score += 0.12;
  if (lu.includes('forest') || lu.includes('wood')) score -= 0.04;
  if (rainfall_mm > 200) score -= 0.10;
  else if (rainfall_mm > 50) score += 0.04;
  score = Math.max(0, Math.min(1, score));
  return Number(score.toFixed(3));
}

function recommendByScore(score:number, params:any) {
  const rec:any[] = [];
  if (score < 0.35) {
    rec.push('Flood mitigation & drainage works');
    if ((params.slopeDeg ?? 0) > 8) rec.push('Terracing & soil conservation');
    if ((params.nearestRoad_m ?? 9999) > 500) rec.push('Access road construction');
  } else if (score < 0.65) {
    rec.push('Targeted irrigation & drainage upgrades');
    rec.push('Pilot livelihood & agri-support programs');
  } else {
    rec.push('Investment candidate: irrigation, value-chain infra, agri-extension');
    if ((params.slopeDeg ?? 0) < 5) rec.push('Consider solar farm pilot (if land available)');
  }
  return rec;
}

// app/api/terrain-analysis/route.ts


// ... keep all your helper functions (getElevation, getLanduseAndRoad, etc.)

// GET: return previous analysis results
export async function GET() {
  try {
    const sb = supabaseServer;
    const { data, error } = await sb
      .from("terrain_analysis_results")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ ok: true, results: data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// POST: run analysis (existing logic)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sb = supabaseServer;

    let locations: any[] = [];

    // ✅ Use user input directly
    if (Array.isArray(body?.locations) && body.locations.length > 0) {
      locations = body.locations;
    } 
    // ✅ Or fallback: use site_ids or all sites
    else if (Array.isArray(body?.site_ids) && body.site_ids.length > 0) {
      const { data: rows, error } = await sb.from("terrain_sites").select("id, display_name, lat, lon").in("id", body.site_ids);
      if (error) throw error;
      locations = rows || [];
    } else {
      const { data: allSites, error } = await sb.from("terrain_sites").select("id, display_name, lat, lon");
      if (error) throw error;
      locations = allSites || [];
    }

    const results: any[] = [];

    for (const loc of locations) {
      const lat = Number(loc.lat);
      const lon = Number(loc.lon);

      const elevation = await getElevation(lat, lon).catch(() => null);
      const grid = await getElevationGrid(lat, lon).catch(() => null);
      const slopeDeg = grid ? computeMeanSlopeDeg(grid) : 0;
      const luRes = await getLanduseAndRoad(lat, lon, 1000).catch(() => ({ landuse: [], nearestRoad_m: null }));
      const rainfall3d = await getRainfall3Day(lat, lon).catch(() => 0);

      const suitability_score = computeSuitability({
        elevation,
        slopeDeg,
        nearestRoad_m: luRes.nearestRoad_m,
        landuse: luRes.landuse,
        rainfall_mm: rainfall3d,
      });

      const recs = recommendByScore(suitability_score, { slopeDeg, nearestRoad_m: luRes.nearestRoad_m, elevation });


const uniqueLanduse = luRes.landuse.filter(
  (item, index, self) =>
    index === self.findIndex((t) => t.value === item.value)
);


console.log(luRes)
console.log(recs);

      const { data, error } = await sb
        .from("terrain_analysis_results")
        .insert([
          {
            site_id: loc.id ?? null,
            site_name: loc.display_name ?? loc.id,
            lat,
            lon,
            elevation_m: elevation,
            slope_deg: slopeDeg,
            landuse: uniqueLanduse,
            nearest_road_m: luRes.nearestRoad_m,
            rainfall_3d_mm: rainfall3d,
            suitability_score,
            recommended_actions: recs,
          },
        ])
        .select()
        .single();

      if (!error && data) results.push(data);
    }

    results.sort((a: any, b: any) => b.suitability_score - a.suitability_score);

    return NextResponse.json({ ok: true, total: results.length, results });
  } catch (err: any) {
    console.error("Terrain analysis error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}



