import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DataVisuals = ({ issData }) => {
  const { speedHistory } = issData;

  const chartData = {
    labels: speedHistory.map(h => h.time),
    datasets: [
      {
        label: 'ISS Speed (km/h)',
        data: speedHistory.map(h => h.speed),
        borderColor: '#e54d2e',
        backgroundColor: 'rgba(229, 77, 46, 0.1)',
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: { display: true, color: '#f1f1f1' },
        ticks: { 
          display: true, 
          maxRotation: 45, 
          minRotation: 45, 
          font: { size: 9 },
          color: '#999'
        },
      },
      y: {
        grid: { display: true, color: '#f1f1f1' },
        ticks: { font: { size: 9 }, color: '#999' },
      },
    },
  };

  return (
    <div className="dashboard-card h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">ISS Speed Trend</h2>
      </div>
      <div className="flex-grow min-h-[300px]">
        {speedHistory.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            Gathering data...
          </div>
        )}
      </div>
    </div>
  );
};

export default DataVisuals;
