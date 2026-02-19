import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Play, RotateCw, Loader2, Shield, ShieldCheck, AlertCircle, Zap, Eye, TrendingUp, Activity } from "lucide-react";
import { toast } from "sonner";
import {
  runQKDSimulation,
  runB92Protocol,
  runE91Protocol,
  analyzeKeyRateVsDistance,
  analyzeEavesdroppingSensitivity,
  generateSimulationReport,
  type QKDSimulationResult,
  type B92SimulationResult,
  type E91SimulationResult,
} from "@/lib/quantum";

declare global {
  interface Window {
    google: any;
  }
}

type Protocol = "B92" | "E91";

export const E91SimulationSection = () => {
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol>("E91");
  const [isRunning, setIsRunning] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Simulation parameters
  const [numSignals, setNumSignals] = useState([1000]);
  const [fiberLength, setFiberLength] = useState([10]);
  const [eavesdroppingRate, setEavesdroppingRate] = useState([0]);
  const [noiseLevel, setNoiseLevel] = useState([2]);
  
  // Results
  const [simulationResult, setSimulationResult] = useState<QKDSimulationResult | null>(null);
  const [b92Result, setB92Result] = useState<B92SimulationResult | null>(null);
  const [e91Result, setE91Result] = useState<E91SimulationResult | null>(null);

  // Run simulation using quantum library
  const runSimulation = () => {
    try {
      setIsRunning(true);
      setSimulationResult(null);
      setB92Result(null);
      setE91Result(null);
      setShowAnalysis(false);

      setTimeout(() => {
        const result = runQKDSimulation({
          protocol: selectedProtocol,
          numSignals: numSignals[0],
          channelParams: {
            fiberLength: fiberLength[0],
            wavelength: 1550,
            detectorEfficiency: 0.85,
            darkCountRate: 100,
            timingWindow: 1.0,
          },
          eveConfig: eavesdroppingRate[0] > 0 ? {
            attackType: 'intercept-resend',
            interceptionProbability: eavesdroppingRate[0] / 100,
          } : undefined,
        });

        setSimulationResult(result);

        if (selectedProtocol === "B92") {
          setB92Result(result.b92Result || null);
        } else {
          setE91Result(result.e91Result || null);
        }

        setShowAnalysis(true);
        setIsRunning(false);

        const keyBits = result.finalKeyLength;
        toast.success(`${selectedProtocol} simulation complete! Generated ${keyBits}-bit secure key.`);
      }, 500);
    } catch (error) {
      console.error("Simulation failed:", error);
      toast.error("Simulation failed. Please try again.");
      setIsRunning(false);
    }
  };

  const resetSimulation = () => {
    setSimulationResult(null);
    setB92Result(null);
    setE91Result(null);
    setShowAnalysis(false);
  };

  // Run distance analysis
  const runDistanceAnalysis = () => {
    setIsRunning(true);
    
    setTimeout(() => {
      const distances = [0, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
      const analysis = analyzeKeyRateVsDistance(selectedProtocol, distances, {
        numSignals: numSignals[0],
        eveConfig: eavesdroppingRate[0] > 0 ? {
          attackType: 'intercept-resend',
          interceptionProbability: eavesdroppingRate[0] / 100,
        } : undefined,
      });

      // Store analysis in a way we can chart
      const analysisData = analysis.map(a => ({
        name: `${a.distance} km`,
        keyRate: a.keyRate * 100,
        qber: a.qber * 100,
        secure: a.secure ? 100 : 0,
        chshSValue: a.chshSValue ? a.chshSValue * 10 : 0,
      }));

      setSimulationResult(prev => prev ? {
        ...prev,
        analysis: {
          ...prev.analysis,
          distanceAnalysis: analysisData,
        }
      } as any : null);

      setIsRunning(false);
      toast.success("Distance analysis complete!");
    }, 1000);
  };

  // Render results table for B92
  const renderB92Table = () => {
    if (!b92Result) return null;

    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="sticky top-0 bg-gray-50 dark:bg-slate-950">
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">#</th>
              <th className="px-4 py-2 text-center text-xs font-bold text-purple-700 uppercase">Alice State</th>
              <th className="px-4 py-2 text-center text-xs font-bold text-purple-700 uppercase">Alice Bit</th>
              <th className="px-4 py-2 text-center text-xs font-bold text-indigo-700 uppercase">Bob Basis</th>
              <th className="px-4 py-2 text-center text-xs font-bold text-indigo-700 uppercase">Bob Result</th>
              <th className="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">Conclusive</th>
              <th className="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">In Key</th>
            </tr>
          </thead>
          <tbody>
            {b92Result.bits.slice(0, 50).map((bit) => (
              <tr key={bit.id} className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800 ${bit.inKey ? "bg-green-50/30 dark:bg-green-900/10" : ""}`}>
                <td className="p-3 text-center text-xs">{bit.id + 1}</td>
                <td className="p-2 text-center font-mono text-lg">{bit.aliceState === 0 ? '→' : '↗'}</td>
                <td className="p-2 text-center">
                  <span className="inline-flex w-6 h-6 items-center justify-center rounded bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-mono text-sm font-bold">
                    {bit.aliceBit}
                  </span>
                </td>
                <td className="p-2 text-center font-mono text-lg">{bit.bobBasis === 0 ? '↕' : '↘'}</td>
                <td className="p-2 text-center">
                  <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold ${
                    bit.bobResult !== null 
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                  }`}>
                    {bit.bobResult ?? '-'}
                  </span>
                </td>
                <td className="p-2 text-center">{bit.bobResult !== null ? '✓' : '-'}</td>
                <td className="p-2 text-center">
                  {bit.inKey ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white mx-auto">
                      <Shield className="w-3 h-3" />
                    </div>
                  ) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {b92Result.bits.length > 50 && (
          <div className="p-4 text-center text-sm text-gray-500">
            Showing first 50 of {b92Result.bits.length} bits
          </div>
        )}
      </div>
    );
  };

  // Render results table for E91 with Bell state visualization
  const renderE91Table = () => {
    if (!e91Result) return null;

    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="sticky top-0 bg-gray-50 dark:bg-slate-950">
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">#</th>
              <th className="px-4 py-2 text-center text-xs font-bold text-purple-600 uppercase">Bell State</th>
              <th colSpan={2} className="px-4 py-2 border-l border-r bg-purple-50/50 dark:bg-purple-900/10 text-center text-xs font-bold text-purple-700 uppercase">Alice</th>
              <th colSpan={2} className="px-4 py-2 border-r bg-indigo-50/50 dark:bg-indigo-900/10 text-center text-xs font-bold text-indigo-700 uppercase">Bob</th>
              <th className="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">Correlation</th>
              <th className="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">For Key</th>
              <th className="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">For CHSH</th>
            </tr>
            <tr className="border-b bg-gray-50/50 dark:bg-slate-900">
              <th className="p-2"></th>
              <th className="p-2 text-center text-[10px] text-gray-500 uppercase">|Φ⁺⟩</th>
              <th className="px-2 py-2 text-center text-[10px] text-gray-500 uppercase border-l">Basis</th>
              <th className="px-2 py-2 text-center text-[10px] text-gray-500 uppercase border-r">Outcome</th>
              <th className="px-2 py-2 text-center text-[10px] text-gray-500 uppercase">Basis</th>
              <th className="px-2 py-2 text-center text-[10px] text-gray-500 uppercase border-r">Outcome</th>
              <th className="px-2 py-2 text-center text-[10px] text-gray-500 uppercase"></th>
              <th className="px-2 py-2 text-center text-[10px] text-gray-500 uppercase"></th>
              <th className="px-2 py-2 text-center text-[10px] text-gray-500 uppercase"></th>
            </tr>
          </thead>
          <tbody>
            {e91Result.pairs.slice(0, 50).map((pair) => {
              // Calculate expected correlation based on angles
              const angleDiff = pair.aliceAngle - pair.bobAngle;
              const expectedCorrelation = Math.cos(2 * angleDiff);
              const actualCorrelation = pair.aliceOutcome === pair.bobOutcome ? 1 : -1;
              
              return (
                <tr key={pair.id} className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800 ${pair.inKey ? "bg-green-50/30 dark:bg-green-900/10" : ""}`}>
                  <td className="p-3 text-center text-xs">{pair.id + 1}</td>
                  <td className="p-2 text-center font-mono text-xs text-purple-600 dark:text-purple-400">
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold">
                      |Φ⁺⟩
                    </span>
                  </td>
                  <td className="p-2 text-center border-l font-mono text-sm">{(pair.aliceBasis * 45).toFixed(0)}°</td>
                  <td className="p-2 text-center border-r">
                    <span className="inline-flex w-6 h-6 items-center justify-center rounded bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-mono text-sm font-bold">
                      {pair.aliceOutcome}
                    </span>
                  </td>
                  <td className="p-2 text-center font-mono text-sm">{(pair.bobBasis * 45).toFixed(0)}°</td>
                  <td className="p-2 text-center border-r">
                    <span className="inline-flex w-6 h-6 items-center justify-center rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-mono text-sm font-bold">
                      {pair.bobOutcome}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className={`text-xs font-bold ${actualCorrelation === 1 ? 'text-green-600' : 'text-red-600'}`}>
                        {actualCorrelation === 1 ? 'same' : 'diff'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        (exp: {(expectedCorrelation * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </td>
                  <td className="p-2 text-center">{pair.inKey ? '✓' : '-'}</td>
                  <td className="p-2 text-center">{pair.forCHSH ? '✓' : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {e91Result.pairs.length > 50 && (
          <div className="p-4 text-center text-sm text-gray-500">
            Showing first 50 of {e91Result.pairs.length} pairs
          </div>
        )}
      </div>
    );
  };

  // Chart rendering
  const loadGoogleCharts = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (window.google?.visualization) {
        resolve(window.google);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/charts/loader.js';
      script.async = true;
      script.onload = () => {
        window.google.charts.load('current', { packages: ['corechart', 'line'] });
        window.google.charts.setOnLoadCallback(() => resolve(window.google));
      };
      script.onerror = () => reject(new Error('Failed to load Google Charts'));
      document.head.appendChild(script);
    });
  };

  const renderChart = (chartId: string, data: any[], options: any) => {
    loadGoogleCharts().then(() => {
      const chartContainer = document.getElementById(chartId);
      if (!chartContainer || !window.google?.visualization) return;

      const dataTable = window.google.visualization.arrayToDataTable(data);
      const chart = new window.google.visualization.LineChart(chartContainer);
      chart.draw(dataTable, options);
    }).catch(error => {
      console.error('Error loading Google Charts:', error);
    });
  };

  return (
    <div className="space-y-6">
      {/* Protocol Selector */}
      <Card className="border-none shadow-soft">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Quantum Key Distribution Simulation</CardTitle>
            <div className="flex gap-2">
              {(["B92", "E91"] as Protocol[]).map((protocol) => (
                <Button
                  key={protocol}
                  variant={selectedProtocol === protocol ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedProtocol(protocol)}
                  className={selectedProtocol === protocol ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  {protocol}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <label className="font-medium">Pairs</label>
                <span className="font-mono font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded">{numSignals[0]}</span>
              </div>
              <Slider value={numSignals} onValueChange={setNumSignals} max={100} min={1} step={1} disabled={isRunning} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <label className="font-medium">Fiber Length</label>
                <span className="font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">{fiberLength[0]} km</span>
              </div>
              <Slider value={fiberLength} onValueChange={setFiberLength} max={100} min={0} step={5} disabled={isRunning} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <label className="font-medium flex items-center gap-1"><Eye className="w-3 h-3" /> Eavesdropping</label>
                <span className={`font-mono font-bold px-2 py-0.5 rounded ${eavesdroppingRate[0] > 0 ? 'text-red-600 bg-red-50 dark:bg-red-900/30' : 'text-gray-500 bg-gray-100 dark:bg-gray-800'}`}>
                  {eavesdroppingRate[0]}%
                </span>
              </div>
              <Slider value={eavesdroppingRate} onValueChange={setEavesdroppingRate} max={100} min={0} step={5} disabled={isRunning} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <label className="font-medium flex items-center gap-1"><Zap className="w-3 h-3" /> Noise</label>
                <span className={`font-mono font-bold px-2 py-0.5 rounded ${noiseLevel[0] > 0 ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' : 'text-gray-500 bg-gray-100 dark:bg-gray-800'}`}>
                  {noiseLevel[0]}%
                </span>
              </div>
              <Slider value={noiseLevel} onValueChange={setNoiseLevel} max={20} min={0} step={1} disabled={isRunning} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button onClick={runSimulation} disabled={isRunning} className="bg-purple-600 hover:bg-purple-700">
              {isRunning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running...</> : <><Play className="w-4 h-4 mr-2 fill-current" /> Run Simulation</>}
            </Button>
            <Button onClick={resetSimulation} variant="outline">
              <RotateCw className="w-4 h-4 mr-2" /> Reset
            </Button>
            <Button onClick={runDistanceAnalysis} variant="outline" className="ml-auto">
              <TrendingUp className="w-4 h-4 mr-2" /> Distance Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {showAnalysis && simulationResult && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-gray-500 uppercase">QBER</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${simulationResult.analysis.qber < 0.05 ? 'text-green-600' : simulationResult.analysis.qber < 0.15 ? 'text-amber-600' : 'text-red-600'}`}>
                {simulationResult.analysis.qberPercentage}
              </div>
              <p className="text-xs text-gray-500 mt-1">Quantum Bit Error Rate</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-gray-500 uppercase">Key Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {(simulationResult.analysis.keyRate * 100).toFixed(2)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">{simulationResult.finalKeyLength} bits generated</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-gray-500 uppercase">Security</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${simulationResult.analysis.securityStatus === 'secure' ? 'text-green-600' : simulationResult.analysis.securityStatus === 'compromised' ? 'text-red-600' : 'text-gray-600'}`}>
                {simulationResult.analysis.securityStatus === 'secure' ? '✓' : simulationResult.analysis.securityStatus === 'compromised' ? '✗' : '?'}
              </div>
              <p className="text-xs text-gray-500 mt-1 capitalize">{simulationResult.analysis.securityStatus}</p>
            </CardContent>
          </Card>

          {selectedProtocol === 'E91' && (
            <>
              <Card className="border-none shadow-soft">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-gray-500 uppercase">CHSH S-Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${simulationResult.analysis.chshSValue && simulationResult.analysis.chshSValue > 2 ? 'text-green-600' : 'text-red-600'}`}>
                    {simulationResult.analysis.chshSValue?.toFixed(3) || 'N/A'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {simulationResult.analysis.chshSValue && simulationResult.analysis.chshSValue > 2 ? 'Bell violated ✓' : 'Classical limit'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-soft">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-gray-500 uppercase">Bell State</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-indigo-600">
                    |ψ⁻⟩
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Singlet state (anti-correlated)
                  </p>
                  <div className="text-[10px] text-gray-400 mt-1 font-mono">
                    (|01⟩ - |10⟩)/√2
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Security Analysis */}
      {showAnalysis && simulationResult && (
        <Card className="border-none shadow-soft">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-b">
            <div className="flex items-center justify-center gap-2 text-purple-700 dark:text-purple-300">
              <ShieldCheck className="w-5 h-5" />
              <CardTitle className="text-lg font-bold">Security Analysis ({selectedProtocol})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500">Security Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Eve's Information</span>
                    <span className="font-mono font-bold text-red-600">{(simulationResult.analysis.eveInformation * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Secure Key Rate</span>
                    <span className="font-mono font-bold text-green-600">{(simulationResult.analysis.secureKeyRate * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Detection Efficiency</span>
                    <span className="font-mono font-bold text-blue-600">{(simulationResult.analysis.detectionEfficiency * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Loss Rate</span>
                    <span className="font-mono font-bold text-amber-600">{(simulationResult.analysis.lossRate * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500">Analysis</h4>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800">
                  <p className="text-sm text-purple-900 dark:text-purple-100 leading-relaxed">
                    {selectedProtocol === 'E91' ? (
                      <>
                        {simulationResult.analysis.bellViolated ? (
                          <>✓ Bell inequality <strong>violated</strong> (S = {simulationResult.analysis.chshSValue?.toFixed(3)}). 
                          Entanglement verified. Security guaranteed by quantum mechanics.</>
                        ) : (
                          <>✗ Bell inequality <strong>not violated</strong>. 
                          Security not guaranteed. Possible eavesdropping or excessive noise.</>
                        )}
                      </>
                    ) : (
                      <>
                        {simulationResult.analysis.qber < 0.15 ? (
                          <>✓ QBER below threshold. Secure key distillation possible. 
                          Privacy amplification can reduce Eve's information to negligible levels.</>
                        ) : (
                          <>✗ QBER too high ({simulationResult.analysis.qberPercentage}). 
                          Key may be compromised. Consider reducing distance or improving equipment.</>
                        )}
                      </>
                    )}
                  </p>
                </div>

                {eavesdroppingRate[0] > 0 && (
                  <Badge variant="destructive" className="flex gap-1">
                    <AlertCircle className="w-3 h-3" /> Eavesdropping Detected
                  </Badge>
                )}
                {noiseLevel[0] > 0 && (
                  <Badge variant="outline" className="border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-900/20">
                    <Zap className="w-3 h-3 mr-1" /> Channel Noise Present
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Final Key Display */}
      {showAnalysis && simulationResult?.finalKey && simulationResult.finalKeyLength > 0 && (
        <Card className="border-none shadow-soft">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b">
            <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
              <Shield className="w-5 h-5" />
              <CardTitle className="text-lg font-bold">Secure Final Key</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="font-mono text-lg bg-white dark:bg-black/20 px-6 py-4 rounded-lg border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 tracking-widest break-all text-center">
                {simulationResult.finalKey}
              </div>
              <div className="flex gap-4 mt-4 text-xs font-medium text-gray-500">
                <span>Length: {simulationResult.finalKeyLength} bits</span>
                <span>Hex encoded</span>
                <span>Privacy amplified</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      {showAnalysis && (selectedProtocol === 'B92' ? b92Result : e91Result) && (
        <Card className="border-none shadow-soft">
          <CardHeader className="bg-gray-50/50 dark:bg-slate-900/50 border-b">
            <CardTitle className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Results Log
              <Badge variant="secondary" className="text-xs font-normal">
                {selectedProtocol === 'B92' ? b92Result?.bits.length : e91Result?.pairs.length} signals
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedProtocol === 'B92' ? renderB92Table() : renderE91Table()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
