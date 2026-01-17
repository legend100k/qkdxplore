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
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <Label htmlFor="noise" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Channel Noise Level
            </Label>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {noise}%
            </span>
        </div>
        <Slider
          id="noise"
          min={0}
          max={20}
          value={[noise]}
          onValueChange={(value) => setNoise(value[0])}
          disabled={isRunning}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-gray-400">
            <span>Low (0%)</span>
            <span>High (20%)</span>
        </div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50 flex gap-3 items-start">
        <div className="mt-0.5 text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Note:</strong> Number of Qubits is fixed at 80 for this comparison experiment.
        </p>
      </div>
    </div>
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
        color="red"
        experimentName="With Eavesdropper"
        experimentData={experimentResult?.data}
        analysis={experimentResult?.analysis}
        usedBits={experimentResult?.usedBits}
        xAxisDataKey="eavesdroppers"
        colorScheme="red"
        experimentControls={parameterControls}
      />
    </div>
  );
};

export default WithEavesdropperExperiment;