'use client';
import { useEffect, useRef } from 'react';

// Both races start at LaVell Edwards Stadium and finish at the Utah County
// Courthouse (University Ave & Center St), so they share the opening block out
// to University Avenue and the whole southbound run into downtown Provo.
//
// 10K — out and back, ~6.2 mi:
//   stadium → east on 1700 N to University Ave (US-189) → north ~2.1 mi to the
//   turnaround just above the Provo River → back south ~3.8 mi to the courthouse.
// Fun Run — ~1.9 mi: the southbound half only.
//
// Road centerlines traced from OpenStreetMap. The stadium connector and the
// turnaround point are planned positions, not a surveyed course — they move
// when the certified measurement comes back.

// Shared opening: the stadium out to University Avenue.
const stadiumConnector: [number, number][] = [
  [40.2583, -111.6545], // START: LaVell Edwards Stadium, BYU campus
  [40.2583, -111.6570],
  [40.2583, -111.6586], // University Ave (US-189)
];

// 10K out leg: north on University Ave to the turnaround.
const outLeg: [number, number][] = [
  [40.2611, -111.6586],
  [40.2649, -111.6582],
  [40.2685, -111.6572],
  [40.2720, -111.6571],
  [40.2758, -111.6575],
  [40.2793, -111.6579],
  [40.2839, -111.6586],
  [40.2877, -111.6586], // Provo River crossing
  [40.2894, -111.6584], // TURNAROUND — mile 2.4
];

// 10K back leg: retrace University Ave south to the stadium, where the Fun Run
// course rejoins for the run into downtown.
const backLeg: [number, number][] = [
  ...[...outLeg].reverse().slice(1),
  [40.2583, -111.6586],
];

// Shared closing stretch: University Ave south into downtown Provo.
const homeStretch: [number, number][] = [
  [40.2576, -111.6586],
  [40.2539, -111.6586],
  [40.2505, -111.6586],
  [40.2466, -111.6586],
  [40.2432, -111.6587],
  [40.2394, -111.6587],
  [40.2362, -111.6587],
  [40.2334, -111.6588], // FINISH: Utah County Courthouse, University Ave & Center St
];

const route: [number, number][] = [
  ...stadiumConnector,
  ...outLeg,
  ...backLeg,
  ...homeStretch,
];

const funRunRoute: [number, number][] = [...stadiumConnector, ...homeStretch];

const turnaround = outLeg[outLeg.length - 1];

export function CourseMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || !mapRef.current) return;
    initializedRef.current = true;

    import('leaflet').then((L) => {
      if (!mapRef.current) return;
      import('leaflet/dist/leaflet.css');

      const map = L.map(mapRef.current, {
        scrollWheelZoom: false,
      });
      map.fitBounds(L.latLngBounds(route), { padding: [30, 30] });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // 10K route — pink
      L.polyline(route, { color: '#F0307A', weight: 4, opacity: 0.9 }).addTo(map);

      // Fun Run route — blue, drawn on top so the overlap is visible as blue
      L.polyline(funRunRoute, { color: '#2563EB', weight: 4, opacity: 0.9 }).addTo(map);

      // Leaflet sizes a divIcon to a 12x12 box, so the label is absolutely
      // positioned and floated above that box — it then centres on the route
      // point whatever the label's length.
      const pill = (label: string, bg: string) =>
        `<div style="position:absolute;left:50%;top:0;transform:translate(-50%,-120%);background:${bg};color:#fff;font-weight:700;font-size:11px;padding:3px 7px;border-radius:999px;white-space:nowrap;font-family:sans-serif;box-shadow:0 1px 4px rgba(0,0,0,0.3)">${label}</div>`;

      const pillIcon = (label: string, bg: string) =>
        L.divIcon({ html: pill(label, bg), className: '', iconSize: [12, 12], iconAnchor: [6, 6] });

      // Shared start marker — both races leave from the stadium
      const startIcon = pillIcon('START', '#16A34A');
      L.marker(route[0], { icon: startIcon })
        .addTo(map)
        .bindPopup('<b>START</b><br>LaVell Edwards Stadium, BYU<br>8:00 AM<br><em>Shared start — 10K &amp; Fun Run</em>');

      // 10K turnaround
      const turnaroundIcon = pillIcon('10K TURNAROUND', '#F0307A');
      L.marker(turnaround, { icon: turnaroundIcon })
        .addTo(map)
        .bindPopup('<b>10K TURNAROUND</b><br>University Ave above the Provo River<br>Mile 2.4 — head back south');

      // Shared finish marker
      const finishIcon = pillIcon('FINISH', '#F0307A');
      L.marker(route[route.length - 1], { icon: finishIcon })
        .addTo(map)
        .bindPopup('<b>FINISH</b><br>Utah County Courthouse<br>University Ave &amp; Center St, downtown Provo<br><em>Shared finish — 10K &amp; Fun Run</em>');
    });
  }, []);

  return (
    <div
      ref={mapRef}
      className="h-96 w-full rounded-card border border-line"
      aria-label="Course map: both races start at LaVell Edwards Stadium and finish at the Utah County Courthouse in downtown Provo. The pink line shows the 10K running north on University Avenue to a turnaround above the Provo River and back south; the blue line shows the Fun Run taking the southbound stretch only."
    />
  );
}
