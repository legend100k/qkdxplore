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
  const [step, setStep] = useState(10);
  const [noise, setNoise] = useState(2); // Set to low noise as per procedure
  const [eavesdropRate, setEavesdropRate] = useState(0); // Set to no eavesdropping as per procedure

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

    // Use the parameter values
    totalSteps = Math.floor((qubitRange[1] - qubitRange[0]) / step) + 1;
    for (let qubits = qubitRange[0]; qubits <= qubitRange[1]; qubits += step) {
      const result = simulateBB84(qubits, eavesdropRate, noise);
      experimentData.push({
        qubits,
        qber: result.errorRate,  // Store as qber for proper charting
        errorRate: result.errorRate,
        keyLength: result.keyLength,
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

  // Parameter controls JSX
  const parameterControls = (
    <Card className="border-quantum-blue/30 p-4">
      <CardContent className="space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="qubit-start">Number of Qubits: {qubitRange[0]}</Label>
            <Slider
              id="qubit-start"
              min={1}
              max={100}
              value={[qubitRange[0]]}
              onValueChange={(value) => setQubitRange([value[0], qubitRange[1]])}
              disabled={isRunning}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="step">Step Size: {step}</Label>
            <Slider
              id="step"
              min={1}
              max={20}
              value={[step]}
              onValueChange={(value) => setStep(value[0])}
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
            <Label htmlFor="eavesdrop">Eavesdropping Rate: {eavesdropRate}%</Label>
            <Slider
              id="eavesdrop"
              min={0}
              max={100}
              value={[eavesdropRate]}
              onValueChange={(value) => setEavesdropRate(value[0])}
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
        selectedExpId="effect-of-qubits"
        runExperiment={runExperiment}
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