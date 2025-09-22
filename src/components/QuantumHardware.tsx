import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const QuantumHardware = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-quantum-blue to-quantum-purple bg-clip-text text-transparent mb-4">
          Quantum Hardware
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Explore the physical components and technologies that make quantum key distribution possible
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quantum Sources */}
        <Card className="quantum-glow border-quantum-blue/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-quantum-blue rounded-full"></div>
              Quantum Light Sources
            </CardTitle>
            <CardDescription>
              Devices that generate quantum states of light
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-quantum-blue mb-2">Single Photon Sources</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Quantum dots for deterministic photon generation</li>
                <li>• Spontaneous parametric down-conversion (SPDC)</li>
                <li>• Weak coherent pulses with decoy states</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-quantum-blue mb-2">Laser Diodes</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Semiconductor lasers for optical pumping</li>
                <li>• Distributed feedback (DFB) lasers</li>
                <li>• External cavity diode lasers (ECDL)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Quantum Detectors */}
        <Card className="quantum-glow border-quantum-purple/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-quantum-purple rounded-full"></div>
              Quantum Detectors
            </CardTitle>
            <CardDescription>
              High-sensitivity devices for detecting single photons
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-quantum-purple mb-2">Single Photon Detectors</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Superconducting nanowire single-photon detectors (SNSPD)</li>
                <li>• Avalanche photodiodes (APD)</li>
                <li>• Transition edge sensors (TES)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-quantum-purple mb-2">Performance Metrics</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Detection efficiency: 90%+ (SNSPD)</li>
                <li>• Dark count rate: &lt; 1 Hz</li>
                <li>• Timing jitter: &lt; 100 ps</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Optical Components */}
        <Card className="quantum-glow border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Optical Components
            </CardTitle>
            <CardDescription>
              Precision optical elements for quantum state manipulation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-500 mb-2">Polarization Control</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Half-wave plates (HWP) for polarization rotation</li>
                <li>• Quarter-wave plates (QWP) for circular polarization</li>
                <li>• Polarizing beam splitters (PBS)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-500 mb-2">Beam Splitters</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 50/50 beam splitters for random basis selection</li>
                <li>• Variable beam splitters for intensity control</li>
                <li>• Fiber optic couplers</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Quantum Channels */}
        <Card className="quantum-glow border-orange-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              Quantum Channels
            </CardTitle>
            <CardDescription>
              Transmission media for quantum information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-orange-500 mb-2">Free Space</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Atmospheric transmission (up to 200 km)</li>
                <li>• Satellite-based quantum communication</li>
                <li>• Ground-to-satellite links</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-orange-500 mb-2">Fiber Optic</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Single-mode optical fibers</li>
                <li>• Low-loss fiber networks (up to 400 km)</li>
                <li>• Quantum repeaters for long distances</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* Hardware Specifications */}
      <Card className="quantum-glow border-cyan-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
            Typical QKD Hardware Specifications
          </CardTitle>
          <CardDescription>
            Performance characteristics of commercial QKD systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-cyan-500">Key Generation Rate</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Short range (&lt; 10 km):</span>
                  <Badge variant="secondary">1-10 Mbps</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Medium range (10-100 km):</span>
                  <Badge variant="secondary">100 Kbps - 1 Mbps</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Long range (&gt; 100 km):</span>
                  <Badge variant="secondary">1-100 Kbps</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-cyan-500">Security Features</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Quantum bit error rate:</span>
                  <Badge variant="secondary">&lt; 2%</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Information leakage:</span>
                  <Badge variant="secondary">Provably secure</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Attack resistance:</span>
                  <Badge variant="secondary">PNS, intercept-resend</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-cyan-500">Environmental</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Operating temperature:</span>
                  <Badge variant="secondary">-40°C to +70°C</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Power consumption:</span>
                  <Badge variant="secondary">10-100 W</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Size/Weight:</span>
                  <Badge variant="secondary">Rack-mountable</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future Technologies */}
      <Card className="quantum-glow border-pink-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
            Emerging Technologies
          </CardTitle>
          <CardDescription>
            Next-generation quantum hardware developments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-pink-500 mb-3">Integrated Photonics</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Silicon photonic chips for compact QKD systems</li>
                <li>• Integrated quantum light sources and detectors</li>
                <li>• On-chip polarization and phase modulators</li>
                <li>• Mass production potential for cost reduction</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-pink-500 mb-3">Quantum Repeaters</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Quantum memory for entanglement storage</li>
                <li>• Quantum error correction for long-distance QKD</li>
                <li>• All-photonic quantum repeaters</li>
                <li>• Global quantum communication networks</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
