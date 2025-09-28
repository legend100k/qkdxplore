import React, { useState } from "react";
import { Beaker } from "lucide-react";
import { toast } from "sonner";
import { ExperimentResult, ExperimentComponentProps } from "../common/types";
import { simulateBB84, generateAnalysis } from "../common/utils";
import { ExperimentUI } from "../common/ExperimentUI";

const EffectOfChannelNoiseExperiment: React.FC<ExperimentComponentProps> = ({ onSaveExperiment }) => {
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
    const noiseRange: [number, number] = [0, 20];
    const step = 2;
    const qubits = 50;

    totalSteps = (noiseRange[1] - noiseRange[0]) / step + 1;
    for (let noise = noiseRange[0]; noise <= noiseRange[1]; noise += step) {
      const result = simulateBB84(qubits, 0, noise);
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

    const experimentResult: ExperimentResult = {
      id: "effect-of-channel-noise",
      name: "Effect of Channel Noise",
      parameters: { noiseRange, step, qubits },
      data: experimentData,
      analysis: generateAnalysis("effect-of-channel-noise", experimentData),
      completed: true,
      timestamp: new Date().toISOString(),
      usedBits: finalExperimentBits
    };

    setResults(prev => ({ ...prev, "effect-of-channel-noise": experimentResult }));
    onSaveExperiment?.(experimentResult);
    setIsRunning(false);
    setPhotonPosition(0);
    setProgress(0);
    toast.success("Effect of Channel Noise experiment completed successfully!");
  };

  const experimentResult = results["effect-of-channel-noise"];

  return (
    <div className="space-y-6">
      <ExperimentUI
        isRunning={isRunning}
        progress={progress}
        photonPosition={photonPosition}
        currentBits={currentBits}
        showBitsSimulation={showBitsSimulation}
        results={results}
        selectedExpId="effect-of-channel-noise"
        runExperiment={runExperiment}
        color="quantum-purple"
        experimentName="Effect of Channel Noise"
        experimentData={experimentResult?.data}
        analysis={experimentResult?.analysis}
        usedBits={experimentResult?.usedBits}
        xAxisDataKey="noise"
        colorScheme="quantum-purple"
      />
    </div>
  );
};

export default EffectOfChannelNoiseExperiment;