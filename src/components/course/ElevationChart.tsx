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

// 5 Miler course: LaVell Edwards Stadium → north on University Ave to the
// turnaround just past 3700 N → south to the Utah County Courthouse.
// Elevations sampled along the actual route (SRTM terrain data).
// Out is uphill (~67 ft of climb to the mile-1.5 turnaround), everything after
// it is downhill (~154 ft). Net drop 87 ft over 5.1 miles.
const miles      = [0,    0.5,  1,    1.5,  2,    3,    4,    5.1];
const elevations = [4663, 4686, 4708, 4730, 4706, 4661, 4613, 4576];

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
                max: 4750,
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
        Roughly 67 ft of climb to the turnaround just past 3700 North, then 154 ft of
        descent all the way to the finish — a net drop of 87 ft over 5.1 miles
      </p>
    </div>
  );
}
