import React, { useState } from "react";
import { BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { ExperimentResult, ExperimentComponentProps } from "../common/types";
import { simulateBB84, generateAnalysis } from "../common/utils";
import { ExperimentUI } from "../common/ExperimentUI";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const EffectOfQubitsExperiment: React.FC<ExperimentComponentProps> = ({ onSaveExperiment }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [photonPosition, setPhotonPosition] = useState(0);
  const [results, setResults] = useState<{ [key: string]: ExperimentResult }>({});
  const [currentBits, setCurrentBits] = useState<any[]>([]);
  const [showBitsSimulation, setShowBitsSimulation] = useState(false);
  const [finalExperimentBits, setFinalExperimentBits] = useState<any[]>([]);
  
  // State for experiment parameters
  const [qubitRange, setQubitRange] = useState<[number, number]>([10, 100]);
  const step = 10; // Fixed step size
  const noise = 5; // Fixed noise level at 5%

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

    // Use the fixed parameter values - run both with and without Eve for comparison
    totalSteps = Math.floor((qubitRange[1] - qubitRange[0]) / step) + 1;
    for (let qubits = qubitRange[0]; qubits <= qubitRange[1]; qubits += step) {
      // Run without Eve
      const resultNoEve = simulateBB84(qubits, 0, noise); // Fixed noise at 5%
      // Run with Eve
      const resultWithEve = simulateBB84(qubits, 1, noise); // Fixed noise at 5% and eavesdroppers at 1
      
      experimentData.push({
        qubits,
        qber: resultNoEve.errorRate,  // Default QBER for compatibility
        qberNoEve: resultNoEve.errorRate,  // Without Eve
        qberWithEve: resultWithEve.errorRate,  // With Eve
        errorRate: resultNoEve.errorRate,
        keyLength: resultNoEve.keyLength,
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
      parameters: { qubitRange, step, noise: 5 }, // Fixed noise at 5%
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
            <Label htmlFor="qubit-start" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Number of Qubits to Simulate
            </Label>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {qubitRange[0]} - {qubitRange[1]}
            </span>
        </div>
        <Slider
            id="qubit-start"
            min={1}
            max={100}
            value={[qubitRange[0]]}
            onValueChange={(value) => setQubitRange([value[0], qubitRange[1]])}
            disabled={isRunning}
            className="py-2"
        />
        <div className="flex justify-between text-xs text-gray-400">
            <span>1 Qubit</span>
            <span>100 Qubits</span>
        </div>
        <p className="text-xs text-muted-foreground">Experiment Step Size: {step}</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50 flex gap-3 items-start">
        <div className="mt-0.5 text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> Noise Level is fixed at 5% and Eavesdroppers are fixed at 1 for this experiment.
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
        selectedExpId="effect-of-qubits"
        runExperiment={runExperiment}
        resetExperiment={resetExperiment}
        color="quantum-blue"
        experimentName="Effect of Qubits"
        experimentData={experimentResult?.data}
        analysis={experimentResult?.analysis}
        usedBits={experimentResult?.usedBits}
        xAxisDataKey="qubits"
        colorScheme="quantum-blue"
        experimentControls={parameterControls}
      />
    </div>
  );
};

export default EffectOfQubitsExperiment;