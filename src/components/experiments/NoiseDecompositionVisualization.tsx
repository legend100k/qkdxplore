import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface NoiseDecompositionDataPoint {
  distance: number;
  eOpt: number;      // Optical misalignment/intrinsic floor error
  eDark: number;     // Dark count contribution
  totalQBER: number; // Total QBER
}

interface NoiseDecompositionVisualizationProps {
  data: NoiseDecompositionDataPoint[];
  title?: string;
}

const NoiseDecompositionVisualization: React.FC<NoiseDecompositionVisualizationProps> = ({ 
  data, 
  title = "Noise Decomposition Analysis" 
}) => {
  return (
    <div className="w-full h-80">
      <h3 className="text-sm font-bold text-center mb-4 text-gray-700 dark:text-gray-200 uppercase tracking-wide">{title}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="distance" 
            label={{ 
              value: 'Distance (km)', 
              position: 'insideBottom', 
              offset: -5,
              className: 'text-sm' 
            }} 
          />
          <YAxis 
            label={{ 
              value: 'Error Contribution (%)', 
              angle: -90, 
              position: 'insideLeft', 
              className: 'text-sm' 
            }}
            domain={[0, (dataMax: number) => Math.max(20, dataMax * 1.1)]} // Scale y-axis appropriately
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'eOpt') return [`${Number(value).toFixed(2)}%`, 'Optical Misalignment'];
              if (name === 'eDark') return [`${Number(value).toFixed(2)}%`, 'Dark Count'];
              return [`${Number(value).toFixed(2)}%`, 'Total QBER'];
            }}
            labelFormatter={(value) => `Distance: ${value} km`}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="eOpt"
            stackId="1"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.6}
            name="Eopt (Optical Misalignment)"
          />
          <Area
            type="monotone"
            dataKey="eDark"
            stackId="1"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.6}
            name="Edark (Dark Count Contribution)"
          />
          <Line
            type="monotone"
            dataKey="totalQBER"
            stroke="#ef4444"
            strokeWidth={3}
            strokeDasharray="3 3"
            name="Total QBER"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NoiseDecompositionVisualization;