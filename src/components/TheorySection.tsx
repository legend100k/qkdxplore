import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCw } from "lucide-react";

export const TheorySection = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const polarizationStates = [
    { name: "Horizontal (H)", angle: 0, symbol: "→" },
    { name: "Vertical (V)", angle: 90, symbol: "↑" },
    { name: "Diagonal (+)", angle: 45, symbol: "↗" },
    { name: "Anti-diagonal (-)", angle: 135, symbol: "↖" }
  ];

  const bases = [
    { name: "Rectilinear", states: ["H", "V"], symbol: "+" },
    { name: "Diagonal", states: ["+", "-"], symbol: "×" }
  ];

  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % 4);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isAnimating]);

  return (
    <div className="space-y-6">
      <Card className="border-quantum-purple/30">
        <CardHeader>
          <CardTitle className="text-quantum-blue flex items-center gap-2">
            <div className="w-6 h-6 bg-quantum-blue rounded-full"></div>
            What is BB84 Protocol?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground/90">
            The BB84 protocol, proposed by Charles Bennett and Gilles Brassard in 1984, 
            is a quantum key distribution scheme that allows two parties to produce a shared 
            random secret key known only to them, which can be used to encrypt and decrypt messages.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card className="bg-secondary/50 border-quantum-glow/30">
              <CardHeader>
                <CardTitle className="text-lg text-quantum-glow">Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-quantum-blue rounded-full"></div>
                    Uses quantum mechanics principles
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-quantum-purple rounded-full"></div>
                    Detects eavesdropping attempts
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-quantum-glow rounded-full"></div>
                    Unconditionally secure
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Uses photon polarization
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-secondary/50 border-quantum-purple/30">
              <CardHeader>
                <CardTitle className="text-lg text-quantum-purple">Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-quantum-blue rounded-full"></div>
                    Secure communications
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-quantum-purple rounded-full"></div>
                    Banking and finance
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-quantum-glow rounded-full"></div>
                    Government communications
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Quantum internet backbone
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="border-quantum-blue/30">
        <CardHeader>
          <CardTitle className="text-quantum-purple flex items-center gap-2">
            <div className="w-6 h-6 bg-quantum-purple rounded-full polarization-animation"></div>
            Photon Polarization States
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => setIsAnimating(!isAnimating)}
              variant="outline"
              className="border-quantum-blue/50 hover:bg-quantum-blue/10"
            >
              {isAnimating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isAnimating ? "Pause" : "Start"} Animation
            </Button>
            <Button
              onClick={() => setCurrentStep(0)}
              variant="outline"
              className="border-quantum-purple/50 hover:bg-quantum-purple/10"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

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
                <p className="text-xs text-muted-foreground">{state.angle}°</p>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            {bases.map((basis, index) => (
              <Card key={basis.name} className="bg-secondary/30 border-quantum-purple/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl text-quantum-purple">{basis.symbol}</span>
                    {basis.name} Basis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    {basis.states.map((state, i) => (
                      <div key={state} className="text-center">
                        <div className="w-12 h-12 border border-quantum-blue rounded-full flex items-center justify-center text-quantum-blue font-bold">
                          {state}
                        </div>
                        <p className="text-xs mt-1 text-muted-foreground">{state}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};