import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import ChartContainer from './ChartContainer';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({ 
  title, 
  subtitle, 
  data, 
  loading = false, 
  error = null,
  height = 300,
  showArea = false,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
}) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        intersect: false,
        mode: 'index'
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
        backgroundColor: '#fff'
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const processedData = data ? {
    ...data,
    datasets: data.datasets?.map((dataset, index) => ({
      ...dataset,
      borderColor: colors[index % colors.length],
      backgroundColor: showArea 
        ? `${colors[index % colors.length]}20`
        : colors[index % colors.length],
      fill: showArea,
      pointBackgroundColor: '#fff',
      pointBorderColor: colors[index % colors.length]
    }))
  } : null;

  const actions = (
    <div className="chart-actions">
      <button 
        className="chart-action-btn"
        onClick={() => console.log('Export chart')}
        title="Export Chart"
      >
        📊
      </button>
      <button 
        className="chart-action-btn"
        onClick={() => console.log('Fullscreen')}
        title="Fullscreen"
      >
        ⛶
      </button>
    </div>
  );

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      loading={loading}
      error={error}
      actions={actions}
    >
      <div style={{ height: `${height}px`, width: '100%' }}>
        {processedData && (
          <Line data={processedData} options={chartOptions} />
        )}
      </div>
    </ChartContainer>
  );
};

export default LineChart;