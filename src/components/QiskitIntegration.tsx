import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Loader2, Play, CheckCircle, XCircle, Sliders, Database, Activity, Cpu } from "lucide-react";
import { PhotonTransmissionAnimation } from "@/components/PhotonTransmissionAnimation";

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

export const QiskitIntegration = () => {
  const [nBits, setNBits] = useState(4);
  const [seed, setSeed] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [photonPosition, setPhotonPosition] = useState(0);
  const [result, setResult] = useState<BB84Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useSimulation, setUseSimulation] = useState(true);

  const runBB84 = async () => {
    setIsLoading(true);
    setProgress(0);
    setPhotonPosition(0);
    setError(null);
    setResult(null);

    // Animate photon transmission
    const animatePhoton = async () => {
      for (let pos = 0; pos <= 100; pos += 2) {
        setPhotonPosition(pos);
        setProgress(pos);
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    };

    // Start photon animation
    const animationPromise = animatePhoton();

    try {
      const endpoint = useSimulation ? '/api/bb84/simulate' : '/api/bb84';
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          n_bits: nBits,
          seed: seed
        })
      });

      // Wait for animation to complete if it's still running
      await animationPromise;

      const data: APIResponse = await response.json();

      if (data.success && data.data) {
        setResult(data.data);
      } else {
        setError(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(`Failed to connect to backend: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setProgress(100);
      setPhotonPosition(100);
    }
  };

  const formatBits = (bits: number[]) => bits.join('');

  const formatBases = (bases: number[]) => bases.map(b => b === 0 ? 'Z' : 'X').join('');

  return (
    <div className="space-y-6">
      <div className="text-center mb-10 mt-6">
        <h1 className="text-3xl font-bold text-foreground mb-4 inline-block">
          Qiskit BB84 Integration
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Run the BB84 Quantum Key Distribution protocol using Qiskit and IBM Quantum hardware
        </p>
      </div>

      {/* Controls */}
      <Card className="border-none shadow-soft bg-white dark:bg-slate-950">
        <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            Protocol Configuration
          </CardTitle>
          <CardDescription>
            Configure the BB84 protocol parameters for simulation or hardware execution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nBits" className="text-sm font-medium text-gray-700 dark:text-gray-300">Number of Bits (2-20)</Label>
              <Input
                id="nBits"
                type="number"
                min="2"
                max="20"
                value={nBits}
                onChange={(e) => setNBits(parseInt(e.target.value) || 4)}
                className="h-10 border-gray-200 dark:border-gray-800 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seed" className="text-sm font-medium text-gray-700 dark:text-gray-300">Random Seed</Label>
              <Input
                id="seed"
                type="number"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                className="h-10 border-gray-200 dark:border-gray-800 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
            <input
              type="checkbox"
              id="useSimulation"
              checked={useSimulation}
              onChange={(e) => setUseSimulation(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <Label htmlFor="useSimulation" className="cursor-pointer font-normal text-gray-700 dark:text-gray-300">
                Use Simulation <span className="text-gray-400 text-xs ml-1">(faster, no quantum hardware required)</span>
            </Label>
          </div>

          <Button 
            onClick={runBB84} 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 h-11 text-base transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Running Protocol...
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Run BB84 Protocol
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progress and Photon Animation */}
      {isLoading && (
        <Card className="border-none shadow-soft bg-white dark:bg-slate-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Photon Transmission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-sm text-gray-700">Progress:</span>
              <Progress value={progress} className="flex-1 h-2" />
              <span className="text-sm text-gray-500 font-mono w-10 text-right">{Math.round(progress)}%</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-gray-800">
                <PhotonTransmissionAnimation photonPosition={photonPosition} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-800 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-300">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Summary */}
          <Card className="border-none shadow-soft bg-white dark:bg-slate-950 overflow-hidden">
            <CardHeader className="bg-gray-50/80 dark:bg-slate-900/50 border-b border-gray-100 dark:border-gray-800 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md">
                    <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                Protocol Results
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{result.key_length}</div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Key Length</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/20">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{(result.qber * 100).toFixed(1)}%</div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-600/70 dark:text-blue-400/70">QBER</div>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {result.keys_match ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-500" />
                    )}
                  </div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {result.keys_match ? 'Keys Match' : 'Keys Mismatch'}
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alice's Data */}
            <Card className="border-none shadow-soft bg-white dark:bg-slate-950 flex flex-col">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4 bg-blue-50/30 dark:bg-blue-900/5">
                <CardTitle className="flex items-center gap-2 text-base text-blue-900 dark:text-blue-100">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Alice's Data (Sender)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6 flex-1">
                <div>
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Initial Bits</Label>
                  <div className="mt-1.5 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-gray-800 font-mono text-sm break-all text-gray-600 dark:text-gray-300">
                    {formatBits(result.alice_bits)}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bases</Label>
                  <div className="mt-1.5 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-gray-800 font-mono text-sm break-all text-gray-600 dark:text-gray-300">
                    {formatBases(result.alice_bases)}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold text-blue-600 uppercase tracking-wider">Final Key</Label>
                  <div className="mt-1.5 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/20 font-mono text-sm break-all text-blue-700 dark:text-blue-300 font-semibold">
                    {formatBits(result.alice_key)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bob's Data */}
            <Card className="border-none shadow-soft bg-white dark:bg-slate-950 flex flex-col">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4 bg-purple-50/30 dark:bg-purple-900/5">
                <CardTitle className="flex items-center gap-2 text-base text-purple-900 dark:text-purple-100">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Bob's Data (Receiver)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6 flex-1">
                <div>
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Measurement Bases</Label>
                  <div className="mt-1.5 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-gray-800 font-mono text-sm break-all text-gray-600 dark:text-gray-300">
                    {formatBases(result.bob_bases)}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Measured Results</Label>
                  <div className="mt-1.5 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-gray-800 font-mono text-sm break-all text-gray-600 dark:text-gray-300">
                    {formatBits(result.bob_results)}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold text-purple-600 uppercase tracking-wider">Final Key</Label>
                  <div className="mt-1.5 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800/20 font-mono text-sm break-all text-purple-700 dark:text-purple-300 font-semibold">
                    {formatBits(result.bob_key)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Basis Comparison */}
          <Card className="border-none shadow-soft bg-white dark:bg-slate-950">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-md">
                    <Database className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                Basis Comparison
              </CardTitle>
              <CardDescription>
                Detailed comparison of bases choices to determine the sifted key
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto pb-2">
                  <div className="min-w-[500px] border rounded-lg border-gray-100 dark:border-gray-800">
                      <div className="space-y-0 text-sm">
                        <div className="flex bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-gray-800">
                          <span className="w-24 shrink-0 p-3 font-semibold text-gray-700 border-r border-gray-100 dark:border-gray-800">Position</span>
                          <div className="flex flex-1">
                              {result.alice_bits.map((_, i) => (
                                <span key={i} className="flex-1 min-w-[30px] p-3 text-center border-r border-gray-100 dark:border-gray-800 last:border-0 text-gray-500">{i}</span>
                              ))}
                          </div>
                        </div>
                        <div className="flex border-b border-gray-100 dark:border-gray-800">
                          <span className="w-24 shrink-0 p-3 font-semibold text-gray-700 border-r border-gray-100 dark:border-gray-800">Alice Bits</span>
                           <div className="flex flex-1">
                              {result.alice_bits.map((bit, i) => (
                                <span key={i} className="flex-1 min-w-[30px] p-3 text-center font-mono border-r border-gray-100 dark:border-gray-800 last:border-0 bg-blue-50/30 dark:bg-blue-900/5">{bit}</span>
                              ))}
                           </div>
                        </div>
                        <div className="flex border-b border-gray-100 dark:border-gray-800">
                          <span className="w-24 shrink-0 p-3 font-semibold text-gray-700 border-r border-gray-100 dark:border-gray-800">Bob Bits</span>
                          <div className="flex flex-1">
                              {result.bob_results.map((bit, i) => (
                                <span key={i} className="flex-1 min-w-[30px] p-3 text-center font-mono border-r border-gray-100 dark:border-gray-800 last:border-0 bg-purple-50/30 dark:bg-purple-900/5">{bit}</span>
                              ))}
                          </div>
                        </div>
                        <div className="flex bg-gray-50/50 dark:bg-slate-900/30">
                          <span className="w-24 shrink-0 p-3 font-semibold text-gray-700 border-r border-gray-100 dark:border-gray-800">Basis Match</span>
                          <div className="flex flex-1">
                              {result.alice_bases.map((basis, i) => (
                                <span key={i} className="flex-1 min-w-[30px] p-2 text-center border-r border-gray-100 dark:border-gray-800 last:border-0 flex items-center justify-center">
                                  {result.alice_bases[i] === result.bob_bases[i] ? (
                                    <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs">✗</div>
                                  )}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                  </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Information */}
          <Card className="border-none shadow-soft bg-white dark:bg-slate-950">
            <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="flex items-center gap-2 text-base text-gray-600">
                <Cpu className="w-4 h-4" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Job ID:</span>
                  <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">{result.job_id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Mode:</span>
                  <Badge variant="secondary" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-normal">
                    {useSimulation ? 'Simulation' : 'Quantum Hardware'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">QBER:</span>
                  <span className="font-medium text-blue-600">
                    {(result.qber * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
