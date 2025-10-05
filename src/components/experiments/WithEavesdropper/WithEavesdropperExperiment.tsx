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
  const [numEavesdroppers, setNumEavesdroppers] = useState(0);
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

    // Run single experiment with specified number of eavesdroppers
    const result = simulateBB84(qubits, numEavesdroppers, noise);
    experimentData.push({
      eavesdroppers: numEavesdroppers,
      qber: result.errorRate,  // Store as qber for proper charting
      errorRate: result.errorRate,
      detectionProbability: Math.min(100, result.errorRate * 4),
      keyRate: result.keyRate
    });
    setProgress(100);
    await new Promise(resolve => setTimeout(resolve, 300));

    const experimentResult: ExperimentResult = {
      id: "with-eavesdropper",
      name: "With Eavesdropper",
      parameters: { numEavesdroppers, qubits, noise, basisSelection: "random" },
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
            <Label htmlFor="num-eavesdroppers">Number of Eavesdroppers: {numEavesdroppers}</Label>
            <Slider
              id="num-eavesdroppers"
              min={0}
              max={5}
              value={[numEavesdroppers]}
              onValueChange={(value) => setNumEavesdroppers(value[0])}
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
        xAxisDataKey="eavesdroppers"
        colorScheme="quantum-glow"
        experimentControls={parameterControls}
      />
    </div>
  );
};

export default WithEavesdropperExperiment;