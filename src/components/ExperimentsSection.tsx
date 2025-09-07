import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Beaker, Play, Eye, Zap, Shield, BarChart3, FileText, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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
}

const experiments = [
  {
    id: "noise-analysis",
    name: "Noise Impact Analysis",
    description: "Analyze how channel noise affects protocol performance",
    icon: Zap,
    color: "yellow-500",
    parameters: {
      qubits: 30,
      noiseRange: [0, 20],
      noiseStep: 2,
      eavesdropping: 0
    },
    statusColor: "yellow"
  },
  {
    id: "eavesdropping-detection",
    name: "Eavesdropping Detection",
    description: "Study how eavesdropping affects error rates",
    icon: Eye,
    color: "red-500",
    parameters: {
      qubits: 30,
      eavesdroppingRange: [0, 30],
      eavesdroppingStep: 3,
      noise: 0
    },
    statusColor: "red"
  },
  {
    id: "qubit-scaling",
    name: "Qubit Scaling Analysis",
    description: "Examine how key length scales with qubit count",
    icon: BarChart3,
    color: "purple-500", 
    parameters: {
      qubitRange: [10, 50],
      qubitStep: 5,
      noise: 5,
      eavesdropping: 0
    },
    statusColor: "purple"
  },
  {
    id: "real-world-comparison",
    name: "Real World Comparison",
    description: "Compare various real-world conditions",
    icon: Shield,
    color: "green-500",
    parameters: {
      qubits: 30,
      conditions: [
        { name: "Ideal", noise: 0, eavesdropping: 0 },
        { name: "Low Noise", noise: 5, eavesdropping: 0 },
        { name: "Medium Noise", noise: 10, eavesdropping: 0 },
        { name: "High Noise", noise: 15, eavesdropping: 0 },
        { name: "Eavesdropping", noise: 0, eavesdropping: 10 },
        { name: "Noise + Eavesdropping", noise: 10, eavesdropping: 10 }
      ]
    },
    statusColor: "green"
  }
];

