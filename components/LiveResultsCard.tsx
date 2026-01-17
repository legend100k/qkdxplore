"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useSimulationStore } from "@/lib/simulationStore";
import { motion } from "framer-motion";

interface LiveResultsCardProps {
  // Add any props if needed
}

export function LiveResultsCard({}: LiveResultsCardProps) {
  const { isRunning, voltage, frequency, simulationData } = useSimulationStore();

  // Generate mock data based on simulation state
  const mockData = simulationData.length > 0
    ? simulationData
    : [
        { time: 0, value: 0 },
        { time: 1, value: voltage * 2 },
        { time: 2, value: voltage * 4 },
        { time: 3, value: voltage * 6 },
        { time: 4, value: voltage * 5 },
        { time: 5, value: voltage * 7 },
        { time: 6, value: voltage * 8 },
        { time: 7, value: voltage * 7.5 },
        { time: 8, value: voltage * 9 },
        { time: 9, value: voltage * 10 },
        { time: 10, value: voltage * 9.5 },
      ];

  return (
    <Card className="h-full border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Live Results</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-56px)]">
        <div className="space-y-4">
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500">Current Value</p>
              <p className="text-lg font-semibold">{(voltage * frequency / 20).toFixed(2)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500">Status</p>
              <p className={`text-lg font-semibold ${isRunning ? 'text-indigo-600' : 'text-slate-500'}`}>
                {isRunning ? 'Running' : 'Idle'}
              </p>
            </div>
          </motion.div>

          <motion.div
            className="h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={mockData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ stroke: '#4f46e5', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 6, stroke: '#4f46e5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            className="pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-sm font-medium mb-2">Recent Events</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${isRunning ? 'bg-indigo-500' : 'bg-slate-400'}`}></div>
                <span>{isRunning ? 'Simulation running' : 'Simulation idle'}</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span>Parameter updated: Voltage = {voltage}V</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <span>Frequency: {frequency}Hz</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}