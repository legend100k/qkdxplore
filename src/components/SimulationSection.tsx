import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, Pause, RotateCw, Zap, Eye, Shield, Activity, Settings, ChevronLeft, ChevronRight, StepForward, Loader2, CheckCircle, XCircle, Cpu, Atom } from "lucide-react";
import { toast } from "sonner";
import { MatlabPlot } from "@/components/MatlabPlot";
import { apiFetch } from "@/lib/api";

interface QuantumBit {
  id: number;
  aliceBit: number;
  aliceBasis: string;
  bobBasis: string;
  bobMeasurement: number | null;
  isMatching: boolean | null;
  inKey: boolean;
}

interface BB84Result {
  alice_bits: number[];
  alice_bases: number[];
  bob_bases: number[];
  bob_results: number[];
  alice_key: number[];
  bob_key: number[];
  qber: number;
  job_id: string;
  key_length: number;
  keys_match: boolean;
}

interface APIResponse {
  success: boolean;
  data?: BB84Result;
  error?: string;
}

const getBasisSymbol = (basis: string): string => {
  switch (basis) {
    case "+": return "→";  // Rectilinear basis (Horizontal/Vertical)
    case "×": return "↗";  // Diagonal basis (Diagonal/Anti-diagonal)
    default: return basis;
  }
};

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
  const [simulationData, setSimulationData] = useState<QuantumBit[]>([]);
  const [showGraphs, setShowGraphs] = useState(false);
  const [isStepByStep, setIsStepByStep] = useState(false);
  const [currentBitIndex, setCurrentBitIndex] = useState(0);
  const [stepByStepBits, setStepByStepBits] = useState<QuantumBit[]>([]);
  const [bitStep, setBitStep] = useState(0);
  
  // New state for Qiskit integration
  const [useQiskit, setUseQiskit] = useState(false);
  const [qiskitResult, setQiskitResult] = useState<BB84Result | null>(null);
  const [qiskitError, setQiskitError] = useState<string | null>(null);
  const [isLoadingQiskit, setIsLoadingQiskit] = useState(false);
  const [seed, setSeed] = useState(0);
  const [useSimulation, setUseSimulation] = useState(true);

  const steps = [
    "Alice generates random bits and bases",
    "Alice sends photons to Bob",
    "Photon transmitted",
    "Bob randomly chooses measurement bases", 
    "Bob measures photons",
    "Public basis comparison",
    "Key sifting and final key generation"
  ];

  const runQiskitBB84 = async () => {
    setIsLoadingQiskit(true);
    setQiskitError(null);
    setQiskitResult(null);

    try {
      const endpoint = useSimulation ? '/api/bb84/simulate' : '/api/bb84';
      const response = await apiFetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          n_bits: numQubits[0],
          seed: seed
        })
      });

      const data: APIResponse = await response.json();

      if (data.success && data.data) {
        setQiskitResult(data.data);
        // Convert Qiskit result to QuantumBit format for display
        const convertedBits = convertQiskitToQuantumBits(data.data);
        setQuantumBits(convertedBits);
        setFinalKey(data.data.alice_key.join(''));
        generateAnalysisData(convertedBits);
        setShowGraphs(true);
        toast.success(`Qiskit BB84 complete! Generated ${data.data.key_length}-bit key.`);
      } else {
        setQiskitError(data.error || 'Unknown error occurred');
        toast.error(`Qiskit error: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      let errorMsg = 'Failed to connect to Qiskit backend.';
      
      if (err instanceof Error) {
        if (err.message.includes('fetch') || err.message.includes('Failed to connect')) {
          errorMsg += ' Please ensure the backend service is running. In local development, run `python start_backend.py`.';
        } else {
          errorMsg += ` ${err.message}`;
        }
      } else {
        errorMsg += ' Unknown error occurred.';
      }
      
      setQiskitError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoadingQiskit(false);
    }
  };

  const convertQiskitToQuantumBits = (result: BB84Result): QuantumBit[] => {
    const bits: QuantumBit[] = [];
    
    for (let i = 0; i < result.alice_bits.length; i++) {
      const aliceBasis = result.alice_bases[i] === 0 ? "+" : "×";
      const bobBasis = result.bob_bases[i] === 0 ? "+" : "×";
      const isMatching = aliceBasis === bobBasis;
      
      bits.push({
        id: i,
        aliceBit: result.alice_bits[i],
        aliceBasis: aliceBasis,
        bobBasis: bobBasis,
        bobMeasurement: result.bob_results[i],
        isMatching: isMatching,
        inKey: isMatching
      });
    }
    
    return bits;
  };

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
    if (bitStep < 4) {
      setBitStep(bitStep + 1);
      if (bitStep === 3) {
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
      setBitStep(4);
    }
  };

  const runSimulation = async () => {
    if (useQiskit) {
      await runQiskitBB84();
      return;
    }

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
    setQiskitResult(null);
    setQiskitError(null);
    setIsLoadingQiskit(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-quantum-blue/30">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-quantum-blue flex items-center gap-2">
              <Zap className="w-6 h-6" />
              BB84 Protocol Simulation
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => setIsStepByStep(!isStepByStep)}
                variant={isStepByStep ? "default" : "outline"}
                className={`border-quantum-purple/30 ${isStepByStep ? "bg-quantum-purple hover:bg-quantum-purple/90" : ""}`}
                size="sm"
              >
                <StepForward className="w-4 h-4 mr-1" />
                {isStepByStep ? "Step" : "Auto"}
              </Button>
              {!isStepByStep ? (
                <Button
                  onClick={runSimulation}
                  disabled={isRunning || isLoadingQiskit}
                  className="bg-quantum-blue hover:bg-quantum-blue/90"
                  size="sm"
                >
                  {isRunning || isLoadingQiskit ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      {useQiskit ? "Running Qiskit..." : "Running"}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1" />
                      {useQiskit ? "Run Qiskit BB84" : "Start"}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={startStepByStepMode}
                  disabled={stepByStepBits.length > 0 || useQiskit}
                  className="bg-quantum-blue hover:bg-quantum-blue/90"
                  size="sm"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </Button>
              )}
              <Button
                onClick={resetSimulation}
                variant="outline"
                className="border-quantum-glow/30"
                size="sm"
              >
                <RotateCw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Two-column layout for simulation controls and results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column - Controls */}
            <div className="space-y-6">
              {/* Simulation Mode Selection */}
              <Card className="border-quantum-blue/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Simulation Mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="local-sim"
                      name="simulation-mode"
                      checked={!useQiskit}
                      onChange={() => setUseQiskit(false)}
                      className="rounded"
                    />
                    <Label htmlFor="local-sim" className="flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      Local Simulation
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="qiskit-sim"
                      name="simulation-mode"
                      checked={useQiskit}
                      onChange={() => setUseQiskit(true)}
                      className="rounded"
                    />
                    <Label htmlFor="qiskit-sim" className="flex items-center gap-2">
                      <Atom className="w-4 h-4" />
                      Qiskit Backend
                    </Label>
                  </div>
                </CardContent>
              </Card>

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
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium whitespace-nowrap">Qubits:</label>
                      <Slider
                        value={numQubits}
                        onValueChange={setNumQubits}
                        max={50}
                        min={8}
                        step={2}
                        className="flex-1"
                        disabled={isRunning || isLoadingQiskit}
                      />
                      <span className="text-sm w-8">{numQubits[0]}</span>
                    </div>

                    {!useQiskit && (
                      <>
                        <div className="flex items-center gap-4">
                          <label className="text-sm font-medium whitespace-nowrap">Eavesdrop:</label>
                          <Slider
                            value={eavesdroppingRate}
                            onValueChange={setEavesdroppingRate}
                            max={100}
                            min={0}
                            step={5}
                            className="flex-1"
                            disabled={isRunning}
                          />
                          <span className="text-sm w-8">{eavesdroppingRate[0]}%</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="text-sm font-medium whitespace-nowrap">Noise:</label>
                          <Slider
                            value={noiseLevel}
                            onValueChange={setNoiseLevel}
                            max={20}
                            min={0}
                            step={1}
                            className="flex-1"
                            disabled={isRunning}
                          />
                          <span className="text-sm w-8">{noiseLevel[0]}%</span>
                        </div>
                      </>
                    )}

                    {useQiskit && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="seed">Random Seed</Label>
                          <Input
                            id="seed"
                            type="number"
                            value={seed}
                            onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                            disabled={isRunning || isLoadingQiskit}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="useSimulation"
                            checked={useSimulation}
                            onChange={(e) => setUseSimulation(e.target.checked)}
                            className="rounded"
                            disabled={isRunning || isLoadingQiskit}
                          />
                          <Label htmlFor="useSimulation">Use Simulation Mode (faster)</Label>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {!isStepByStep && (
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">Progress:</span>
                    <Progress value={progress} className="flex-1" />
                    <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                )}
                
                {currentStep > 0 && !isStepByStep && (
                  <Card className="bg-quantum-blue/5 border-quantum-blue/20">
                    <CardContent className="p-3">
                      <p className="font-semibold text-quantum-blue">Current Step:</p>
                      <p className="text-sm">{steps[currentStep - 1]}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!useQiskit && eavesdroppingRate[0] > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive rounded">
                    <Eye className="w-4 h-4 text-destructive" />
                    <span className="text-sm text-destructive">Eve Active ({eavesdroppingRate[0]}%)</span>
                  </div>
                )}

                {!useQiskit && noiseLevel[0] > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500 rounded">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-yellow-500">Noise ({noiseLevel[0]}%)</span>
                  </div>
                )}

                {useQiskit && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-quantum-blue/10 border border-quantum-blue rounded">
                    <Atom className="w-4 h-4 text-quantum-blue" />
                    <span className="text-sm text-quantum-blue">
                      {useSimulation ? 'Qiskit Simulation' : 'IBM Quantum Hardware'}
                    </span>
                  </div>
                )}
              </div>

              {/* Qiskit Error Display */}
              {qiskitError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    {qiskitError}
                    {qiskitError.includes('Unable to retrieve instances') && (
                      <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm">
                        <strong>API Key Issue:</strong> The IBM Quantum API key may be invalid or expired. 
                        Please get a new API key from <a href="https://quantum.ibm.com/" target="_blank" className="text-blue-600 underline">IBM Quantum Platform</a> 
                        or use Simulation Mode for now.
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Qiskit Results Summary */}
              {qiskitResult && (
                <Card className="bg-quantum-blue/5 border-quantum-blue/30">
                  <CardHeader>
                    <CardTitle className="text-quantum-blue flex items-center gap-2 text-sm">
                      <Atom className="w-4 h-4" />
                      Qiskit BB84 Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Key Length:</span>
                        <Badge variant="secondary">{qiskitResult.key_length} bits</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">QBER:</span>
                        <Badge variant="secondary">{(qiskitResult.qber * 100).toFixed(2)}%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Keys Match:</span>
                        <div className="flex items-center gap-1">
                          {qiskitResult.keys_match ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className={qiskitResult.keys_match ? 'text-green-500' : 'text-red-500'}>
                            {qiskitResult.keys_match ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Job ID:</span>
                        <span className="font-mono text-xs">{qiskitResult.job_id}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step-by-step controls */}
              {isStepByStep && stepByStepBits.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={previousBitStep}
                    disabled={currentBitIndex === 0 && bitStep === 0}
                    variant="outline"
                    className="border-quantum-purple/30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={nextBitStep}
                    disabled={currentBitIndex === stepByStepBits.length - 1 && bitStep === 4 && !!finalKey}
                    className="bg-quantum-purple hover:bg-quantum-purple/90"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  <span className="text-sm px-3 py-2 bg-muted rounded border whitespace-nowrap">
                    Bit {currentBitIndex + 1}/{stepByStepBits.length} - Step {bitStep + 1}/5
                  </span>
                </div>
              )}

              {/* Step-by-step visualization */}
              {isStepByStep && stepByStepBits.length > 0 && (
                <Card className="border-quantum-glow/30">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Step-by-Step Visualization - Bit {currentBitIndex + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                                  {bitStep >= 0 ? getBasisSymbol(stepByStepBits[currentBitIndex].aliceBasis) : '?'}
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
                                  {bitStep >= 1 ? getBasisSymbol(stepByStepBits[currentBitIndex].bobBasis) : '?'}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {[
                                "Alice generates bits and random bases",
                                "Photon transmitted on quantum channel",
                                "Bob selects random bases",
                                "Bob measures photon",
                                "Selected basis are shared and compared"
                              ].map((step, index) => (
                                <div
                                  key={index}
                                  className={`p-4 rounded text-sm text-center transition-all ${
                                    bitStep === index
                                      ? 'bg-quantum-glow/20 border-2 border-quantum-glow text-quantum-glow font-semibold'
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

                        {bitStep >= 4 && (
                          <Card className={`${stepByStepBits[currentBitIndex].isMatching ? 'bg-green-400/10 border-green-400/30' : 'bg-red-400/10 border-red-400/30'}`}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Basis Match:</span>
                                <span className={`font-bold ${stepByStepBits[currentBitIndex].isMatching ? 'text-green-400' : 'text-red-400'}`}>
                                  {stepByStepBits[currentBitIndex].isMatching ? '✓ Yes - Key bit!' : 'X No - Discarded'}
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
                                <span className="text-lg font-bold">{getBasisSymbol(bit.aliceBasis)}</span>
                              </td>
                              <td className="p-2 font-mono text-center bg-quantum-purple/5 border-l border-r border-quantum-purple/20">
                                <span className="inline-block w-6 h-6 bg-quantum-purple/20 rounded-full text-center leading-6 text-quantum-purple font-bold">
                                  {bit.bobMeasurement ?? '-'}
                                </span>
                              </td>
                              <td className="p-2 font-mono text-quantum-purple bg-quantum-purple/5 border-r border-quantum-purple/20 text-center">
                                <span className="text-lg font-bold">{getBasisSymbol(bit.bobBasis)}</span>
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
                                    {bit.isMatching ? '✓' : 'X'}
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
                            <h3 className="font-bold text-quantum-glow mb-2">
                              {useQiskit ? 'Qiskit BB84 Final Key' : 'Final Shared Key'}
                            </h3>
                            <div className="font-mono text-lg bg-background/50 p-3 rounded border">
                              {finalKey}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Length: {finalKey.length} bits
                              {useQiskit && qiskitResult && (
                                <>
                                  <span className="block">
                                    QBER: {(qiskitResult.qber * 100).toFixed(2)}%
                                  </span>
                                  <span className="block">
                                    Mode: {useSimulation ? 'Qiskit Simulation' : 'IBM Quantum Hardware'}
                                  </span>
                                  {!qiskitResult.keys_match && (
                                    <span className="block text-red-500">
                                      ⚠️ Keys don't match! Possible quantum errors.
                                    </span>
                                  )}
                                </>
                              )}
                              {!useQiskit && eavesdroppingRate[0] > 0 && (
                                <span className="block text-destructive">
                                  ⚠️ Eavesdropping detected! Key may be compromised.
                                </span>
                              )}
                              {!useQiskit && noiseLevel[0] > 0 && (
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
                      <Activity className="w-6 h-6" />
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
                          <div className="flex justify-center">
                            <MatlabPlot
                              data={simulationData.slice(0, 3)}
                              xAxisKey="name"
                              seriesKeys={["value"]}
                              xAxisLabel="Metrics"
                              yAxisLabel="Count"
                              title="Simulation Metrics"
                              width={400}
                              height={300}
                            />
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