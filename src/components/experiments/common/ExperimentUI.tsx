import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PhotonTransmissionAnimation } from "@/components/PhotonTransmissionAnimation";
import { QuantumBit, ExperimentResult } from "./types";

interface SharedExperimentUIProps {
  isRunning: boolean;
  progress: number;
  photonPosition: number;
  currentBits: QuantumBit[];
  showBitsSimulation: boolean;
  results: { [key: string]: ExperimentResult };
  selectedExpId: string;
  runExperiment: () => void;
  color: string;
  experimentName: string;
  experimentData?: any[];
  analysis?: string;
  usedBits?: QuantumBit[];
  xAxisDataKey: string;
  colorScheme: string;
}

export const ExperimentUI: React.FC<SharedExperimentUIProps> = ({
  isRunning,
  progress,
  photonPosition,
  currentBits,
  showBitsSimulation,
  results,
  selectedExpId,
  runExperiment,
  color,
  experimentName,
  experimentData,
  analysis,
  usedBits,
  xAxisDataKey,
  colorScheme
}) => {
  const selectedResult = results[selectedExpId];
  
  return (
    <Card className={`border-${color}/30`}>
      <CardHeader>
        <CardTitle className={`text-${color} flex items-center gap-2`}>
          <span className="w-6 h-6" /> {/* Placeholder for icon - will be replaced by parent */}
          {experimentName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isRunning && !selectedResult && (
          <div className="text-center">
            <Button
              onClick={runExperiment}
              className={`bg-${color} hover:bg-${color}/80`}
            >
              <span className="w-4 h-4 mr-2" /> {/* Placeholder for icon */}
              Run Experiment
            </Button>
          </div>
        )}

        {isRunning && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Running experiment...</p>
              <Progress value={progress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(0)}%</p>
            </div>
            
            {/* Photon Transmission Animation */}
            <Card className="border-quantum-glow/30">
              <CardHeader>
                <CardTitle className="text-sm">Photon Transmission</CardTitle>
              </CardHeader>
              <CardContent>
                <PhotonTransmissionAnimation photonPosition={photonPosition} />
              </CardContent>
            </Card>
            
            {showBitsSimulation && currentBits.length > 0 && (
              <Card className="bg-secondary/20">
                <CardHeader>
                  <CardTitle className="text-sm">Live Quantum Bits Simulation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-8 gap-1 text-xs font-mono">
                      <div className="font-semibold">Bit</div>
                      <div className="font-semibold">A-Bit</div>
                      <div className="font-semibold">A-Basis</div>
                      <div className="font-semibold">B-Basis</div>
                      <div className="font-semibold">B-Meas</div>
                      <div className="font-semibold">Match</div>
                      <div className="font-semibold">Key</div>
                      <div className="font-semibold">Eve</div>
                      
                      {currentBits.slice(0, Math.min(20, currentBits.length)).map((bit) => (
                        <React.Fragment key={bit.id}>
                          <div className="p-1 text-center">{bit.id + 1}</div>
                          <div className={`p-1 text-center rounded ${bit.aliceBit ? 'bg-quantum-blue/30' : 'bg-quantum-purple/30'}`}>
                            {bit.aliceBit}
                          </div>
                          <div className="p-1 text-center text-xs">{bit.aliceBasis[0]}</div>
                          <div className="p-1 text-center text-xs">{bit.bobBasis[0]}</div>
                          <div className={`p-1 text-center rounded ${bit.bobMeasurement ? 'bg-quantum-blue/30' : 'bg-quantum-purple/30'}`}>
                            {bit.bobMeasurement}
                          </div>
                          <div className={`p-1 text-center rounded text-xs ${bit.match ? 'bg-green-400/30 text-green-400' : 'bg-red-400/30 text-red-400'}`}>
                            {bit.match ? '✓' : '✗'}
                          </div>
                          <div className={`p-1 text-center rounded text-xs ${bit.kept ? 'bg-quantum-glow/30 text-quantum-glow' : 'bg-muted/30'}`}>
                            {bit.kept ? '⚿' : '-'}
                          </div>
                          <div className={`p-1 text-center rounded text-xs ${bit.eavesdropped ? 'bg-destructive/30 text-destructive' : 'bg-muted/30'}`}>
                            {bit.eavesdropped ? '👁' : '-'}
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                    {currentBits.length > 20 && (
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Showing first 20 of {currentBits.length} qubits...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {selectedResult && (
          <div className="space-y-6">
            {/* Left Column - Experiment Details */}
            <div className="space-y-6">
              {/* Experiment Formulas */}
              <Card className="bg-secondary/20 border-quantum-glow/20">
                <CardHeader>
                  <CardTitle className="text-sm text-quantum-glow flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Calculations & Formulas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-quantum-purple">Statistical Formulas:</h4>
                      <div className="font-mono text-xs space-y-1 bg-background/50 p-3 rounded">
                        {selectedExpId === 'effect-of-qubits' && (
                          <>
                            <div>Statistical Security = (Qubits / 50) × 100%</div>
                            <div>Key Length = Matched Bases - Errors</div>
                          </>
                        )}
                        {selectedExpId === 'effect-of-channel-noise' && (
                          <>
                            <div>Error Rate = (Noise Level + Base Errors) / Total</div>
                            <div>Security = Error Rate &lt; 11% ? "Secure" : "Compromised"</div>
                          </>
                        )}
                        {selectedExpId === 'without-eavesdropper' && (
                          <>
                            <div>Error Rate = Base Channel Errors</div>
                            <div>Security = Error Rate &lt; 11% ? "Secure" : "Insecure"</div>
                          </>
                        )}
                        {selectedExpId === 'with-eavesdropper' && (
                          <>
                            <div>Detection Prob = min(100%, Error Rate × 4)</div>
                            <div>Eve Error = 25% per intercepted qubit</div>
                          </>
                        )}
                        {selectedExpId === 'effect-of-distance' && (
                          <>
                            <div>Photon Loss = (1 - e^(-Distance/50)) × 100%</div>
                            <div>Error Rate = Noise + Distance Factor</div>
                          </>
                        )}
                        {selectedExpId === 'overall' && (
                          <>
                            <div>Combined Error = f(Distance, Noise, Eavesdropping)</div>
                            <div>Security = Error Rate &lt; 11% ? "Secure" : "Compromised"</div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-quantum-blue">Experiment Data:</h4>
                      <div className="font-mono text-xs space-y-1 bg-background/50 p-3 rounded max-h-32 overflow-y-auto">
                        {selectedResult.data.slice(0, 5).map((dataPoint, idx) => (
                          <div key={idx} className="text-xs">
                            {Object.entries(dataPoint).map(([key, value]) => (
                              <span key={key} className="mr-2">
                                {key}: {typeof value === 'number' ? value.toFixed(1) : String(value)}
                              </span>
                            ))}
                          </div>
                        ))}
                        {selectedResult.data.length > 5 && (
                          <div className="text-muted-foreground">...and {selectedResult.data.length - 5} more data points</div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Bits Storage Display */}
              {selectedResult.usedBits && selectedResult.usedBits.length > 0 && (
                <div className="grid gap-4">
                  {/* Alice's Bits */}
                  <Card className="bg-quantum-blue/10 border-quantum-blue/30">
                    <CardHeader>
                      <CardTitle className="text-sm text-quantum-blue flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-quantum-blue"></div>
                        Alice's Transmitted Bits
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">Bits: {selectedResult.usedBits!.filter(b => b.kept).length} kept from {selectedResult.usedBits!.length} total</div>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                          {selectedResult.usedBits!.map((bit, index) => (
                            <div 
                              key={index}
                              className={`w-6 h-6 flex items-center justify-center text-xs font-mono rounded border ${
                                bit.kept 
                                  ? 'bg-quantum-blue/30 border-quantum-blue text-quantum-blue' 
                                  : 'bg-muted/20 border-muted text-muted-foreground'
                              }`}
                              title={`Bit ${index + 1}: ${bit.aliceBit} (${bit.aliceBasis}) ${bit.kept ? '- Kept' : '- Discarded'}`}
                            >
                              {bit.aliceBit}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bob's Bits */}
                  <Card className="bg-quantum-purple/10 border-quantum-purple/30">
                    <CardHeader>
                      <CardTitle className="text-sm text-quantum-purple flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-quantum-purple"></div>
                        Bob's Received Bits
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">Measurements: {selectedResult.usedBits!.filter(b => b.kept).length} kept from {selectedResult.usedBits!.length} total</div>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                          {selectedResult.usedBits!.map((bit, index) => (
                            <div 
                              key={index}
                              className={`w-6 h-6 flex items-center justify-center text-xs font-mono rounded border ${
                                bit.kept 
                                  ? bit.eavesdropped 
                                    ? 'bg-destructive/30 border-destructive text-destructive'
                                    : 'bg-quantum-purple/30 border-quantum-purple text-quantum-purple'
                                  : 'bg-muted/20 border-muted text-muted-foreground'
                              }`}
                              title={`Bit ${index + 1}: ${bit.bobMeasurement} (${bit.bobBasis}) ${bit.kept ? '- Kept' : '- Discarded'} ${bit.eavesdropped ? '- Eavesdropped' : ''}`}
                            >
                              {bit.bobMeasurement}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Right Column - Results and Analysis */}
            <div className="space-y-6">
              <Card className="bg-secondary/30">
                <CardHeader>
                  <CardTitle className="text-sm">Experiment Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedResult.data.length === 1 && selectedExpId === "without-eavesdropper" ? (
                    <Card className="h-64 flex items-center justify-center bg-secondary/20">
                      <div className="text-center p-6">
                        <h4 className="text-lg font-semibold mb-4">Single Run Results</h4>
                        <div className="space-y-2">
                          <p>Key Rate: <span className="font-mono">{selectedResult.data[0].keyRate?.toFixed(2)}%</span></p>
                          <p>Error Rate: <span className="font-mono">{selectedResult.data[0].errorRate?.toFixed(2)}%</span></p>
                          <p className={`font-semibold mt-4 ${selectedResult.data[0].security === 'Secure' ? 'text-green-500' : 'text-destructive'}`}>
                            Security: {selectedResult.data[0].security}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <div className="h-64 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={selectedResult.data}
                          margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                          <XAxis 
                            dataKey={xAxisDataKey}
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12}
                            label={{ 
                              value: "",
                              position: "insideBottom", 
                              offset: -5 
                            }}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12}
                            label={{ 
                              value: "Error Rate (%)", 
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
                          <Line 
                            type={selectedResult.data.length > 1 ? "monotone" : "step"}
                            dataKey="errorRate" 
                            stroke="hsl(var(--destructive))" 
                            strokeWidth={2}
                            name="Error Rate (%)"
                            symbol={selectedResult.data.length === 1 ? "circle" : "circle"}
                            dot={selectedResult.data.length === 1 ? true : false}
                          />
                          {selectedExpId !== "basis-mismatch" && selectedExpId !== "without-eavesdropper" && (
                            <Line 
                              type={selectedResult.data.length > 1 ? "monotone" : "step"}
                              dataKey={
                                selectedExpId === "effect-of-qubits" ? "statisticalSecurity" :
                                selectedExpId === "effect-of-distance" ? "photonLoss" :
                                selectedExpId === "overall" ? "security" :
                                "keyRate"
                              }
                              stroke={`hsl(var(--${colorScheme}))`}
                              strokeWidth={2}
                              name={
                                selectedExpId === "effect-of-qubits" ? "Statistical Security (%)" :
                                selectedExpId === "effect-of-distance" ? "Photon Loss (%)" :
                                selectedExpId === "overall" ? "Security" :
                                "Key Rate (%)"
                              }
                              symbol={selectedResult.data.length === 1 ? "circle" : "circle"}
                              dot={selectedResult.data.length === 1 ? true : false}
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  
                  <Card className="bg-quantum-glow/10 border-quantum-glow/30">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-quantum-glow mb-2">Analysis</h4>
                      <p className="text-sm">{selectedResult.analysis}</p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};