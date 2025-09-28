import React, { useState } from "react";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { ExperimentResult, ExperimentComponentProps } from "../common/types";
import { simulateBB84, generateAnalysis } from "../common/utils";
import { ExperimentUI } from "../common/ExperimentUI";

const WithEavesdropperExperiment: React.FC<ExperimentComponentProps> = ({ onSaveExperiment }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [photonPosition, setPhotonPosition] = useState(0);
  const [results, setResults] = useState<{ [key: string]: ExperimentResult }>({});
  const [currentBits, setCurrentBits] = useState<any[]>([]);
  const [showBitsSimulation, setShowBitsSimulation] = useState(false);
  const [finalExperimentBits, setFinalExperimentBits] = useState<any[]>([]);

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

    // Define experiment parameters
    const eavesDroppingRange: [number, number] = [0, 100];
    const step = 10;
    const qubits = 80;

    totalSteps = (eavesDroppingRange[1] - eavesDroppingRange[0]) / step + 1;
    for (let eves = eavesDroppingRange[0]; eves <= eavesDroppingRange[1]; eves += step) {
      const result = simulateBB84(qubits, eves, 2);
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

    const experimentResult: ExperimentResult = {
      id: "with-eavesdropper",
      name: "With Eavesdropper",
      parameters: { eavesDroppingRange, step, qubits, basisSelection: "random" },
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
        color="quantum-glow"
        experimentName="With Eavesdropper"
        experimentData={experimentResult?.data}
        analysis={experimentResult?.analysis}
        usedBits={experimentResult?.usedBits}
        xAxisDataKey="eavesdropping"
        colorScheme="quantum-glow"
      />
    </div>
  );
};

export default WithEavesdropperExperiment;