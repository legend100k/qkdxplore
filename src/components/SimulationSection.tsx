import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Play,
  Pause,
  RotateCw,
  Zap,
  Eye,
  Shield,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  StepForward,
  Loader2,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";
import {
  PolarizationState,
  applyOpticalNoise,
  legacyNoiseToOptical,
} from "@/lib/opticalNoise";
// Google Charts is loaded via script tag in index.html
// We'll implement type definitions for Google Charts
declare global {
  interface Window {
    google: any;
  }
}

// Add CSS animations
const animationStyles = `
  @keyframes photon-vibrate {
    0% { transform: translate(0, 0); }
    25% { transform: translate(-1px, -1px); }
    50% { transform: translate(1px, -1px); }
    75% { transform: translate(-1px, 1px); }
    100% { transform: translate(1px, 1px); }
  }

  @keyframes photon-fall {
    0% { 
      transform: translateY(0) rotate(0deg);
      opacity: 1;
    }
    100% { 
      transform: translateY(100px) rotate(180deg);
      opacity: 0;
    }
  }



  @keyframes photon-transmission {
    0% { 
      left: 0%; 
      opacity: 1; 
    }
    100% { 
      left: 100%; 
      opacity: 1; 
    }
  }

  .animate-vibrate {
    animation: photon-vibrate 0.1s infinite;
  }

  .animate-fall {
    animation: photon-fall 1s ease-in forwards;
    transition: none;
  }



  .animate-photon-transmission {
    animation: photon-transmission 2s ease-in-out forwards;
  }
`;

// Inject CSS animations into the document (only once)
let styleSheetAdded = false;
if (typeof document !== "undefined" && !styleSheetAdded) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "quantum-bb84-animations";
  styleSheet.innerText = animationStyles;
  document.head.appendChild(styleSheet);
  styleSheetAdded = true;
}

interface QuantumBit {
  id: number;
  aliceBit: number;
  aliceBasis: string;
  bobBasis: string;
  bobMeasurement: number | null;
  isMatching: boolean | null;
  inKey: boolean;
  intercepted: boolean;
  eveMeasureBasis: string | null;
  eveMeasurement: number | null;
  eveResendBasis: string | null;
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
    case "+":
      return "→"; // Rectilinear basis (Horizontal/Vertical)
    case "×":
      return "↗"; // Diagonal basis (Diagonal/Anti-diagonal)
    default:
      return basis;
  }
};

const getPolarization = (bit: number, basis: string): string => {
  if (basis === "+") {
    return bit === 0 ? "H" : "V";
  } else {
    return bit === 0 ? "+45°" : "-45°";
  }
};

const getPolarizationSymbol = (bit: number, basis: string): string => {
  if (basis === "+") {
    return bit === 0 ? "→" : "↑";
  } else {
    return bit === 0 ? "↗" : "↖";
  }
};

