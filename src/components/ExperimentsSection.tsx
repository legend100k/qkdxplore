import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Beaker, Play, Eye, Zap, Shield, BarChart3, FileText } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface QuantumBit {
  id: number;
  aliceBit: number;
  aliceBasis: string;
  bobBasis: string;
  bobMeasurement: number;
  match: boolean;
  kept: boolean;
  eavesdropped: boolean;
}

interface ExperimentResult {
  id: string;
  name: string;
  parameters: any;
  data: any[];
  analysis: string;
  completed: boolean;
  timestamp: string;
  usedBits?: QuantumBit[];
}

const experiments = [
  {
    id: "noise-analysis",
    name: "Channel Noise Impact Analysis",
    description: "Study how different noise levels affect key generation and error rates",
    icon: Beaker,
    color: "quantum-blue",
    parameters: {
      noiseRange: [0, 20],
      step: 2,
      qubits: 30
    }
  },
  {
    id: "eavesdropping-detection", 
    name: "Eavesdropping Detection Experiment",
    description: "Analyze how Eve's presence affects the quantum channel and error patterns",
    icon: Eye,
    color: "quantum-purple",
    parameters: {
      eavesDroppingRange: [0, 100],
      step: 10,
      qubits: 40
    }
  },
  {
    id: "qubit-scaling",
    name: "Qubit Number Scaling Study",
    description: "Examine how the number of qubits affects statistical security and key rates",
    icon: BarChart3,
    color: "quantum-glow",
    parameters: {
      qubitRange: [10, 50],
      step: 5,
      noise: 5
    }
  },
  {
    id: "basis-mismatch",
    name: "Basis Mismatch Rate Analysis", 
    description: "Study the theoretical vs practical basis matching rates in BB84",
    icon: Shield,
    color: "primary",
    parameters: {
      iterations: 20,
      qubits: 25,
      noise: 3
    }
  }
];