export const ExperimentsSection = ({ onSaveExperiment }: { onSaveExperiment?: (result: ExperimentResult) => void }) => {
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ [key: string]: ExperimentResult }>({});
  const [currentBits, setCurrentBits] = useState<QuantumBit[]>([]);
  const [showBitsSimulation, setShowBitsSimulation] = useState(false);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [totalIterations, setTotalIterations] = useState(0);

  const runExperiment = async (experimentId: string) => {
    const experiment = experiments.find(e => e.id === experimentId);
    if (!experiment) return;

    setIsRunning(true);
    setProgress(0);
    setShowBitsSimulation(true);
    setCurrentBits([]);
    setCurrentIteration(0);
    
    let experimentData: any[] = [];
    
    if (experimentId === "noise-analysis") {
      const { qubits, noiseRange, noiseStep, eavesdropping } = experiment.parameters;
      const [minNoise, maxNoise] = noiseRange;
      const iterations = Math.floor((maxNoise - minNoise) / noiseStep) + 1;
      setTotalIterations(iterations);
      
      for (let i = 0; i <= iterations; i++) {
        const noise = minNoise + i * noiseStep;
        setProgress((i / iterations) * 100);
        setCurrentIteration(i + 1);
        
        const result = simulateBB84(qubits, eavesdropping, noise);
        experimentData.push({
          noise,
          errorRate: result.errorRate,
          keyRate: result.keyRate,
          keyLength: result.keyLength,
          basisMatchRate: result.basisMatchRate
        });
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } else if (experimentId === "eavesdropping-detection") {
      const { qubits, eavesdroppingRange, eavesdroppingStep, noise } = experiment.parameters;
      const [minEavesdropping, maxEavesdropping] = eavesdroppingRange;
      const iterations = Math.floor((maxEavesdropping - minEavesdropping) / eavesdroppingStep) + 1;
      setTotalIterations(iterations);
      
      for (let i = 0; i <= iterations; i++) {
        const eavesdropping = minEavesdropping + i * eavesdroppingStep;
        setProgress((i / iterations) * 100);
        setCurrentIteration(i + 1);
        
        const result = simulateBB84(qubits, eavesdropping, noise);
        experimentData.push({
          eavesdropping,
          errorRate: result.errorRate,
          keyRate: result.keyRate,
          keyLength: result.keyLength,
          basisMatchRate: result.basisMatchRate
        });
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } else if (experimentId === "qubit-scaling") {
      const { qubitRange, qubitStep, noise, eavesdropping } = experiment.parameters;
      const [minQubits, maxQubits] = qubitRange;
      const iterations = Math.floor((maxQubits - minQubits) / qubitStep) + 1;
      setTotalIterations(iterations);
      
      for (let i = 0; i <= iterations; i++) {
        const qubits = minQubits + i * qubitStep;
        setProgress((i / iterations) * 100);
        setCurrentIteration(i + 1);
        
        const result = simulateBB84(qubits, eavesdropping, noise);
        experimentData.push({
          qubits,
          errorRate: result.errorRate,
          keyRate: result.keyRate,
          keyLength: result.keyLength,
          basisMatchRate: result.basisMatchRate
        });
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } else if (experimentId === "real-world-comparison") {
      const { qubits, conditions } = experiment.parameters;
      setTotalIterations(conditions.length);
      
      for (let i = 0; i < conditions.length; i++) {
        const condition = conditions[i];
        setProgress(((i + 1) / conditions.length) * 100);
        setCurrentIteration(i + 1);
        
        const result = simulateBB84(qubits, condition.eavesdropping, condition.noise);
        experimentData.push({
          condition: condition.name,
          noise: condition.noise,
          eavesdropping: condition.eavesdropping,
          errorRate: result.errorRate,
          keyRate: result.keyRate,
          keyLength: result.keyLength,
          basisMatchRate: result.basisMatchRate
        });
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // For demo purposes, show the last simulation bits
    if (experimentData.length > 0) {
      const lastData = experimentData[experimentData.length - 1];
      const result = simulateBB84(
        experiment.parameters.qubits || lastData.qubits || 30,
        experiment.parameters.eavesdropping || lastData.eavesdropping || 0,
        experiment.parameters.noise || lastData.noise || 0
      );
      setCurrentBits(result.simulationBits);
    }
    
    const experimentResult: ExperimentResult = {
      id: experimentId,
      name: experiment.name,
      parameters: experiment.parameters,
      data: experimentData,
      analysis: generateAnalysis(experimentId, experimentData),
      completed: true,
      timestamp: new Date().toISOString()
    };

    setResults(prev => ({ ...prev, [experimentId]: experimentResult }));
    onSaveExperiment?.(experimentResult);
    setIsRunning(false);
    setProgress(100);
    setCurrentIteration(totalIterations);
    toast.success(`${experiment.name} completed successfully with ${experimentData.length} iterations!`);
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

      // Apply eavesdropping
      if (isEavesdropped) {
        // Eve measures the photon and randomly changes the bit with 75% probability
        if (Math.random() < 0.75) {
          bobResult = 1 - bobResult;
        }
      }

      // Apply noise
      if (Math.random() < noise / 100) {
        bobResult = 1 - bobResult;
      }

      const basisMatch = aliceBasis === bobBasis;
      const kept = basisMatch && bobResult === aliceBit;

      if (basisMatch) {
        matchingBases++;
        if (kept) {
          keyBits++;
        } else {
          errors++;
        }
      }

      // Only store first 20 bits for display
      if (i < 20) {
        simulationBits.push({
          id: i,
          aliceBit,
          aliceBasis: aliceBasis ? "Diagonal" : "Rectilinear",
          bobBasis: bobBasis ? "Diagonal" : "Rectilinear", 
          bobMeasurement: bobResult,
          match: basisMatch,
          kept,
          eavesdropped: isEavesdropped
        });
      }
    }

    return {
      errorRate: matchingBases > 0 ? (errors / matchingBases) * 100 : 0,
      keyRate: (keyBits / qubits) * 100,
      keyLength: keyBits,
      basisMatchRate: (matchingBases / qubits) * 100,
      simulationBits
    };
  };

  const generateAnalysis = (experimentId: string, data: any[]) => {
    switch (experimentId) {
      case "noise-analysis":
        return `Noise analysis shows a linear relationship between channel noise and error rate. As noise increases from ${data[0].noise}% to ${data[data.length-1].noise}%, the error rate increases from ${data[0].errorRate.toFixed(2)}% to ${data[data.length-1].errorRate.toFixed(2)}%. Key generation rate decreases from ${data[0].keyRate.toFixed(2)}% to ${data[data.length-1].keyRate.toFixed(2)}%. This demonstrates the sensitivity of quantum key distribution to environmental noise.`;
      
      case "eavesdropping-detection":
        return `Eavesdropping detection experiment shows that interception significantly increases error rates. With ${data[0].eavesdropping}% eavesdropping, error rate is ${data[0].errorRate.toFixed(2)}%, increasing to ${data[data.length-1].errorRate.toFixed(2)}% at ${data[data.length-1].eavesdropping}% interception. This validates the fundamental principle of quantum cryptography: any eavesdropping attempt introduces detectable errors.`;
      
      case "qubit-scaling":
        return `Qubit scaling analysis demonstrates that larger key sizes improve statistical security. With ${data[0].qubits} qubits, ${data[0].keyLength} bits were generated (${data[0].keyRate.toFixed(2)}% efficiency). With ${data[data.length-1].qubits} qubits, ${data[data.length-1].keyLength} bits were generated (${data[data.length-1].keyRate.toFixed(2)}% efficiency). Larger qubit counts provide better security through statistical confidence.`;
      
      case "real-world-comparison":
        return `Real-world comparison shows that noise has a more significant impact on performance than eavesdropping at equivalent levels. Ideal conditions yield near-zero error rates, while 15% noise increases error rate to ~15%. Eavesdropping at 10% causes ~7.5% error rate. Combined noise and eavesdropping show additive effects, demonstrating practical implementation challenges.`;
      
      default:
        return "Experiment completed successfully. Data shows expected quantum behavior patterns.";
    }
  };

  const resetExperiment = (experimentId: string) => {
    setResults(prev => {
      const newResults = { ...prev };
      delete newResults[experimentId];
      return newResults;
    });
  };

  const renderExperimentChart = (data: any[], experimentId: string) => {
    // Determine chart configuration based on experiment type
    let xAxisKey, series1, series2;
    if (experimentId === "noise-analysis") {
      xAxisKey = "noise";
      series1 = "errorRate";
      series2 = "keyRate";
    } else if (experimentId === "eavesdropping-detection") {
      xAxisKey = "eavesdropping";
      series1 = "errorRate";
      series2 = "keyRate";
    } else if (experimentId === "qubit-scaling") {
      xAxisKey = "qubits";
      series1 = "errorRate";
      series2 = "keyRate";
    } else if (experimentId === "real-world-comparison") {
      xAxisKey = "condition";
      series1 = "errorRate";
      series2 = "keyRate";
    } else {
      // Default case
      xAxisKey = Object.keys(data[0] || {})[0];
      series1 = Object.keys(data[0] || {})[1];
      series2 = Object.keys(data[0] || {})[2];
    }

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
            <XAxis 
              dataKey={xAxisKey}
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
            />
            <YAxis 
              yAxisId="left" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="hsl(var(--quantum-glow))" 
              fontSize={12} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }} 
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey={series1} 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              name={series1 === "errorRate" ? "Error Rate (%)" : series1 === "keyRate" ? "Key Rate (%)" : series1}
              activeDot={{ r: 8 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey={series2} 
              stroke="hsl(var(--quantum-glow))" 
              strokeWidth={2}
              name={series2 === "keyRate" ? "Key Rate (%)" : series2 === "keyLength" ? "Key Length" : series2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
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
          <div className="grid md:grid-cols-2 gap-4">
            {experiments.map((experiment) => {
              const Icon = experiment.icon;
              const isCompleted = results[experiment.id]?.completed;
              
              return (
                <Card 
                  key={experiment.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedExperiment === experiment.id 
                      ? `border-${experiment.statusColor}-400/50 bg-${experiment.statusColor}-400/10 shadow-${experiment.statusColor}-400/20`
                      : 'border-muted-foreground/20 hover:border-quantum-glow/50'
                  } ${isCompleted ? 'bg-green-400/5 border-green-400/30' : ''}`}
                  onClick={() => setSelectedExperiment(experiment.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-3 h-3 rounded-full bg-${experiment.statusColor}-400`}></div>
                      <div className={`p-2 rounded-lg bg-${experiment.statusColor}-400/20`}>
                        <Icon className={`w-6 h-6 text-${experiment.statusColor}-400`} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                          {experiment.name}
                          {isCompleted && <span className="text-green-400 text-xs">✓ Completed</span>}
                        </h3>
                        <p className="text-sm text-muted-foreground">{experiment.description}</p>
                      </div>
                      <div className="space-y-2 text-sm">
                        {experiment.id === "noise-analysis" && (
                          <>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 flex items-center justify-center bg-primary/20 rounded text-xs">📊</div>
                              <span className="text-muted-foreground">Qubits: {experiment.parameters.qubits}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 flex items-center justify-center bg-primary/20 rounded text-xs">🌊</div>
                              <span className="text-muted-foreground">Noise: {experiment.parameters.noiseRange[0]}% to {experiment.parameters.noiseRange[1]}%</span>
                            </div>
                          </>
                        )}
                        {experiment.id === "eavesdropping-detection" && (
                          <>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 flex items-center justify-center bg-primary/20 rounded text-xs">📊</div>
                              <span className="text-muted-foreground">Qubits: {experiment.parameters.qubits}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 flex items-center justify-center bg-primary/20 rounded text-xs">👁</div>
                              <span className="text-muted-foreground">Eavesdropping: {experiment.parameters.eavesdroppingRange[0]}% to {experiment.parameters.eavesdroppingRange[1]}%</span>
                            </div>
                          </>
                        )}
                        {experiment.id === "qubit-scaling" && (
                          <>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 flex items-center justify-center bg-primary/20 rounded text-xs">📊</div>
                              <span className="text-muted-foreground">Qubits: {experiment.parameters.qubitRange[0]} to {experiment.parameters.qubitRange[1]}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 flex items-center justify-center bg-primary/20 rounded text-xs">🌊</div>
                              <span className="text-muted-foreground">Noise: {experiment.parameters.noise}%</span>
                            </div>
                          </>
                        )}
                        {experiment.id === "real-world-comparison" && (
                          <>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 flex items-center justify-center bg-primary/20 rounded text-xs">📊</div>
                              <span className="text-muted-foreground">Conditions: {experiment.parameters.conditions.length}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 flex items-center justify-center bg-primary/20 rounded text-xs">🔍</div>
                              <span className="text-muted-foreground">Qubits: {experiment.parameters.qubits}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            runExperiment(experiment.id);
                          }}
                          disabled={isRunning}
                          className={`flex-1 bg-${experiment.statusColor}-500 hover:bg-${experiment.statusColor}-600 text-white`}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Run Experiment
                        </Button>
                        {isCompleted && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              resetExperiment(experiment.id);
                            }}
                            variant="outline"
                            size="icon"
                            className="border-quantum-purple/50 hover:bg-quantum-purple/10"
                          >
                            <RotateCw className="w-4 h-4" />
                          </Button>
                        )}
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
                  <p className="text-sm text-muted-foreground">
                    Running experiment... Iteration {currentIteration} of {totalIterations}
                  </p>
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
                          
                          {currentBits.map((bit) => (
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
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {results[selectedExp.id] && (
              <div className="space-y-6">
                <Card className="bg-secondary/30">
                  <CardHeader>
                    <CardTitle className="text-sm">Experiment Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 mb-4">
                      {renderExperimentChart(results[selectedExp.id].data, selectedExp.id)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {results[selectedExp.id].data.slice(0, 4).map((dataPoint, index) => (
                        <Card key={index} className="bg-background/50">
                          <CardContent className="p-3">
                            <div className="text-center">
                              <div className="font-semibold text-sm">
                                {selectedExp.id === "noise-analysis" ? `Noise: ${dataPoint.noise}%` :
                                 selectedExp.id === "eavesdropping-detection" ? `Eavesdropping: ${dataPoint.eavesdropping}%` :
                                 selectedExp.id === "qubit-scaling" ? `Qubits: ${dataPoint.qubits}` :
                                 dataPoint.condition}
                              </div>
                              <div className="flex justify-between text-xs mt-1">
                                <span className="text-destructive">Error: {dataPoint.errorRate.toFixed(2)}%</span>
                                <span className="text-quantum-glow">Key: {dataPoint.keyRate.toFixed(2)}%</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
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
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};