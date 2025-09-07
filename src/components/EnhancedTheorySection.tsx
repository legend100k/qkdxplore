import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCw, Users, Send, Eye, Shield, Zap } from "lucide-react";

export const EnhancedTheorySection = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentRole, setCurrentRole] = useState(0);

  const polarizationStates = [
    { name: "Horizontal (H)", angle: 0, symbol: "→", bit: "0" },
    { name: "Vertical (V)", angle: 90, symbol: "↑", bit: "1" },
    { name: "Diagonal (+45°)", angle: 45, symbol: "↗", bit: "0" },
    { name: "Anti-diagonal (-45°)", angle: 135, symbol: "↖", bit: "1" }
  ];

  const bases = [
    { name: "Rectilinear", states: ["H", "V"], symbol: "+", color: "quantum-blue" },
    { name: "Diagonal", states: ["+45°", "-45°"], symbol: "×", color: "quantum-purple" }
  ];

  const roleAnimations = [
    {
      role: "Alice (Sender)",
      icon: Send,
      color: "quantum-blue",
      description: "Alice prepares qubits in random states using random bases",
      actions: [
        "Generates random bits (0 or 1)",
        "Randomly chooses measurement basis (+ or ×)",
        "Encodes bit in corresponding polarization state",
        "Sends polarized photons through quantum channel"
      ]
    },
    {
      role: "Bob (Receiver)", 
      icon: Eye,
      color: "quantum-purple",
      description: "Bob receives and measures qubits using random bases",
      actions: [
        "Receives photons from quantum channel",
        "Randomly chooses measurement basis (+ or ×)",
        "Measures photon polarization",
        "Records measurement results"
      ]
    }
  ];

  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        if (currentStep < 3) {
          setCurrentStep((prev) => prev + 1);
        } else {
          setCurrentRole((prev) => (prev + 1) % 2);
          setCurrentStep(0);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isAnimating, currentStep]);

  return (
    <div className="space-y-6">
      <Card className="border-quantum-purple/30">
        <CardHeader>
          <CardTitle className="text-quantum-blue flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Understanding BB84 Quantum Key Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-secondary/50 border-quantum-blue/30">
              <CardHeader>
                <CardTitle className="text-lg text-quantum-blue">What is BB84?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  The BB84 protocol, developed by Charles Bennett and Gilles Brassard in 1984, 
                  is the first quantum cryptography protocol. It uses the fundamental principles 
                  of quantum mechanics to enable secure communication.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-quantum-glow" />
                    <span className="text-sm">Uses photon polarization states</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-quantum-glow" />
                    <span className="text-sm">Guaranteed eavesdropping detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-quantum-glow" />
                    <span className="text-sm">Information-theoretic security</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary/50 border-quantum-purple/30">
              <CardHeader>
                <CardTitle className="text-lg text-quantum-purple">Key Principles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-quantum-glow/10 rounded border border-quantum-glow/30">
                    <h4 className="font-semibold text-quantum-glow text-sm">No-Cloning Theorem</h4>
                    <p className="text-xs text-muted-foreground">
                      Quantum states cannot be perfectly copied, preventing eavesdropping
                    </p>
                  </div>
                  <div className="p-3 bg-quantum-blue/10 rounded border border-quantum-blue/30">
                    <h4 className="font-semibold text-quantum-blue text-sm">Measurement Disturbance</h4>
                    <p className="text-xs text-muted-foreground">
                      Any measurement changes the quantum state, revealing eavesdropping
                    </p>
                  </div>
                  <div className="p-3 bg-quantum-purple/10 rounded border border-quantum-purple/30">
                    <h4 className="font-semibold text-quantum-purple text-sm">Basis Randomness</h4>
                    <p className="text-xs text-muted-foreground">
                      Random basis selection ensures security even with partial information
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Role Explanations */}
      <Card className="border-quantum-glow/30">
        <CardHeader>
          <CardTitle className="text-quantum-glow flex items-center gap-2">
            <Users className="w-6 h-6" />
            Alice & Bob: The Quantum Communication Duo
          </CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <Button
              onClick={() => setIsAnimating(!isAnimating)}
              variant="outline"
              className="border-quantum-blue/50 hover:bg-quantum-blue/10"
            >
              {isAnimating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isAnimating ? "Pause" : "Start"} Role Animation
            </Button>
            <Button
              onClick={() => {
                setCurrentStep(0);
                setCurrentRole(0);
              }}
              variant="outline"
              className="border-quantum-purple/50 hover:bg-quantum-purple/10"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {roleAnimations.map((roleData, index) => {
              const Icon = roleData.icon;
              const isActive = isAnimating && currentRole === index;
              
              return (
                <Card 
                  key={roleData.role}
                  className={`transition-all duration-500 ${
                    isActive 
                      ? `border-${roleData.color} bg-${roleData.color}/10 quantum-glow` 
                      : 'border-muted-foreground/20'
                  }`}
                >
                  <CardHeader>
                    <CardTitle className={`text-${roleData.color} flex items-center gap-2`}>
                      <Icon className="w-6 h-6" />
                      {roleData.role}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{roleData.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {roleData.actions.map((action, actionIndex) => (
                        <div 
                          key={actionIndex}
                          className={`flex items-center gap-3 p-2 rounded transition-all duration-300 ${
                            isActive && currentStep === actionIndex
                              ? `bg-${roleData.color}/20 border border-${roleData.color}/50`
                              : 'bg-secondary/30'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 border-${roleData.color} flex items-center justify-center text-xs font-bold ${
                            isActive && currentStep === actionIndex ? `bg-${roleData.color} text-background` : ''
                          }`}>
                            {actionIndex + 1}
                          </div>
                          <span className="text-sm">{action}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Detailed Role Explanations */}
          <div className="space-y-6 mt-8">
            <Card className="bg-quantum-blue/5 border-quantum-blue/30">
              <CardHeader>
                <CardTitle className="text-quantum-blue flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Alice: The Quantum Sender (Transmitter)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-quantum-blue">Primary Responsibilities:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-quantum-blue rounded-full mt-2 flex-shrink-0"></div>
                        <span><strong>Key Generation:</strong> Alice creates a random sequence of bits (0s and 1s) that will eventually form the encryption key.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-quantum-blue rounded-full mt-2 flex-shrink-0"></div>
                        <span><strong>Basis Selection:</strong> For each bit, she randomly chooses between rectilinear (+) or diagonal (×) measurement basis.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-quantum-blue rounded-full mt-2 flex-shrink-0"></div>
                        <span><strong>Photon Preparation:</strong> She encodes each bit into the polarization state of a photon using the chosen basis.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-quantum-blue rounded-full mt-2 flex-shrink-0"></div>
                        <span><strong>Transmission:</strong> Alice sends the prepared photons through the quantum channel to Bob.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-quantum-blue">Technical Details:</h4>
                    <div className="bg-background/50 p-3 rounded border border-quantum-blue/20">
                      <p className="text-sm mb-2"><strong>Encoding Process:</strong></p>
                      <ul className="text-xs space-y-1">
                        <li>• Bit 0 + Rectilinear basis → Horizontal polarization (0°)</li>
                        <li>• Bit 1 + Rectilinear basis → Vertical polarization (90°)</li>
                        <li>• Bit 0 + Diagonal basis → +45° polarization</li>
                        <li>• Bit 1 + Diagonal basis → -45° polarization</li>
                      </ul>
                    </div>
                    <div className="bg-quantum-blue/10 p-3 rounded border border-quantum-blue/30">
                      <p className="text-xs"><strong>Example:</strong> If Alice wants to send bit "1" and randomly chooses diagonal basis, she prepares a photon with -45° polarization.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-quantum-purple/5 border-quantum-purple/30">
              <CardHeader>
                <CardTitle className="text-quantum-purple flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Bob: The Quantum Receiver
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-quantum-purple">Primary Responsibilities:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-quantum-purple rounded-full mt-2 flex-shrink-0"></div>
                        <span><strong>Photon Reception:</strong> Bob receives the quantum-encoded photons sent by Alice through the quantum channel.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-quantum-purple rounded-full mt-2 flex-shrink-0"></div>
                        <span><strong>Random Basis Choice:</strong> For each received photon, Bob independently and randomly chooses a measurement basis.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-quantum-purple rounded-full mt-2 flex-shrink-0"></div>
                        <span><strong>Quantum Measurement:</strong> He measures the photon's polarization using his chosen basis and records the result.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-quantum-purple rounded-full mt-2 flex-shrink-0"></div>
                        <span><strong>Basis Comparison:</strong> Bob publicly shares his measurement bases (not results) with Alice for key sifting.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-quantum-purple">Measurement Outcomes:</h4>
                    <div className="space-y-2">
                      <div className="bg-green-500/10 p-3 rounded border border-green-500/30">
                        <p className="text-sm font-semibold text-green-400 mb-1">Same Basis as Alice:</p>
                        <p className="text-xs">Bob measures the correct bit with 100% probability. This bit becomes part of the shared key.</p>
                      </div>
                      <div className="bg-red-500/10 p-3 rounded border border-red-500/30">
                        <p className="text-sm font-semibold text-red-400 mb-1">Different Basis from Alice:</p>
                        <p className="text-xs">Bob's measurement is random (50% chance of 0 or 1). This bit is discarded and not used in the key.</p>
                      </div>
                    </div>
                    <div className="bg-quantum-purple/10 p-3 rounded border border-quantum-purple/30">
                      <p className="text-xs"><strong>Critical Point:</strong> Bob cannot know which basis Alice used until they compare publicly, ensuring quantum security.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-quantum-glow/5 border-quantum-glow/30">
              <CardHeader>
                <CardTitle className="text-quantum-glow">Why This Process is Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-background/50 rounded border border-quantum-glow/20">
                    <Shield className="w-8 h-8 text-quantum-glow mx-auto mb-2" />
                    <h4 className="font-semibold text-sm mb-2">Quantum Uncertainty</h4>
                    <p className="text-xs">An eavesdropper cannot measure photons without disturbing them, revealing their presence.</p>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded border border-quantum-glow/20">
                    <Eye className="w-8 h-8 text-quantum-glow mx-auto mb-2" />
                    <h4 className="font-semibold text-sm mb-2">Detection Guarantee</h4>
                    <p className="text-xs">Any eavesdropping attempt introduces errors that Alice and Bob can detect statistically.</p>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded border border-quantum-glow/20">
                    <Zap className="w-8 h-8 text-quantum-glow mx-auto mb-2" />
                    <h4 className="font-semibold text-sm mb-2">Perfect Randomness</h4>
                    <p className="text-xs">Random basis selection ensures that even partial information doesn't compromise security.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Polarization Visualization */}
      <Card className="border-quantum-blue/30">
        <CardHeader>
          <CardTitle className="text-quantum-purple flex items-center gap-2">
            <div className="w-6 h-6 bg-quantum-purple rounded-full polarization-animation"></div>
            Photon Polarization States & Measurement Bases
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {polarizationStates.map((state, index) => (
              <Card 
                key={state.name}
                className={`p-4 text-center transition-all duration-500 ${
                  currentStep === index && isAnimating
                    ? 'border-quantum-glow bg-quantum-glow/10 quantum-glow'
                    : 'border-muted-foreground/20'
                }`}
              >
                <div className="w-16 h-16 mx-auto mb-3 relative">
                  <div 
                    className="w-full h-full border-2 border-quantum-blue rounded-full flex items-center justify-center text-2xl font-bold text-quantum-blue transition-transform duration-1000"
                    style={{ transform: `rotate(${state.angle}deg)` }}
                  >
                    {state.symbol}
                  </div>
                </div>
                <h3 className="font-semibold text-sm">{state.name}</h3>
                <p className="text-xs text-muted-foreground">Bit: {state.bit}</p>
                <p className="text-xs text-quantum-glow">{state.angle}°</p>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {bases.map((basis, index) => (
              <Card key={basis.name} className={`bg-secondary/30 border-${basis.color}/20`}>
                <CardHeader>
                  <CardTitle className={`text-lg flex items-center gap-2 text-${basis.color}`}>
                    <span className="text-2xl">{basis.symbol}</span>
                    {basis.name} Basis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4 justify-center">
                      {basis.states.map((state, i) => (
                        <div key={state} className="text-center">
                          <div className={`w-12 h-12 border border-${basis.color} rounded-full flex items-center justify-center text-${basis.color} font-bold`}>
                            {polarizationStates[index * 2 + i].symbol}
                          </div>
                          <p className="text-xs mt-1 text-muted-foreground">{state}</p>
                          <p className="text-xs text-quantum-glow">Bit {i}</p>
                        </div>
                      ))}
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        {basis.name === "Rectilinear" 
                          ? "Measures horizontal/vertical polarizations"
                          : "Measures diagonal polarizations at ±45°"
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-quantum-glow/10 border-quantum-glow/30">
            <CardContent className="p-4">
              <h3 className="font-bold text-quantum-glow mb-2">Key Insight</h3>
              <p className="text-sm">
                When Alice and Bob use the same basis, Bob measures the correct bit with 100% probability.
                When they use different bases, Bob's measurement is random (50% probability), making 
                those bits useless for the final key. This randomness is fundamental to quantum security!
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};