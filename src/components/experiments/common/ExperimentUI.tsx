import React, { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, Play } from "lucide-react";
import { QuantumBit, ExperimentResult } from "./types";
import QBERDistanceVisualization from "../QBERDistanceVisualization";
import NoiseDecompositionVisualization from "../NoiseDecompositionVisualization";

// Google Charts is loaded via script tag in index.html
declare global {
  interface Window {
    google: any;
  }
}

interface SharedExperimentUIProps {
  isRunning: boolean;
  progress: number;
  photonPosition: number;
  currentBits: QuantumBit[];
  showBitsSimulation: boolean;
  results: { [key: string]: ExperimentResult };
  selectedExpId: string;
  runExperiment: () => void;
  resetExperiment?: () => void;
  color: string;
  experimentName: string;
  experimentData?: any[];
  analysis?: string;
  usedBits?: QuantumBit[];
  xAxisDataKey: string;
  colorScheme: string;
  experimentControls?: React.ReactNode;
}

export const ExperimentUI: React.FC<SharedExperimentUIProps> = ({
  isRunning,
  progress,
  photonPosition,
  currentBits,
  showBitsSimulation,
  results,
  selectedExpId,
  runExperiment,
  resetExperiment,
  color,
  experimentName,
  experimentData,
  analysis,
  usedBits,
  xAxisDataKey,
  colorScheme,
  experimentControls
}) => {
  useEffect(() => {
    // Load Google Charts when component mounts
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/charts/loader.js';
    script.async = true;
    script.onload = () => {
      window.google.charts.load('current', { packages: ['corechart', 'line', 'bar'] });
    };
    document.head.appendChild(script);

    return () => {
      // Clean up the script if necessary
    };
  }, []);

  // Function to render the chart
  const renderChart = (data: any[], xAxisDataKey: string, selectedExpId: string, colorScheme: string) => {
    if (!data || data.length === 0 || !window.google) return;

    // Wait for Google Charts to be loaded
    const drawChart = () => {
      // Prepare data for the chart based on experiment type - only plot QBER
      let chartData: any[];
      let title = '';
      let yTitle = '';
      let seriesOptions: any = {};

      // Check if this is an experiment that shows Eve comparison
      if (selectedExpId === 'with-eavesdropper') {
        // For eavesdropper experiment, show both "No Eve" and "With Eve" lines
        chartData = [['Number of Eavesdroppers', 'No Eve', 'With Eve']];
        
        // Get baseline (no eve) value
        const baselineQBER = data.find(item => item.eavesdroppers === 0)?.qber || 2;
        
        data.forEach(item => {
          if (item.eavesdroppers && item.eavesdroppers > 0) {
            chartData.push([
              item.eavesdroppers,
              baselineQBER,  // Constant baseline for no Eve
              item.qber || item.errorRate || 0  // With Eve values
            ]);
          }
        });
      } else if (selectedExpId === 'effect-of-qubits' && data[0]?.qberNoEve !== undefined) {
        // For qubits experiment with Eve comparison
        chartData = [['Qubits', 'No Eve', 'With Eve']];
        data.forEach(item => {
          chartData.push([
            item.qubits || 0,
            item.qberNoEve || item.qber || 0,  // No Eve values
            item.qberWithEve || item.qber || 0  // With Eve values
          ]);
        });
      } else {
        // For all other experiments, plot single QBER line
        chartData = [[xAxisDataKey, 'QBER']];
        data.forEach(item => {
          chartData.push([
            item[xAxisDataKey] || 0, 
            item.qber || item.errorRate || 0
          ]);
        });
      }
      
      // Set title based on experiment type
      const hasEveData = (selectedExpId === 'with-eavesdropper') || 
                        (selectedExpId === 'effect-of-qubits' && data[0]?.qberNoEve !== undefined);
      
      switch(selectedExpId) {
        case 'effect-of-qubits':
          title = hasEveData ? 'QBER vs Qubits (With/Without Eve)' : 'QBER vs Qubits';
          break;
        case 'effect-of-channel-noise':
          title = 'QBER vs Noise';
          break;
        case 'without-eavesdropper':
          title = 'QBER Baseline (No Eavesdropper)';
          break;
        case 'with-eavesdropper':
          title = 'QBER Comparison (With/Without Eve)';
          break;
        case 'effect-of-distance':
          title = 'QBER vs Distance';
          break;
        case 'overall':
          title = 'QBER vs Measurement';
          break;
        default:
          title = 'QBER';
          break;
      }
      
      yTitle = 'QBER (%)';
      
      // Determine if this experiment should show comparison (e.g., with/without Eve)
      const hasEveComparison = (selectedExpId === 'with-eavesdropper') || 
                               (selectedExpId === 'effect-of-qubits' && data[0]?.qberNoEve !== undefined);
      
      if (hasEveComparison) {
        // For Eve comparison, show green for "No Eve" and red for "With Eve"
        seriesOptions = {
          0: { 
            color: '#22c55e', // Green for No Eve
            pointSize: 6,
            lineWidth: 2,
            lineDashStyle: [0, 0] // Solid line
          },
          1: {
            color: '#ef4444', // Red for With Eve
            pointSize: 6,
            lineWidth: 2,
            lineDashStyle: [0, 0] // Solid line
          }
        };
      } else {
        // Single series experiments
        seriesOptions = {
          0: { 
            color: '#3b82f6', // Blue for single series
            pointSize: 6,
            lineWidth: 2
          }
        };
      }

      // Add security threshold line (11% for active experiments)
      if (selectedExpId !== 'without-eavesdropper') {
        // Add a third column for the threshold line
        const extendedData = [chartData[0].concat('Security Threshold (11%)')]; // Add threshold column name
        chartData.slice(1).forEach(row => {
          extendedData.push([...row, 11]); // Add 11% to each row
        });
        
        chartData = extendedData;
        
        // Add series configuration for threshold
        const thresholdIndex = Object.keys(seriesOptions).length;
        seriesOptions[thresholdIndex] = { 
          color: '#fbbf24', 
          lineDashStyle: [10, 2], // Dashed line for threshold
          pointSize: 0,
          lineWidth: 2,
          visibleInLegend: true
        };
      }

      const dataTable = window.google.visualization.arrayToDataTable(chartData);

      const options: any = {
        title: title,
        titleTextStyle: {
          fontSize: 15,
          bold: true,
          color: '#1f2937'
        },
        hAxis: {
          title: selectedExpId === 'overall' ? 'Bit Number' : 
                (selectedExpId === 'effect-of-distance' ? 'Distance (km)' : 
                (selectedExpId === 'effect-of-qubits' ? 'Qubits' : 
                (selectedExpId === 'with-eavesdropper' ? 'Number of Eavesdroppers' : xAxisDataKey || 'X Axis'))),
          titleTextStyle: {
            fontSize: 14,
            italic: false
          },
          textStyle: {
            fontSize: 12,
            color: '#374151'
          },
          gridlines: { 
            color: '#e5e7eb',
            count: 10
          },
          minorGridlines: {
            color: '#f3f4f6',
            count: 1
          },
          showTextEvery: 1,
          slantedText: false,
          format: '0',
          ticks: (() => {
            // Generate specific ticks based on experiment type
            if (selectedExpId === 'with-eavesdropper') {
              return [0, 1, 2, 3, 4, 5];
            } else if (selectedExpId === 'effect-of-qubits') {
              const ticks = [];
              for (let i = 0; i <= 100; i += 10) {
                ticks.push(i);
              }
              return ticks;
            } else if (selectedExpId === 'effect-of-distance') {
              return [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
            } else if (selectedExpId === 'effect-of-channel-noise') {
              const ticks = [];
              for (let i = 0; i <= 20; i += 2) {
                ticks.push(i);
              }
              return ticks;
            }
            return null;
          })()
        },
        vAxis: {
          title: yTitle,
          titleTextStyle: {
            fontSize: 14,
            italic: false
          },
          textStyle: {
            fontSize: 11,
            color: '#374151'
          },
          viewWindow: { 
            min: 0,
            max: Math.max(100, ...data.map(d => d.qber || d.errorRate || 0)) * 1.1
          },
          gridlines: { 
            color: '#e5e7eb',
            count: 10
          },
          minorGridlines: {
            color: '#f3f4f6',
            count: 1
          },
          format: '0.##',
          ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
        },
        series: seriesOptions,
        legend: { 
          position: 'top',
          alignment: 'end',
          textStyle: {
            fontSize: 12
          }
        },
        width: '100%',
        height: 400,
        backgroundColor: '#ffffff',
        chartArea: {
          backgroundColor: {
            stroke: '#e5e7eb',
            strokeWidth: 1
          },
          width: '85%',
          height: '65%',
          left: 100,
          top: 50,
          right: 30,
          bottom: 70
        },
        curveType: 'function',
        interpolateNulls: true,
        pointsVisible: true,
        fontName: 'Arial',
        fontSize: 12
      };

      // Choose chart type based on experiment
      let chart;
      if (selectedExpId === 'with-eavesdropper') {
        // Use BarChart for eavesdropper experiment
        chart = new window.google.visualization.ColumnChart(
          document.getElementById('experiment-chart') as HTMLElement
        );
      } else {
        // Use LineChart for other experiments
        chart = new window.google.visualization.LineChart(
          document.getElementById('experiment-chart') as HTMLElement
        );
      }
      chart.draw(dataTable, options);
    };

    // Check if Google Charts is already loaded
    if (window.google && window.google.charts) {
      drawChart();
      // Redraw on window resize
      window.addEventListener('resize', drawChart);
    } else {
      // Wait for Google Charts to be loaded
      window.google.charts.load('current', { packages: ['corechart', 'line', 'bar'] });
      window.google.charts.setOnLoadCallback(() => {
        drawChart();
        // Redraw on window resize
        window.addEventListener('resize', drawChart);
      });
    }
    
    // Cleanup resize listener
    return () => {
      window.removeEventListener('resize', drawChart);
    };
  };

  const selectedResult = results[selectedExpId];

  const plotAnalysis = useMemo(() => {
    if (!selectedResult?.data || selectedResult.data.length === 0) {
      return '';
    }

    const qberKey = selectedResult.data.some((point) => typeof point.qber === 'number') ? 'qber' : 'errorRate';

    const points = selectedResult.data
      .map((entry, index) => {
        const rawQber = entry[qberKey];
        const numericQber = typeof rawQber === 'number' ? rawQber : Number(rawQber);
        if (!Number.isFinite(numericQber)) {
          return null;
        }

        const rawAxisValue = entry[xAxisDataKey];
        const numericAxisValue = typeof rawAxisValue === 'number' ? rawAxisValue : Number(rawAxisValue);

        return {
          qber: Number(numericQber),
          axisValue: Number.isFinite(numericAxisValue) ? numericAxisValue : rawAxisValue ?? index + 1,
          axisLabel: rawAxisValue ?? index + 1,
        };
      })
      .filter((point): point is { qber: number; axisValue: number | string; axisLabel: number | string } => point !== null);

    if (points.length === 0) {
      return '';
    }

    const minPoint = points.reduce((best, current) => (current.qber < best.qber ? current : best), points[0]);
    const maxPoint = points.reduce((worst, current) => (current.qber > worst.qber ? current : worst), points[0]);
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const thresholdCrossings = points.filter((point) => point.qber > 11).length;

    const formatAxisValue = (value: number | string) => (typeof value === 'number' ? value.toString() : String(value));
    const formatQber = (value: number) => value.toFixed(2);

    const axisDescriptor = (() => {
      switch (selectedExpId) {
        case 'effect-of-qubits':
          return 'number of qubits';
        case 'effect-of-channel-noise':
          return 'channel noise level';
        case 'with-eavesdropper':
          return 'eavesdropping rate';
        case 'effect-of-distance':
          return 'transmission distance';
        case 'overall':
          return 'bit index';
        default:
          return 'parameter';
      }
    })();

    const trendDescriptor = (() => {
      if (points.length < 2) {
        return 'remains constant across the recorded sample.';
      }
      if (lastPoint.qber > firstPoint.qber) {
        return `increases as the ${axisDescriptor} grows from ${formatAxisValue(firstPoint.axisLabel)} to ${formatAxisValue(lastPoint.axisLabel)}.`;
      }
      if (lastPoint.qber < firstPoint.qber) {
        return `decreases as the ${axisDescriptor} moves from ${formatAxisValue(firstPoint.axisLabel)} to ${formatAxisValue(lastPoint.axisLabel)}.`;
      }
      return `stays steady while the ${axisDescriptor} varies between ${formatAxisValue(firstPoint.axisLabel)} and ${formatAxisValue(lastPoint.axisLabel)}.`;
    })();

    const thresholdMessage = thresholdCrossings > 0
      ? `${thresholdCrossings === points.length ? 'All' : thresholdCrossings} run${thresholdCrossings === 1 ? '' : 's'} exceed the 11% security threshold, indicating a compromised channel.`
      : 'All runs remain below the 11% security threshold, keeping the channel within acceptable limits.';

    return [
      `QBER spans ${formatQber(minPoint.qber)}% to ${formatQber(maxPoint.qber)}% across the sampled ${axisDescriptor}.`,
      `The lowest error occurs at ${formatAxisValue(minPoint.axisLabel)}, while the highest appears at ${formatAxisValue(maxPoint.axisLabel)}.`,
      `Overall, the error rate ${trendDescriptor}`,
      thresholdMessage,
    ].join(' ');
  }, [selectedResult, selectedExpId, xAxisDataKey]);
  
  // If we have results, render the chart after the component mounts
  useEffect(() => {
    if (selectedResult && selectedResult.data) {
      setTimeout(() => renderChart(selectedResult.data, xAxisDataKey, selectedExpId, colorScheme), 100);
    }
  }, [selectedResult, xAxisDataKey, selectedExpId, colorScheme]);
  
    return (
    <Card className="border-none shadow-soft overflow-hidden bg-white dark:bg-slate-950">
      <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900/50 pb-4">
        <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <FileText className="w-5 h-5" />
          </span>
          {experimentName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 p-6 md:p-8">
        {!isRunning && !selectedResult && (
          <div className="grid grid-cols-1 gap-6">
            <Card className="border-none shadow-sm bg-slate-50 dark:bg-slate-900/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  Experiment Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                  {(() => {
                    // Dynamically determine experiment based on selectedExpId
                    const expTextMap: Record<string, string> = {
                      'effect-of-qubits': 'Experiment 1: Effect of Qubits',
                      'without-eavesdropper': 'Experiment 2: BB84 Without an Evesdropper',
                      'with-eavesdropper': 'Experiment 3: With an Evesdropper',
                      'effect-of-channel-noise': 'Experiment 4: Effect of Channel Noise',
                      'effect-of-distance': 'Experiment 5: Effect of Distance',
                      'overall': 'Experiment 6: Effect of Photon Loss'
                    };
                    
                    const expName = expTextMap[selectedExpId] || experimentName;
                    
                    return (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <h4 className="text-lg font-bold text-foreground mb-4">{expName}</h4>
                        
                        <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm mb-4">
                            <p className="mb-2"><strong className="text-blue-600 dark:text-blue-400">Aim:</strong> {selectedExpId === 'effect-of-qubits' 
                            ? 'To study the fundamental role of qubits and their quantum properties in the BB84 protocol.'
                            : selectedExpId === 'without-eavesdropper'
                            ? 'To establish a baseline for the BB84 protocol\'s performance under ideal, secure conditions.'
                            : selectedExpId === 'with-eavesdropper'
                            ? 'To demonstrate the detection of an evesdropper (Eve) using the BB84 protocol.'
                            : selectedExpId === 'effect-of-channel-noise'
                            ? 'To investigate how noise in the quantum channel affects the security of the BB84 protocol by increasing the Quantum Bit Error Rate (QBER).'
                            : selectedExpId === 'effect-of-distance'
                            ? 'To analyze how increasing the transmission distance impacts the efficiency and performance of the BB84 protocol.'
                            : 'To study the specific impact of photon loss on the efficiency of the BB84 protocol and distinguish it from bit errors.'}</p>
                            
                            <p className="mb-0"><strong className="text-indigo-600 dark:text-indigo-400">Objective:</strong> {selectedExpId === 'effect-of-qubits'
                            ? 'To understand how the principles of superposition, measurement disturbance, and the no-cloning theorem provide the security foundation for Quantum Key Distribution (QKD).'
                            : selectedExpId === 'without-eavesdropper'
                            ? 'To observe the key generation process and resulting QBER when the quantum channel is secure.'
                            : selectedExpId === 'with-eavesdropper'
                            ? 'To observe how Eve\'s interception attempts disturb the quantum states and significantly increase the QBER.'
                            : selectedExpId === 'effect-of-channel-noise'
                            ? 'To isolate and observe the impact of channel noise on the QBER.'
                            : selectedExpId === 'effect-of-distance'
                            ? 'To observe the relationship between distance, photon loss (key rate), and error rate (QBER).'
                            : 'To demonstrate that photon loss reduces the key rate but does not directly increase the QBER.'}</p>
                        </div>

                        <p className="text-xs text-muted-foreground mb-4"><strong>Apparatus:</strong> Q-Xplore Virtual Lab {(selectedExpId !== 'without-eavesdropper' && selectedExpId !== 'with-eavesdropper' && selectedExpId !== 'effect-of-channel-noise' && selectedExpId !== 'effect-of-distance') ? '(Web-based interface powered by Qiskit)' : ''}</p>
                        
                        <div className="space-y-4">
                            <h5 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mt-6 border-b border-gray-200 dark:border-gray-800 pb-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">i</span>
                                Theory
                            </h5>
                            
                            <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-800 space-y-3">
                                {selectedExpId === 'effect-of-qubits' && (
                                <>
                                    <p>The BB84 protocol leverages the unique properties of <span className="font-semibold text-foreground">qubits</span>, which can exist in a superposition of states.</p>
                                    <ul className="list-disc pl-5 space-y-1 marker:text-blue-500">
                                        <li><strong>Rectilinear Basis (+):</strong> |0⟩ (Horizontal), |1⟩ (Vertical)</li>
                                        <li><strong>Diagonal Basis (×):</strong> |0⟩ (45°), |1⟩ (135°)</li>
                                    </ul>
                                    <p>Security relies on three core principles:</p>
                                    <ul className="list-disc pl-5 space-y-1 marker:text-indigo-500">
                                        <li><strong>Measurement Disturbance:</strong> Measuring collapses the state.</li>
                                        <li><strong>No-Cloning Theorem:</strong> Impossible to copy unknown quantum states perfectly.</li>
                                        <li><strong>Heisenberg Uncertainty:</strong> Cannot measure both bases simultaneously.</li>
                                    </ul>
                                </>
                                )}
                                {selectedExpId === 'without-eavesdropper' && (
                                <>
                                    <p>This experiment establishes the baseline performance. In a secure channel, QBER (Quantum Bit Error Rate) should be very low (typically &lt; 2%).</p>
                                    <p>Process:</p>
                                    <ol className="list-decimal pl-5 space-y-1 marker:text-green-500">
                                        <li><strong>Transmission:</strong> Alice sends random qubits.</li>
                                        <li><strong>Measurement:</strong> Bob measures in random bases.</li>
                                        <li><strong>Sifting:</strong> Bases are compared publicly; mismatches discarded.</li>
                                        <li><strong>Error Check:</strong> QBER is calculated from a subset.</li>
                                    </ol>
                                </>
                                )}
                                {selectedExpId === 'with-eavesdropper' && (
                                <>
                                    <p>Demonstrates the extensive disruption caused by an intercept-resend attack.</p>
                                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30 text-red-800 dark:text-red-300 text-xs">
                                        <strong>Attack Impact Calculation:</strong><br/>
                                        P(Eve wrong basis) = 0.5<br/>
                                        P(Bob wrong result | Eve wrong) = 0.5<br/>
                                        Total Error Probability = 0.5 × 0.5 = <strong>25% QBER</strong>
                                    </div>
                                    <p className="mt-2 text-red-600 dark:text-red-400 text-xs font-semibold">This ~25% error rate is the "smoking gun" of eavesdropping.</p>
                                </>
                                )}
                                {selectedExpId === 'effect-of-channel-noise' && (
                                <>
                                    <p>Channel noise (scattering, dark counts) introduces errors (QBER) even without an attacker. High noise levels can mimic eavesdropping, making secure key exchange impossible if the QBER exceeds ~11%.</p>
                                </>
                                )}
                                {selectedExpId === 'effect-of-distance' && (
                                <>
                                    <p>Distance primarily causes <strong>Photon Loss</strong> (reducing key rate). It can also slightly increase QBER due to polarization drift over long fibers.</p>
                                </>
                                )}
                                {selectedExpId === 'overall' && (
                                <>
                                    <p>Distinguishes between:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><strong>Photon Loss:</strong> Missing data (reduces speed).</li>
                                        <li><strong>Bit Errors:</strong> Wrong data (reduces security).</li>
                                    </ul>
                                </>
                                )}
                            </div>
                            
                            <h5 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mt-6 border-b border-gray-200 dark:border-gray-800 pb-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">ii</span>
                                Procedure
                            </h5>
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 text-sm">
                                {selectedExpId === 'effect-of-qubits' && (
                                <ul className="list-disc pl-5 space-y-1 text-blue-800 dark:text-blue-300">
                                    <li>Run simulation with varying qubit counts.</li>
                                    <li>Observe how more qubits lead to statistically more stable keys.</li>
                                </ul>
                                )}
                                {selectedExpId === 'without-eavesdropper' && (
                                <ul className="list-disc pl-5 space-y-1 text-blue-800 dark:text-blue-300">
                                    <li>Set <strong>Eavesdropper: OFF</strong>, <strong>Noise: LOW</strong>.</li>
                                    <li>Run and observe low QBER (&lt;2%).</li>
                                </ul>
                                )}
                                {selectedExpId === 'with-eavesdropper' && (
                                <ul className="list-disc pl-5 space-y-1 text-blue-800 dark:text-blue-300">
                                    <li>Set <strong>Eavesdropper: ON</strong>.</li>
                                    <li>Run and observe high QBER (~25%).</li>
                                    <li>Compare with the secure baseline.</li>
                                </ul>
                                )}
                                {selectedExpId === 'effect-of-channel-noise' && (
                                <ul className="list-disc pl-5 space-y-1 text-blue-800 dark:text-blue-300">
                                    <li>Vary <strong>Channel Noise</strong> from Low to High.</li>
                                    <li>Record QBER at each level.</li>
                                    <li>Identify the safety threshold (11%).</li>
                                </ul>
                                )}
                                {selectedExpId === 'effect-of-distance' && (
                                <ul className="list-disc pl-5 space-y-1 text-blue-800 dark:text-blue-300">
                                    <li>Increase <strong>Distance</strong>.</li>
                                    <li>Observe the drop in Key Rate (loss).</li>
                                    <li>Observe slight increase in QBER.</li>
                                </ul>
                                )}
                                {selectedExpId === 'overall' && (
                                <ul className="list-disc pl-5 space-y-1 text-blue-800 dark:text-blue-300">
                                    <li>Set high loss/distance.</li>
                                    <li>Note that key generation slows down/stops, but QBER may remain low.</li>
                                </ul>
                                )}
                            </div>


                        </div>
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
            
            {experimentControls && (
              <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
                 <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Configuration</h4>
                {experimentControls}
              </div>
            )}
            
            <div className="flex justify-center pt-4">
              <Button
                onClick={runExperiment}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 px-8 py-6 text-lg rounded-xl font-bold transition-all hover:scale-105"
              >
                <Play className="w-5 h-5 mr-3 fill-current" />
                Start Experiment
              </Button>
            </div>
          </div>
        )}

        {isRunning && (
          <div className="space-y-8 py-8">
            <div className="max-w-xl mx-auto text-center space-y-4">
               <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                        Running
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-gray-500 mt-2 animate-pulse">Processing quantum states...</p>
                </div>
            </div>
            
            {showBitsSimulation && currentBits.length > 0 && (
              <Card className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
                <CardHeader className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-gray-800 py-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Live Quantum Stream
                    </CardTitle>
                    <span className="text-xs text-muted-foreground font-mono">{currentBits.length} Qubits</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs font-mono">
                        <thead className="bg-gray-50 dark:bg-slate-950 sticky top-0">
                            <tr className="text-gray-500">
                                <th className="p-2 font-semibold">#</th>
                                <th className="p-2 font-semibold text-blue-600">Alice</th>
                                <th className="p-2 font-semibold text-blue-600">Basis</th>
                                <th className="p-2 font-semibold text-purple-600">Bob</th>
                                <th className="p-2 font-semibold text-purple-600">Basis</th>
                                <th className="p-2 font-semibold">Match</th>
                                <th className="p-2 font-semibold">Key</th>
                                <th className="p-2 font-semibold text-red-500">Eve</th>
                            </tr>
                        </thead>
                     
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {currentBits.slice(0, Math.min(50, currentBits.length)).map((bit) => (
                        <tr key={bit.id} className="hover:bg-gray-50/50">
                          <td className="p-2 text-center text-gray-400">{bit.id + 1}</td>
                          <td className="p-2 text-center">
                            <span className={`inline-block px-1.5 rounded ${bit.aliceBit ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                {bit.aliceBit}
                            </span>
                          </td>
                          <td className="p-2 text-center text-blue-500">{bit.aliceBasis[0]}</td>
                          <td className="p-2 text-center text-purple-500">{bit.bobBasis[0]}</td>
                          <td className="p-2 text-center">
                            <span className={`inline-block px-1.5 rounded ${bit.bobMeasurement ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                {bit.bobMeasurement}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                             {bit.match ? <span className="text-green-500 font-bold">✓</span> : <span className="text-gray-300">·</span>}
                          </td>
                          <td className="p-2 text-center">
                             {bit.kept ? <span className="text-green-600 bg-green-50 px-1 rounded font-bold">KEY</span> : <span className="text-gray-300">-</span>}
                          </td>
                          <td className="p-2 text-center">
                            {bit.eavesdropped 
                                ? <span className="text-red-500 bg-red-50 px-1 rounded font-bold animate-pulse">DETECTED</span> 
                                : <span className="text-gray-300">-</span>}
                          </td>
                        </tr>
                      ))}
                      </tbody>
                       </table>
                    </div>
                  </div>
                    {currentBits.length > 50 && (
                      <div className="bg-gray-50 p-2 text-center border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          ... streaming remaining qubits
                        </p>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {selectedResult && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Analysis Card */}
              <Card className="border border-indigo-100 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-sm">
                <CardHeader className="bg-indigo-50/50 dark:bg-indigo-900/10 border-b border-indigo-100 dark:border-indigo-900 py-3">
                  <CardTitle className="text-sm font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                    <span className="p-1 bg-indigo-100 dark:bg-indigo-900 rounded-md">
                        <FileText className="w-4 h-4" />
                    </span>
                    Mathematical Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wide">Key Formulas Used</h4>
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm font-mono text-xs space-y-2 text-indigo-900 dark:text-indigo-200">
                        {selectedExpId === 'effect-of-qubits' && (
                          <>
                            <div className="flex justify-between"><span>Security Confidence</span> <span>= (1 - (1/2)^n) × 100%</span></div>
                            <div className="flex justify-between"><span>Raw Key</span> <span>= Sifted Bits - Errors</span></div>
                          </>
                        )}
                        {selectedExpId === 'effect-of-channel-noise' && (
                          <>
                            <div className="flex justify-between"><span>Observed QBER</span> <span>= Error Bits / Total Sifted Bits</span></div>
                            <div className="flex justify-between text-red-500 dark:text-red-400 font-bold"><span>Security Threshold</span> <span>&lt; 11%</span></div>
                          </>
                        )}
                        {selectedExpId === 'without-eavesdropper' && (
                          <>
                            <div className="flex justify-between"><span>Baseline QBER</span> <span>= Intrinsic Noise Only</span></div>
                            <div className="flex justify-between text-green-600"><span>Expected QBER</span> <span>~0-2% (Ideal)</span></div>
                          </>
                        )}
                        {selectedExpId === 'with-eavesdropper' && (
                          <>
                            <div className="flex justify-between"><span>Eve's Error Introduction</span> <span>P(Error) = 25%</span></div>
                            <div className="flex justify-between font-bold"><span>Detected QBER</span> <span>≈ 25% × Interception Rate</span></div>
                          </>
                        )}
                        {selectedExpId === 'effect-of-distance' && (
                           <>
                            <div className="flex justify-between"><span>Transmission T</span> <span>= 10^(-Loss_dB * L / 10)</span></div>
                            <div className="flex justify-between"><span>Key Rate</span> <span>∝ T (Exponential Decay)</span></div>
                          </>
                        )}
                        {selectedExpId === 'overall' && (
                           <>
                            <div className="flex justify-between"><span>Final Security</span> <span>= QBER &lt; 11% AND Key Length &gt; Min</span></div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {selectedResult && selectedResult.data.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wide">Latest Data Points</h4>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm overflow-hidden">
                             <div className="overflow-x-auto">
                              <table className="w-full text-xs text-left">
                                <thead className="text-gray-400 border-b border-gray-100">
                                    <tr>
                                        {Object.keys(selectedResult.data[0]).slice(0,3).map(k => (
                                            <th key={k} className="pb-2 font-medium capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                   {selectedResult.data.slice(-3).map((point, idx) => (
                                        <tr key={idx}>
                                            {Object.values(point).slice(0,3).map((val, vIdx) => (
                                                <td key={vIdx} className="py-2 font-mono text-gray-600 dark:text-gray-300">
                                                    {typeof val === 'number' ? val.toFixed(2) : String(val)}
                                                </td>
                                            ))}
                                        </tr>
                                   ))}
                                </tbody>
                              </table>
                             </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
               {/* Bits Visualization Preview */}
              <div className="space-y-6">
                {selectedResult.usedBits && selectedResult.usedBits.length > 0 && (
                    <>
                    <Card className="border-none shadow-sm bg-blue-50/50 dark:bg-blue-900/10">
                        <CardHeader className="py-3">
                        <CardTitle className="text-sm font-bold text-blue-700 dark:text-blue-300 flex justify-between items-center">
                            Alice's Transmission
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-800 dark:text-blue-200">
                                {selectedResult.usedBits.filter(b => b.kept).length} bits generated
                            </span>
                        </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                        <div className="flex flex-wrap gap-1">
                            {selectedResult.usedBits.slice(0, 40).map((bit, index) => (
                            <div 
                                key={index}
                                className={`w-8 h-8 flex items-center justify-center text-xs font-mono font-bold rounded-md transition-all hover:scale-110 ${
                                bit.kept 
                                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
                                    : 'bg-white border border-blue-100 text-gray-300 opacity-50'
                                }`}
                            >
                                {bit.aliceBit}
                            </div>
                            ))}
                             {selectedResult.usedBits.length > 40 && (
                                <div className="w-8 h-8 flex items-center justify-center text-xs text-blue-400">...</div>
                             )}
                        </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-purple-50/50 dark:bg-purple-900/10">
                        <CardHeader className="py-3">
                        <CardTitle className="text-sm font-bold text-purple-700 dark:text-purple-300 flex justify-between items-center">
                            Bob's Reception
                            <span className="text-xs bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded text-purple-800 dark:text-purple-200">
                                {selectedResult.usedBits.filter(b => b.kept).length} bits matched
                            </span>
                        </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                        <div className="flex flex-wrap gap-1">
                            {selectedResult.usedBits.slice(0, 40).map((bit, index) => (
                            <div 
                                key={index}
                                className={`w-8 h-8 flex items-center justify-center text-xs font-mono font-bold rounded-md transition-all hover:scale-110 ${
                                bit.kept 
                                    ? bit.eavesdropped 
                                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20 ring-2 ring-red-300'
                                    : 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                                    : 'bg-white border border-purple-100 text-gray-300 opacity-50'
                                }`}
                            >
                                {bit.bobMeasurement}
                            </div>
                            ))}
                              {selectedResult.usedBits.length > 40 && (
                                <div className="w-8 h-8 flex items-center justify-center text-xs text-purple-400">...</div>
                             )}
                        </div>
                        </CardContent>
                    </Card>
                    </>
                )}
              </div>
             </div>

            <Card className="border-none shadow-soft bg-white dark:bg-slate-950 overflow-hidden">
              <CardHeader className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">Analytic Results</CardTitle>
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (resetExperiment) {
                            resetExperiment();
                          }
                        }}
                        disabled={isRunning}
                        className="text-xs border-gray-200 hover:bg-gray-50"
                      >
                        Run Again
                      </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {selectedResult.data.length === 1 && (selectedExpId === "without-eavesdropper" || selectedExpId === "overall") ? (
                   <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-8 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex-1 max-w-xs text-center p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100">
                             <div className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Key Rate</div>
                             <div className="text-4xl font-bold text-blue-600 mb-1">
                                {typeof selectedResult.data[0].keyRate === 'number' ? selectedResult.data[0].keyRate.toFixed(1) : String(selectedResult.data[0].keyRate)}%
                             </div>
                             <div className="text-xs text-gray-400">Efficiency</div>
                        </div>
                        
                         <div className="flex-1 max-w-xs text-center p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100">
                             <div className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Error Rate (QBER)</div>
                             <div className={`text-4xl font-bold mb-1 ${Number(selectedResult.data[0].errorRate) > 11 ? 'text-red-500' : 'text-green-500'}`}>
                                {typeof selectedResult.data[0].errorRate === 'number' ? selectedResult.data[0].errorRate.toFixed(1) : String(selectedResult.data[0].errorRate)}%
                             </div>
                             <div className="text-xs text-gray-400">Target: &lt; 11%</div>
                        </div>
                        
                        <div className="flex-1 max-w-xs text-center p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100">
                             <div className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Status</div>
                             <div className={`text-2xl font-bold mb-1 ${String(selectedResult.data[0].security) === 'Secure' ? 'text-green-600' : 'text-red-600'}`}>
                                {String(selectedResult.data[0].security)}
                             </div>
                              <div className="text-xs text-gray-400">Protocol Outcome</div>
                        </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                      <div id="experiment-chart" className="w-full min-h-[400px]">
                        {/* Google Chart will be rendered here */}
                      </div>
                    </div>
                  </div>
                )}
                
                {(plotAnalysis || selectedResult?.analysis) && (
                  <div className={`rounded-xl p-6 border-l-4 shadow-sm ${String(selectedResult?.data?.[0]?.security || '').includes('Compromised') || Number(selectedResult?.data?.[0]?.errorRate || 0) > 11 ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'}`}>
                    <h4 className={`font-bold mb-3 flex items-center gap-2 ${String(selectedResult?.data?.[0]?.security || '').includes('Compromised') || Number(selectedResult?.data?.[0]?.errorRate || 0) > 11 ? 'text-red-800' : 'text-blue-800'}`}>
                        <span className="text-xl">💡</span>
                        Insight
                    </h4>
                    {plotAnalysis && (
                      <p className="text-sm text-gray-700 leading-relaxed font-medium mb-2">{plotAnalysis}</p>
                    )}
                  </div>
                )}
                
                {/* New visualizations for distance experiment */}
                {selectedExpId === 'effect-of-distance' && selectedResult?.data && selectedResult.data.length > 0 && (
                  <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <div className="grid md:grid-cols-2 gap-8">
                        <QBERDistanceVisualization 
                        data={selectedResult.data.map(item => ({
                            distance: Number(item.distance),
                            qber: Number(item.qber)
                        }))}
                        title="Distance vs QBER"
                        />
                        
                        <NoiseDecompositionVisualization 
                        data={selectedResult.data.map(item => ({
                            distance: Number(item.distance),
                            eOpt: Number(item.intrinsicFloor || 1.5),      // Optical misalignment/intrinsic floor error
                            eDark: Number(item.darkCountContribution || 0), // Dark count contribution
                            totalQBER: Number(item.qber)
                        }))}
                        title="Error Source Breakdown"
                        />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};