'use client';
import { useEffect, useRef } from 'react';

// All three races start at LaVell Edwards Stadium and finish at the Utah County
// Courthouse, University Ave & Center St. Geometry traced from OpenStreetMap
// road centerlines; distances measured along these polylines.

// The 10K's north spur — out and back up University Ave, 2.03 mi each way.
// The 5K runs the first half mile of it; the Fun Run never runs it at all.
const northSpur: [number, number][] = [
  [40.2649, -111.6582], // Start: LaVell Edwards Stadium
  [40.2685, -111.6572],
  [40.2720, -111.6571],
  [40.2758, -111.6575],
  [40.2793, -111.6579],
  [40.2839, -111.6586],
  [40.2877, -111.6586],
  [40.2911, -111.6583],
  [40.2941, -111.6577], // Turnaround — 2.03 mi north of the stadium
];

// Stadium south to the finish: the Fun Run in full, and the last 2.15 mi of
// the 10K and 5K.
const toFinish: [number, number][] = [
  [40.2649, -111.6582], // LaVell Edwards Stadium
  [40.2611, -111.6586],
  [40.2576, -111.6586],
  [40.2539, -111.6586],
  [40.2505, -111.6586],
  [40.2466, -111.6586],
  [40.2432, -111.6587],
  [40.2394, -111.6587],
  [40.2362, -111.6587],
  [40.2338, -111.6585], // Finish: Utah County Courthouse, University Ave & Center St
];

// Full 10K, 6.21 mi: up the spur, back down it, then south to the finish.
// slice() copies before reverse(), which would otherwise mutate northSpur.
const route: [number, number][] = [
  ...northSpur,
  ...northSpur.slice(0, -1).reverse(),
  ...toFinish.slice(1),
];

// The 5K's turnaround: 0.475 mi up the spur, between its second and third
// points, which puts the whole 5K at 3.10 mi.
const fiveKTurnaround: [number, number] = [40.2717, -111.6571];
const fiveKSpur: [number, number][] = [...northSpur.slice(0, 2), fiveKTurnaround];

// Full 5K, 3.10 mi: the 10K's shape with the turnaround moved in.
const fiveKRoute: [number, number][] = [
  ...fiveKSpur,
  ...fiveKSpur.slice(0, -1).reverse(),
  ...toFinish.slice(1),
];

// Fun Run, 2.15 mi: the stadium-to-finish leg on its own.
const funRunRoute: [number, number][] = toFinish;

// Shorter races are drawn over longer ones, so where they share road the
// shorter race's color shows — the legend under the map says as much.
const COLORS = { tenK: '#F0307A', fiveK: '#9333EA', funRun: '#2563EB' };

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

      // Longest first, so each shorter race lands on top of the one it shares
      // road with: the 5K's half mile shows purple over the 10K's spur, and
      // the shared run to the finish shows the Fun Run's blue.
      L.polyline(route, { color: COLORS.tenK, weight: 4, opacity: 0.9 }).addTo(map);
      L.polyline(fiveKRoute, { color: COLORS.fiveK, weight: 4, opacity: 0.9 }).addTo(map);
      L.polyline(funRunRoute, { color: COLORS.funRun, weight: 4, opacity: 0.9 }).addTo(map);

      // One start point for every race, two turnarounds, one finish. Each is a
      // dot on the exact coordinate plus a permanent tooltip beside it —
      // Leaflet places tooltips relative to the point, so the labels don't
      // have to be nudged by hand and can't land on top of their own marker.
      const point = (
        latlng: [number, number],
        color: string,
        label: string,
        popup: string,
      ) => {
        L.circleMarker(latlng, {
          radius: 6,
          color: '#fff',
          weight: 2,
          fillColor: color,
          fillOpacity: 1,
        })
          .addTo(map)
          .bindTooltip(label, {
            permanent: true,
            // All of them sit to the right of the line. Leaflet's 'left'
            // direction mispositions these once the label is restyled, and
            // the points are far enough apart vertically that one side is
            // enough. Labels stay short so they clear the map's right edge
            // at phone width.
            direction: 'right',
            offset: [10, 0],
            className: 'course-label',
            opacity: 1,
          })
          .bindPopup(popup);
      };

      // Every race leaves from the same line, so this is one marker, not three.
      point(
        route[0],
        '#16A34A',
        'START · ALL RACES',
        '<b>START — 10K, 5K &amp; FUN RUN</b><br>LaVell Edwards Stadium, BYU<br>8:00 AM',
      );

      point(
        fiveKTurnaround,
        COLORS.fiveK,
        '5K TURNAROUND',
        '<b>5K TURNAROUND</b><br>Half a mile up University Ave<br><em>5K only — the 10K keeps climbing</em>',
      );

      point(
        northSpur[northSpur.length - 1],
        '#1C1719',
        '10K TURNAROUND',
        '<b>10K TURNAROUND</b><br>Mile 2 on University Ave<br>Aid station<br><em>10K only — the Fun Run never comes up here</em>',
      );

      point(
        route[route.length - 1],
        '#F0307A',
        'FINISH',
        '<b>FINISH</b><br>Utah County Courthouse<br>University Ave &amp; Center St, downtown Provo<br><em>Shared finish — all three races</em>',
      );
    });
  }, []);

  return (
    <div>
      <div
        ref={mapRef}
        className="h-96 w-full rounded-card border border-line"
        aria-label="Course map: all three races start at LaVell Edwards Stadium. The pink line shows the 10K, which runs two miles north on University Avenue, turns around, and heads south to the finish at the Utah County Courthouse in downtown Provo. The purple line shows the 5K, which turns around half a mile north of the stadium and then follows the same road to the finish. The blue line shows the Fun Run, the final two miles from the stadium to the same finish."
      />
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-body text-xs text-ash" aria-hidden="true">
        {[
          { label: '10K', color: COLORS.tenK },
          { label: '5K', color: COLORS.fiveK },
          { label: 'Fun Run', color: COLORS.funRun },
        ].map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span className="h-1 w-5 rounded-pill" style={{ backgroundColor: item.color }} />
            {item.label}
          </li>
        ))}
        <li>Where routes share road, the shorter race&rsquo;s color is on top.</li>
      </ul>
    </div>
  );
}
