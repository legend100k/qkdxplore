import React, { useState } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { ExperimentResult, ExperimentComponentProps } from "../common/types";
import { simulateBB84, generateAnalysis } from "../common/utils";
import { ExperimentUI } from "../common/ExperimentUI";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const OverallAnalysisExperiment: React.FC<ExperimentComponentProps> = ({ onSaveExperiment }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [photonPosition, setPhotonPosition] = useState(0);
  const [results, setResults] = useState<{ [key: string]: ExperimentResult }>({});
  const [currentBits, setCurrentBits] = useState<any[]>([]);
  const [showBitsSimulation, setShowBitsSimulation] = useState(false);
  const [finalExperimentBits, setFinalExperimentBits] = useState<any[]>([]);
  
  // State for experiment parameters
  const [qubits, setQubits] = useState(50);
  const [noise, setNoise] = useState(5);
  const [numEves, setNumEves] = useState(2);

  const runExperiment = async () => {
    setIsRunning(true);
    setProgress(0);
    setPhotonPosition(0);
    setShowBitsSimulation(true);
    setCurrentBits([]);
    
    const experimentData: Record<string, unknown>[] = [];
    let totalSteps = 0;
    let currentStep = 0;

    // Animate photon during experiment
    const animatePhoton = async () => {
      while (isRunning) {
        setPhotonPosition(prev => (prev >= 100 ? 0 : prev + 2));
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    };

    // Start photon animation
    animatePhoton();

    // Instead of simulating individual bits, we'll run multiple simulations to get proper QBER values
    // Each simulation will represent an accumulated QBER over a set of bits
    
    // Run multiple iterations to get meaningful QBER data
    totalSteps = qubits; // Total number of data points to generate
    
    for (let i = 0; i < totalSteps; i++) {
      // Calculate varying eavesdropping effect based on numEves
      const eavesdroppingEffect = (numEves / 5) * 30; // Max 30% error from eavesdropping
      const baseNoise = noise;
      
      // Simulate with increasing complexity per point
      const eavesdropping = Math.min(100, eavesdroppingEffect + Math.random() * 5); // Varying eavesdropping
      const currentNoise = baseNoise + (i * 0.1); // Slightly increasing noise per step
      
      // Run simulation with the parameters
      const result = simulateBB84(10, eavesdropping, currentNoise); // Using 10 qubits to get stable QBER
      
      // Calculate QBER as error rate
      const calculatedQBER = result.errorRate || 0;
      
      experimentData.push({
        bit: i + 1,
        qber: result.errorRate,  // Already correctly stored as qber
        errorRate: result.errorRate, // Also include errorRate for compatibility
        noise: currentNoise,
        eavesdropping,
        numEves
      });
      
      currentStep++;
      setProgress((currentStep / totalSteps) * 100);
      await new Promise(resolve => setTimeout(resolve, 50)); // Faster for more points
    }

    const experimentResult: ExperimentResult = {
      id: "overall",
      name: "Overall Analysis",
      parameters: { qubits, noise, numEves },
      data: experimentData,
      analysis: generateAnalysis("overall", experimentData),
      completed: true,
      timestamp: new Date().toISOString(),
      usedBits: finalExperimentBits
    };

    setResults(prev => ({ ...prev, "overall": experimentResult }));
    onSaveExperiment?.(experimentResult);
    setIsRunning(false);
    setPhotonPosition(0);
    setProgress(0);
    toast.success("Overall Analysis experiment completed successfully!");
  };

  const experimentResult = results["overall"];

  // Parameter controls JSX
  const parameterControls = (
    <Card className="border-secondary/30 p-4">
      <CardContent className="space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="num-qubits">Number of Qubits: {qubits}</Label>
            <Slider
              id="num-qubits"
              min={10}
              max={200}
              value={[qubits]}
              onValueChange={(value) => setQubits(value[0])}
              disabled={isRunning}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="noise">Noise Level: {noise}%</Label>
            <Slider
              id="noise"
              min={0}
              max={20}
              value={[noise]}
              onValueChange={(value) => setNoise(value[0])}
              disabled={isRunning}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="num-eves">Number of Eavesdroppers: {numEves}</Label>
            <Slider
              id="num-eves"
              min={0}
              max={5}
              value={[numEves]}
              onValueChange={(value) => setNumEves(value[0])}
              disabled={isRunning}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <ExperimentUI
        isRunning={isRunning}
        progress={progress}
        photonPosition={photonPosition}
        currentBits={currentBits}
        showBitsSimulation={showBitsSimulation}
        results={results}
        selectedExpId="overall"
        runExperiment={runExperiment}
        color="secondary"
        experimentName="Overall Analysis"
        experimentData={experimentResult?.data}
        analysis={experimentResult?.analysis}
        usedBits={experimentResult?.usedBits}
        xAxisDataKey="bit"
        colorScheme="secondary"
        experimentControls={parameterControls}
      />
    </div>
  );
};

export default OverallAnalysisExperiment;