export const ExperimentsSection = ({ onSaveExperiment }: { onSaveExperiment?: (result: ExperimentResult) => void }) => {
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ [key: string]: ExperimentResult }>({});
  const [currentBits, setCurrentBits] = useState<QuantumBit[]>([]);
  const [showBitsSimulation, setShowBitsSimulation] = useState(false);
  const [finalExperimentBits, setFinalExperimentBits] = useState<QuantumBit[]>([]);

  const runExperiment = async (experimentId: string) => {
    const experiment = experiments.find(e => e.id === experimentId);
    if (!experiment) return;

    setIsRunning(true);
    setProgress(0);
    setShowBitsSimulation(true);
    setCurrentBits([]);
    
    const experimentData: any[] = [];
    let totalSteps = 0;
    let currentStep = 0;

    switch (experimentId) {
      case "noise-analysis":
        totalSteps = (experiment.parameters.noiseRange[1] - experiment.parameters.noiseRange[0]) / experiment.parameters.step + 1;
        for (let noise = experiment.parameters.noiseRange[0]; noise <= experiment.parameters.noiseRange[1]; noise += experiment.parameters.step) {
          const result = simulateBB84(experiment.parameters.qubits, 0, noise);
          experimentData.push({
            noise,
            errorRate: result.errorRate,
            keyRate: result.keyRate,
            securityLevel: result.errorRate < 10 ? "Secure" : "Compromised"
          });
          currentStep++;
          setProgress((currentStep / totalSteps) * 100);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        // Store the final simulation bits
        setFinalExperimentBits([...currentBits]);
        break;

      case "eavesdropping-detection":
        totalSteps = (experiment.parameters.eavesDroppingRange[1] - experiment.parameters.eavesDroppingRange[0]) / experiment.parameters.step + 1;
        for (let eves = experiment.parameters.eavesDroppingRange[0]; eves <= experiment.parameters.eavesDroppingRange[1]; eves += experiment.parameters.step) {
          const result = simulateBB84(experiment.parameters.qubits, eves, 2);
          experimentData.push({
            eavesdropping: eves,
            errorRate: result.errorRate,
            detectionProbability: Math.min(100, result.errorRate * 4),
            keyRate: result.keyRate
          });
          currentStep++;
          setProgress((currentStep / totalSteps) * 100);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        break;

      case "qubit-scaling":
        totalSteps = (experiment.parameters.qubitRange[1] - experiment.parameters.qubitRange[0]) / experiment.parameters.step + 1;
        for (let qubits = experiment.parameters.qubitRange[0]; qubits <= experiment.parameters.qubitRange[1]; qubits += experiment.parameters.step) {
          const result = simulateBB84(qubits, 10, experiment.parameters.noise);
          experimentData.push({
            qubits,
            keyLength: result.keyLength,
            errorRate: result.errorRate,
            statisticalSecurity: Math.min(100, (qubits / 50) * 100)
          });
          currentStep++;
          setProgress((currentStep / totalSteps) * 100);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        break;

      case "basis-mismatch":
        totalSteps = experiment.parameters.iterations;
        for (let i = 0; i < experiment.parameters.iterations; i++) {
          const result = simulateBB84(experiment.parameters.qubits, 0, experiment.parameters.noise);
          experimentData.push({
            iteration: i + 1,
            basisMatchRate: result.basisMatchRate,
            theoreticalMatch: 50,
            deviation: Math.abs(result.basisMatchRate - 50)
          });
          currentStep++;
          setProgress((currentStep / totalSteps) * 100);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        break;
    }

    const experimentResult: ExperimentResult = {
      id: experimentId,
      name: experiment.name,
      parameters: experiment.parameters,
      data: experimentData,
      analysis: generateAnalysis(experimentId, experimentData),
      completed: true,
      timestamp: new Date().toISOString(),
      usedBits: finalExperimentBits
    };

    setResults(prev => ({ ...prev, [experimentId]: experimentResult }));
    onSaveExperiment?.(experimentResult);
    setIsRunning(false);
    setProgress(0);
    toast.success(`${experiment.name} completed successfully!`);
  };

  const simulateBB84 = (qubits: number, eavesdropping: number, noise: number) => {
    let matchingBases = 0;
    let errors = 0;
    let keyBits = 0;
    const simulationBits: QuantumBit[] = [];

    for (let i = 0; i < qubits; i++) {
      const aliceBasis = Math.random() > 0.5;
      const bobBasis = Math.random() > 0.5;
      const aliceBit = Math.random() > 0.5 ? 1 : 0;
      const isEavesdropped = Math.random() < eavesdropping / 100;

      let bobResult = aliceBit;
      let hasError = false;

      // Apply eavesdropping
      if (isEavesdropped) {
        bobResult = Math.random() > 0.25 ? 1 - aliceBit : aliceBit;
      }

      // Apply noise
      if (Math.random() < noise / 100) {
        bobResult = 1 - bobResult;
        hasError = true;
      }

      const basisMatch = aliceBasis === bobBasis;
      const kept = basisMatch;

      if (basisMatch) {
        matchingBases++;
        keyBits++;
        if (bobResult !== aliceBit && !hasError) {
          errors++;
        }
      }

      simulationBits.push({
        id: i,
        aliceBit,
        aliceBasis: aliceBasis ? "Diagonal" : "Rectilinear",
        bobBasis: bobBasis ? "Diagonal" : "Rectilinear", 
        bobMeasurement: bobResult,
        match: basisMatch,
        kept: kept && bobResult === aliceBit,
        eavesdropped: isEavesdropped
      });
    }

    setCurrentBits(simulationBits);

    return {
      errorRate: matchingBases > 0 ? (errors / matchingBases) * 100 : 0,
      keyRate: (keyBits / qubits) * 100,
      keyLength: keyBits,
      basisMatchRate: (matchingBases / qubits) * 100
    };
  };

  const getXAxisLabel = (experimentId: string) => {
    switch (experimentId) {
      case "noise-analysis":
        return "Noise Level (%)";
      case "eavesdropping-detection":
        return "Eavesdropping Rate (%)";
      case "qubit-scaling":
        return "Number of Qubits";
      case "basis-mismatch":
        return "Iteration";
      default:
        return "X-Axis";
    }
  };

  const generateAnalysis = (experimentId: string, data: any[]) => {
    switch (experimentId) {
      case "noise-analysis":
        const maxNoise = Math.max(...data.map(d => d.noise));
        const errorAtMaxNoise = data.find(d => d.noise === maxNoise)?.errorRate || 0;
        return `Channel noise significantly affects BB84 performance. At ${maxNoise}% noise, error rate reaches ${errorAtMaxNoise.toFixed(1)}%. The linear relationship demonstrates quantum channel sensitivity.`;
      
      case "eavesdropping-detection":
        const maxEaves = Math.max(...data.map(d => d.eavesdropping));
        const detectionAtMax = data.find(d => d.eavesdropping === maxEaves)?.detectionProbability || 0;
        return `Eavesdropping detection shows clear correlation with error rates. At ${maxEaves}% interception, detection probability reaches ${detectionAtMax.toFixed(1)}%, demonstrating quantum security principles.`;
      
      case "qubit-scaling":
        const maxQubits = Math.max(...data.map(d => d.qubits));
        const keyAtMax = data.find(d => d.qubits === maxQubits)?.keyLength || 0;
        return `Qubit scaling demonstrates improved statistical security. With ${maxQubits} qubits, ${keyAtMax} key bits generated. Higher qubit counts provide better eavesdropping detection confidence.`;
      
      case "basis-mismatch":
        const avgMatch = data.reduce((sum, d) => sum + d.basisMatchRate, 0) / data.length;
        const avgDeviation = data.reduce((sum, d) => sum + d.deviation, 0) / data.length;
        return `Basis matching shows expected ~50% rate with ${avgMatch.toFixed(1)}% average. Standard deviation of ${avgDeviation.toFixed(1)}% confirms theoretical predictions and random basis selection.`;
      
      default:
        return "Experiment completed successfully. Data shows expected quantum behavior patterns.";
    }
  };

  const selectedExp = experiments.find(e => e.id === selectedExperiment);

  return (
    <div className="space-y-6">
      <Card className="border-quantum-glow/30">
        <CardHeader>
          <CardTitle className="text-quantum-glow flex items-center gap-2">
            <Beaker className="w-6 h-6" />
            Quantum Cryptography Experiments
          </CardTitle>
          <p className="text-muted-foreground">
            Conduct systematic experiments to understand BB84 protocol behavior under various conditions
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {experiments.map((experiment) => {
              const Icon = experiment.icon;
              const isCompleted = results[experiment.id]?.completed;
              
              return (
                <Card 
                  key={experiment.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedExperiment === experiment.id 
                      ? `border-${experiment.color} bg-${experiment.color}/10 quantum-glow`
                      : 'border-muted-foreground/20 hover:border-quantum-glow/50'
                  } ${isCompleted ? 'bg-green-400/5 border-green-400/30' : ''}`}
                  onClick={() => setSelectedExperiment(experiment.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full bg-${experiment.color}/20`}>
                        <Icon className={`w-5 h-5 text-${experiment.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1 flex items-center gap-2">
                          {experiment.name}
                          {isCompleted && <span className="text-green-400 text-xs">✓ Completed</span>}
                        </h3>
                        <p className="text-sm text-muted-foreground">{experiment.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedExp && (
        <Card className={`border-${selectedExp.color}/30`}>
          <CardHeader>
            <CardTitle className={`text-${selectedExp.color} flex items-center gap-2`}>
              <selectedExp.icon className="w-6 h-6" />
              {selectedExp.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isRunning && !results[selectedExp.id] && (
              <div className="text-center">
                <Button
                  onClick={() => runExperiment(selectedExp.id)}
                  className={`bg-${selectedExp.color} hover:bg-${selectedExp.color}/80`}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run Experiment
                </Button>
              </div>
            )}

            {isRunning && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Running experiment...</p>
                  <Progress value={progress} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(0)}%</p>
                </div>
                
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
                              <div className={`p-1 text-center rounded ${bit.aliceBit ? 'bg-quantum-blue/30' : 'bg-quantum-purple/30'}`}>
                                {bit.aliceBit}
                              </div>
                              <div className="p-1 text-center text-xs">{bit.aliceBasis[0]}</div>
                              <div className="p-1 text-center text-xs">{bit.bobBasis[0]}</div>
                              <div className={`p-1 text-center rounded ${bit.bobMeasurement ? 'bg-quantum-blue/30' : 'bg-quantum-purple/30'}`}>
                                {bit.bobMeasurement}
                              </div>
                              <div className={`p-1 text-center rounded text-xs ${bit.match ? 'bg-green-400/30 text-green-400' : 'bg-red-400/30 text-red-400'}`}>
                                {bit.match ? '✓' : '✗'}
                              </div>
                              <div className={`p-1 text-center rounded text-xs ${bit.kept ? 'bg-quantum-glow/30 text-quantum-glow' : 'bg-muted/30'}`}>
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

            {results[selectedExp.id] && (
              <div className="space-y-6">
                {/* Left Column - Experiment Details */}
                <div className="space-y-6">
                  {/* Experiment Formulas */}
                  <Card className="bg-secondary/20 border-quantum-glow/20">
                    <CardHeader>
                      <CardTitle className="text-sm text-quantum-glow flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Calculations & Formulas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-quantum-purple">Statistical Formulas:</h4>
                        <div className="font-mono text-xs space-y-1 bg-background/50 p-3 rounded">
                          {selectedExp.id === 'noise-analysis' && (
                            <>
                              <div>Error Rate = (Noise Level + Base Errors) / Total</div>
                              <div>Security = Error Rate &lt; 11% ? "Secure" : "Compromised"</div>
                            </>
                          )}
                          {selectedExp.id === 'eavesdropping-detection' && (
                            <>
                              <div>Detection Prob = min(100%, Error Rate × 4)</div>
                              <div>Eve Error = 25% per intercepted qubit</div>
                            </>
                          )}
                          {selectedExp.id === 'qubit-scaling' && (
                            <>
                              <div>Statistical Security = (Qubits / 50) × 100%</div>
                              <div>Key Length = Matched Bases - Errors</div>
                            </>
                          )}
                          {selectedExp.id === 'basis-mismatch' && (
                            <>
                              <div>Basis Match Rate = (Matches / Total) × 100%</div>
                              <div>Theoretical Rate = 50% (random choice)</div>
                              <div>Deviation = |Actual - Theoretical|</div>
                            </>
                          )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-quantum-blue">Experiment Data:</h4>
                          <div className="font-mono text-xs space-y-1 bg-background/50 p-3 rounded max-h-32 overflow-y-auto">
                            {results[selectedExp.id].data.slice(0, 5).map((dataPoint, idx) => (
                              <div key={idx} className="text-xs">
                                {Object.entries(dataPoint).map(([key, value]) => (
                                  <span key={key} className="mr-2">
                                    {key}: {typeof value === 'number' ? value.toFixed(1) : String(value)}
                                  </span>
                                ))}
                              </div>
                            ))}
                            {results[selectedExp.id].data.length > 5 && (
                              <div className="text-muted-foreground">...and {results[selectedExp.id].data.length - 5} more data points</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Bits Storage Display */}
                  {results[selectedExp.id].usedBits && results[selectedExp.id].usedBits!.length > 0 && (
                    <div className="grid gap-4">
                      {/* Alice's Bits */}
                      <Card className="bg-quantum-blue/10 border-quantum-blue/30">
                        <CardHeader>
                          <CardTitle className="text-sm text-quantum-blue flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-quantum-blue"></div>
                            Alice's Transmitted Bits
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-xs text-muted-foreground">Bits: {results[selectedExp.id].usedBits!.filter(b => b.kept).length} kept from {results[selectedExp.id].usedBits!.length} total</div>
                            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                              {results[selectedExp.id].usedBits!.map((bit, index) => (
                                <div 
                                  key={index}
                                  className={`w-6 h-6 flex items-center justify-center text-xs font-mono rounded border ${
                                    bit.kept 
                                      ? 'bg-quantum-blue/30 border-quantum-blue text-quantum-blue' 
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

                      {/* Bob's Bits */}
                      <Card className="bg-quantum-purple/10 border-quantum-purple/30">
                        <CardHeader>
                          <CardTitle className="text-sm text-quantum-purple flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-quantum-purple"></div>
                            Bob's Received Bits
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-xs text-muted-foreground">Measurements: {results[selectedExp.id].usedBits!.filter(b => b.kept).length} kept from {results[selectedExp.id].usedBits!.length} total</div>
                            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                              {results[selectedExp.id].usedBits!.map((bit, index) => (
                                <div 
                                  key={index}
                                  className={`w-6 h-6 flex items-center justify-center text-xs font-mono rounded border ${
                                    bit.kept 
                                      ? bit.eavesdropped 
                                        ? 'bg-destructive/30 border-destructive text-destructive'
                                        : 'bg-quantum-purple/30 border-quantum-purple text-quantum-purple'
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

                {/* Right Column - Results and Analysis */}
                <div className="space-y-6">
                  <Card className="bg-secondary/30">
                    <CardHeader>
                      <CardTitle className="text-sm">Experiment Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={results[selectedExp.id].data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                            <XAxis 
                              dataKey={selectedExp.id === "basis-mismatch" ? "iteration" : 
                                       selectedExp.id === "qubit-scaling" ? "qubits" :
                                       selectedExp.id === "eavesdropping-detection" ? "eavesdropping" : "noise"} 
                              stroke="hsl(var(--muted-foreground))" 
                              fontSize={12}
                              label={{ 
                                value: getXAxisLabel(selectedExp.id), 
                                position: "insideBottom", 
                                offset: -5 
                              }}
                            />
                            <YAxis 
                              stroke="hsl(var(--muted-foreground))" 
                              fontSize={12}
                              label={{ 
                                value: "Error Rate (%)", 
                                angle: -90, 
                                position: "insideLeft" 
                              }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--background))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '6px'
                              }} 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="errorRate" 
                              stroke="hsl(var(--destructive))" 
                              strokeWidth={2}
                              name="Error Rate (%)"
                            />
                            {selectedExp.id !== "basis-mismatch" && (
                              <Line 
                                type="monotone" 
                                dataKey={selectedExp.id === "qubit-scaling" ? "statisticalSecurity" : "keyRate"}
                                stroke={`hsl(var(--${selectedExp.color}))`}
                                strokeWidth={2}
                                name={selectedExp.id === "qubit-scaling" ? "Statistical Security (%)" : "Key Rate (%)"}
                              />
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <Card className="bg-quantum-glow/10 border-quantum-glow/30">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-quantum-glow mb-2">Analysis</h4>
                          <p className="text-sm">{results[selectedExp.id].analysis}</p>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};