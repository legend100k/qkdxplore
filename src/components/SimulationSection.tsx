import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCw, Zap, Eye, Shield, BarChart3, Settings } from "lucide-react";
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

  const steps = [
    "Alice generates random bits and bases",
    "Alice sends photons to Bob",
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
      
      let bobMeasurement = null;
      let isMatching = null;
      let inKey = false;

      if (currentStep >= 4) {
        isMatching = aliceBasis === bobBasis;
        if (isMatching) {
          // Apply eavesdropping and noise effects
          let correctBit = aliceBit;
          
          // Eavesdropping effect
          if (eavesProbability > 0 && Math.random() < eavesProbability) {
            correctBit = Math.random() > 0.25 ? 1 - aliceBit : aliceBit;
          }
          
          // Noise effect
          if (noise > 0 && Math.random() < noise) {
            correctBit = 1 - correctBit;
          }
          
          bobMeasurement = correctBit;
          inKey = true;
        } else {
          bobMeasurement = Math.random() > 0.5 ? 1 : 0;
        }
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
          {/* Simulation Parameters */}
          <Card className="bg-secondary/30 border-quantum-glow/20">
            <CardHeader>
              <CardTitle className="text-quantum-glow flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Simulation Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
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

          <div className="flex items-center gap-4">
            <Button
              onClick={runSimulation}
              disabled={isRunning}
              className="bg-quantum-blue hover:bg-quantum-blue/80"
            >
              {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isRunning ? "Running..." : "Start Simulation"}
            </Button>
            
            <Button
              onClick={resetSimulation}
              variant="outline"
              className="border-quantum-purple/50 hover:bg-quantum-purple/10"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Reset
            </Button>

            {eavesdroppingRate[0] > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/30 rounded">
                <Eye className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">Eve Active ({eavesdroppingRate[0]}%)</span>
              </div>
            )}

            {noiseLevel[0] > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
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
              <div className="p-4 bg-secondary/30 rounded-lg border border-quantum-glow/30">
                <p className="font-semibold text-quantum-glow">Current Step:</p>
                <p className="text-sm text-foreground/90">{steps[currentStep - 1]}</p>
              </div>
            )}
          </div>

          {/* Photon transmission visualization */}
          {currentStep === 1 && (
            <Card className="bg-background/50 border-quantum-purple/20">
              <CardContent className="p-6">
                <div className="relative h-20 bg-gradient-to-r from-quantum-blue/20 to-quantum-purple/20 rounded-lg overflow-hidden">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-quantum-blue font-bold">
                    Alice
                  </div>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-quantum-purple font-bold">
                    Bob
                  </div>
                  <div 
                    className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-quantum-glow rounded-full quantum-glow transition-all duration-100"
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
        </CardContent>
      </Card>

      {/* Results Display */}
      {quantumBits.length > 0 && (
        <Card className="border-quantum-purple/30">
          <CardHeader>
            <CardTitle className="text-quantum-purple flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Simulation Results
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
                  {quantumBits.map((bit) => (
                    <tr 
                      key={bit.id} 
                      className={`border-b border-muted/20 ${
                        bit.inKey ? 'bg-quantum-glow/10' : ''
                      }`}
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
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
  );
};