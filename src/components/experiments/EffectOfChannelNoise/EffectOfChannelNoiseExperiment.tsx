import React, { useState } from "react";
import { Beaker } from "lucide-react";
import { toast } from "sonner";
import { ExperimentResult, ExperimentComponentProps } from "../common/types";
import { simulateBB84, generateAnalysis } from "../common/utils";
import { ExperimentUI } from "../common/ExperimentUI";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const EffectOfChannelNoiseExperiment: React.FC<ExperimentComponentProps> = ({ onSaveExperiment }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [photonPosition, setPhotonPosition] = useState(0);
  const [results, setResults] = useState<{ [key: string]: ExperimentResult }>({});
  const [currentBits, setCurrentBits] = useState<any[]>([]);
  const [showBitsSimulation, setShowBitsSimulation] = useState(false);
  const [finalExperimentBits, setFinalExperimentBits] = useState<any[]>([]);
  
  // State for experiment parameters
  const [noiseRange, setNoiseRange] = useState<[number, number]>([0, 20]);
  const [step, setStep] = useState(2);
  const [qubits, setQubits] = useState(50);
  const [eavesdropRate, setEavesdropRate] = useState(10);

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

    totalSteps = Math.floor((noiseRange[1] - noiseRange[0]) / step) + 1;
    for (let noise = noiseRange[0]; noise <= noiseRange[1]; noise += step) {
      const result = simulateBB84(qubits, eavesdropRate, noise);
      experimentData.push({
        noise,
        qber: result.errorRate,  // Store as qber for proper charting
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

  // Parameter controls JSX
  const parameterControls = (
    <Card className="border-quantum-purple/30 p-4">
      <CardContent className="space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="noise-start">Starting Noise: {noiseRange[0]}%</Label>
            <Slider
              id="noise-start"
              min={0}
              max={noiseRange[1]}
              value={[noiseRange[0]]}
              onValueChange={(value) => setNoiseRange([value[0], noiseRange[1]])}
              disabled={isRunning}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="noise-end">Ending Noise: {noiseRange[1]}%</Label>
            <Slider
              id="noise-end"
              min={noiseRange[0]}
              max={50}
              value={[noiseRange[1]]}
              onValueChange={(value) => setNoiseRange([noiseRange[0], value[0]])}
              disabled={isRunning}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="noise-step">Step Size: {step}%</Label>
            <Slider
              id="noise-step"
              min={1}
              max={10}
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
        selectedExpId="effect-of-channel-noise"
        runExperiment={runExperiment}
        color="quantum-purple"
        experimentName="Effect of Channel Noise"
        experimentData={experimentResult?.data}
        analysis={experimentResult?.analysis}
        usedBits={experimentResult?.usedBits}
        xAxisDataKey="noise"
        colorScheme="quantum-purple"
        experimentControls={parameterControls}
      />
    </div>
  );
};

export default EffectOfChannelNoiseExperiment;