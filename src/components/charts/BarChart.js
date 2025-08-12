import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ChartContainer from './ChartContainer';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ 
  title, 
  subtitle, 
  data, 
  loading = false, 
  error = null,
  height = 300,
  horizontal = false,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
}) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
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
        displayColors: true
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
      bar: {
        borderRadius: 4,
        borderSkipped: false
      }
    }
  };

  const processedData = data ? {
    ...data,
    datasets: data.datasets?.map((dataset, index) => ({
      ...dataset,
      backgroundColor: `${colors[index % colors.length]}`,
      borderColor: colors[index % colors.length],
      borderWidth: 0,
      borderRadius: 4,
      hoverBackgroundColor: `${colors[index % colors.length]}dd`
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
          <Bar data={processedData} options={chartOptions} />
        )}
      </div>
    </ChartContainer>
  );
};

export default BarChart;