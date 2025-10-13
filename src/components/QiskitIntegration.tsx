import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Loader2, Play, RefreshCw, CheckCircle, XCircle } from "lucide-react";
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
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-quantum-blue to-quantum-purple bg-clip-text text-transparent mb-4">
          Qiskit BB84 Integration
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-justify">
          Run the BB84 Quantum Key Distribution protocol using Qiskit and IBM Quantum hardware
        </p>
      </div>

      {/* Controls */}
      <Card className="quantum-glow border-quantum-blue/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 bg-quantum-blue rounded-full"></div>
            Protocol Configuration
          </CardTitle>
          <CardDescription>
            Configure the BB84 protocol parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nBits">Number of Bits</Label>
              <Input
                id="nBits"
                type="number"
                min="2"
                max="20"
                value={nBits}
                onChange={(e) => setNBits(parseInt(e.target.value) || 4)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seed">Random Seed</Label>
              <Input
                id="seed"
                type="number"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useSimulation"
              checked={useSimulation}
              onChange={(e) => setUseSimulation(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="useSimulation">Use Simulation (faster, no quantum hardware required)</Label>
          </div>

          <Button 
            onClick={runBB84} 
            disabled={isLoading}
            className="w-full bg-quantum-blue hover:bg-quantum-blue/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running BB84 Protocol...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run BB84 Protocol
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progress and Photon Animation */}
      {isLoading && (
        <Card className="border-quantum-glow/30">
          <CardHeader>
            <CardTitle className="text-sm">Photon Transmission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-semibold">Progress:</span>
              <Progress value={progress} className="flex-1" />
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <PhotonTransmissionAnimation photonPosition={photonPosition} />
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <Card className="quantum-glow border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Protocol Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{result.key_length}</div>
                  <div className="text-sm text-muted-foreground">Key Length</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{(result.qber * 100).toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">QBER</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    {result.keys_match ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {result.keys_match ? 'Keys Match' : 'Keys Mismatch'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alice's Data */}
            <Card className="quantum-glow border-quantum-blue/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-quantum-blue rounded-full"></div>
                  Alice's Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Initial Bits</Label>
                  <div className="mt-1 p-2 bg-secondary/50 rounded font-mono text-sm">
                    {formatBits(result.alice_bits)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Bases</Label>
                  <div className="mt-1 p-2 bg-secondary/50 rounded font-mono text-sm">
                    {formatBases(result.alice_bases)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Final Key</Label>
                  <div className="mt-1 p-2 bg-quantum-blue/20 rounded font-mono text-sm">
                    {formatBits(result.alice_key)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bob's Data */}
            <Card className="quantum-glow border-quantum-purple/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-quantum-purple rounded-full"></div>
                  Bob's Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Measurement Bases</Label>
                  <div className="mt-1 p-2 bg-secondary/50 rounded font-mono text-sm">
                    {formatBases(result.bob_bases)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Measured Results</Label>
                  <div className="mt-1 p-2 bg-secondary/50 rounded font-mono text-sm">
                    {formatBits(result.bob_results)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Final Key</Label>
                  <div className="mt-1 p-2 bg-quantum-purple/20 rounded font-mono text-sm">
                    {formatBits(result.bob_key)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Basis Comparison */}
          <Card className="quantum-glow border-orange-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                Basis Comparison
              </CardTitle>
              <CardDescription>
                Shows which qubits were measured in the same basis (✓) or different basis (✗)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-16">Position:</span>
                  {result.alice_bits.map((_, i) => (
                    <span key={i} className="w-8 text-center">{i}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-16">Alice:</span>
                  {result.alice_bits.map((bit, i) => (
                    <span key={i} className="w-8 text-center font-mono">{bit}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-16">Bob:</span>
                  {result.bob_results.map((bit, i) => (
                    <span key={i} className="w-8 text-center font-mono">{bit}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-16">Basis:</span>
                  {result.alice_bases.map((basis, i) => (
                    <span key={i} className="w-8 text-center">
                      {result.alice_bases[i] === result.bob_bases[i] ? (
                        <Badge variant="secondary" className="text-green-600">✓</Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600">✗</Badge>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Information */}
          <Card className="quantum-glow border-cyan-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                Job Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Job ID:</span>
                  <span className="font-mono text-sm">{result.job_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Mode:</span>
                  <Badge variant="secondary">
                    {useSimulation ? 'Simulation' : 'Quantum Hardware'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">QBER:</span>
                  <span className="text-sm font-medium">
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
