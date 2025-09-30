import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, Play } from "lucide-react";
import { PhotonTransmissionAnimation } from "@/components/PhotonTransmissionAnimation";
import { QuantumBit, ExperimentResult } from "./types";

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
      window.google.charts.load('current', { packages: ['corechart', 'line'] });
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
      // Prepare data for the chart based on experiment type
      let chartData: any[];
      let title = '';
      let yTitle = '';
      let seriesOptions: any = {};

      // Determine the experiment type and configure accordingly
      switch(selectedExpId) {
        case 'effect-of-qubits':
          // Plot Qubit count vs QBER and Statistical Security
          chartData = [[xAxisDataKey, 'QBER', 'Statistical Security']];
          data.forEach(item => {
            chartData.push([
              item[xAxisDataKey] || 0, 
              item.qber || item.errorRate || 0, 
              item.statisticalSecurity || 0
            ]);
          });
          title = 'Effect of Qubits: QBER and Statistical Security';
          yTitle = 'Value (%)';
          seriesOptions = {
            0: { color: '#ef4444' }, // Red for QBER
            1: { color: '#22c55e' }  // Green for Statistical Security
          };
          break;
          
        case 'effect-of-channel-noise':
          // Plot Noise Level vs QBER and Key Rate
          chartData = [[xAxisDataKey, 'QBER', 'Key Rate']];
          data.forEach(item => {
            chartData.push([
              item[xAxisDataKey] || 0, 
              item.qber || item.errorRate || 0, 
              item.keyRate || 0
            ]);
          });
          title = 'Effect of Channel Noise: QBER and Key Rate';
          yTitle = 'Value (%)';
          seriesOptions = {
            0: { color: '#ef4444' }, // Red for QBER
            1: { color: '#3b82f6' }  // Blue for Key Rate
          };
          break;
          
        case 'without-eavesdropper':
          // Shows QBER baseline (simple bar/line)
          chartData = [[xAxisDataKey, 'QBER']];
          data.forEach(item => {
            chartData.push([item[xAxisDataKey] || 0, item.qber || item.errorRate || 0]);
          });
          title = 'Without Eavesdropper: QBER Baseline';
          yTitle = 'QBER (%)';
          seriesOptions = {
            0: { color: '#22c55e' }  // Green for baseline
          };
          break;
          
        case 'with-eavesdropper':
          // Plots Interception Rate vs QBER and Detection Probability
          chartData = [[xAxisDataKey, 'QBER', 'Detection Probability']];
          data.forEach(item => {
            chartData.push([
              item[xAxisDataKey] || 0, 
              item.qber || item.errorRate || 0, 
              item.detectionProbability || 0
            ]);
          });
          title = 'With Eavesdropper: QBER and Detection Probability';
          yTitle = 'Value (%)';
          seriesOptions = {
            0: { color: '#ef4444' }, // Red for QBER
            1: { color: '#8b5cf6' }  // Purple for Detection Probability
          };
          break;
          
        case 'effect-of-distance':
          // Plots Distance vs QBER and Photon Loss
          chartData = [[xAxisDataKey, 'QBER', 'Photon Loss']];
          data.forEach(item => {
            chartData.push([
              item[xAxisDataKey] || 0, 
              item.qber || item.errorRate || 0, 
              item.photonLoss || 0
            ]);
          });
          title = 'Effect of Distance: QBER and Photon Loss';
          yTitle = 'Value (%)';
          seriesOptions = {
            0: { color: '#ef4444' }, // Red for QBER
            1: { color: '#f97316' }  // Orange for Photon Loss
          };
          break;
          
        case 'basis-mismatch':
          // Plots Basis Match Rate vs QBER and Key Rate
          chartData = [[xAxisDataKey, 'QBER', 'Key Rate']];
          data.forEach(item => {
            chartData.push([
              item[xAxisDataKey] || 0, 
              item.qber || item.errorRate || 0, 
              item.keyRate || 0
            ]);
          });
          title = 'Basis Mismatch: QBER and Key Rate';
          yTitle = 'Value (%)';
          seriesOptions = {
            0: { color: '#ef4444' }, // Red for QBER
            1: { color: '#06b6d4' }  // Cyan for Key Rate
          };
          break;
          
        case 'overall':
          // Plots Bit Number vs cumulative QBER
          chartData = [[xAxisDataKey, 'QBER']];
          data.forEach(item => {
            chartData.push([item[xAxisDataKey] || 0, item.qber || item.errorRate || 0]);
          });
          title = 'Overall Analysis: QBER vs Bit Number';
          yTitle = 'QBER (%)';
          seriesOptions = {
            0: { color: '#ef4444' }  // Red for QBER
          };
          break;
          
        default:
          // For unknown experiment types, use a general approach
          chartData = [[xAxisDataKey, 'Error Rate']];
          data.forEach(item => {
            chartData.push([item[xAxisDataKey] || 0, item.errorRate || 0]);
          });
          title = 'Experiment Results';
          yTitle = 'Error Rate (%)';
          seriesOptions = {
            0: { color: '#64748b' }  // Gray for default
          };
          break;
      }

      // Add security threshold line (11% for active experiments)
      if (selectedExpId !== 'without-eavesdropper') {
        // Add a third column for the threshold line
        const extendedData = [chartData[0].concat('Security Threshold')]; // Add threshold column name
        chartData.slice(1).forEach(row => {
          extendedData.push([...row, 11]); // Add 11% to each row
        });
        
        chartData = extendedData;
        
        // Add series configuration for threshold
        seriesOptions = {
          ...seriesOptions,
          [Object.keys(seriesOptions).length]: { 
            color: '#f59e0b', 
            lineDashStyle: [4, 4], // Dashed line
            visibleInLegend: true
          }
        };
      }

      const dataTable = window.google.visualization.arrayToDataTable(chartData);

      const options: any = {
        title: title,
        hAxis: {
          title: selectedExpId === 'overall' ? 'Bit Number' : xAxisDataKey || 'X Axis'
        },
        vAxis: {
          title: yTitle,
          viewWindow: { min: 0 } // Start Y-axis at 0 for better visualization
        },
        series: seriesOptions,
        legend: { position: 'top' },
        width: '100%',
        height: 400,
        theme: 'material',
        backgroundColor: 'transparent',
        chartArea: {
          backgroundColor: 'transparent',
          width: '80%',
          height: '80%'
        },
        // Add grid lines
        hAxis: {
          title: selectedExpId === 'overall' ? 'Bit Number' : xAxisDataKey || 'X Axis',
          gridlines: { color: '#e0e0e0' }
        },
        vAxis: {
          title: yTitle,
          viewWindow: { min: 0 }, // Start Y-axis at 0 for better visualization
          gridlines: { count: 10 }
        }
      };

      const chart = new window.google.visualization.LineChart(
        document.getElementById('experiment-chart') as HTMLElement
      );
      chart.draw(dataTable, options);
    };

    // Check if Google Charts is already loaded
    if (window.google && window.google.charts) {
      drawChart();
    } else {
      // Wait for Google Charts to be loaded
      window.google.charts.load('current', { packages: ['corechart', 'line'] });
      window.google.charts.setOnLoadCallback(drawChart);
    }
  };

  const selectedResult = results[selectedExpId];
  
  // If we have results, render the chart after the component mounts
  useEffect(() => {
    if (selectedResult && selectedResult.data) {
      setTimeout(() => renderChart(selectedResult.data, xAxisDataKey, selectedExpId, colorScheme), 100);
    }
  }, [selectedResult, xAxisDataKey, selectedExpId, colorScheme]);
  
  return (
    <Card className="border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center gap-2">
          <span className="w-6 h-6" />
          {experimentName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isRunning && !selectedResult && (
          <>
            {experimentControls && (
              <div className="space-y-4">
                {experimentControls}
              </div>
            )}
            <div className="text-center">
              <Button
                onClick={runExperiment}
                className="bg-blue-500 hover:bg-blue-600 flex items-center justify-center"
              >
                <Play className="w-4 h-4 mr-2" />
                Run Experiment
              </Button>
            </div>
          </>
        )}

        {isRunning && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Running experiment...</p>
              <Progress value={progress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(0)}%</p>
            </div>
            
            <Card className="border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-sm">Photon Transmission</CardTitle>
              </CardHeader>
              <CardContent>
                <PhotonTransmissionAnimation photonPosition={photonPosition} />
              </CardContent>
            </Card>
            
            {showBitsSimulation && currentBits.length > 0 && (
              <Card className="bg-secondary/20">
                <CardHeader>
                  <CardTitle className="text-sm">Live Quantum Bits Simulation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-8 gap-1 text-xs font-mono">
                      <div className="font-semibold">Bit</div>
                      <div className="font-semibold">A-Bit</div>
                      <div className="font-semibold">A-Basis</div>
                      <div className="font-semibold">B-Basis</div>
                      <div className="font-semibold">B-Meas</div>
                      <div className="font-semibold">Match</div>
                      <div className="font-semibold">Key</div>
                      <div className="font-semibold">Eve</div>
                      
                      {currentBits.slice(0, Math.min(20, currentBits.length)).map((bit) => (
                        <React.Fragment key={bit.id}>
                          <div className="p-1 text-center">{bit.id + 1}</div>
                          <div className={`p-1 text-center rounded ${bit.aliceBit ? 'bg-blue-500/30' : 'bg-purple-500/30'}`}>
                            {bit.aliceBit}
                          </div>
                          <div className="p-1 text-center text-xs">{bit.aliceBasis[0]}</div>
                          <div className="p-1 text-center text-xs">{bit.bobBasis[0]}</div>
                          <div className={`p-1 text-center rounded ${bit.bobMeasurement ? 'bg-blue-500/30' : 'bg-purple-500/30'}`}>
                            {bit.bobMeasurement}
                          </div>
                          <div className={`p-1 text-center rounded text-xs ${bit.match ? 'bg-green-400/30 text-green-400' : 'bg-red-400/30 text-red-400'}`}>
                            {bit.match ? '✓' : '✗'}
                          </div>
                          <div className={`p-1 text-center rounded text-xs ${bit.kept ? 'bg-cyan-500/30 text-cyan-400' : 'bg-muted/30'}`}>
                            {bit.kept ? '⚿' : '-'}
                          </div>
                          <div className={`p-1 text-center rounded text-xs ${bit.eavesdropped ? 'bg-destructive/30 text-destructive' : 'bg-muted/30'}`}>
                            {bit.eavesdropped ? '👁' : '-'}
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                    {currentBits.length > 20 && (
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Showing first 20 of {currentBits.length} qubits...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {selectedResult && (
          <div className="space-y-6">
            <div className="space-y-6">
              <Card className="bg-secondary/20 border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="text-sm text-cyan-400 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Calculations & Formulas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-400">Statistical Formulas:</h4>
                      <div className="font-mono text-xs space-y-1 bg-background/50 p-3 rounded">
                        {selectedExpId === 'effect-of-qubits' && (
                          <>
                            <div>Statistical Security = (Qubits / 50) × 100%</div>
                            <div>Key Length = Matched Bases - Errors</div>
                          </>
                        )}
                        {selectedExpId === 'effect-of-channel-noise' && (
                          <>
                            <div>Error Rate = (Noise Level + Base Errors) / Total</div>
                            <div>Security = Error Rate &lt; 11% ? "Secure" : "Compromised"</div>
                          </>
                        )}
                        {selectedExpId === 'without-eavesdropper' && (
                          <>
                            <div>Error Rate = Base Channel Errors</div>
                            <div>Security = Error Rate &lt; 11% ? "Secure" : "Insecure"</div>
                          </>
                        )}
                        {selectedExpId === 'with-eavesdropper' && (
                          <>
                            <div>Detection Prob = min(100%, Error Rate × 4)</div>
                            <div>Eve Error = 25% per intercepted qubit</div>
                          </>
                        )}
                        {selectedExpId === 'effect-of-distance' && (
                          <>
                            <div>Photon Loss = (1 - e^(-Distance/50)) × 100%</div>
                            <div>Error Rate = Noise + Distance Factor</div>
                          </>
                        )}
                        {selectedExpId === 'overall' && (
                          <>
                            <div>Combined Error = f(Distance, Noise, Eavesdropping)</div>
                            <div>Security = Error Rate &lt; 11% ? "Secure" : "Compromised"</div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-400">Experiment Data:</h4>
                      <div className="font-mono text-xs space-y-1 bg-background/50 p-3 rounded max-h-32 overflow-y-auto">
                        {selectedResult.data.slice(0, 5).map((dataPoint, idx) => (
                          <div key={idx} className="text-xs">
                            {Object.entries(dataPoint).map(([key, value]) => (
                              <span key={key} className="mr-2">
                                {key}: {typeof value === 'number' ? value.toFixed(1) : String(value)}
                              </span>
                            ))}
                          </div>
                        ))}
                        {selectedResult.data.length > 5 && (
                          <div className="text-muted-foreground">...and {selectedResult.data.length - 5} more data points</div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedResult.usedBits && selectedResult.usedBits.length > 0 && (
                <div className="grid gap-4">
                  <Card className="bg-blue-500/10 border-blue-500/30">
                    <CardHeader>
                      <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        Alice's Transmitted Bits
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">Bits: {selectedResult.usedBits.filter(b => b.kept).length} kept from {selectedResult.usedBits.length} total</div>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                          {selectedResult.usedBits.map((bit, index) => (
                            <div 
                              key={index}
                              className={`w-6 h-6 flex items-center justify-center text-xs font-mono rounded border ${
                                bit.kept 
                                  ? 'bg-blue-500/30 border-blue-500 text-blue-400' 
                                  : 'bg-muted/20 border-muted text-muted-foreground'
                              }`}
                              title={`Bit ${index + 1}: ${bit.aliceBit} (${bit.aliceBasis}) ${bit.kept ? '- Kept' : '- Discarded'}`}
                            >
                              {bit.aliceBit}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-500/10 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-sm text-purple-400 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        Bob's Received Bits
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">Measurements: {selectedResult.usedBits.filter(b => b.kept).length} kept from {selectedResult.usedBits.length} total</div>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                          {selectedResult.usedBits.map((bit, index) => (
                            <div 
                              key={index}
                              className={`w-6 h-6 flex items-center justify-center text-xs font-mono rounded border ${
                                bit.kept 
                                  ? bit.eavesdropped 
                                    ? 'bg-destructive/30 border-destructive text-destructive'
                                    : 'bg-purple-500/30 border-purple-500 text-purple-400'
                                  : 'bg-muted/20 border-muted text-muted-foreground'
                              }`}
                              title={`Bit ${index + 1}: ${bit.bobMeasurement} (${bit.bobBasis}) ${bit.kept ? '- Kept' : '- Discarded'} ${bit.eavesdropped ? '- Eavesdropped' : ''}`}
                            >
                              {bit.bobMeasurement}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Card className="bg-secondary/30">
                <CardHeader>
                  <CardTitle className="text-sm">Experiment Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedResult.data.length === 1 && selectedExpId === "without-eavesdropper" ? (
                    <Card className="h-64 flex items-center justify-center bg-secondary/20">
                      <div className="text-center p-6">
                        <h4 className="text-lg font-semibold mb-4">Single Run Results</h4>
                        <div className="space-y-2">
                          <p>Key Rate: <span className="font-mono">{typeof selectedResult.data[0].keyRate === 'number' ? selectedResult.data[0].keyRate.toFixed(2) : String(selectedResult.data[0].keyRate)}%</span></p>
                          <p>Error Rate: <span className="font-mono">{typeof selectedResult.data[0].errorRate === 'number' ? selectedResult.data[0].errorRate.toFixed(2) : String(selectedResult.data[0].errorRate)}%</span></p>
                          <p className={`font-semibold mt-4 ${selectedResult.data[0].security === 'Secure' ? 'text-green-500' : 'text-destructive'}`}>
                            Security: {String(selectedResult.data[0].security)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <div className="mb-4">
                      <div id="experiment-chart" className="h-64 w-full">
                        {/* Google Chart will be rendered here */}
                      </div>
                    </div>
                  )}
                  
                  <Card className="bg-cyan-500/10 border-cyan-500/30">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-cyan-400 mb-2">Analysis</h4>
                      <p className="text-sm">{selectedResult.analysis}</p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};