export const SimulationSection = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [quantumBits, setQuantumBits] = useState<QuantumBit[]>([]);
  const [finalKey, setFinalKey] = useState<string>("");
  const [photonPosition, setPhotonPosition] = useState(0);
  const [numQubits, setNumQubits] = useState([16]);
  const [eavesdroppingRate, setEavesdroppingRate] = useState([0]);
  const [noiseLevel, setNoiseLevel] = useState([0]);
  const [simulationData, setSimulationData] = useState<Array<{name: string, value: number | string}>>([]);
  const [showGraphs, setShowGraphs] = useState(false);
  const [isStepByStep, setIsStepByStep] = useState(false);
  const [currentBitIndex, setCurrentBitIndex] = useState(0);
  const [stepByStepBits, setStepByStepBits] = useState<QuantumBit[]>([]);
  const [bitStep, setBitStep] = useState(0);

  // Animation state variables
  const [isPhotonVisible, setIsPhotonVisible] = useState(false);
  const [isPhotonVibrating, setIsPhotonVibrating] = useState(false);
  const [isPhotonFalling, setIsPhotonFalling] = useState(false);
  const [statusInfo, setStatusInfo] = useState("Ready...");
  const [isStatusInfoVisible, setIsStatusInfoVisible] = useState(false);
  const [activeEve, setActiveEve] = useState<number | null>(null);
  const [aliceBit, setAliceBit] = useState("-");
  const [aliceBasis, setAliceBasis] = useState("-");
  const [alicePol, setAlicePol] = useState("-");
  const [bobBasis, setBobBasis] = useState("-");
  const [bobBit, setBobBit] = useState("-");
  const [bobResult, setBobResult] = useState("-");
  const [alicePolarizer, setAlicePolarizer] = useState("+");
  const [bobPolarizer, setBobPolarizer] = useState("+");
  const [evePolarizers, setEvePolarizers] = useState<
    Array<{ measure: string; send: string }>
  >([
    { measure: "+", send: "+" },
    { measure: "+", send: "+" },
    { measure: "+", send: "+" },
    { measure: "+", send: "+" },
    { measure: "+", send: "+" },
  ]);
  const [numEves, setNumEves] = useState(0);

  // Calculate number of Eves based on eavesdropping rate
  useEffect(() => {
    // Eavesdropping rate is now 0-5 (number of Eves)
    const calculatedNumEves = eavesdroppingRate[0]; // Direct number of Eves (0-5)
    setNumEves(calculatedNumEves);
    
    // Randomize Eve polarizers when eavesdropping rate changes
    if (eavesdroppingRate[0] > 0) {
      randomizeEvePolarizers();
    }
  }, [eavesdroppingRate]);

  const steps = [
    "Alice generates random bits and bases",
    "Alice sends photons to Bob",
    "Photon transmitted",
    "Bob randomly chooses measurement bases",
    "Bob measures photons",
    "Public basis comparison",
    "Key sifting and final key generation",
  ];

  // Initialize animation on mount
  useEffect(() => {
    // Set initial state for animation
    setAliceBit("-");
    setAliceBasis("-");
    setAlicePol("-");
    setBobBasis("-");
    setBobBit("-");
    setBobResult("-");
    setAlicePolarizer("+");
    setBobPolarizer("+");
    setEvePolarizers([
      { measure: "+", send: "+" },
      { measure: "+", send: "+" },
      { measure: "+", send: "+" },
      { measure: "+", send: "+" },
      { measure: "+", send: "+" },
    ]);
    setNumEves(0);
    hidePhoton();
    hideStatusInfo();

    // Cleanup function for component unmount
    return () => {
      const photonElement = document.querySelector('.photon-particle') as HTMLElement;
      if (photonElement) {
        photonElement.classList.remove('animate-photon-transmission', 'animate-vibrate', 'animate-fall');
      }
    };
  }, []);

  // Load Google Charts when component mounts
  useEffect(() => {
    loadGoogleCharts();
  }, []);

  const generateRandomBits = () => {
    const bits: QuantumBit[] = [];
    const totalBits = numQubits[0];
    // Eavesdropping rate: 0 = no eavesdropping, 1-5 = probability of interception increases with more Eves
    const eavesProbability = eavesdroppingRate[0] * 0.2; // Each Eve has 20% chance, so 5 Eves = 100%
    
    // Convert legacy noise slider to optical noise parameters
    // Increase noise effect for more realistic QBER
    const opticalParams = legacyNoiseToOptical(noiseLevel[0] * 3, 10); // Amplify noise effect

    for (let i = 0; i < totalBits; i++) {
      const aliceBit = Math.random() > 0.5 ? 1 : 0;
      const aliceBasis = Math.random() > 0.5 ? "+" : "×";
      const bobBasis = Math.random() > 0.5 ? "+" : "×";

      // Create polarization state for the photon
      let photonState: PolarizationState = {
        basis: aliceBasis === "+" ? 'rectilinear' : 'diagonal',
        bit: aliceBit,
        amplitude: 1.0,
        phase: 0
      };

      const isMatching = aliceBasis === bobBasis;
      let bobMeasurement = null;
      let inKey = false;
      let intercepted = false;
      let eveMeasureBasis: string | null = null;
      let eveMeasurement: number | null = null;
      let eveResendBasis: string | null = null;

      // Apply eavesdropping effect
      if (eavesProbability > 0 && Math.random() < eavesProbability) {
        intercepted = true;
        
        // Eve intercepts the photon and measures in a random basis
        eveMeasureBasis = Math.random() > 0.5 ? "+" : "×";
        
        // Eve measures the photon in her chosen basis
        if (eveMeasureBasis === aliceBasis) {
          // Bases match - Eve gets the correct bit
          eveMeasurement = aliceBit;
        } else {
          // Bases don't match - Eve gets a random result (quantum uncertainty)
          eveMeasurement = Math.random() > 0.5 ? 1 : 0;
        }
        
        // Eve resends the photon in a random basis (she doesn't know Alice's basis)
        eveResendBasis = Math.random() > 0.5 ? "+" : "×";
        
        // CRITICAL: Eve creates a NEW photon state based on HER measurement
        // This is what Bob will receive, not Alice's original photon
        // Eve's measurement and resend introduces significant disturbance
        photonState = {
          basis: eveResendBasis === "+" ? 'rectilinear' : 'diagonal',
          bit: eveMeasurement,  // Eve sends what SHE measured, not what Alice sent
          amplitude: 0.7, // Eve's measurement significantly disturbs the quantum state (reduce from 0.9)
          phase: Math.random() * Math.PI / 4, // Add random phase disturbance
        };
        
        // Activate one of the Eves visually in the animation
        const eveIndex = Math.floor(Math.random() * 5);
        setTimeout(() => activateEve(eveIndex), 100);
      }

      // Apply optical noise to the photon during transmission
      const noisyPhoton = applyOpticalNoise(photonState, opticalParams);
      
      // If photon is lost, Bob doesn't detect it - but we still record the attempt
      if (!noisyPhoton) {
        // Photon lost - Bob gets no measurement
        bobMeasurement = null;
        inKey = false;
      } else {
        // Bob measures the photon
        let bobResult = noisyPhoton.bit;
        
        // If Bob's basis doesn't match the photon's current basis, he gets a random result
        const photonBasisSymbol = noisyPhoton.basis === 'rectilinear' ? "+" : "×";
        if (bobBasis !== photonBasisSymbol) {
          bobResult = Math.random() > 0.5 ? 1 : 0;
        }

        // Bob always gets his measurement result
        bobMeasurement = bobResult;
        
        // Key is only generated when Alice and Bob's bases match
        if (isMatching) {
          inKey = true;
        } else {
          inKey = false;
        }
      }

      bits.push({
        id: i,
        aliceBit,
        aliceBasis,
        bobBasis,
        bobMeasurement,
        isMatching,
        inKey,
        intercepted,
        eveMeasureBasis,
        eveMeasurement,
        eveResendBasis,
      });
    }
    return bits;
  };

  // Animation control functions
  const updateAliceInfo = useCallback((bit: number, basis: string) => {
    setAliceBit(bit.toString());
    setAliceBasis(getBasisSymbol(basis));
    setAlicePol(getPolarization(bit, basis));
  }, []);

  const updateBobInfo = useCallback((
    basis: string,
    bit: number | null,
    result: number | null,
  ) => {
    setBobBasis(getBasisSymbol(basis));
    setBobBit(bit !== null ? bit.toString() : "-");
    setBobResult(result !== null ? result.toString() : "-");
  }, []);

  const updatePolarizers = useCallback((aliceBasis: string, bobBasis: string) => {
    setAlicePolarizer(getBasisSymbol(aliceBasis));
    setBobPolarizer(getBasisSymbol(bobBasis));
  }, []);

  const updateEvePolarizers = useCallback((
    index: number,
    measureBasis: string,
    sendBasis: string,
  ) => {
    setEvePolarizers((prev) => {
      const newPolarizers = [...prev];
      newPolarizers[index] = {
        measure: getBasisSymbol(measureBasis),
        send: getBasisSymbol(sendBasis),
      };
      return newPolarizers;
    });
  }, []);

  const randomizeEvePolarizers = useCallback(() => {
    setEvePolarizers((prev) => {
      return prev.map(() => ({
        measure: Math.random() > 0.5 ? "+" : "×",
        send: Math.random() > 0.5 ? "+" : "×",
      }));
    });
  }, []);

  const activateEve = useCallback((index: number) => {
    setActiveEve(index);
    setTimeout(() => setActiveEve(null), 1500);
  }, []);

  const showPhoton = useCallback(() => {
    setIsPhotonVisible(true);
  }, []);

  const hidePhoton = useCallback(() => {
    setIsPhotonVisible(false);
    setIsPhotonVibrating(false);
    setIsPhotonFalling(false);
  }, []);

  const vibratePhoton = useCallback(() => {
    setIsPhotonVibrating(true);
  }, []);

  const stopVibratingPhoton = useCallback(() => {
    setIsPhotonVibrating(false);
  }, []);

  const fallPhoton = useCallback(() => {
    setIsPhotonFalling(true);
  }, []);

  const animatePhotonTransmission = useCallback(async () => {
    // Reset photon position and show it
    setPhotonPosition(0);
    showPhoton();
    
    // Use CSS animation for smoother transmission
    const photonElement = document.querySelector('.photon-particle') as HTMLElement;
    if (photonElement) {
      photonElement.classList.add('animate-photon-transmission');
    }
    
    // Animate photon from left to right with smoother steps
    for (let pos = 0; pos <= 100; pos += 2) {
      setPhotonPosition(pos);
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    
    // Clean up animation class
    if (photonElement) {
      photonElement.classList.remove('animate-photon-transmission');
    }
  }, [showPhoton]);

  const updateStatusInfo = (text: string) => {
    setStatusInfo(text);
    setIsStatusInfoVisible(true);
  };

  const hideStatusInfo = () => {
    setIsStatusInfoVisible(false);
  };

  const setPhotonPositionAnimated = (position: number) => {
    setPhotonPosition(position);
  };

  const updateNumEves = (num: number) => {
    setNumEves(num);
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
        inKey: false,
        intercepted: false,
        eveMeasureBasis: null,
        eveMeasurement: null,
        eveResendBasis: null,
      });
    }
    return bits;
  };

  const processBitStep = (bitIndex: number, step: number) => {
    // Eavesdropping rate: 0 = no eavesdropping, 1-5 = probability of interception increases with more Eves
    const eavesProbability = eavesdroppingRate[0] * 0.2; // Each Eve has 20% chance, so 5 Eves = 100%
    // Increase noise effect for more realistic QBER
    const opticalParams = legacyNoiseToOptical(noiseLevel[0] * 3, 10); // Amplify noise effect

    setStepByStepBits((prevBits) => {
      const newBits = [...prevBits];
      const bit = newBits[bitIndex];

      if (step === 3) {
        // Bob measures
        const isMatching = bit.aliceBasis === bit.bobBasis;
        bit.isMatching = isMatching;

        // Create polarization state for the photon
        let photonState: PolarizationState = {
          basis: bit.aliceBasis === "+" ? 'rectilinear' : 'diagonal',
          bit: bit.aliceBit,
          amplitude: 1.0,
          phase: 0
        };

        // Apply eavesdropping effect - Eve intercepts the photon before Bob measures
        if (eavesProbability > 0 && Math.random() < eavesProbability) {
          bit.intercepted = true;
          
          // Eve measures the photon in a random basis
          bit.eveMeasureBasis = Math.random() > 0.5 ? "+" : "×";
          
          // Eve measures the photon in her chosen basis
          if (bit.eveMeasureBasis === bit.aliceBasis) {
            // Bases match - Eve gets the correct bit
            bit.eveMeasurement = bit.aliceBit;
          } else {
            // Bases don't match - Eve gets a random result (quantum uncertainty)
            bit.eveMeasurement = Math.random() > 0.5 ? 1 : 0;
          }

          // Eve resends the photon in a random basis (she doesn't know Alice's basis)
          bit.eveResendBasis = Math.random() > 0.5 ? "+" : "×";

          // CRITICAL: Eve creates a NEW photon state based on HER measurement
          // This is what Bob will receive, not Alice's original photon
          // Eve's measurement and resend introduces significant disturbance
          photonState = {
            basis: bit.eveResendBasis === "+" ? 'rectilinear' : 'diagonal',
            bit: bit.eveMeasurement!,  // Eve sends what SHE measured
            amplitude: 0.7,  // Eve's measurement significantly disturbs the quantum state (reduce from 0.9)
            phase: Math.random() * Math.PI / 4, // Add random phase disturbance
          };
        }

        // Apply optical noise to the photon
        const noisyPhoton = applyOpticalNoise(photonState, opticalParams);

        if (!noisyPhoton) {
          // Photon lost - Bob gets no measurement
          bit.bobMeasurement = null;
          bit.inKey = false;
        } else {
          // Bob receives the noisy photon
          let bobResult = noisyPhoton.bit;

          // If Bob's basis doesn't match the photon's current basis, he gets a random result
          const photonBasisSymbol = noisyPhoton.basis === 'rectilinear' ? "+" : "×";
          if (bit.bobBasis !== photonBasisSymbol) {
            bobResult = Math.random() > 0.5 ? 1 : 0;
          }

          // Bob always gets his measurement result
          bit.bobMeasurement = bobResult;
          
          // Key is only generated when Alice and Bob's bases match
          if (isMatching) {
            bit.inKey = true;
          } else {
            bit.inKey = false;
          }
        }
      }

      return newBits;
    });

    // Update animation state for current bit
    if (bitIndex < stepByStepBits.length) {
      const currentBit = stepByStepBits[bitIndex];
      if (currentBit) {
        updateAliceInfo(currentBit.aliceBit, currentBit.aliceBasis);
        updateBobInfo(currentBit.bobBasis, currentBit.aliceBit, currentBit.bobMeasurement);
        updatePolarizers(currentBit.aliceBasis, currentBit.bobBasis);
      }
    }
  };

  const startStepByStepMode = () => {
    setIsStepByStep(true);
    const bits = generateStepByStepBits();
    setStepByStepBits(bits);
    setCurrentBitIndex(0);
    setBitStep(0);
    setShowGraphs(false);
    setFinalKey("");
    toast.success(
      "Step-by-step mode started. Use the controls to step through each bit.",
    );
  };

  const nextBitStep = async () => {
    if (bitStep < 4) {
      // Handle photon animation for step 2 (photon transmission)
      if (bitStep === 1) { // When moving from step 1 to step 2 (photon transmission)
        await animatePhotonTransmission();
        // Only increment step after animation completes
        setBitStep(bitStep + 1);
      } else {
        const newBitStep = bitStep + 1;
        setBitStep(newBitStep);
        
        // Process bit step after state update
        if (newBitStep === 3) {
          // Use setTimeout to ensure state is updated before processing
          setTimeout(() => {
            processBitStep(currentBitIndex, newBitStep);
          }, 0);
        }
      }
    } else if (currentBitIndex < stepByStepBits.length - 1) {
      // Before moving to the next bit, clear Bob's measurement if bases don't match
      setStepByStepBits(prevBits => {
        const newBits = [...prevBits];
        const currentBit = newBits[currentBitIndex];
        
        // If bases don't match, clear Bob's measurement for this bit to show that it's discarded
        if (currentBit && !currentBit.isMatching && currentBit.inKey === false) {
          currentBit.bobMeasurement = null;
        }
        
        return newBits;
      });
      
      setCurrentBitIndex(currentBitIndex + 1);
      setBitStep(0);
      hidePhoton();
      setPhotonPosition(0);
    } else {
      // Finished all bits
      const finalBits = stepByStepBits.filter((bit) => bit.inKey);
      const key = finalBits.map((bit) => bit.aliceBit).join("");
      setFinalKey(key);
      generateAnalysisData(stepByStepBits);
      setShowGraphs(true);
      toast.success(
        `Step-by-step simulation complete! Generated ${key.length}-bit key.`,
      );
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
    setIsRunning(true);
    setCurrentStep(0);
    setFinalKey("");

    for (let step = 0; step <= 5; step++) {
      setCurrentStep(step);

      if (step === 1) {
        // Animate photon transmission with improved animation
        await animatePhotonTransmission();
        hidePhoton();
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    const bits = generateRandomBits();
    setQuantumBits(bits);

    const key = bits
      .filter((bit) => bit.inKey)
      .map((bit) => bit.aliceBit)
      .join("");
    setFinalKey(key);

    // Generate analysis data
    generateAnalysisData(bits);
    setShowGraphs(true);

    toast.success(`Simulation complete! Generated ${key.length}-bit key.`);
    setIsRunning(false);
  };

  // Calculate dark count probability and optical misalignment error floor
  const calculateDarkCountContribution = (fiberLength: number): number => {
    // Dark count rate typically 10-100 Hz for single photon detectors at 1550nm
    // At high clock rates, this contributes to the error rate
    const darkCountRate = 50; // Hz (example value)
    const clockRate = 1e9; // 1 GHz clock rate
    const darkCountProbability = darkCountRate / clockRate; // Probability per bit
    
    // With increasing distance, more photons are lost, so dark counts become a larger fraction
    const lossProbability = 1 - Math.pow(10, -(0.2 * fiberLength) / 10); // Typical fiber at 1550nm
    const relativeDarkCountContribution = darkCountProbability / (1 - lossProbability);
    
    // Limit to 50% max since dark counts are random
    return Math.min(relativeDarkCountContribution * 100, 50) * 0.5; // 50% error contribution
  };

  // Calculate optical misalignment/intrinsic floor error
  const calculateIntrinsicFloor = (): number => {
    // Typical intrinsic errors: 1-3% from misalignment, reflections, imperfect components
    // Add small random fluctuation to simulate varying alignment conditions
    const baseFloor = 1.5;
    const fluctuation = (Math.random() - 0.5) * 0.6; // ±0.3% variation
    return Math.max(0.8, baseFloor + fluctuation); // Keep it between 0.8% and 2.1%
  };

  // Apply statistical security check using Hoeffding's bound
  const applySecurityCheck = (measuredQBER: number, sampleSize: number, securityThreshold: number = 11): { isSecure: boolean, upperBound: number } => {
    // Calculate statistical upper bound using Hoeffding's inequality
    const statisticalDeviation = Math.sqrt(Math.log(2 / 0.05) / (2 * sampleSize)); // 95% confidence
    const upperBound = measuredQBER + statisticalDeviation * 100; // Convert to percentage
    
    // Check against security threshold (typically 11% for BB84)
    const isSecure = upperBound < securityThreshold;
    
    return { isSecure, upperBound };
  };

  const generateAnalysisData = (bits: QuantumBit[]) => {
    // Standard BB84 QBER calculation:
    // QBER = errors in sifted key / total sifted key bits
    
    // Sifted key = bits where Alice and Bob used same basis
    const siftedKeyBits = bits.filter(bit => bit.isMatching && bit.bobMeasurement !== null);
    const siftedKeyCount = siftedKeyBits.length;
    
    // Errors in sifted key = where Bob's measurement doesn't match Alice's bit
    const errorsInSiftedKey = siftedKeyBits.filter(
      bit => bit.aliceBit !== bit.bobMeasurement
    );
    
    // Calculate the standard QBER
    let actualQBER = siftedKeyCount > 0 
      ? (errorsInSiftedKey.length / siftedKeyCount) * 100
      : 0;
    
    // Add contributions from different error sources for a more realistic QBER
    const eavesdroppingRateValue = eavesdroppingRate[0];
    const noiseLevelValue = noiseLevel[0];
    
    // Eavesdropping creates significant QBER: when Eve intercepts and resends, 
    // she causes ~25% error rate (since she guesses basis randomly and causes disturbance)
    // For each Eve, if they intercept a bit, they cause ~25% error rate
    // Assuming each Eve intercepts ~50% of the photons they encounter
    let eavesdroppingContribution = 0;
    if (eavesdroppingRateValue > 0) {
      // In a realistic scenario, even 1 Eve intercepting 10% of photons would cause ~2.5% QBER (0.1 * 0.25)
      // But if Eve intercepts ALL photons, it's 25% QBER. So we scale based on number of Eves and assume each intercepts a portion
      // For simplicity, let's say each Eve causes approximately their count * 15% QBER contribution
      eavesdroppingContribution = Math.min(eavesdroppingRateValue * 25, 75); // Max 75% if multiple Eves
    }
    
    // Noise contributes directly to QBER - more realistic noise model
    const noiseContribution = noiseLevelValue * 2.5; // Each 1% noise contributes ~2.5% to QBER
    
    // Intrinsic floor for realistic optical imperfections
    const intrinsicFloor = 1.5; // Increase to 1.5% for more realistic baseline
    
    // Calculate combined QBER based on error sources
    let combinedQBER = actualQBER + eavesdroppingContribution + noiseContribution + intrinsicFloor;
    
    // Apply upper bound based on theoretical maximum
    const totalQBER = Math.min(combinedQBER, 75); // Allow up to 75% for extreme scenarios
    
    // Also count total errors for display
    const totalBits = bits.length;
    const allErrorBits = bits.filter(
      bit => bit.bobMeasurement === null || bit.aliceBit !== bit.bobMeasurement
    );
    
    // Apply statistical security check
    const securityCheck = applySecurityCheck(totalQBER, siftedKeyCount);
    const secureKeyRate = securityCheck.isSecure ? (siftedKeyCount / bits.length) * 100 : 0;
    
    // Prepare data for display
    const data = [
      { name: "Total Bits", value: totalBits },
      { name: "Sifted Key", value: siftedKeyCount },
      { name: "Errors in Sifted Key", value: errorsInSiftedKey.length },
      { name: "QBER (%)", value: totalQBER.toFixed(2) },
      { name: "Security Status", value: securityCheck.isSecure ? "✅ Secure" : "❌ Compromised" }
    ];

    setSimulationData(data);
    
    // Render the chart with the new data
    setTimeout(() => renderSimulationMetricsChart(data), 100);
  };

  // Function to load Google Charts
  const loadGoogleCharts = () => {
    return new Promise((resolve, reject) => {
      if (window.google) {
        window.google.load('visualization', '1', { packages: ['corechart', 'bar'] });
        window.google.setOnLoadCallback(() => resolve(window.google));
        return;
      }
      
      // Load the Google Charts script if not already loaded
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/charts/loader.js';
      script.async = true;
      script.onload = () => {
        window.google.charts.load('current', { packages: ['corechart', 'bar'] });
        window.google.charts.setOnLoadCallback(() => resolve(window.google));
      };
      script.onerror = () => reject(new Error('Failed to load Google Charts'));
      document.head.appendChild(script);
    });
  };

  // Function to render the simulation metrics chart (counts only)
  const renderSimulationMetricsChart = (data: Array<{name: string, value: number | string}>) => {
    loadGoogleCharts().then(() => {
      const totalBits = Number(data[0]?.value || 0);
      const matchingBases = Number(data[1]?.value || 0);
      const keyBits = Number(data[2]?.value || 0);

      const chartData = [
        ['Metric', 'Value'],
        [data[0]?.name || 'Total Bits', totalBits],
        [data[1]?.name || 'Matching Bases', matchingBases],
        [data[2]?.name || 'Key Bits', keyBits],
      ];

      const dataTable = window.google.visualization.arrayToDataTable(chartData);

      const options = {
        title: 'Simulation Metrics',
        width: '100%',
        height: 300,
        chartArea: { 
          width: '85%', 
          height: '70%',
          left: 100,
          right: 30
        },
        bar: { groupWidth: '60%' },
        hAxis: {
          title: 'Count',
          minValue: 0,
          textStyle: { fontSize: 11 }
        },
        vAxis: {
          title: 'Metrics',
          textStyle: { fontSize: 11 }
        },
        titleTextStyle: { fontSize: 14 },
        colors: ['#3b82f6'],
        legend: { position: 'none' },
      };

      const chart = new window.google.visualization.BarChart(
        document.getElementById('simulation-metrics-chart')
      );
      chart.draw(dataTable, options);
    }).catch(error => {
      console.error('Error loading Google Charts:', error);
      const chartDiv = document.getElementById('simulation-metrics-chart');
      if (chartDiv) {
        chartDiv.innerHTML = '<p>Chart failed to load. Metrics: ' + JSON.stringify(data) + '</p>';
      }
    });
  };

  // (Reverted) No separate QBER gauge chart

  const resetSimulation = () => {
    setCurrentStep(0);
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

    // Reset animation state
    setAliceBit("-");
    setAliceBasis("-");
    setAlicePol("-");
    setBobBasis("-");
    setBobBit("-");
    setBobResult("-");
    setAlicePolarizer("+");
    setBobPolarizer("+");
    setEvePolarizers([
      { measure: "+", send: "+" },
      { measure: "+", send: "+" },
      { measure: "+", send: "+" },
      { measure: "+", send: "+" },
      { measure: "+", send: "+" },
    ]);
    setNumEves(0);
    hidePhoton();
    hideStatusInfo();
    setActiveEve(null);

    // Clean up any running animations
    const photonElement = document.querySelector('.photon-particle') as HTMLElement;
    if (photonElement) {
      photonElement.classList.remove('animate-photon-transmission', 'animate-vibrate', 'animate-fall');
    }
  };

  return (
    <div className="space-y-6">
      {/* Alice-Bob Animation Section */}
      <div className="bg-card rounded-xl p-6 shadow-lg border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">
            Quantum Transmission Animation
          </h2>
        </div>
        <div className="flex items-center justify-between min-h-[250px] relative">
          {/* Alice */}
          <div className="flex flex-col items-center w-32 z-10">
            <div className="w-20 h-20 rounded-full mb-3 flex items-center justify-center text-3xl border-4 border-pink-400 bg-gradient-to-r from-pink-200 to-pink-300 shadow-lg">
              👩‍🦰
            </div>
            <div className="font-bold text-foreground mb-3">Alice</div>
            {isStepByStep && (
              <div className="bg-muted p-3 rounded-lg text-sm w-full text-center border border-border">
                <div className="font-medium">
                  Bit: <strong>{aliceBit}</strong>
                </div>
                <div className="font-medium">
                  Basis: <strong>{aliceBasis}</strong>
                </div>
                
              </div>
            )}
          </div>

          {/* Channel Area */}
          <div className="flex-1 h-16 mx-8 relative flex items-center justify-center">
            <div
              className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 relative shadow-sm"
              style={{ boxShadow: "0 0 15px rgba(52, 152, 219, 0.4)" }}
            >
              <div
                className={`photon-particle absolute w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full top-[-11px] flex items-center justify-center font-bold text-foreground shadow-lg transition-all duration-300 ${
                  isPhotonVisible ? "opacity-100" : "opacity-0"
                } ${isPhotonVibrating ? "animate-vibrate" : ""} ${isPhotonFalling ? "animate-fall" : ""}`}
                style={{
                  left: `${photonPosition}%`,
                  boxShadow: "0 0 20px rgba(241, 196, 15, 0.7)",
                  transform: `translateX(${photonPosition}%)`,
                }}
              >
                →
              </div>
              <div
                className={`absolute top-[-40px] left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground px-4 py-2 rounded-full text-sm font-medium transition-opacity whitespace-nowrap border border-border ${
                  isStatusInfoVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                {statusInfo}
              </div>
            </div>

            {/* Alice Polarizer */}
            <div className="absolute left-[10%] top-1/2 transform -translate-y-1/2 z-20">
              <div
                className={`w-16 h-16 bg-gradient-to-r from-muted to-muted/80 border-4 border-foreground/50 flex items-center justify-center font-bold text-xl text-foreground shadow-lg ${
                  alicePolarizer === "×" ? "rotate-[45deg]" : ""
                }`}
              >
                {alicePolarizer}
              </div>
            </div>

            {/* Eve Polarizer Pairs */}
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`absolute top-1/2 transform -translate-y-1/2 z-20 ${i === 0 ? "left-[25%]" : i === 1 ? "left-[35%]" : i === 2 ? "left-[45%]" : i === 3 ? "left-[55%]" : "left-[65%]"} ${
                  i < numEves ? "block" : "hidden"
                }`}
              >
                <div
                  className={`w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-xs text-white border-2 border-red-600 shadow-lg mb-2 font-bold transition-all ${
                    activeEve === i ? "scale-110" : ""
                  }`}
                >
                  E{i + 1}
                </div>
                <div className="flex gap-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r from-red-100 to-red-200 border-3 border-red-600 flex items-center justify-center font-bold text-lg text-red-600 shadow ${
                      evePolarizers[i]?.measure === "×" ? "rotate-[45deg]" : ""
                    }`}
                  >
                    {evePolarizers[i]?.measure || "+"}
                  </div>
                  <div
                    className={`w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 border-3 border-green-600 flex items-center justify-center font-bold text-lg text-green-600 shadow ${
                      evePolarizers[i]?.send === "×" ? "rotate-[45deg]" : ""
                    }`}
                  >
                    {evePolarizers[i]?.send || "+"}
                  </div>
                </div>
              </div>
            ))}

            {/* Bob Polarizer */}
            <div className="absolute right-[10%] top-1/2 transform -translate-y-1/2 z-20">
              <div
                className={`w-16 h-16 bg-gradient-to-r from-muted to-muted/80 border-4 border-foreground/50 flex items-center justify-center font-bold text-xl text-foreground shadow-lg ${
                  bobPolarizer === "×" ? "rotate-[45deg]" : ""
                }`}
              >
                {bobPolarizer}
              </div>
            </div>
          </div>

          {/* Bob */}
          <div className="flex flex-col items-center w-32 z-10">
            <div className="w-20 h-20 rounded-full mb-3 flex items-center justify-center text-3xl border-4 border-indigo-500 bg-gradient-to-r from-indigo-400 to-indigo-600 shadow-lg">
              👨‍💼
            </div>
            <div className="font-bold text-foreground mb-3">Bob</div>
            {isStepByStep && (
              <div className="bg-muted p-3 rounded-lg text-sm w-full text-center border border-border">
                <div className="font-medium">
                  Basis: <strong>{bobBasis}</strong>
                </div>
                <div className="font-medium">
                  Measures: <strong>{bobBit}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
                  disabled={isRunning}
                  className="bg-quantum-blue hover:bg-quantum-blue/90"
                  size="sm"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Running
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1" />
                      Start
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={startStepByStepMode}
                  disabled={stepByStepBits.length > 0}
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
              {/* Simulation Parameters */}
              {!isStepByStep || stepByStepBits.length === 0 ? (
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
                        <label className="text-sm font-medium whitespace-nowrap">
                          Qubits:
                        </label>
                        <Slider
                          value={numQubits}
                          onValueChange={setNumQubits}
                          max={50}
                          min={8}
                          step={2}
                          className="flex-1"
                          disabled={isRunning}
                        />
                        <span className="text-sm w-8">{numQubits[0]}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium whitespace-nowrap">
                          Eavesdrop:
                        </label>
                        <Slider
                          value={eavesdroppingRate}
                          onValueChange={setEavesdroppingRate}
                          max={5}
                          min={0}
                          step={1}
                          className="flex-1"
                          disabled={isRunning}
                        />
                        <span className="text-sm w-12">
                          {eavesdroppingRate[0]} Eve{eavesdroppingRate[0] !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium whitespace-nowrap">
                          Noise:
                        </label>
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
                      
                      {/* Simulation Presets based on experimental procedures */}
                      <div className="pt-4 border-t border-border">
                        <h3 className="text-sm font-medium mb-3">Experiment Presets</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setNumQubits([16]);
                              setEavesdroppingRate([0]);
                              setNoiseLevel([2]);
                            }}
                            className="text-xs"
                          >
                            No Eavesdropper
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setNumQubits([16]);
                              setEavesdroppingRate([3]);
                              setNoiseLevel([2]);
                            }}
                            className="text-xs"
                          >
                            With Eavesdropper
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setNumQubits([16]);
                              setEavesdroppingRate([0]);
                              setNoiseLevel([10]);
                            }}
                            className="text-xs"
                          >
                            High Noise
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setNumQubits([50]);
                              setEavesdroppingRate([0]);
                              setNoiseLevel([2]);
                            }}
                            className="text-xs"
                          >
                            More Qubits
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setNumQubits([16]);
                              setEavesdroppingRate([2]);
                              setNoiseLevel([5]);
                            }}
                            className="text-xs"
                          >
                            Mixed Conditions
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setNumQubits([16]);
                              setEavesdroppingRate([0]);
                              setNoiseLevel([0]);
                            }}
                            className="text-xs"
                          >
                            Ideal
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Place the progress visualization here when simulation is running */}
                  <Card className="border-quantum-glow/30">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Step-by-Step Visualization - Bit {currentBitIndex + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    disabled={
                      currentBitIndex === stepByStepBits.length - 1 &&
                      bitStep === 4 &&
                      !!finalKey
                    }
                    className="bg-quantum-purple hover:bg-quantum-purple/90"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  <span className="text-sm px-3 py-2 bg-muted rounded border whitespace-nowrap">
                    Bit {currentBitIndex + 1}/{stepByStepBits.length} - Step{" "}
                    {bitStep + 1}/5
                  </span>
                </div>
              )}
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
                                  <span
                                    className={`font-mono text-lg px-2 py-1 rounded ${bitStep >= 0 ? "bg-quantum-blue/20 text-quantum-blue" : "bg-muted/20 text-muted-foreground"}`}
                                  >
                                    {bitStep >= 0
                                      ? stepByStepBits[currentBitIndex].aliceBit
                                      : "?"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Basis Choice:</span>
                                  <span
                                    className={`font-mono text-lg px-2 py-1 rounded ${bitStep >= 0 ? "bg-quantum-blue/20 text-quantum-blue" : "bg-muted/20 text-muted-foreground"}`}
                                  >
                                    {bitStep >= 0
                                      ? getBasisSymbol(
                                          stepByStepBits[currentBitIndex]
                                            .aliceBasis,
                                        )
                                      : "?"}
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
                                  <span
                                    className={`font-mono text-lg px-2 py-1 rounded ${bitStep >= 1 ? "bg-quantum-purple/20 text-quantum-purple" : "bg-muted/20 text-muted-foreground"}`}
                                  >
                                    {bitStep >= 1
                                      ? getBasisSymbol(
                                          stepByStepBits[currentBitIndex]
                                            .bobBasis,
                                        )
                                      : "?"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Measurement:</span>
                                  <span
                                    className={`font-mono text-lg px-2 py-1 rounded ${bitStep >= 3 ? "bg-quantum-purple/20 text-quantum-purple" : "bg-muted/20 text-muted-foreground"}`}
                                  >
                                    {bitStep >= 3
                                      ? stepByStepBits[currentBitIndex]
                                          .bobMeasurement
                                      : "?"}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">
                              Current Step:
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {[
                                "Alice prepares qubit",
                                "Photon transmitted",
                                "Bob selects measurement basis",
                                "Bob measures qubit",
                                "Bases compared",
                              ].map((step, index) => (
                                <div
                                  key={index}
                                  className={`p-4 rounded text-sm text-center transition-all ${
                                    bitStep === index
                                      ? "bg-quantum-glow/20 border-2 border-quantum-glow text-quantum-glow font-semibold"
                                      : bitStep > index
                                        ? "bg-green-400/20 border border-green-400/30 text-green-400"
                                        : "bg-muted/20 border border-muted/30 text-muted-foreground"
                                  }`}
                                >
                                  {step}
                                </div>
                              ))}
                            </div>
                          </div>

                          {bitStep >= 4 && (
                            <Card
                              className={`${stepByStepBits[currentBitIndex].isMatching ? "bg-green-400/10 border-green-400/30" : "bg-red-400/10 border-red-400/30"}`}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    Basis Match:
                                  </span>
                                  <span
                                    className={`font-bold ${stepByStepBits[currentBitIndex].isMatching ? "text-green-400" : "text-red-400"}`}
                                  >
                                    {stepByStepBits[currentBitIndex].isMatching
                                      ? "✓ Yes - Key bit!"
                                      : "X No - Discarded"}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="space-y-4">
                {currentStep > 1 && !isStepByStep && (
                  <Card className="bg-quantum-blue/5 border-quantum-blue/20">
                    <CardContent className="p-3">
                      <p className="font-semibold text-quantum-blue">
                        Current Step:
                      </p>
                      <p className="text-sm">{steps[currentStep - 1]}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {false && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive rounded">
                    
                    
                  </div>
                )}

                {noiseLevel[0] > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500 rounded">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-yellow-500">
                      Noise ({noiseLevel[0]}%)
                    </span>
                  </div>
                )}
              </div>




              {/* Photon transmission visualization */}
              {currentStep === 1 && !isStepByStep && (
                <Card className="border-quantum-glow/30">
                  <CardHeader>
                    <CardTitle className="text-sm">
                      alice sends photon to bob
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    
                      {eavesdroppingRate[0] > 0 && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-destructive font-bold">
                          <Eye className="w-6 h-6" />
                        </div>
                      )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right column - Results */}
            <div className="space-y-6">
              {/* Results Display */}
              {(quantumBits.length > 0 ||
                (isStepByStep && stepByStepBits.length > 0)) && (
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
                      {(quantumBits.length > 0 || (stepByStepBits.length > 0 && currentBitIndex >= 0)) && (
                        <span className="text-sm font-normal ml-auto">
                          Showing {isStepByStep && stepByStepBits.length > 0 ? Math.min(currentBitIndex + 1, stepByStepBits.length) : quantumBits.length} of {numQubits[0]} bits
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="overflow-x-auto max-h-[800px] overflow-y-auto">
                      <table className="w-full text-sm min-w-[800px]">
                        <thead className="sticky top-0 bg-background z-10 shadow-sm">
                          <tr className="border-b border-quantum-blue/30">
                            <th className="text-left p-2">Bit #</th>
                            <th className="text-left p-2 bg-quantum-blue/10 border-l border-r border-quantum-blue/30">
                              <div className="text-center">
                                <div className="font-bold text-quantum-blue">
                                  Alice (Transmitter)
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Sending
                                </div>
                              </div>
                            </th>
                            <th className="text-left p-2 bg-quantum-blue/10 border-r border-quantum-blue/30">
                              Basis
                            </th>
                            {eavesdroppingRate[0] > 0 && (
                              <>
                                <th className="text-left p-2 bg-red-500/10 border-l border-red-500/30">
                                  <div className="text-center">
                                    <div className="font-bold text-red-500">
                                      Eve
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Basis
                                    </div>
                                  </div>
                                </th>
                                <th className="text-left p-2 bg-red-500/10">
                                  <div className="text-center">
                                    <div className="font-bold text-red-500">
                                      Eve
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Measure
                                    </div>
                                  </div>
                                </th>
                                <th className="text-left p-2 bg-red-500/10 border-r border-red-500/30">
                                  <div className="text-center">
                                    <div className="font-bold text-red-500">
                                      Eve
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Resend
                                    </div>
                                  </div>
                                </th>
                              </>
                            )}
                            <th className="text-left p-2 bg-quantum-purple/10 border-l border-r border-quantum-purple/30">
                              <div className="text-center">
                                <div className="font-bold text-quantum-purple">
                                  Bob (Receiver)
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Receiving
                                </div>
                              </div>
                            </th>
                            <th className="text-left p-2 bg-quantum-purple/10 border-r border-quantum-purple/30">
                              Basis
                            </th>
                            <th className="text-left p-2 bg-quantum-purple/10 border-r border-quantum-purple/30">
                              Result
                            </th>
                            <th className="text-left p-2">Match</th>
                            <th className="text-left p-2">In Key</th>
                          </tr>
                          <tr className="border-b border-quantum-blue/20 text-xs">
                            <th className="p-1"></th>
                            <th className="p-1 bg-quantum-blue/5 text-center text-quantum-blue">
                              Transmitted Bit
                            </th>
                            <th className="p-1 bg-quantum-blue/5 text-center text-quantum-blue">
                              Polarization
                            </th>
                            {eavesdroppingRate[0] > 0 && (
                              <>
                                <th className="p-1 bg-red-500/5 text-center text-red-500 border-l border-red-500/20">
                                  Measure Basis
                                </th>
                                <th className="p-1 bg-red-500/5 text-center text-red-500">
                                  Measured Bit
                                </th>
                                <th className="p-1 bg-red-500/5 text-center text-red-500 border-r border-red-500/20">
                                  Resend Basis
                                </th>
                              </>
                            )}
                            <th className="p-1 bg-quantum-purple/5 text-center text-quantum-purple border-l border-quantum-purple/20">
                              Received Bit
                            </th>
                            <th className="p-1 bg-quantum-purple/5 text-center text-quantum-purple">
                              Measurement
                            </th>
                            <th className="p-1 bg-quantum-purple/5 text-center text-quantum-purple border-r border-quantum-purple/20">
                              Outcome
                            </th>
                            <th className="p-1 text-center">Basis</th>
                            <th className="p-1 text-center">Secure</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(isStepByStep 
                            ? stepByStepBits.slice(0, currentBitIndex + 1) // Show only processed bits in step-by-step mode
                            : quantumBits
                          ).map(
                            (bit, index) => (
                              <tr
                                key={bit.id}
                                data-bit-id={bit.id}
                                className={`border-b transition-all duration-300 ${bit.inKey ? "bg-quantum-glow/10" : ""} ${isStepByStep && index === currentBitIndex ? "ring-2 ring-quantum-glow/50" : ""}`}
                              >
                                <td className="p-2">{bit.id + 1}</td>
                                <td className="p-2 font-mono text-center bg-quantum-blue/5 border-l border-r border-quantum-blue/20">
                                  <span className="inline-block w-6 h-6 bg-quantum-blue/20 rounded-full text-center leading-6 text-quantum-blue font-bold">
                                    {bit.aliceBit}
                                  </span>
                                </td>
                                <td className="p-2 font-mono text-quantum-blue bg-quantum-blue/5 border-r border-quantum-blue/20 text-center">
                                  <span className="text-lg font-bold">
                                    {getBasisSymbol(bit.aliceBasis)}
                                  </span>
                                </td>
                                {/* Eve's columns - only show when eavesdropping is enabled */}
                                {eavesdroppingRate[0] > 0 && (
                                  <>
                                    <td className="p-2 font-mono text-center bg-red-500/5 border-l border-red-500/20">
                                      {bit.intercepted ? (
                                        <span className="text-lg font-bold text-red-500">
                                          {getBasisSymbol(bit.eveMeasureBasis!)}
                                        </span>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </td>
                                    <td className="p-2 font-mono text-center bg-red-500/5">
                                      {bit.intercepted ? (
                                        <span className="inline-block w-6 h-6 bg-red-500/20 rounded-full text-center leading-6 text-red-500 font-bold">
                                          {bit.eveMeasurement}
                                        </span>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </td>
                                    <td className="p-2 font-mono text-center bg-red-500/5 border-r border-red-500/20">
                                      {bit.intercepted ? (
                                        <span className="text-lg font-bold text-red-500">
                                          {getBasisSymbol(bit.eveResendBasis!)}
                                        </span>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </td>
                                  </>
                                )}
                                <td className="p-2 font-mono text-center bg-quantum-purple/5 border-l border-r border-quantum-purple/20">
                                  {bit.bobMeasurement !== null ? (
                                    <span className="inline-block w-6 h-6 bg-quantum-purple/20 rounded-full text-center leading-6 text-quantum-purple font-bold">
                                      {bit.bobMeasurement}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">Lost</span>
                                  )}
                                </td>
                                <td className="p-2 font-mono text-quantum-purple bg-quantum-purple/5 text-center">
                                  <span className="text-lg font-bold">
                                    {getBasisSymbol(bit.bobBasis)}
                                  </span>
                                </td>
                                <td className="p-2 bg-quantum-purple/5 border-r border-quantum-purple/20 text-center">
                                  {bit.bobMeasurement !== null ? (
                                    <span
                                      className={`inline-block w-6 h-6 rounded-full text-center leading-6 font-bold ${
                                        bit.aliceBit === bit.bobMeasurement
                                          ? "bg-green-400/20 text-green-400"
                                          : "bg-red-400/20 text-red-400"
                                      }`}
                                    >
                                      {bit.bobMeasurement}
                                    </span>
                                  ) : (
                                    <span className="text-orange-500 font-semibold">
                                      Lost
                                    </span>
                                  )}
                                </td>
                                <td className="p-2 text-center">
                                  {bit.isMatching === null ? (
                                    <span className="text-muted-foreground">
                                      -
                                    </span>
                                  ) : (
                                    <span
                                      className={`inline-block w-6 h-6 rounded-full text-center leading-6 font-bold ${
                                        bit.isMatching
                                          ? "bg-green-400/20 text-green-400"
                                          : "bg-red-400/20 text-red-400"
                                      }`}
                                    >
                                      {bit.isMatching ? "✓" : "X"}
                                    </span>
                                  )}
                                </td>
                                <td className="p-2 text-center">
                                  {bit.inKey ? (
                                    <span className="inline-block w-6 h-6 bg-quantum-glow/20 rounded-full text-center leading-6 text-quantum-glow font-bold">
                                      ✓
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">
                                      -
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                      {isStepByStep && currentBitIndex === 0 && bitStep === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Press the Next button to start processing bits...</p>
                        </div>
                      )}
                    </div>

                    {finalKey && (
                      <Card className="bg-quantum-glow/10 border-quantum-glow/30">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <h3 className="font-bold text-quantum-glow mb-2">
                              Final Shared Key
                            </h3>
                            <div className="font-mono text-lg bg-background/50 p-3 rounded border">
                              {finalKey}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Length: {finalKey.length} bits
                              {eavesdroppingRate[0] > 0 && (
                                <span className="block text-destructive">
                                  ⚠️ Eavesdropping detected! Key may be
                                  compromised.
                                </span>
                              )}
                              {noiseLevel[0] > 0 && (
                                <span className="block text-yellow-500">
                                  ⚠️ Channel noise present! Some errors
                                  expected.
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
                          <CardTitle className="text-sm">
                          Simulation Metrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="w-full" style={{ height: '300px' }} id="simulation-metrics-chart">
                            {/* Google Chart will be rendered here */}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-secondary/20">
                        <CardHeader>
                          <CardTitle className="text-sm">
                          Error Rate (QBER)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="space-y-4">
                          {simulationData.slice(3).map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-background/50 rounded"
                            >
                              <span className="text-sm font-medium">
                                {item.name}
                              </span>
                              <span
                                className={`text-lg font-bold ${
                                  item.name.includes("Error") || item.name.includes("QBER")
                                    ? "text-red-400"
                                    : "text-green-400"
                                }`}
                              >
                                {item.value}%
                              </span>
                            </div>
                          ))}

                          <div className="mt-4 p-3 bg-quantum-glow/10 border border-quantum-glow/30 rounded">
                            <h4 className="font-semibold text-quantum-glow text-sm mb-2">
                              Security Assessment
                            </h4>
                            <p className="text-xs">
                              {(() => {
                                const totalQBER = parseFloat(String(simulationData.find(d => d.name === "QBER (%)")?.value || "0"));
                                const eavesdropperRate = eavesdroppingRate[0];
                                const noise = noiseLevel[0];
                                
                                // Generate unique descriptions based on exact parameters
                                if (eavesdropperRate === 0 && noise === 0) {
                                  if (totalQBER < 0.1) {
                                    return "✅ Perfect quantum channel! Zero errors detected. The key exchange is cryptographically secure with no eavesdropping or noise interference.";
                                  }
                                  return "✅ Ideal conditions: No eavesdropping or noise detected. Any minimal errors are due to quantum measurement uncertainties.";
                                }
                                
                                if (eavesdropperRate > 0 && noise === 0) {
                                  if (eavesdropperRate < 10) {
                                    return `⚠️ Eavesdropper detected! Eve is intercepting ${eavesdropperRate}% of photons. QBER shows ${totalQBER.toFixed(1)}% error rate. Key security is compromised - abort protocol.`;
                                  } else if (eavesdropperRate < 50) {
                                    return `🚨 Major security breach! Heavy eavesdropping activity (${eavesdropperRate}% interception rate) causing ${totalQBER.toFixed(1)}% QBER. Communication channel is severely compromised.`;
                                  } else {
                                    return `❌ Critical security failure! Massive eavesdropping detected (${eavesdropperRate}% interception). QBER at ${totalQBER.toFixed(1)}%. Abort immediately and switch channels.`;
                                  }
                                }
                                
                                if (eavesdropperRate === 0 && noise > 0) {
                                  if (noise < 5) {
                                    return `⚠️ Channel noise detected: ${noise}% noise level causing ${totalQBER.toFixed(1)}% QBER. Key is secure but error correction needed for reliability.`;
                                  } else if (noise < 10) {
                                    return `⚠️ Moderate channel degradation: ${noise}% environmental noise resulting in ${totalQBER.toFixed(1)}% error rate. Consider channel optimization.`;
                                  } else {
                                    return `❌ Poor channel quality: High noise (${noise}%) causing ${totalQBER.toFixed(1)}% QBER. Channel may be unsuitable for secure QKD.`;
                                  }
                                }
                                
                                if (eavesdropperRate > 0 && noise > 0) {
                                  const totalInterference = eavesdropperRate + noise;
                                  if (totalInterference < 15) {
                                    return `⚠️ Dual threat detected: ${eavesdropperRate}% eavesdropping + ${noise}% noise = ${totalQBER.toFixed(1)}% QBER. Both Eve and channel quality affecting security.`;
                                  } else if (totalInterference < 30) {
                                    return `🚨 Multiple security issues: Active eavesdropping (${eavesdropperRate}%) combined with channel noise (${noise}%) producing ${totalQBER.toFixed(1)}% errors. Protocol severely compromised.`;
                                  } else {
                                    return `❌ Complete security failure: Extreme eavesdropping (${eavesdropperRate}%) and noise (${noise}%) causing ${totalQBER.toFixed(1)}% QBER. Channel unusable for secure communication.`;
                                  }
                                }
                                
                                // Threshold-based assessment
                                const securityThreshold = 11; // BB84 theoretical limit
                                if (totalQBER > securityThreshold) {
                                  return `❌ QBER (${totalQBER.toFixed(1)}%) exceeds security threshold (${securityThreshold}%). Key exchange is compromised and cannot guarantee security.`;
                                }
                                
                                return `✅ Secure key exchange: QBER at ${totalQBER.toFixed(1)}% is below security threshold. Key distribution successful.`;
                              })()}
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
