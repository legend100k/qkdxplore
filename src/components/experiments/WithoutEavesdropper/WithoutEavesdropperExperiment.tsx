import React, { useState } from "react";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { ExperimentResult, ExperimentComponentProps } from "../common/types";
import { simulateBB84, generateAnalysis } from "../common/utils";
import { ExperimentUI } from "../common/ExperimentUI";

const WithoutEavesdropperExperiment: React.FC<ExperimentComponentProps> = ({ onSaveExperiment }) => {
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

    // Single simulation run without eavesdropping
    const qubits = 60;
    const noise = 2;
    const resultWithoutEve = simulateBB84(qubits, 0, noise);
    experimentData.push({
      run: 1, // Adding a run property for the chart
      qber: resultWithoutEve.errorRate,  // Store as qber for proper charting
      errorRate: resultWithoutEve.errorRate,
      keyRate: resultWithoutEve.keyRate,
      security: resultWithoutEve.errorRate < 11 ? "Secure" : "Insecure"
    });
    setProgress(100);
    // Store the final simulation bits
    setFinalExperimentBits([...currentBits]);

    const experimentResult: ExperimentResult = {
      id: "without-eavesdropper",
      name: "Without Eavesdropper",
      parameters: { qubits, noise },
      data: experimentData,
      analysis: generateAnalysis("without-eavesdropper", experimentData),
      completed: true,
      timestamp: new Date().toISOString(),
      usedBits: finalExperimentBits
    };

    setResults(prev => ({ ...prev, "without-eavesdropper": experimentResult }));
    onSaveExperiment?.(experimentResult);
    setIsRunning(false);
    setPhotonPosition(0);
    setProgress(0);
    toast.success("Without Eavesdropper experiment completed successfully!");
  };

  const experimentResult = results["without-eavesdropper"];

  return (
    <div className="space-y-6">
      <ExperimentUI
        isRunning={isRunning}
        progress={progress}
        photonPosition={photonPosition}
        currentBits={currentBits}
        showBitsSimulation={showBitsSimulation}
        results={results}
        selectedExpId="without-eavesdropper"
        runExperiment={runExperiment}
        color="primary"
        experimentName="Without Eavesdropper"
        experimentData={experimentResult?.data}
        analysis={experimentResult?.analysis}
        usedBits={experimentResult?.usedBits}
        xAxisDataKey="run"
        colorScheme="primary"
      />
    </div>
  );
};

export default WithoutEavesdropperExperiment;