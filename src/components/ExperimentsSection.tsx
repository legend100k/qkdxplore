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
}

const experiments = [
  {
    id: "perfect-channel",
    name: "Perfect Channel",
    description: "Ideal conditions with no interference",
    icon: Shield,
    color: "green-500",
    parameters: {
      qubits: 20,
      noise: 0,
      eavesdropping: 0
    },
    statusColor: "green"
  },
  {
    id: "noisy-channel",
    name: "Noisy Channel", 
    description: "Channel with environmental noise",
    icon: Zap,
    color: "yellow-500",
    parameters: {
      qubits: 25,
      noise: 15,
      eavesdropping: 0
    },
    statusColor: "yellow"
  },
  {
    id: "eavesdropper-present",
    name: "Eavesdropper Present",
    description: "Clean channel but Eve is listening",
    icon: Eye,
    color: "red-500",
    parameters: {
      qubits: 30,
      noise: 0,
      eavesdropping: 25
    },
    statusColor: "red"
  },
  {
    id: "real-world-scenario",
    name: "Real World Scenario",
    description: "Both noise and potential eavesdropping",
    icon: BarChart3,
    color: "purple-500", 
    parameters: {
      qubits: 35,
      noise: 10,
      eavesdropping: 15
    },
    statusColor: "purple"
  }
];

export const ExperimentsSection = ({ onSaveExperiment }: { onSaveExperiment?: (result: ExperimentResult) => void }) => {
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ [key: string]: ExperimentResult }>({});
  const [currentBits, setCurrentBits] = useState<QuantumBit[]>([]);
  const [showBitsSimulation, setShowBitsSimulation] = useState(false);

  const runExperiment = async (experimentId: string) => {
    const experiment = experiments.find(e => e.id === experimentId);
    if (!experiment) return;

    setIsRunning(true);
    setProgress(0);
    setShowBitsSimulation(true);
    setCurrentBits([]);
    
    // Run single experiment with specified parameters
    setProgress(50);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = simulateBB84(
      experiment.parameters.qubits, 
      experiment.parameters.eavesdropping, 
      experiment.parameters.noise
    );
    
    setProgress(100);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const experimentData = [{
      qubits: experiment.parameters.qubits,
      noise: experiment.parameters.noise,
      eavesdropping: experiment.parameters.eavesdropping,
      errorRate: result.errorRate,
      keyRate: result.keyRate,
      keyLength: result.keyLength,
      basisMatchRate: result.basisMatchRate,
      securityLevel: result.errorRate < 10 ? "Secure" : "Compromised"
    }];

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

  const generateAnalysis = (experimentId: string, data: any[]) => {
    const result = data[0];
    switch (experimentId) {
      case "perfect-channel":
        return `Perfect channel conditions achieved ${result.keyLength} key bits with ${result.basisMatchRate.toFixed(1)}% basis matching. Error rate: ${result.errorRate.toFixed(2)}%. This represents optimal BB84 performance under ideal conditions.`;
      
      case "noisy-channel":
        return `Environmental noise (${result.noise}%) increased error rate to ${result.errorRate.toFixed(1)}%. Generated ${result.keyLength} key bits from ${result.qubits} qubits. Noise significantly impacts quantum channel fidelity.`;
      
      case "eavesdropper-present":
        return `Eavesdropping detected with ${result.eavesdropping}% interception rate. Error rate elevated to ${result.errorRate.toFixed(1)}%, indicating security compromise. ${result.keyLength} bits generated but channel integrity questioned.`;
      
      case "real-world-scenario":
        return `Real-world conditions with ${result.noise}% noise and ${result.eavesdropping}% eavesdropping show ${result.errorRate.toFixed(1)}% error rate. Generated ${result.keyLength} secure bits. Multi-factor degradation reflects practical deployment challenges.`;
      
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
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 flex items-center justify-center bg-primary/20 rounded text-xs">📊</div>
                          <span className="text-muted-foreground">Qubits: {experiment.parameters.qubits}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 flex items-center justify-center bg-primary/20 rounded text-xs">🌊</div>
                          <span className="text-muted-foreground">Noise: {experiment.parameters.noise}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 flex items-center justify-center bg-primary/20 rounded text-xs">👁</div>
                          <span className="text-muted-foreground">Eavesdropping: {experiment.parameters.eavesdropping}%</span>
                        </div>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          runExperiment(experiment.id);
                        }}
                        disabled={isRunning}
                        className={`w-full mt-4 bg-${experiment.statusColor}-500 hover:bg-${experiment.statusColor}-600 text-white`}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Run Experiment
                      </Button>
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
                          />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};