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
  const [eavesDroppingRange, setEavesDroppingRange] = useState<[number, number]>([0, 100]);
  const [step, setStep] = useState(10);
  const [qubits, setQubits] = useState(80);
  const [noise, setNoise] = useState(2);

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

    totalSteps = Math.floor((eavesDroppingRange[1] - eavesDroppingRange[0]) / step) + 1;
    for (let eves = eavesDroppingRange[0]; eves <= eavesDroppingRange[1]; eves += step) {
      const result = simulateBB84(qubits, eves, noise);
      experimentData.push({
        eavesdropping: eves,
        qber: result.errorRate,  // Store as qber for proper charting
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

  // Parameter controls JSX
  const parameterControls = (
    <Card className="border-quantum-glow/30 p-4">
      <CardContent className="space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eavesdrop-start">Starting Eavesdrop Rate: {eavesDroppingRange[0]}%</Label>
            <Slider
              id="eavesdrop-start"
              min={0}
              max={eavesDroppingRange[1]}
              value={[eavesDroppingRange[0]]}
              onValueChange={(value) => setEavesDroppingRange([value[0], eavesDroppingRange[1]])}
              disabled={isRunning}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eavesdrop-end">Ending Eavesdrop Rate: {eavesDroppingRange[1]}%</Label>
            <Slider
              id="eavesdrop-end"
              min={eavesDroppingRange[0]}
              max={100}
              value={[eavesDroppingRange[1]]}
              onValueChange={(value) => setEavesDroppingRange([eavesDroppingRange[0], value[0]])}
              disabled={isRunning}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="step">Step Size: {step}%</Label>
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
            <Label htmlFor="num-qubits">Number of Qubits: {qubits}</Label>
            <Slider
              id="num-qubits"
              min={1}
              max={200}
              value={[qubits]}
              onValueChange={(value) => setQubits(value[0])}
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
        color="quantum-glow"
        experimentName="With Eavesdropper"
        experimentData={experimentResult?.data}
        analysis={experimentResult?.analysis}
        usedBits={experimentResult?.usedBits}
        xAxisDataKey="eavesdropping"
        colorScheme="quantum-glow"
        experimentControls={parameterControls}
      />
    </div>
  );
};

export default WithEavesdropperExperiment;