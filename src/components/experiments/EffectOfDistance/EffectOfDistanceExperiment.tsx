import React, { useState } from "react";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import { ExperimentResult, ExperimentComponentProps } from "../common/types";
import { simulateBB84, generateAnalysis } from "../common/utils";
import { ExperimentUI } from "../common/ExperimentUI";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { OpticalNoiseParams, getAttenuationCoeff, calculatePhotonLoss } from "@/lib/opticalNoise";

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
  const [baseNoise, setBaseNoise] = useState(2); // Set to low noise as per procedure
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
      // Create optical noise parameters that scale with distance
      // Distance primarily affects: photon loss, PMD, and slightly increases depolarization
      
      const photonLoss = calculatePhotonLoss(distance, attenuationCoeff);
      
      // Base optical noise increases slightly with distance due to:
      // - More opportunity for polarization drift
      // - Environmental fluctuations over longer fiber
      const distanceFactor = Math.sqrt(distance / 100); // Scales with √distance
      
      const opticalParams: OpticalNoiseParams = {
        fiberLength: distance,
        wavelength: 1550,
        attenuationCoeff: attenuationCoeff,
        depolarization: (baseNoise / 100) * 0.02 + distanceFactor * 0.01,  // Slight increase with distance
        phaseDamping: (baseNoise / 100) * 0.015 + distanceFactor * 0.008,  // Phase decoherence
        amplitudeDamping: photonLoss * 0.5,                                  // Proportional to fiber loss
        pmd: 0.5 + distance / 100,                                          // PMD grows with distance
        thermalNoise: (baseNoise / 100) * 0.01                              // Constant thermal noise
      };
      
      const result = simulateBB84(qubits, 0, baseNoise, opticalParams);
      experimentData.push({
        distance,
        qber: result.totalQBER,  // Store total QBER with all contributions
        rawQber: result.errorRate,  // Store measured QBER without noise contributions
        photonLoss: photonLoss * 100, // Photon loss in %
        errorRate: result.errorRate,
        keyRate: result.keyRate,
        darkCountContribution: result.darkCountContribution,
        intrinsicFloor: result.intrinsicFloor,
        statisticalUpperBound: result.statisticalUpperBound,
        isSecure: result.isSecure
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
        <div className="text-sm text-muted-foreground mt-4">
          <p>Distance range: {distanceRange[0]} - {distanceRange[1]} km (step: {step} km)</p>
        </div>
      </CardContent>
    </Card>
  );

  const experimentResult = results["effect-of-distance"];

  const resetExperiment = () => {
    setResults({});
    setProgress(0);
    setPhotonPosition(0);
    setShowBitsSimulation(false);
    setCurrentBits([]);
    setFinalExperimentBits([]);
  };

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
        resetExperiment={resetExperiment}
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