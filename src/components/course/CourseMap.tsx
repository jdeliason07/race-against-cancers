'use client';
import { useEffect, useRef } from 'react';

// Both races start at LaVell Edwards Stadium and finish at the Utah County
// Courthouse, University Ave & Center St. Geometry traced from OpenStreetMap
// road centerlines; distances measured along these polylines.

// The 5 Miler's north spur — out and back up University Ave, 1.47 mi each way,
// turning just past University Ave & 3700 N. The Fun Run never runs this.
const northSpur: [number, number][] = [
  [40.2649, -111.6582], // Start: LaVell Edwards Stadium
  [40.2685, -111.6572],
  [40.2720, -111.6571],
  [40.2758, -111.6575],
  [40.2793, -111.6579],
  [40.2839, -111.6586],
  [40.2860, -111.6586], // Turnaround — just past University Ave & 3700 N
];

// Stadium south to the finish: the Fun Run in full, and the 5 Miler's last 2.15 mi.
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

// Full 5 Miler, 5.08 mi: up the spur, back down it, then south to the finish.
// slice() copies before reverse(), which would otherwise mutate northSpur.
const route: [number, number][] = [
  ...northSpur,
  ...northSpur.slice(0, -1).reverse(),
  ...toFinish.slice(1),
];

// Fun Run, 2.15 mi: the stadium-to-finish leg on its own.
const funRunRoute: [number, number][] = toFinish;

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

      // 5 Miler route — pink
      L.polyline(route, { color: '#F0307A', weight: 4, opacity: 0.9 }).addTo(map);

      // Fun Run route — blue, drawn on top so the overlap is visible as blue
      L.polyline(funRunRoute, { color: '#2563EB', weight: 4, opacity: 0.9 }).addTo(map);

      // One start point for both races, one turnaround, one finish. Each is a
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
            // All three sit to the right of the line. Leaflet's 'left'
            // direction mispositions these once the label is restyled, and
            // the three points are far enough apart vertically that one side
            // is enough. Labels stay short so they clear the map's right edge
            // at phone width.
            direction: 'right',
            offset: [10, 0],
            className: 'course-label',
            opacity: 1,
          })
          .bindPopup(popup);
      };

      // Both races leave from the same line, so this is one marker, not two.
      point(
        route[0],
        '#16A34A',
        'START · BOTH RACES',
        '<b>START — 5 MILER &amp; FUN RUN</b><br>LaVell Edwards Stadium, BYU<br>8:00 AM',
      );

      point(
        northSpur[northSpur.length - 1],
        '#1C1719',
        'TURNAROUND · 3700 N',
        '<b>TURNAROUND</b><br>Just past University Ave &amp; 3700 N<br>Mile 1.5 · aid station<br><em>5 Miler only — the Fun Run never comes up here</em>',
      );

      point(
        route[route.length - 1],
        '#F0307A',
        'FINISH',
        '<b>FINISH</b><br>Utah County Courthouse<br>University Ave &amp; Center St, downtown Provo<br><em>Shared finish — 5 Miler &amp; Fun Run</em>',
      );
    });
  }, []);

  return (
    <div
      ref={mapRef}
      className="h-96 w-full rounded-card border border-line"
      aria-label="Course map: both races start at LaVell Edwards Stadium. The pink line shows the 5 Miler, which runs north on University Avenue to a turnaround just past 3700 North, then heads south to the finish at the Utah County Courthouse in downtown Provo. The blue line shows the Fun Run, the final two miles from the stadium to the same finish."
    />
  );
}
