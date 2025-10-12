import React, { useState } from "react";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { ExperimentResult, ExperimentComponentProps } from "../common/types";
import { simulateBB84, generateAnalysis } from "../common/utils";
import { ExperimentUI } from "../common/ExperimentUI";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const WithEavesdropperExperiment: React.FC<ExperimentComponentProps> = ({ onSaveExperiment }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [photonPosition, setPhotonPosition] = useState(0);
  const [results, setResults] = useState<{ [key: string]: ExperimentResult }>({});
  const [currentBits, setCurrentBits] = useState<any[]>([]);
  const [showBitsSimulation, setShowBitsSimulation] = useState(false);
  const [finalExperimentBits, setFinalExperimentBits] = useState<any[]>([]);
  
  // State for experiment parameters
  const qubits = 80; // Fixed number of qubits
  const [noise, setNoise] = useState(2);

  const runExperiment = async () => {
    setIsRunning(true);
    setProgress(0);
    setPhotonPosition(0);
    setShowBitsSimulation(true);
    setCurrentBits([]);
    
    const experimentData: Record<string, unknown>[] = [];
    const totalSteps = 0;
    const currentStep = 0;

    // Animate photon during experiment
    const animatePhoton = async () => {
      while (isRunning) {
        setPhotonPosition(prev => (prev >= 100 ? 0 : prev + 2));
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    };

    // Start photon animation
    animatePhoton();

    // Run experiments with varying numbers of eavesdroppers to show comparison
    const eavesdropperCounts = [0, 1, 2, 3, 4, 5];
    
    for (let i = 0; i < eavesdropperCounts.length; i++) {
      const eveCount = eavesdropperCounts[i];
      const result = simulateBB84(qubits, eveCount, noise); // Using fixed qubits value
      
      experimentData.push({
        eavesdroppers: eveCount,
        qber: result.errorRate,  // Store as qber for proper charting
        qberNoEve: eveCount === 0 ? result.errorRate : null, // Baseline without Eve
        qberWithEve: eveCount > 0 ? result.errorRate : null, // With Eve
        errorRate: result.errorRate,
        detectionProbability: Math.min(100, result.errorRate * 4),
        keyRate: result.keyRate
      });
      
      setProgress((i + 1) * (100 / eavesdropperCounts.length));
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const experimentResult: ExperimentResult = {
      id: "with-eavesdropper",
      name: "With Eavesdropper",
      parameters: { qubits: 80, noise, basisSelection: "random" }, // Fixed qubits at 80
      data: experimentData,
      analysis: generateAnalysis("with-eavesdropper", experimentData),
      completed: true,
      timestamp: new Date().toISOString(),
      usedBits: finalExperimentBits
    };

    setResults(prev => ({ ...prev, "with-eavesdropper": experimentResult }));
    onSaveExperiment?.(experimentResult);
    setIsRunning(false);
    setPhotonPosition(0);
    setProgress(0);
    toast.success("With Eavesdropper experiment completed successfully!");
  };

  const experimentResult = results["with-eavesdropper"];

  const resetExperiment = () => {
    setResults({});
    setProgress(0);
    setPhotonPosition(0);
    setShowBitsSimulation(false);
    setCurrentBits([]);
    setFinalExperimentBits([]);
  };

  // Parameter controls JSX
  const parameterControls = (
    <Card className="border-quantum-glow/30 p-4">
      <CardContent className="space-y-4 p-4">
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
        
        <div className="bg-quantum-glow/10 p-3 rounded-lg border border-quantum-glow/30">
          <p className="text-sm text-quantum-glow">
            <strong>Note:</strong> Number of Qubits is fixed at 80 for this experiment.
          </p>
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
        selectedExpId="with-eavesdropper"
        runExperiment={runExperiment}
        resetExperiment={resetExperiment}
        color="quantum-glow"
        experimentName="With Eavesdropper"
        experimentData={experimentResult?.data}
        analysis={experimentResult?.analysis}
        usedBits={experimentResult?.usedBits}
        xAxisDataKey="eavesdroppers"
        colorScheme="quantum-glow"
        experimentControls={parameterControls}
      />
    </div>
  );
};

export default WithEavesdropperExperiment;