import React, { useState } from "react";
import { BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { ExperimentResult, ExperimentComponentProps } from "../common/types";
import { simulateBB84, generateAnalysis } from "../common/utils";
import { ExperimentUI } from "../common/ExperimentUI";

const EffectOfQubitsExperiment: React.FC<ExperimentComponentProps> = ({ onSaveExperiment }) => {
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
    const qubitRange: [number, number] = [10, 100];
    const step = 10;
    const noise = 5;

    totalSteps = (qubitRange[1] - qubitRange[0]) / step + 1;
    for (let qubits = qubitRange[0]; qubits <= qubitRange[1]; qubits += step) {
      const result = simulateBB84(qubits, 10, noise);
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
    // Store the final simulation bits
    setFinalExperimentBits([...currentBits]);

    const experimentResult: ExperimentResult = {
      id: "effect-of-qubits",
      name: "Effect of Qubits",
      parameters: { qubitRange, step, noise },
      data: experimentData,
      analysis: generateAnalysis("effect-of-qubits", experimentData),
      completed: true,
      timestamp: new Date().toISOString(),
      usedBits: finalExperimentBits
    };

    setResults(prev => ({ ...prev, "effect-of-qubits": experimentResult }));
    onSaveExperiment?.(experimentResult);
    setIsRunning(false);
    setPhotonPosition(0);
    setProgress(0);
    toast.success("Effect of Qubits experiment completed successfully!");
  };

  const experimentResult = results["effect-of-qubits"];

  return (
    <div className="space-y-6">
      <ExperimentUI
        isRunning={isRunning}
        progress={progress}
        photonPosition={photonPosition}
        currentBits={currentBits}
        showBitsSimulation={showBitsSimulation}
        results={results}
        selectedExpId="effect-of-qubits"
        runExperiment={runExperiment}
        color="quantum-blue"
        experimentName="Effect of Qubits"
        experimentData={experimentResult?.data}
        analysis={experimentResult?.analysis}
        usedBits={experimentResult?.usedBits}
        xAxisDataKey="qubits"
        colorScheme="quantum-blue"
      />
    </div>
  );
};

export default EffectOfQubitsExperiment;