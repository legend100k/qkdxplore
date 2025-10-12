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
    <Card className="border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center gap-2">
          <span className="w-6 h-6\" />
          {experimentName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isRunning && !selectedResult && (
          <>
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4\" />
                  Experiment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="text-xs space-y-2 bg-gray-50 p-3 rounded-lg max-h-96 overflow-y-auto">
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
                      <>
                        <p><strong>{expName}</strong></p>
                        <p><strong>Aim:</strong> {selectedExpId === 'effect-of-qubits' 
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
                        <p><strong>Objective:</strong> {selectedExpId === 'effect-of-qubits'
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
                        <p><strong>Apparatus:</strong> Q-Xplore Virtual Lab {(selectedExpId !== 'without-eavesdropper' && selectedExpId !== 'with-eavesdropper' && selectedExpId !== 'effect-of-channel-noise' && selectedExpId !== 'effect-of-distance') ? '(Web-based interface powered by Qiskit)' : ''}</p>
                        <p className="font-semibold">Theory:</p>
                        {selectedExpId === 'effect-of-qubits' && (
                          <>
                            <p>The BB84 protocol leverages the unique properties of quantum bits, or qubits, which is the fundamental unit of quantum information. Unlike a classical bit, which is definitively 0 or 1, a qubit can exist in a superposition of both states simultaneously, represented as |ψ⟩ = α|0⟩ + β|1⟩, where α and β are complex probability amplitudes (|α|² + |β|² = 1).</p>
                            <p>In BB84, information is encoded onto qubits using two non-orthogonal bases:</p>
                            <p>The Rectilinear Basis (+): |0⟩₊ = |→⟩ (Horizontal polarization), |1⟩₊ = |↑⟩ (Vertical polarization)</p>
                            <p>The Diagonal Basis (×): |0⟩ₓ = |↗⟩ = (|→⟩ + |↑⟩)/√2 (45° polarization), |1⟩ₓ = |↖⟩ = (|→⟩ - |↑⟩)/√2 (135° polarization)</p>
                            <p>The protocol's security is not mathematical but physical, relying on three core principles:</p>
                            <p>Measurement Disturbance: Measuring a quantum system irrevocably collapses its state. If Bob measures a qubit in a basis different from the one Alice used to prepare it, the result is random (50% chance of |0⟩ or |1⟩), and the original information is lost.</p>
                            <p>No-Cloning Theorem: It is impossible to create an identical copy (clone) of an arbitrary unknown quantum state. An evesdropper, Eve, cannot perfectly intercept, copy, and resend a qubit without altering the original.</p>
                            <p>Heisenberg Uncertainty Principle: Certain pairs of physical properties (like polarization in different bases) cannot be simultaneously known with perfect accuracy. This makes it impossible to measure a quantum state in multiple ways without introducing errors.</p>
                            <p>These properties ensure that any attempt to gain information about the key introduces detectable anomalies.</p>
                          </>
                        )}
                        {selectedExpId === 'without-eavesdropper' && (
                          <>
                            <p>This experiment establishes the optimal operating conditions for the BB84 protocol. In the complete absence of an evesdropper, the only factors affecting the Quantum Bit Error Rate (QBER) are the inherent channel noise and system imperfections. Under well-controlled laboratory conditions with high-quality components, this intrinsic QBER can be very low, often below 2%.</p>
                            <p>The process proceeds as follows:</p>
                            <p>Quantum Transmission: Alice sends a sequence of qubits, each randomly prepared in one of the two bases.</p>
                            <p>Quantum Measurement: Bob independently and randomly chooses a basis for each incoming qubit and measures it.</p>
                            <p>Sifting: Alice and Bob publicly communicate the bases they used for each qubit (but not the bit values) over a classical channel. They discard all bits where their bases did not match. The remaining bits form the sifted key.</p>
                            <p>Error Estimation: They compare a random subset of the sifted key to calculate the QBER. A low QBER confirms the channel is secure.</p>
                            <p>Key Finalization: The remaining portion of the sifted key is then processed through error correction (to fix the few remaining errors) and privacy amplification (to reduce any partial information a potential evesdropper might have) to produce a final, identical, and perfectly secret key.</p>
                            <p>This scenario demonstrates the protocol's maximum efficiency and serves as a control to identify the disruptive effects of an evesdropper.</p>
                          </>
                        )}
                        {selectedExpId === 'with-eavesdropper' && (
                          <>
                            <p>This experiment demonstrates the core security feature of BB84: the detectable disruption caused by any interception attempt. The most straightforward attack is the intercept-resend attack:</p>
                            <p>Interception: Eve intercepts the qubit sent by Alice.</p>
                            <p>Measurement: She randomly chooses a basis (rectilinear or diagonal) to measure it. She has a 50% chance of choosing the wrong basis.</p>
                            <p>Disturbance: If she chooses the wrong basis, the qubit's state collapses randomly. She records this random result as the bit value.</p>
                            <p>Resending: To hide her presence, she must send a new qubit to Bob prepared in the state she measured.</p>
                            <p>This action introduces errors. The probability that Eve chooses the wrong basis is 1/2. If she chooses wrong, she sends the wrong state to Bob. However, Bob also has a 50% chance of choosing the wrong basis for his measurement. The overall probability that an error is introduced for a bit that Eve tampered with is calculated as:</p>
                            <p>P(Eve chooses wrong basis) = 1/2</p>
                            <p>P(Bob gets wrong bit | Eve was wrong) = 1/2</p>
                            <p>Therefore, P(Error) = (1/2) * (1/2) = 1/4 or 25%</p>
                            <p>Thus, Eve's activity raises the Quantum Bit Error Rate (QBER) to approximately 25%, which is far above the typical tolerable threshold of ~11%. This dramatic and predictable increase is an unambiguous signature of evesdropping, forcing Alice and Bob to discard the compromised key.</p>
                          </>
                        )}
                        {selectedExpId === 'effect-of-channel-noise' && (
                          <>
                            <p>Channel noise stems from physical imperfections like photon scattering, polarization drift, and detector dark counts. Unlike photon loss, noise directly causes bit errors: Bob detects a photon but records the wrong bit value. This directly increases the QBER. A high QBER can render the key insecure, even without an evesdropper, as it becomes impossible to distinguish these errors from a malicious attack.</p>
                          </>
                        )}
                        {selectedExpId === 'effect-of-distance' && (
                          <>
                            <p>The primary effect of distance is exponential photon loss (attenuation), which drastically reduces the number of photons reaching Bob and thus the final key rate. Furthermore, over longer distances, effects like polarization drift have more time to occur, which can also cause errors and lead to a slight increase in the QBER alongside the major issue of loss.</p>
                          </>
                        )}
                        {selectedExpId === 'overall' && (
                          <>
                            <p>It is crucial to distinguish between Photon Loss and Bit Errors.</p>
                            <p>Photon Loss: A photon is sent but not detected. This reduces the raw number of bits, lowering the key rate, but it does not increase the QBER (a lost photon isn't an error; it's just missing data).</p>
                            <p>Bit Errors: A photon is detected but its value is wrong. This increases the QBER and compromises security.</p>
                            <p>An evesdropper causes errors. Channel noise causes errors. Distance causes loss (which can lead to errors indirectly). This experiment isolates the pure effect of loss.</p>
                          </>
                        )}
                        <p className="font-semibold">Procedure:</p>
                        {selectedExpId === 'effect-of-qubits' && (
                          <>
                            <p>Go to the Q-Xplore Virtual Lab simulator.</p>
                            <p>Run the BB84 simulation without any evesdropper and with low channel noise.</p>
                            <p>Note the QBER and the successful generation of a secure key.</p>
                            <p>Take a screenshot of the results screen showing the low QBER.</p>
                          </>
                        )}
                        {selectedExpId === 'without-eavesdropper' && (
                          <>
                            <p>Go to the Q-Xplore Virtual Lab simulator.</p>
                            <p>Set the \"evesdropper\" parameter to OFF and \"Channel Noise\" to LOW.</p>
                            <p>Run the simulation and note the low QBER and efficient key generation.</p>
                            <p>Take a screenshot of the successful results.</p>
                          </>
                        )}
                        {selectedExpId === 'with-eavesdropper' && (
                          <>
                            <p>Go to the Q-Xplore Virtual Lab simulator.</p>
                            <p>Set the \"evesdropper\" parameter to ON.</p>
                            <p>Run the simulation and observe the QBER.</p>
                            <p>Take a screenshot of the results showing the high (~25%) QBER.</p>
                          </>
                        )}
                        {selectedExpId === 'effect-of-channel-noise' && (
                          <>
                            <p>Set evesdropper = OFF, Distance = SHORT (to minimize other effects).</p>
                            <p>Set Channel Noise = LOW. Run the simulation. Record the QBER and Final Key Length. This is your baseline.</p>
                            <p>Set Channel Noise = MEDIUM. Run the simulation. Record the QBER and Final Key Length.</p>
                            <p>Set Channel Noise = HIGH. Run the simulation. Record the QBER and Final Key Length.</p>
                          </>
                        )}
                        {selectedExpId === 'effect-of-distance' && (
                          <>
                            <p>Set evesdropper = OFF, Channel Noise = LOW.</p>
                            <p>Set Distance = SHORT. Run the simulation. Record the QBER and Final Key Length. This is your baseline.</p>
                            <p>Set Distance = MEDIUM. Run the simulation. Record the QBER and Final Key Length.</p>
                            <p>Set Distance = LONG. Run the simulation. Record the QBER and Final Key Length.</p>
                          </>
                        )}
                        {selectedExpId === 'overall' && (
                          <>
                            <p>Set evesdropper = OFF, Channel Noise = LOW (to ensure no errors are introduced).</p>
                            <p>Find a \"Photon Loss\" or \"Attenuation\" parameter. If not available, use Distance = LONG.</p>
                            <p>Set loss to HIGH (or use max distance). Run the simulation.</p>
                            <p>Record the very short (or zero) Final Key Length and the QBER.</p>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
            {experimentControls && (
              <div className="space-y-4">
                {experimentControls}
              </div>
            )}
            <div className="text-center">
              <Button
                onClick={runExperiment}
                className="bg-blue-500 hover:bg-blue-600 flex items-center justify-center\"
              >
                <Play className="w-4 h-4 mr-2\" />
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
            
            {/*<Card className="border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-sm">Photon Transmission</CardTitle>
              </CardHeader>
              <CardContent>
                <PhotonTransmissionAnimation photonPosition={photonPosition} />
              </CardContent>
            </Card>*/}
            
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
                    {selectedResult && (
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
                    )}
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

            <Card className="bg-white/95 border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">Experiment Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedResult.data.length === 1 && selectedExpId === "without-eavesdropper" ? (
                  <div className="h-64 flex items-center justify-center bg-secondary/20 rounded-lg">
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
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">QBER vs {selectedExpId === 'effect-of-qubits' ? 'Number of Qubits' : 
                        selectedExpId === 'effect-of-channel-noise' ? 'Noise Level (%)' : 
                        selectedExpId === 'with-eavesdropper' ? 'Eavesdropping Rate (%)' : 
                        selectedExpId === 'effect-of-distance' ? 'Distance (km)' : 'Parameter'}</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (resetExperiment) {
                            resetExperiment();
                          }
                        }}
                        disabled={isRunning}
                        className="text-xs"
                      >
                        Reset & Rerun
                      </Button>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div id="experiment-chart" className="w-full" style={{ height: '400px' }}>
                        {/* Google Chart will be rendered here */}
                      </div>
                    </div>
                    {/*plotAnalysis && (
                      <div className="text-sm text-muted-foreground mt-2">
                        <p>{plotAnalysis}</p>
                      </div>
                    )*/}
                  </div>
                )}
                
                {(plotAnalysis || selectedResult?.analysis) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Analysis</h4>
                    {plotAnalysis && (
                      <p className="text-sm text-gray-700">{plotAnalysis}</p>
                    )}
                    {selectedResult?.analysis && (
                      <p className="text-sm mt-2 text-gray-600">{null}</p>
                    )}
                  </div>
                )}
                
                {/* New visualizations for distance experiment */}
                {selectedExpId === 'effect-of-distance' && selectedResult?.data && selectedResult.data.length > 0 && (
                  <div className="mt-6 space-y-6">
                    <QBERDistanceVisualization 
                      data={selectedResult.data.map(item => ({
                        distance: Number(item.distance),
                        qber: Number(item.qber)
                      }))}
                      title="QBER vs Distance with Security Threshold"
                    />
                    
                    <NoiseDecompositionVisualization 
                      data={selectedResult.data.map(item => ({
                        distance: Number(item.distance),
                        eOpt: Number(item.intrinsicFloor || 1.5),      // Optical misalignment/intrinsic floor error
                        eDark: Number(item.darkCountContribution || 0), // Dark count contribution
                        totalQBER: Number(item.qber)
                      }))}
                      title="Noise Decomposition Analysis"
                    />
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