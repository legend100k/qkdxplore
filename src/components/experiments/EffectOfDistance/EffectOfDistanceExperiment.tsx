import React, { useState } from "react";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import { ExperimentResult, ExperimentComponentProps } from "../common/types";
import { simulateBB84, generateAnalysis } from "../common/utils";
import { ExperimentUI } from "../common/ExperimentUI";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const EffectOfDistanceExperiment: React.FC<ExperimentComponentProps> = ({ onSaveExperiment }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [photonPosition, setPhotonPosition] = useState(0);
  const [results, setResults] = useState<{ [key: string]: ExperimentResult }>({});
  const [currentBits, setCurrentBits] = useState<any[]>([]);
  const [showBitsSimulation, setShowBitsSimulation] = useState(false);
  const [finalExperimentBits, setFinalExperimentBits] = useState<any[]>([]);
  
  // State for experiment parameters
  const [distanceRange, setDistanceRange] = useState<[number, number]>([1, 100]);
  const [step, setStep] = useState(10);
  const [qubits, setQubits] = useState(40);
  const [baseNoise, setBaseNoise] = useState(3);
  const [attenuationCoeff, setAttenuationCoeff] = useState(0.2); // Fiber attenuation coefficient

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

    totalSteps = Math.floor((distanceRange[1] - distanceRange[0]) / step) + 1;
    for (let distance = distanceRange[0]; distance <= distanceRange[1]; distance += step) {
      // Simulate distance effect in optical fiber where signal degrades exponentially with distance
      // In optical fiber, signal loss follows Beer-Lambert law: P_out = P_in * 10^(-alpha * L / 10)
      // where alpha is the attenuation coefficient in dB/km
      const baseNoiseValue = 0.1; // Base noise independent of distance
      
      // Calculate effective noise based on distance using exponential decay model
      const distanceInKm = distance / 10.0; // Convert to km if current unit is not km
      const fiberLoss = Math.pow(10, -(attenuationCoeff * distanceInKm / 10)); // Linear loss factor
      const distanceInducedNoise = (1 - fiberLoss) * 20; // As distance increases, noise increases due to signal degradation
      
      const distanceNoise = baseNoiseValue + distanceInducedNoise + baseNoise;
      
      const result = simulateBB84(qubits, 0, distanceNoise);
      experimentData.push({
        distance,
        qber: result.errorRate,  // Store as qber for proper charting
        photonLoss: (1 - Math.pow(10, -(attenuationCoeff * distanceInKm / 10))) * 100, // Fiber loss in %
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
      parameters: { distanceRange, step, qubits, baseNoise, attenuationCoeff },
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

  // Parameter controls JSX
  const parameterControls = (
    <Card className="border-quantum-blue/30 p-4">
      <CardContent className="space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="distance-start">Starting Distance: {distanceRange[0]} km</Label>
            <Slider
              id="distance-start"
              min={1}
              max={distanceRange[1]}
              value={[distanceRange[0]]}
              onValueChange={(value) => setDistanceRange([value[0], distanceRange[1]])}
              disabled={isRunning}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="distance-end">Ending Distance: {distanceRange[1]} km</Label>
            <Slider
              id="distance-end"
              min={distanceRange[0]}
              max={200}
              value={[distanceRange[1]]}
              onValueChange={(value) => setDistanceRange([distanceRange[0], value[0]])}
              disabled={isRunning}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="distance-step">Step Size: {step} km</Label>
            <Slider
              id="distance-step"
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
              min={10}
              max={100}
              value={[qubits]}
              onValueChange={(value) => setQubits(value[0])}
              disabled={isRunning}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="base-noise">Base Noise Level: {baseNoise}%</Label>
            <Slider
              id="base-noise"
              min={0}
              max={10}
              value={[baseNoise]}
              onValueChange={(value) => setBaseNoise(value[0])}
              disabled={isRunning}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="attenuation">Fiber Attenuation: {attenuationCoeff} dB/km</Label>
            <Slider
              id="attenuation"
              min={0.1}
              max={1.0}
              step={0.1}
              value={[attenuationCoeff]}
              onValueChange={(value) => setAttenuationCoeff(value[0])}
              disabled={isRunning}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
        color="quantum-blue"
        experimentName="Effect of Distance"
        experimentData={experimentResult?.data}
        analysis={experimentResult?.analysis}
        usedBits={experimentResult?.usedBits}
        xAxisDataKey="distance"
        colorScheme="quantum-blue"
        experimentControls={parameterControls}
      />
    </div>
  );

  };

export default EffectOfDistanceExperiment;