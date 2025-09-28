import React, { useState } from "react";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import { ExperimentResult, ExperimentComponentProps } from "../common/types";
import { simulateBB84, generateAnalysis } from "../common/utils";
import { ExperimentUI } from "../common/ExperimentUI";

const EffectOfDistanceExperiment: React.FC<ExperimentComponentProps> = ({ onSaveExperiment }) => {
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
    const distanceRange: [number, number] = [1, 100];
    const step = 10;
    const qubits = 40;
    const noise = 3;

    totalSteps = (distanceRange[1] - distanceRange[0]) / step + 1;
    for (let distance = distanceRange[0]; distance <= distanceRange[1]; distance += step) {
      // Simulate distance effect by adjusting noise based on distance (higher distance = more noise)
      const distanceNoise = noise + (distance * 0.1); // 0.1 noise per unit distance
      const result = simulateBB84(qubits, 0, distanceNoise);
      experimentData.push({
        distance,
        photonLoss: (1 - Math.exp(-distance / 50)) * 100, // Simulate photon loss based on distance
        errorRate: result.errorRate,
        keyRate: result.keyRate
      });
      currentStep++;
      setProgress((currentStep / totalSteps) * 100);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    // Store the final simulation bits
    setFinalExperimentBits([...currentBits]);

    const experimentResult: ExperimentResult = {
      id: "effect-of-distance",
      name: "Effect of Distance",
      parameters: { distanceRange, step, qubits, noise },
      data: experimentData,
      analysis: generateAnalysis("effect-of-distance", experimentData),
      completed: true,
      timestamp: new Date().toISOString(),
      usedBits: finalExperimentBits
    };

    setResults(prev => ({ ...prev, "effect-of-distance": experimentResult }));
    onSaveExperiment?.(experimentResult);
    setIsRunning(false);
    setPhotonPosition(0);
    setProgress(0);
    toast.success("Effect of Distance experiment completed successfully!");
  };

  const experimentResult = results["effect-of-distance"];

  return (
    <div className="space-y-6">
      <ExperimentUI
        isRunning={isRunning}
        progress={progress}
        photonPosition={photonPosition}
        currentBits={currentBits}
        showBitsSimulation={showBitsSimulation}
        results={results}
        selectedExpId="effect-of-distance"
        runExperiment={runExperiment}
        color="accent"
        experimentName="Effect of Distance"
        experimentData={experimentResult?.data}
        analysis={experimentResult?.analysis}
        usedBits={experimentResult?.usedBits}
        xAxisDataKey="distance"
        colorScheme="accent"
      />
    </div>
  );
};

export default EffectOfDistanceExperiment;