import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import ChartContainer from './ChartContainer';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ 
  title, 
  subtitle, 
  data, 
  loading = false, 
  error = null,
  height = 300,
  doughnut = true,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16']
}) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.backgroundColor[i],
                  lineWidth: 0,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
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
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: '#fff',
        hoverBorderWidth: 3
      }
    },
    cutout: doughnut ? '60%' : '0%'
  };

  const processedData = data ? {
    ...data,
    datasets: data.datasets?.map((dataset) => ({
      ...dataset,
      backgroundColor: colors.slice(0, dataset.data?.length || 0),
      borderColor: '#fff',
      borderWidth: 2,
      hoverBorderWidth: 3,
      hoverOffset: 4
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
          <Doughnut data={processedData} options={chartOptions} />
        )}
      </div>
    </ChartContainer>
  );
};

export default PieChart;