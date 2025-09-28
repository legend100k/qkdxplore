import React, { useState } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { ExperimentResult, ExperimentComponentProps } from "../common/types";
import { simulateBB84, generateAnalysis } from "../common/utils";
import { ExperimentUI } from "../common/ExperimentUI";

const OverallAnalysisExperiment: React.FC<ExperimentComponentProps> = ({ onSaveExperiment }) => {
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
    const iterations = 10;
    const qubits = 50;
    const noise = 5;
    const distance = 10;

    totalSteps = iterations;
    for (let i = 0; i < iterations; i++) {
      // Simulate combined effect of all parameters
      const distanceNoise = noise + (distance * 0.1);
      const eavesdropping = Math.random() * 30; // Random eavesdropping for variation
      const result = simulateBB84(qubits, eavesdropping, distanceNoise);
      experimentData.push({
        iteration: i + 1,
        qubits,
        noise: distanceNoise,
        eavesdropping,
        distance,
        errorRate: result.errorRate,
        keyRate: result.keyRate,
        security: result.errorRate < 11 ? "Secure" : "Compromised"
      });
      currentStep++;
      setProgress((currentStep / totalSteps) * 100);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const experimentResult: ExperimentResult = {
      id: "overall",
      name: "Overall Analysis",
      parameters: { iterations, qubits, noise, distance },
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
        xAxisDataKey="iteration"
        colorScheme="secondary"
      />
    </div>
  );
};

export default OverallAnalysisExperiment;