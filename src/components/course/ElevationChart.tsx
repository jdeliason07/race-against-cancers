'use client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

// 10K course: LaVell Edwards Stadium → north on University Ave → turnaround above
// the Provo River (mile 2.4) → back south to the Utah County Courthouse.
// Elevations sampled along the route (SRTM terrain data).
// Out and back: ~98 ft of climb to the turnaround, then ~175 ft of descent —
// a net drop of ~77 ft over 6.2 miles (4,644 ft → 4,567 ft).
const miles      = [0,    1,    2,    2.4,  3,    4,    5,    6,    6.2];
const elevations = [4644, 4680, 4726, 4742, 4713, 4668, 4621, 4576, 4567];

export function ElevationChart() {
  return (
    <div>
      <div className="rounded-card border border-line bg-paper p-6">
        <Line
          data={{
            labels: miles.map((m) => `Mile ${m}`),
            datasets: [
              {
                data: elevations,
                borderColor: '#F0307A',
                borderWidth: 2.5,
                pointBackgroundColor: '#F0307A',
                pointRadius: 4,
                fill: true,
                backgroundColor: (ctx: { chart: ChartJS }) => {
                  const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
                  gradient.addColorStop(0, 'rgba(253,231,240,0.7)');
                  gradient.addColorStop(1, 'rgba(253,231,240,0)');
                  return gradient;
                },
                tension: 0.4,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${(ctx.parsed.y ?? 0).toLocaleString()} ft`,
                },
              },
            },
            scales: {
              x: {
                grid: { color: '#ECE2E6' },
                ticks: { font: { family: 'Saira, sans-serif', size: 11 }, color: '#6E5C64' },
              },
              y: {
                min: 4550,
                max: 4800,
                grid: { color: '#ECE2E6' },
                ticks: {
                  font: { family: 'Saira, sans-serif', size: 11 },
                  color: '#6E5C64',
                  callback: (v) => `${v} ft`,
                },
              },
            },
          }}
        />
      </div>
      <p className="mt-3 text-center font-body text-sm text-ash">
        Out and back over 6.2 miles — a gentle 98 ft climb up University Avenue to the mile-2.4 turnaround, then a 175 ft descent into downtown Provo
      </p>
    </div>
  );
}
