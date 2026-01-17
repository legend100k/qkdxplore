import React, { useState } from "react";
import { Beaker } from "lucide-react";
import { toast } from "sonner";
import { ExperimentResult, ExperimentComponentProps } from "../common/types";
import { simulateBB84, generateAnalysis } from "../common/utils";
import { ExperimentUI } from "../common/ExperimentUI";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { OpticalNoiseParams, getAttenuationCoeff } from "@/lib/opticalNoise";

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
  const step = 2; // Fixed step size
  const [qubits, setQubits] = useState(50);

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
      // Create optical noise parameters - varying depolarization and phase damping
      const normalizedNoise = noise / 100;
      const opticalParams: OpticalNoiseParams = {
        fiberLength: 10, // Fixed 10km distance
        wavelength: 1550,
        attenuationCoeff: getAttenuationCoeff(1550),
        depolarization: normalizedNoise * 0.5,     // Depolarization is main contributor
        phaseDamping: normalizedNoise * 0.3,       // Phase damping
        amplitudeDamping: normalizedNoise * 0.1,   // Some photon loss
        pmd: normalizedNoise * 1.5,                // PMD increases with noise
        thermalNoise: normalizedNoise * 0.15       // Thermal noise
      };
      
      const result = simulateBB84(qubits, 0, noise, opticalParams); // Fixed eavesdrop rate to 0
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
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label htmlFor="noise-start" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Starting Noise Level
                </Label>
                 <span className="text-sm font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                    {noiseRange[0]}%
                </span>
            </div>
            <Slider
              id="noise-start"
              min={0}
              max={noiseRange[1]}
              value={[noiseRange[0]]}
              onValueChange={(value) => setNoiseRange([value[0], noiseRange[1]])}
              disabled={isRunning}
              className="py-2"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label htmlFor="num-qubits" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Number of Qubits
                </Label>
                 <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {qubits}
                </span>
            </div>
            <Slider
              id="num-qubits"
              min={1}
              max={200}
              value={[qubits]}
              onValueChange={(value) => setQubits(value[0])}
              disabled={isRunning}
              className="py-2"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border border-gray-100 dark:border-gray-800">
          <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">i</div>
          <p>Simulation will run from <strong>{noiseRange[0]}%</strong> to <strong>{noiseRange[1]}%</strong> noise in steps of <strong>{step}%</strong>.</p>
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
        selectedExpId="effect-of-channel-noise"
        runExperiment={runExperiment}
        resetExperiment={resetExperiment}
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