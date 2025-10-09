import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface QBERDistanceDataPoint {
  distance: number;
  qber: number;
}

interface QBERDistanceVisualizationProps {
  data: QBERDistanceDataPoint[];
  title?: string;
}

const QBERDistanceVisualization: React.FC<QBERDistanceVisualizationProps> = ({ 
  data, 
  title = "QBER vs Distance" 
}) => {
  // Calculate the security threshold line at 11%
  const securityThreshold = 11;

  return (
    <div className="w-full h-80">
      <h3 className="text-lg font-semibold text-center mb-4 text-quantum-blue">{title}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
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
              value: 'QBER (%)', 
              angle: -90, 
              position: 'insideLeft', 
              className: 'text-sm' 
            }}
            domain={[0, (dataMax: number) => Math.max(30, dataMax * 1.1)]} // Scale y-axis appropriately
          />
          <Tooltip 
            formatter={(value) => [`${Number(value).toFixed(2)}%`, 'QBER']}
            labelFormatter={(value) => `Distance: ${value} km`}
          />
          <Legend />
          <ReferenceLine 
            y={securityThreshold} 
            stroke="#ff0000" 
            strokeDasharray="5 5" 
            label={{ 
              value: `Security Threshold (${securityThreshold}%)`, 
              position: 'top',
              fill: '#ff0000',
              fontSize: 12
            }}
          />
          <Line
            type="monotone"
            dataKey="qber"
            stroke="#3b82f6"
            strokeWidth={2}
            activeDot={{ r: 8 }}
            name="QBER (%)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default QBERDistanceVisualization;