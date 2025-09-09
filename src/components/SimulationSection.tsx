import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCw, Zap, Eye, Shield, BarChart3, Settings, ChevronLeft, ChevronRight, StepForward } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface QuantumBit {
  id: number;
  aliceBit: number;
  aliceBasis: string;
  bobBasis: string;
  bobMeasurement: number | null;
  isMatching: boolean | null;
  inKey: boolean;
}

export const SimulationSection = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [quantumBits, setQuantumBits] = useState<QuantumBit[]>([]);
  const [finalKey, setFinalKey] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [photonPosition, setPhotonPosition] = useState(0);
  const [numQubits, setNumQubits] = useState([16]);
  const [eavesdroppingRate, setEavesdroppingRate] = useState([0]);
  const [noiseLevel, setNoiseLevel] = useState([0]);
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [showGraphs, setShowGraphs] = useState(false);
  const [isStepByStep, setIsStepByStep] = useState(false);
  const [currentBitIndex, setCurrentBitIndex] = useState(0);
  const [stepByStepBits, setStepByStepBits] = useState<QuantumBit[]>([]);
  const [bitStep, setBitStep] = useState(0);

  const steps = [
    "Alice generates random bits and bases",
    "Alice sends photons to Bob",
    "Photon transmitted",
    "Bob randomly chooses measurement bases", 
    "Bob measures photons",
    "Public basis comparison",
    "Key sifting and final key generation"
  ];

  const generateRandomBits = () => {
    const bits: QuantumBit[] = [];
    const totalBits = numQubits[0];
    const eavesProbability = eavesdroppingRate[0] / 100;
    const noise = noiseLevel[0] / 100;
    
    for (let i = 0; i < totalBits; i++) {
      const aliceBit = Math.random() > 0.5 ? 1 : 0;
      const aliceBasis = Math.random() > 0.5 ? "+" : "×";
      const bobBasis = Math.random() > 0.5 ? "+" : "×";
      
      const isMatching = aliceBasis === bobBasis;
      let bobMeasurement = null;
      let inKey = false;

      // Bob measures the photon
      if (isMatching) {
        // When bases match, Bob should get the same bit as Alice (in ideal conditions)
        bobMeasurement = aliceBit;
        inKey = true;
        
        // Apply eavesdropping effect
        if (eavesProbability > 0 && Math.random() < eavesProbability) {
          // Eve measures the photon and randomly changes the bit with 75% probability
          if (Math.random() < 0.75) {
            bobMeasurement = 1 - bobMeasurement;
          }
        }
        
        // Apply noise effect
        if (noise > 0 && Math.random() < noise) {
          bobMeasurement = 1 - bobMeasurement;
        }
      } else {
        // When bases don't match, Bob gets a random result
        bobMeasurement = Math.random() > 0.5 ? 1 : 0;
        inKey = false;
      }

      bits.push({
        id: i,
        aliceBit,
        aliceBasis,
        bobBasis,
        bobMeasurement,
        isMatching,
        inKey
      });
    }
    return bits;
  };

  const generateStepByStepBits = () => {
    const bits: QuantumBit[] = [];
    const totalBits = numQubits[0];
    
    for (let i = 0; i < totalBits; i++) {
      const aliceBit = Math.random() > 0.5 ? 1 : 0;
      const aliceBasis = Math.random() > 0.5 ? "+" : "×";
      const bobBasis = Math.random() > 0.5 ? "+" : "×";
      
      bits.push({
        id: i,
        aliceBit,
        aliceBasis,
        bobBasis,
        bobMeasurement: null,
        isMatching: null,
        inKey: false
      });
    }
    return bits;
  };

  const processBitStep = (bitIndex: number, step: number) => {
    const eavesProbability = eavesdroppingRate[0] / 100;
    const noise = noiseLevel[0] / 100;
    
    setStepByStepBits(prevBits => {
      const newBits = [...prevBits];
      const bit = newBits[bitIndex];
      
      if (step >= 3) { // Bob measures
        const isMatching = bit.aliceBasis === bit.bobBasis;
        bit.isMatching = isMatching;
        
        if (isMatching) {
          // When bases match, Bob should get the same bit as Alice (in ideal conditions)
          let correctBit = bit.aliceBit;
          bit.inKey = true;
          
          // Apply eavesdropping effect
          if (eavesProbability > 0 && Math.random() < eavesProbability) {
            // Eve measures the photon and randomly changes the bit with 75% probability
            if (Math.random() < 0.75) {
              correctBit = 1 - correctBit;
            }
          }
          
          // Apply noise effect
          if (noise > 0 && Math.random() < noise) {
            correctBit = 1 - correctBit;
          }
          
          bit.bobMeasurement = correctBit;
        } else {
          // When bases don't match, Bob gets a random result
          bit.bobMeasurement = Math.random() > 0.5 ? 1 : 0;
          bit.inKey = false;
        }
      }
      
      return newBits;
    });
  };

  const startStepByStepMode = () => {
    setIsStepByStep(true);
    const bits = generateStepByStepBits();
    setStepByStepBits(bits);
    setCurrentBitIndex(0);
    setBitStep(0);
    setShowGraphs(false);
    setFinalKey("");
    toast.success("Step-by-step mode started. Use the controls to step through each bit.");
  };

  const nextBitStep = () => {
    if (bitStep < 5) {
      setBitStep(bitStep + 1);
      if (bitStep === 4) {
        processBitStep(currentBitIndex, bitStep + 1);
      }
    } else if (currentBitIndex < stepByStepBits.length - 1) {
      setCurrentBitIndex(currentBitIndex + 1);
      setBitStep(0);
    } else {
      // Finished all bits
      const finalBits = stepByStepBits.filter(bit => bit.inKey);
      const key = finalBits.map(bit => bit.aliceBit).join('');
      setFinalKey(key);
      generateAnalysisData(stepByStepBits);
      setShowGraphs(true);
      toast.success(`Step-by-step simulation complete! Generated ${key.length}-bit key.`);
    }
  };

  const previousBitStep = () => {
    if (bitStep > 0) {
      setBitStep(bitStep - 1);
    } else if (currentBitIndex > 0) {
      setCurrentBitIndex(currentBitIndex - 1);
      setBitStep(5);
    }
  };

  const runSimulation = async () => {
    setIsRunning(true);
    setCurrentStep(0);
    setProgress(0);
    setFinalKey("");
    
    for (let step = 0; step <= 5; step++) {
      setCurrentStep(step);
      setProgress((step / 5) * 100);
      
      if (step === 1) {
        // Animate photon transmission
        for (let pos = 0; pos <= 100; pos += 5) {
          setPhotonPosition(pos);
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    const bits = generateRandomBits();
    setQuantumBits(bits);
    
    const key = bits
      .filter(bit => bit.inKey)
      .map(bit => bit.aliceBit)
      .join('');
    setFinalKey(key);
    
    // Generate analysis data
    generateAnalysisData(bits);
    setShowGraphs(true);
    
    toast.success(`Simulation complete! Generated ${key.length}-bit key.`);
    setIsRunning(false);
  };

  const generateAnalysisData = (bits: QuantumBit[]) => {
    const matchingBits = bits.filter(bit => bit.isMatching);
    const errorBits = matchingBits.filter(bit => bit.aliceBit !== bit.bobMeasurement);
    const errorRate = matchingBits.length > 0 ? (errorBits.length / matchingBits.length) * 100 : 0;
    const keyRate = (bits.filter(bit => bit.inKey).length / bits.length) * 100;
    
    // Create data for the graph with Qubit on x-axis and Key Rate on y-axis
    const graphData = bits.map((bit, index) => ({
      qubit: index + 1,
      keyRate: ((bits.slice(0, index + 1).filter(b => b.inKey).length / (index + 1)) * 100).toFixed(2)
    }));
    
    const data = [
      { name: 'Total Bits', value: bits.length },
      { name: 'Matching Bases', value: matchingBits.length },
      { name: 'Key Bits', value: bits.filter(bit => bit.inKey).length },
      { name: 'Error Rate (%)', value: errorRate.toFixed(2) },
      { name: 'Key Rate (%)', value: keyRate.toFixed(2) }
    ];
    
    setSimulationData(data);
  };

  const resetSimulation = () => {
    setCurrentStep(0);
    setProgress(0);
    setQuantumBits([]);
    setFinalKey("");
    setPhotonPosition(0);
    setIsRunning(false);
    setShowGraphs(false);
    setSimulationData([]);
    setIsStepByStep(false);
    setCurrentBitIndex(0);
    setStepByStepBits([]);
    setBitStep(0);
  };

  return (
    <div className="space-y-6">
      <Card className="border-quantum-blue/30">
        <CardHeader>
          <CardTitle className="text-quantum-blue flex items-center gap-2">
            <Zap className="w-6 h-6" />
            BB84 Protocol Simulation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Two-column layout for simulation controls and results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column - Controls */}
            <div className="space-y-6">
              {/* Simulation Parameters */}
              <Card className="border-quantum-blue/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Simulation Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Number of Qubits: {numQubits[0]}</label>
                      <Slider
                        value={numQubits}
                        onValueChange={setNumQubits}
                        max={50}
                        min={8}
                        step={2}
                        className="w-full"
                        disabled={isRunning}
                      />
                      <p className="text-xs text-muted-foreground">Range: 8-50 qubits</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Eavesdropping Rate: {eavesdroppingRate[0]}%</label>
                      <Slider
                        value={eavesdroppingRate}
                        onValueChange={setEavesdroppingRate}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full"
                        disabled={isRunning}
                      />
                      <p className="text-xs text-muted-foreground">Probability of Eve intercepting</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Noise Level: {noiseLevel[0]}%</label>
                      <Slider
                        value={noiseLevel}
                        onValueChange={setNoiseLevel}
                        max={20}
                        min={0}
                        step={1}
                        className="w-full"
                        disabled={isRunning}
                      />
                      <p className="text-xs text-muted-foreground">Channel noise and imperfections</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setIsStepByStep(!isStepByStep)}
                    variant={isStepByStep ? "default" : "outline"}
                    className={`border-quantum-purple/30 ${isStepByStep ? "bg-quantum-purple hover:bg-quantum-purple/90" : ""}`}
                  >
                    <StepForward className="w-4 h-4 mr-2" />
                    {isStepByStep ? "Step Mode" : "Auto Mode"}
                  </Button>
                </div>

                {!isStepByStep ? (
                  <>
                    <Button
                      onClick={runSimulation}
                      disabled={isRunning}
                      className="bg-quantum-blue hover:bg-quantum-blue/90"
                    >
                      {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {isRunning ? "Running..." : "Start Simulation"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={startStepByStepMode}
                      disabled={stepByStepBits.length > 0}
                      className="bg-quantum-blue hover:bg-quantum-blue/90"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Step-by-Step
                    </Button>
                    
                    {stepByStepBits.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={previousBitStep}
                          disabled={currentBitIndex === 0 && bitStep === 0}
                          variant="outline"
                          size="sm"
                          className="border-quantum-purple/30"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          onClick={nextBitStep}
                          disabled={currentBitIndex === stepByStepBits.length - 1 && bitStep === 5 && !!finalKey}
                          className="bg-quantum-purple hover:bg-quantum-purple/90"
                          size="sm"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                        
                        <span className="text-sm px-3 py-1 bg-muted rounded border whitespace-nowrap">
                          Bit {currentBitIndex + 1}/{stepByStepBits.length} - Step {bitStep + 1}/5
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                <Button
                  onClick={resetSimulation}
                  variant="outline"
                  className="border-quantum-glow/30"
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>

                {eavesdroppingRate[0] > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive rounded">
                    <Eye className="w-4 h-4 text-destructive" />
                    <span className="text-sm text-destructive">Eve Active ({eavesdroppingRate[0]}%)</span>
                  </div>
                )}

                {noiseLevel[0] > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500 rounded">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-yellow-500">Noise ({noiseLevel[0]}%)</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Progress:</span>
                  <Progress value={progress} className="flex-1" />
                  <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                
                {currentStep > 0 && (
                  <Card className="bg-quantum-blue/5 border-quantum-blue/20">
                    <CardContent className="p-3">
                      <p className="font-semibold text-quantum-blue">Current Step:</p>
                      <p className="text-sm">{steps[currentStep - 1]}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Photon transmission visualization */}
              {currentStep === 1 && !isStepByStep && (
                <Card className="border-quantum-glow/30">
                  <CardHeader>
                    <CardTitle className="text-sm">Photon Transmission</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative h-20 bg-muted rounded-lg overflow-hidden">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-quantum-blue font-bold">
                        Alice
                      </div>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-quantum-purple font-bold">
                        Bob
                      </div>
                      <div 
                        className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-quantum-glow rounded-full transition-all duration-100"
                        style={{ left: `${photonPosition}%` }}
                      >
                      </div>
                      {eavesdroppingRate[0] > 0 && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-destructive font-bold">
                          <Eye className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step-by-step visualization */}
              {isStepByStep && stepByStepBits.length > 0 && (
                <Card className="border-quantum-glow/30">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Step-by-Step Visualization - Bit {currentBitIndex + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {stepByStepBits[currentBitIndex] && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="border-quantum-blue/30">
                            <CardHeader>
                              <CardTitle className="text-quantum-blue flex items-center gap-2 text-sm">
                                <span className="text-lg">👩‍🔬</span>
                                Alice (Sender)
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Bit Value:</span>
                                <span className={`font-mono text-lg px-2 py-1 rounded ${bitStep >= 0 ? 'bg-quantum-blue/20 text-quantum-blue' : 'bg-muted/20 text-muted-foreground'}`}>
                                  {bitStep >= 0 ? stepByStepBits[currentBitIndex].aliceBit : '?'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Basis Choice:</span>
                                <span className={`font-mono text-lg px-2 py-1 rounded ${bitStep >= 0 ? 'bg-quantum-blue/20 text-quantum-blue' : 'bg-muted/20 text-muted-foreground'}`}>
                                  {bitStep >= 0 ? stepByStepBits[currentBitIndex].aliceBasis : '?'}
                                </span>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-quantum-purple/30">
                            <CardHeader>
                              <CardTitle className="text-quantum-purple flex items-center gap-2 text-sm">
                                <span className="text-lg">👨‍🔬</span>
                                Bob (Receiver)
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Basis Choice:</span>
                                <span className={`font-mono text-lg px-2 py-1 rounded ${bitStep >= 1 ? 'bg-quantum-purple/20 text-quantum-purple' : 'bg-muted/20 text-muted-foreground'}`}>
                                  {bitStep >= 1 ? stepByStepBits[currentBitIndex].bobBasis : '?'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Measurement:</span>
                                <span className={`font-mono text-lg px-2 py-1 rounded ${bitStep >= 3 ? 'bg-quantum-purple/20 text-quantum-purple' : 'bg-muted/20 text-muted-foreground'}`}>
                                  {bitStep >= 3 ? stepByStepBits[currentBitIndex].bobMeasurement : '?'}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Current Step:</h4>
                          <div className="grid grid-cols-6 gap-2">
                            {[
                              "Alice generates bit & basis",
                              "Photon transmitted",
                              "Bob chooses basis",
                              "Photon measured",
                              "Bob measures",
                              "Basis comparison"
                            ].map((step, index) => (
                              <div
                                key={index}
                                className={`p-2 rounded text-xs text-center transition-all ${
                                  bitStep === index
                                    ? 'bg-quantum-glow/20 border border-quantum-glow/50 text-quantum-glow font-semibold'
                                    : bitStep > index
                                    ? 'bg-green-400/20 border border-green-400/30 text-green-400'
                                    : 'bg-muted/20 border border-muted/30 text-muted-foreground'
                                }`}
                              >
                                {step}
                              </div>
                            ))}
                          </div>
                        </div>

                        {bitStep >= 5 && (
                          <Card className={`${stepByStepBits[currentBitIndex].isMatching ? 'bg-green-400/10 border-green-400/30' : 'bg-red-400/10 border-red-400/30'}`}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Basis Match:</span>
                                <span className={`font-bold ${stepByStepBits[currentBitIndex].isMatching ? 'text-green-400' : 'text-red-400'}`}>
                                  {stepByStepBits[currentBitIndex].isMatching ? '✓ Yes - Key bit!' : '✗ No - Discarded'}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right column - Results */}
            <div className="space-y-6">
              {/* Results Display */}
              {(quantumBits.length > 0 || (isStepByStep && stepByStepBits.length > 0)) && (
                <Card className="border-quantum-purple/30">
                  <CardHeader>
                    <CardTitle className="text-quantum-purple flex items-center gap-2">
                      <Shield className="w-6 h-6" />
                      Simulation Results
                      {isStepByStep && (
                        <span className="text-sm font-normal ml-2 px-2 py-1 bg-quantum-glow/20 rounded">
                          Step-by-Step Mode
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-quantum-blue/30">
                            <th className="text-left p-2">Bit #</th>
                            <th className="text-left p-2 bg-quantum-blue/10 border-l border-r border-quantum-blue/30">
                              <div className="text-center">
                                <div className="font-bold text-quantum-blue">Alice (Transmitter)</div>
                                <div className="text-xs text-muted-foreground">Sending</div>
                              </div>
                            </th>
                            <th className="text-left p-2 bg-quantum-blue/10 border-r border-quantum-blue/30">Basis</th>
                            <th className="text-left p-2 bg-quantum-purple/10 border-l border-r border-quantum-purple/30">
                              <div className="text-center">
                                <div className="font-bold text-quantum-purple">Bob (Receiver)</div>
                                <div className="text-xs text-muted-foreground">Receiving</div>
                              </div>
                            </th>
                            <th className="text-left p-2 bg-quantum-purple/10 border-r border-quantum-purple/30">Basis</th>
                            <th className="text-left p-2 bg-quantum-purple/10 border-r border-quantum-purple/30">Result</th>
                            <th className="text-left p-2">Match</th>
                            <th className="text-left p-2">In Key</th>
                          </tr>
                          <tr className="border-b border-quantum-blue/20 text-xs">
                            <th className="p-1"></th>
                            <th className="p-1 bg-quantum-blue/5 text-center text-quantum-blue">Transmitted Bit</th>
                            <th className="p-1 bg-quantum-blue/5 text-center text-quantum-blue">Polarization</th>
                            <th className="p-1 bg-quantum-purple/5 text-center text-quantum-purple">Received Bit</th>
                            <th className="p-1 bg-quantum-purple/5 text-center text-quantum-purple">Measurement</th>
                            <th className="p-1 bg-quantum-purple/5 text-center text-quantum-purple">Outcome</th>
                            <th className="p-1 text-center">Basis</th>
                            <th className="p-1 text-center">Secure</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(isStepByStep ? stepByStepBits : quantumBits).map((bit, index) => (
                            <tr 
                              key={bit.id} 
                              className={`border-b ${bit.inKey ? 'bg-quantum-glow/10' : ''} ${isStepByStep && index === currentBitIndex ? 'ring-2 ring-quantum-glow/50' : ''}`}
                            >
                              <td className="p-2">{bit.id + 1}</td>
                              <td className="p-2 font-mono text-center bg-quantum-blue/5 border-l border-r border-quantum-blue/20">
                                <span className="inline-block w-6 h-6 bg-quantum-blue/20 rounded-full text-center leading-6 text-quantum-blue font-bold">
                                  {bit.aliceBit}
                                </span>
                              </td>
                              <td className="p-2 font-mono text-quantum-blue bg-quantum-blue/5 border-r border-quantum-blue/20 text-center">
                                <span className="text-lg font-bold">{bit.aliceBasis}</span>
                              </td>
                              <td className="p-2 font-mono text-center bg-quantum-purple/5 border-l border-r border-quantum-purple/20">
                                <span className="inline-block w-6 h-6 bg-quantum-purple/20 rounded-full text-center leading-6 text-quantum-purple font-bold">
                                  {bit.bobMeasurement ?? '-'}
                                </span>
                              </td>
                              <td className="p-2 font-mono text-quantum-purple bg-quantum-purple/5 border-r border-quantum-purple/20 text-center">
                                <span className="text-lg font-bold">{bit.bobBasis}</span>
                              </td>
                              <td className="p-2 bg-quantum-purple/5 border-r border-quantum-purple/20 text-center">
                                {bit.bobMeasurement !== null ? (
                                  <span className={`inline-block w-6 h-6 rounded-full text-center leading-6 font-bold ${
                                    bit.aliceBit === bit.bobMeasurement 
                                      ? 'bg-green-400/20 text-green-400' 
                                      : 'bg-red-400/20 text-red-400'
                                  }`}>
                                    {bit.bobMeasurement}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                              <td className="p-2 text-center">
                                {bit.isMatching === null ? (
                                  <span className="text-muted-foreground">-</span>
                                ) : (
                                  <span className={`inline-block w-6 h-6 rounded-full text-center leading-6 font-bold ${
                                    bit.isMatching 
                                      ? 'bg-green-400/20 text-green-400' 
                                      : 'bg-red-400/20 text-red-400'
                                  }`}>
                                    {bit.isMatching ? '✓' : '✗'}
                                  </span>
                                )}
                              </td>
                              <td className="p-2 text-center">
                                {bit.inKey ? (
                                  <span className="inline-block w-6 h-6 bg-quantum-glow/20 rounded-full text-center leading-6 text-quantum-glow font-bold">
                                    ✓
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {finalKey && (
                      <Card className="bg-quantum-glow/10 border-quantum-glow/30">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <h3 className="font-bold text-quantum-glow mb-2">Final Shared Key</h3>
                            <div className="font-mono text-lg bg-background/50 p-3 rounded border">
                              {finalKey}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Length: {finalKey.length} bits
                              {eavesdroppingRate[0] > 0 && (
                                <span className="block text-destructive">
                                  ⚠️ Eavesdropping detected! Key may be compromised.
                                </span>
                              )}
                              {noiseLevel[0] > 0 && (
                                <span className="block text-yellow-500">
                                  ⚠️ Channel noise present! Some errors expected.
                                </span>
                              )}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Analysis Graphs */}
              {showGraphs && simulationData.length > 0 && (
                <Card className="border-quantum-glow/30">
                  <CardHeader>
                    <CardTitle className="text-quantum-glow flex items-center gap-2">
                      <BarChart3 className="w-6 h-6" />
                      Simulation Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="bg-secondary/20">
                        <CardHeader>
                          <CardTitle className="text-sm">Simulation Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={simulationData.slice(0, 3)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      label={{ 
                        value: "Metrics", 
                        position: "insideBottom", 
                        offset: -5 
                      }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      label={{ 
                        value: "Count", 
                        angle: -90, 
                        position: "insideLeft" 
                      }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }} 
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-secondary/20">
                        <CardHeader>
                          <CardTitle className="text-sm">Error & Key Rates</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {simulationData.slice(3).map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded">
                                <span className="text-sm font-medium">{item.name}</span>
                                <span className={`text-lg font-bold ${
                                  item.name.includes('Error') ? 'text-red-400' : 'text-green-400'
                                }`}>
                                  {item.value}
                                </span>
                              </div>
                            ))}
                            
                            <div className="mt-4 p-3 bg-quantum-glow/10 border border-quantum-glow/30 rounded">
                              <h4 className="font-semibold text-quantum-glow text-sm mb-2">Security Assessment</h4>
                              <p className="text-xs">
                                {parseFloat(simulationData[3]?.value || '0') > 10 
                                  ? "⚠️ High error rate detected! Possible eavesdropping or excessive noise."
                                  : "✅ Error rate within acceptable limits for secure communication."
                                }
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
};