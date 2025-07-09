
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface NutritionData {
  calories: number;
  carbs: string;
  fat: string;
  protein: string;
}

interface NutritionChartProps {
  nutrition: NutritionData;
  type?: 'doughnut' | 'bar';
}

const NutritionChart = ({ nutrition, type = 'doughnut' }: NutritionChartProps) => {
  // Parse nutrition data (remove 'g' and convert to numbers)
  const carbs = parseFloat(nutrition.carbs?.replace('g', '') || '0');
  const fat = parseFloat(nutrition.fat?.replace('g', '') || '0');
  const protein = parseFloat(nutrition.protein?.replace('g', '') || '0');

  const data = {
    labels: ['Carbs', 'Fat', 'Protein'],
    datasets: [
      {
        data: [carbs, fat, protein],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Green for carbs
          'rgba(249, 115, 22, 0.8)',  // Orange for fat
          'rgba(59, 130, 246, 0.8)',  // Blue for protein
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || context.raw;
            return `${label}: ${value}g`;
          },
        },
      },
    },
  };

  const barOptions = {
    ...options,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value + 'g';
          },
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-green-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
        Nutrition Breakdown
      </h3>
      
      {/* Total calories */}
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          {nutrition.calories}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Calories</div>
      </div>
      
      {/* Chart */}
      <div className="h-64 flex items-center justify-center">
        {type === 'doughnut' ? (
          <Doughnut data={data} options={options} />
        ) : (
          <Bar data={data} options={barOptions} />
        )}
      </div>
      
      {/* Nutrition values */}
      <div className="grid grid-cols-3 gap-4 mt-4 text-center">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
            {carbs}g
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Carbs</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
          <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
            {fat}g
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Fat</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            {protein}g
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Protein</div>
        </div>
      </div>
    </div>
  );
};

export default NutritionChart;
