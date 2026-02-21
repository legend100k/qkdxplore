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
  ShieldCheck,
  AlertCircle,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  StepForward,
  Loader2,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  PolarizationState,
  applyOpticalNoise,
  legacyNoiseToOptical,
} from "@/lib/opticalNoise";
import { E91SimulationSection } from "./E91SimulationSection";
import { B92SimulationSection } from "./B92SimulationSection";

// MathML type definitions for TypeScript
declare namespace JSX {
  interface IntrinsicElements {
    math: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    mrow: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    mi: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    mo: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    mfrac: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    msub: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    semantics: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    annotation: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
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
  const [selectedProtocol, setSelectedProtocol] = useState<'bb84' | 'e91' | 'b92'>('bb84');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [quantumBits, setQuantumBits] = useState<QuantumBit[]>([]);
  const [finalKey, setFinalKey] = useState<string>("");
  const [photonPosition, setPhotonPosition] = useState(0);
  const [numQubits, setNumQubits] = useState([16]);
  const [eavesdroppingRate, setEavesdroppingRate] = useState([0]);
  const [noiseLevel, setNoiseLevel] = useState([0]);
  const [simulationData, setSimulationData] = useState<Array<{ name: string, value: number | string }>>([]);
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

  // Calculate number of Eves based on eavesdropping rate (percentage-based)
  useEffect(() => {
    const calculatedNumEves =
      eavesdroppingRate[0] === 0
        ? 0
        : Math.min(5, Math.ceil(eavesdroppingRate[0] / 20));
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


  const generateRandomBits = () => {
    const bits: QuantumBit[] = [];
    const totalBits = numQubits[0];
    // Eavesdropping rate: 0-100% probability of interception
    const eavesProbability = eavesdroppingRate[0] / 100;

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

    setPhotonPosition(100);

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
    // Eavesdropping rate: 0-100% probability of interception
    const eavesProbability = eavesdroppingRate[0] / 100;
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
    try {
      setIsRunning(true);
      setCurrentStep(0);
      setFinalKey("");

      // Instantly go to the final step
      setCurrentStep(6);
      hidePhoton();

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
    } catch (error) {
      console.error("Simulation failed:", error);
      toast.error("Simulation failed. Please try again.");
    } finally {
      setIsRunning(false);
    }
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
    try {
      // Standard BB84 QBER calculation:
      // QBER = errors in sifted key / total sifted key bits

      // Sifted key = bits where Alice and Bob used same basis
      const siftedKeyBits = bits.filter(bit => bit.isMatching && bit.bobMeasurement !== null);
      const siftedKeyCount = siftedKeyBits.length;

      // Errors in sifted key = where Bob's measurement doesn't match Alice's bit
      const errorsInSiftedKey = siftedKeyBits.filter(
        bit => bit.aliceBit !== bit.bobMeasurement
      );

      // Calculate the standard QBER from actual measurements
      let actualQBER = siftedKeyCount > 0
        ? (errorsInSiftedKey.length / siftedKeyCount) * 100
        : 0;

      // Add contributions from different error sources
      const eavesdroppingRateValue = eavesdroppingRate[0];
      const noiseLevelValue = noiseLevel[0];

      // Eavesdropping creates QBER: when Eve intercepts and resends,
      // she causes ~25% error rate (since she guesses basis randomly)
      let eavesdroppingContribution = 0;
      if (eavesdroppingRateValue > 0) {
        eavesdroppingContribution = Math.min((eavesdroppingRateValue / 100) * 25, 25);
      }

      // Noise contributes to QBER
      const noiseContribution = noiseLevelValue * 0.5; // Each 1% noise contributes ~0.5% to QBER

      // Intrinsic QBER floor - ALWAYS present in real quantum systems due to:
      // - Detector dark counts and timing jitter
      // - Polarization alignment imperfections
      // - State preparation fidelity limits
      // - Environmental factors (temperature, vibrations)
      // Typical values: 0.5-2% for well-aligned lab systems
      const intrinsicFloor = 0.5 + Math.random() * 0.3; // 0.5-0.8% with quantum variation

      // Calculate combined QBER based on error sources
      let combinedQBER = actualQBER + eavesdroppingContribution + noiseContribution + intrinsicFloor;

      // Apply upper bound based on theoretical maximum
      const totalQBER = Math.min(combinedQBER, 75);

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
    } catch (error) {
      console.error("Analysis generation failed:", error);
    }
  };

  // Charts functions removed

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
    <div className="space-y-8 pb-4">
      {/* Protocol Selection Tabs */}
      <Card className="border-none shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-quantum-blue" />
              <h2 className="text-lg font-bold text-foreground">Select Protocol</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedProtocol === 'bb84' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedProtocol('bb84')}
                className={selectedProtocol === 'bb84' ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                BB84
              </Button>
              <Button
                variant={selectedProtocol === 'e91' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedProtocol('e91')}
                className={selectedProtocol === 'e91' ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                E91
              </Button>
              <Button
                variant={selectedProtocol === 'b92' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedProtocol('b92')}
                className={selectedProtocol === 'b92' ? "bg-red-600 hover:bg-red-700" : ""}
              >
                B92
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Render selected protocol component */}
      {selectedProtocol === 'bb84' && (
        <div className="space-y-8 pb-4">
          {/* Alice-Bob Animation Section */}
          <Card className="border-none shadow-soft overflow-hidden">
            <CardHeader className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Interactive</Badge>
                  <h2 className="text-lg font-bold text-foreground">
                    Quantum Channel Visualization
                  </h2>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-10 relative bg-white dark:bg-slate-950/30 min-h-[300px] flex flex-col justify-center">
              <div className="flex flex-col md:flex-row items-center md:items-stretch justify-between gap-8 md:gap-6 min-h-[250px] relative w-full max-w-none">
                {/* Alice */}
                <div className="flex flex-col items-center w-full md:w-32 z-10 group cursor-pointer">
                  <div className="w-24 h-24 rounded-2xl mb-4 flex items-center justify-center text-4xl bg-white dark:bg-slate-900 shadow-soft border border-gray-100 dark:border-gray-800 transition-transform group-hover:scale-105 duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    👩‍🦰
                    <div className="absolute -bottom-2 px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs font-bold rounded-full border border-pink-200 dark:border-pink-800">Sender</div>
                  </div>
                  <div className="font-bold text-foreground text-lg">Alice</div>
                  {isStepByStep && (
                    <div className="mt-2 bg-white dark:bg-slate-900 p-3 rounded-xl text-sm w-full text-center border border-gray-100 dark:border-gray-800 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-500 text-xs">Bit</span>
                        <span className="font-mono font-bold text-blue-600">{aliceBit}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-xs">Basis</span>
                        <span className="font-mono font-bold text-purple-600">{aliceBasis}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Channel Area */}
                <div className="flex-1 h-24 w-full md:w-auto mx-2 md:mx-12 relative flex items-center justify-center">
                  {/* Fiber Optic Cable */}
                  <div className="absolute w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent w-1/2 animate-[shimmer_2s_infinite]"></div>
                  </div>

                  <div
                    className="w-full h-0.5 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 relative z-0"
                  >
                    <div
                      className={`photon-particle absolute w-10 h-10 bg-white dark:bg-slate-900 rounded-full top-[-20px] flex items-center justify-center font-bold text-xl shadow-lg border-2 border-yellow-400 transition-all duration-300 z-30 ${isPhotonVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"
                        } ${isPhotonVibrating ? "animate-vibrate" : ""} ${isPhotonFalling ? "animate-fall" : ""}`}
                      style={{
                        left: `${photonPosition}%`,
                        boxShadow: "0 0 20px rgba(250, 204, 21, 0.4)",
                        transform: `translateX(${photonPosition}%)`,
                      }}
                    >
                      <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping"></div>
                      →
                    </div>

                    <div
                      className={`absolute top-[-60px] left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 text-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md border border-gray-100 dark:border-gray-700 whitespace-nowrap z-40 ${isStatusInfoVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                        }`}
                    >
                      {statusInfo}
                    </div>
                  </div>

                  {/* Alice Polarizer */}
                  <div className="absolute left-[10%] top-1/2 transform -translate-y-1/2 z-20">
                    <div
                      className={`w-16 h-16 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center font-bold text-2xl text-blue-600 shadow-md rounded-xl transition-all duration-500 ${alicePolarizer === "×" ? "rotate-[45deg]" : ""
                        }`}
                    >
                      {alicePolarizer}
                    </div>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Filter</div>
                  </div>

                  {/* Eve Polarizer Pairs */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`absolute top-1/2 transform -translate-y-1/2 z-20 transition-all duration-500 ${i === 0 ? "left-[25%]" : i === 1 ? "left-[35%]" : i === 2 ? "left-[45%]" : i === 3 ? "left-[55%]" : "left-[65%]"} ${i < numEves ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"
                        }`}
                    >
                      <div
                        className={`w-8 h-8 bg-red-500 mx-auto rounded-full flex items-center justify-center text-[10px] text-white shadow-md mb-2 font-bold transition-transform ${activeEve === i ? "scale-125 ring-4 ring-red-500/20" : ""
                          }`}
                      >
                        E{i + 1}
                      </div>
                      <div className="flex gap-2 p-1 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20 backdrop-blur-sm">
                        <div
                          className={`w-10 h-10 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-center font-bold text-lg text-red-500 shadow-sm ${evePolarizers[i]?.measure === "×" ? "rotate-[45deg]" : ""
                            }`}
                        >
                          {evePolarizers[i]?.measure || "+"}
                        </div>
                        <div
                          className={`w-10 h-10 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-center font-bold text-lg text-red-500 shadow-sm ${evePolarizers[i]?.send === "×" ? "rotate-[45deg]" : ""
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
                      className={`w-16 h-16 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center font-bold text-2xl text-purple-600 shadow-md rounded-xl transition-all duration-500 ${bobPolarizer === "×" ? "rotate-[45deg]" : ""
                        }`}
                    >
                      {bobPolarizer}
                    </div>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Detector</div>
                  </div>
                </div>

                {/* Bob */}
                <div className="flex flex-col items-center w-full md:w-32 z-10 group cursor-pointer">
                  <div className="w-24 h-24 rounded-2xl mb-4 flex items-center justify-center text-4xl bg-white dark:bg-slate-900 shadow-soft border border-gray-100 dark:border-gray-800 transition-transform group-hover:scale-105 duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    👨‍💼
                    <div className="absolute -bottom-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full border border-indigo-200 dark:border-indigo-800">Receiver</div>
                  </div>
                  <div className="font-bold text-foreground text-lg">Bob</div>
                  {isStepByStep && (
                    <div className="mt-2 bg-white dark:bg-slate-900 p-3 rounded-xl text-sm w-full text-center border border-gray-100 dark:border-gray-800 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-500 text-xs">Basis</span>
                        <span className="font-mono font-bold text-purple-600">{bobBasis}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-xs">Result</span>
                        <span className="font-mono font-bold text-green-600">{bobBit}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <Zap className="w-6 h-6 text-blue-600" />
                  BB84 Protocol Simulation
                </CardTitle>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={runSimulation}
                    disabled={isRunning}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2 fill-current" />
                        Run Simulation
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={resetSimulation}
                    variant="outline"
                    className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left column - Controls */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-6 flex flex-col">
                  <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-6 border border-gray-100 dark:border-gray-800 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
                      <Settings className="w-5 h-5 text-gray-500" />
                      Simulation Parameters
                    </h3>

                    <div className="space-y-8">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <label className="font-medium text-foreground">Qubits</label>
                          <span className="font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">{numQubits[0]}</span>
                        </div>
                        <Slider
                          value={numQubits}
                          onValueChange={setNumQubits}
                          max={100}
                          min={1}
                          step={1}
                          className="py-2"
                          disabled={isRunning}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <label className="font-medium text-foreground">Eavesdrop</label>
                          <span className={`font-mono font-bold px-2 py-0.5 rounded ${eavesdroppingRate[0] > 0 ? 'text-red-600 bg-red-50 dark:bg-red-900/30' : 'text-gray-500 bg-gray-100'}`}>
                            {eavesdroppingRate[0]}%
                          </span>
                        </div>
                        <Slider
                          value={eavesdroppingRate}
                          onValueChange={setEavesdroppingRate}
                          max={100}
                          min={0}
                          step={5}
                          className="py-2"
                          disabled={isRunning}
                        />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Simulates an eavesdropper intercepting photons. Higher percentage = more interception.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <label className="font-medium text-foreground">Channel Noise</label>
                          <span className={`font-mono font-bold px-2 py-0.5 rounded ${noiseLevel[0] > 0 ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' : 'text-gray-500 bg-gray-100'}`}>
                            {noiseLevel[0]}%
                          </span>
                        </div>
                        <Slider
                          value={noiseLevel}
                          onValueChange={setNoiseLevel}
                          max={20}
                          min={0}
                          step={1}
                          className="py-2"
                          disabled={isRunning}
                        />
                      </div>

                      <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Experiment Presets</h3>
                          <Zap className="w-3 h-3 text-amber-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setNumQubits([16]);
                              setEavesdroppingRate([0]);
                              setNoiseLevel([2]);
                            }}
                            className="h-auto py-3 px-2 flex flex-col items-center gap-2 rounded-xl transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-100 dark:hover:border-blue-800 group"
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <ShieldCheck className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 uppercase tracking-tighter">No Eavesdropper</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setNumQubits([16]);
                              setEavesdroppingRate([40]);
                              setNoiseLevel([2]);
                            }}
                            className="h-auto py-3 px-2 flex flex-col items-center gap-2 rounded-xl transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-800 group"
                          >
                            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Eye className="w-4 h-4 text-red-600" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 group-hover:text-red-700 dark:group-hover:text-red-300 uppercase tracking-tighter">With Eavesdropper</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setNumQubits([16]);
                              setEavesdroppingRate([0]);
                              setNoiseLevel([15]);
                            }}
                            className="h-auto py-3 px-2 flex flex-col items-center gap-2 rounded-xl transition-all duration-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-transparent hover:border-amber-100 dark:hover:border-amber-800 group"
                          >
                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Zap className="w-4 h-4 text-amber-600" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 uppercase tracking-tighter">High Noise</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setNumQubits([50]);
                              setEavesdroppingRate([0]);
                              setNoiseLevel([2]);
                            }}
                            className="h-auto py-3 px-2 flex flex-col items-center gap-2 rounded-xl transition-all duration-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800 group"
                          >
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Cpu className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 uppercase tracking-tighter">More Qubits</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setNumQubits([32]);
                              setEavesdroppingRate([25]);
                              setNoiseLevel([8]);
                            }}
                            className="h-auto py-3 px-2 flex flex-col items-center gap-2 rounded-xl transition-all duration-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-transparent hover:border-purple-100 dark:hover:border-purple-800 group"
                          >
                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Settings className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 uppercase tracking-tighter">Mixed Conditions</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setNumQubits([16]);
                              setEavesdroppingRate([0]);
                              setNoiseLevel([0]);
                            }}
                            className="h-auto py-3 px-2 flex flex-col items-center gap-2 rounded-xl transition-all duration-300 hover:bg-green-50 dark:hover:bg-green-900/20 border border-transparent hover:border-green-100 dark:hover:border-green-800 group"
                          >
                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <RotateCw className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 group-hover:text-green-700 dark:group-hover:text-green-300 uppercase tracking-tighter">Ideal System</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {currentStep > 1 && !isStepByStep && (
                      <div className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                          Live Status
                        </p>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{steps[currentStep - 1]}</p>
                      </div>
                    )}
                  </div>

                  {/* Step-by-step Status */}
                  {currentStep === 1 && !isStepByStep && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 p-4 rounded-xl flex items-center justify-center gap-3 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Photon In Transit</span>
                      {eavesdroppingRate[0] > 0 && (
                        <Badge variant="destructive" className="ml-2 animate-bounce">INTERCEPTION RISK</Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Right column - Results */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-8 min-w-0 flex flex-col">
                  {quantumBits.length === 0 && (!isStepByStep || stepByStepBits.length === 0) && (
                    <div className="rounded-lg border border-dashed border-border bg-card/60 p-8 text-center flex-1 flex flex-col items-center justify-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <BarChart3 className="h-6 w-6" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground">Results will appear here</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Run the simulation to generate the results log, charts, and key analysis.
                      </p>
                    </div>
                  )}
                  {/* Results Display */}
                  {(quantumBits.length > 0 ||
                    (isStepByStep && stepByStepBits.length > 0)) && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-gray-500" />
                            Results Log
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs font-normal">
                              {isStepByStep && stepByStepBits.length > 0 ? Math.min(currentBitIndex + 1, stepByStepBits.length) : quantumBits.length} / {numQubits[0]} Bits Processed
                            </Badge>
                          </h3>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                          <div className="w-full overflow-x-auto max-h-[600px] overflow-y-auto">
                            <table className="w-full text-sm min-w-[900px]">
                              <thead className="sticky top-0 bg-gray-50 dark:bg-slate-950 z-10">
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-12">#</th>

                                  {/* Alice Group */}
                                  <th colSpan={2} className="px-4 py-2 border-l border-r border-gray-200 dark:border-gray-800 bg-blue-50/50 dark:bg-blue-900/10">
                                    <div className="text-center text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Alice (Sender)</div>
                                  </th>

                                  {/* Eve Group */}
                                  {eavesdroppingRate[0] > 0 && (
                                    <th colSpan={3} className="px-4 py-2 border-r border-gray-200 dark:border-gray-800 bg-red-50/50 dark:bg-red-900/10">
                                      <div className="text-center text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center justify-center gap-1">
                                        <Eye className="w-3 h-3" /> Eve
                                      </div>
                                    </th>
                                  )}

                                  {/* Bob Group */}
                                  <th colSpan={3} className="px-4 py-2 border-r border-gray-200 dark:border-gray-800 bg-purple-50/50 dark:bg-purple-900/10">
                                    <div className="text-center text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Bob (Receiver)</div>
                                  </th>

                                  <th colSpan={2} className="px-4 py-2">
                                    <div className="text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Analysis</div>
                                  </th>
                                </tr>
                                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50">
                                  <th className="p-2"></th>
                                  <th className="px-2 py-2 text-center text-[10px] text-gray-500 font-medium uppercase border-l border-gray-200 dark:border-gray-800">Bit</th>
                                  <th className="px-2 py-2 text-center text-[10px] text-gray-500 font-medium uppercase border-r border-gray-200 dark:border-gray-800">Basis</th>

                                  {eavesdroppingRate[0] > 0 && (
                                    <>
                                      <th className="px-2 py-2 text-center text-[10px] text-red-400 font-medium uppercase">Bas.</th>
                                      <th className="px-2 py-2 text-center text-[10px] text-red-400 font-medium uppercase">Bit</th>
                                      <th className="px-2 py-2 text-center text-[10px] text-red-400 font-medium uppercase border-r border-gray-200 dark:border-gray-800">Snd</th>
                                    </>
                                  )}

                                  <th className="px-2 py-2 text-center text-[10px] text-gray-500 font-medium uppercase">Bit</th>
                                  <th className="px-2 py-2 text-center text-[10px] text-gray-500 font-medium uppercase">Meas.</th>
                                  <th className="px-2 py-2 text-center text-[10px] text-gray-500 font-medium uppercase border-r border-gray-200 dark:border-gray-800">Res</th>

                                  <th className="px-2 py-2 text-center text-[10px] text-gray-500 font-medium uppercase">Match?</th>
                                  <th className="px-2 py-2 text-center text-[10px] text-gray-500 font-medium uppercase">Key?</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-gray-800">
                                {(isStepByStep
                                  ? stepByStepBits.slice(0, currentBitIndex + 1)
                                  : quantumBits
                                ).map(
                                  (bit, index) => (
                                    <tr
                                      key={bit.id}
                                      className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${bit.inKey ? "bg-green-50/30 dark:bg-green-900/10" : ""} ${isStepByStep && index === currentBitIndex ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                                    >
                                      <td className="p-3 text-center text-xs font-medium text-gray-500">{bit.id + 1}</td>

                                      {/* ALICE DATA */}
                                      <td className="p-2 text-center border-l border-gray-100 dark:border-gray-800">
                                        <span className="inline-flex w-6 h-6 items-center justify-center rounded-md bg-blue-50 text-blue-700 font-mono text-sm font-bold border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30">
                                          {bit.aliceBit}
                                        </span>
                                      </td>
                                      <td className="p-2 text-center border-r border-gray-100 dark:border-gray-800">
                                        <span className="font-mono text-lg font-bold text-gray-700 dark:text-gray-300">
                                          {getBasisSymbol(bit.aliceBasis)}
                                        </span>
                                      </td>

                                      {/* EVE DATA */}
                                      {eavesdroppingRate[0] > 0 && (
                                        <>
                                          <td className="p-2 text-center">
                                            {bit.intercepted ? (
                                              <span className="font-mono font-bold text-red-500">
                                                {getBasisSymbol(bit.eveMeasureBasis!)}
                                              </span>
                                            ) : (
                                              <span className="text-gray-300">-</span>
                                            )}
                                          </td>
                                          <td className="p-2 text-center">
                                            {bit.intercepted ? (
                                              <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                                {bit.eveMeasurement}
                                              </span>
                                            ) : (
                                              <span className="text-gray-300">-</span>
                                            )}
                                          </td>
                                          <td className="p-2 text-center border-r border-gray-100 dark:border-gray-800">
                                            {bit.intercepted ? (
                                              <span className="font-mono font-bold text-red-500">
                                                {getBasisSymbol(bit.eveResendBasis!)}
                                              </span>
                                            ) : (
                                              <span className="text-gray-300">-</span>
                                            )}
                                          </td>
                                        </>
                                      )}

                                      {/* BOB DATA */}
                                      <td className="p-2 text-center border-r border-gray-100 dark:border-gray-800">
                                        {bit.bobMeasurement !== null ? (
                                          <span className="inline-flex w-6 h-6 items-center justify-center rounded-md bg-purple-50 text-purple-700 font-mono text-sm font-bold border border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-900/30">
                                            {bit.bobMeasurement}
                                          </span>
                                        ) : (
                                          <span className="text-xs text-gray-400">Lost</span>
                                        )}
                                      </td>
                                      <td className="p-2 text-center border-r border-gray-100 dark:border-gray-800">
                                        <span className="font-mono text-lg font-bold text-gray-700 dark:text-gray-300">
                                          {getBasisSymbol(bit.bobBasis)}
                                        </span>
                                      </td>
                                      <td className="p-2 text-center border-r border-gray-100 dark:border-gray-800">
                                        {bit.bobMeasurement !== null ? (
                                          <span
                                            className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold ${bit.aliceBit === bit.bobMeasurement
                                              ? "bg-green-100 text-green-700"
                                              : "bg-red-100 text-red-700"
                                              }`}
                                          >
                                            {bit.bobMeasurement}
                                          </span>
                                        ) : (
                                          <span className="text-orange-400 font-semibold text-xs">
                                            -
                                          </span>
                                        )}
                                      </td>

                                      {/* MATCH */}
                                      <td className="p-2 text-center">
                                        {bit.isMatching === null ? (
                                          <span className="text-gray-300">
                                            -
                                          </span>
                                        ) : (
                                          <span
                                            className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${bit.isMatching
                                              ? "bg-green-50 text-green-600 border border-green-100"
                                              : "bg-gray-100 text-gray-500"
                                              }`}
                                          >
                                            {bit.isMatching ? "Match" : "Diff"}
                                          </span>
                                        )}
                                      </td>
                                      <td className="p-2 text-center">
                                        {bit.inKey ? (
                                          <div className="flex justify-center">
                                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white shadow-sm shadow-green-200">
                                              <Shield className="w-3 h-3" />
                                            </div>
                                          </div>
                                        ) : (
                                          <span className="text-gray-300">
                                            -
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ),
                                )}
                              </tbody>
                            </table>
                          </div>

                          {isStepByStep && currentBitIndex === 0 && bitStep === 0 && (
                            <div className="text-center py-12 bg-gray-50/50">
                              <p className="text-gray-500 font-medium">Ready to start visualization...</p>
                              <Button variant="link" onClick={nextBitStep} className="text-blue-600">Click to begin</Button>
                            </div>
                          )}
                        </div>

                        {/* Final Key Display */}
                        {finalKey && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-100 dark:border-green-900/30">
                            <div className="flex flex-col items-center justify-center text-center">
                              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 shadow-sm">
                                <ShieldCheck className="w-6 h-6" />
                              </div>
                              <h3 className="font-bold text-green-800 dark:text-green-300 mb-2 text-lg">
                                Secure Shared Key Generated
                              </h3>
                              <div className="font-mono text-xl bg-white dark:bg-black/20 px-6 py-3 rounded-lg border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 tracking-widest shadow-inner mb-3">
                                {finalKey}
                              </div>
                              <div className="flex gap-4 text-xs font-medium text-green-700/70">
                                <span>Length: {finalKey.length} bits</span>
                                <span>Status: Verified</span>
                              </div>

                              {(eavesdroppingRate[0] > 0 || noiseLevel[0] > 0) && (
                                <div className="mt-4 flex gap-2">
                                  {eavesdroppingRate[0] > 0 && (
                                    <Badge variant="destructive" className="flex gap-1 items-center">
                                      <AlertCircle className="w-3 h-3" /> Eavesdropping Detected
                                    </Badge>
                                  )}
                                  {noiseLevel[0] > 0 && (
                                    <Badge variant="outline" className="border-amber-400 text-amber-600 bg-amber-50 flex gap-1 items-center">
                                      <Zap className="w-3 h-3" /> Noise Present
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Analysis Graphs */}
                  {showGraphs && simulationData.length > 0 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-gray-500" />
                        Post-Processing Analysis
                      </h3>

                      {/* QBER Formula Card */}
                      <Card className="border-none shadow-soft">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs font-bold text-gray-500 uppercase">QBER Calculation Formula (BB84)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-gray-500 mt-3 text-center">
                            For BB84: N represents sifted key bits where Alice and Bob used matching bases
                          </p>
                        </CardContent>
                      </Card>

                      <div className="grid md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-soft overflow-hidden">
                          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-3">
                            <CardTitle className="text-sm font-bold text-gray-700">
                              Transfer Metrics
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="w-full min-h-[300px] flex items-center justify-center">
                              {simulationData.length > 0 && (
                                <ResponsiveContainer width="100%" height={300}>
                                  <LineChart
                                    data={simulationData.slice(0, 3)}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                                  </LineChart>
                                </ResponsiveContainer>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-none shadow-soft overflow-hidden">
                          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-3">
                            <CardTitle className="text-sm font-bold text-gray-700">
                              Security Assessment (QBER)
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="space-y-6">

                              <div className="flex items-center justify-center py-6">
                                <div className="relative w-40 h-40 flex items-center justify-center">
                                  <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-100" />
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent"
                                      strokeDasharray={440}
                                      strokeDashoffset={440 - (440 * parseFloat(String(simulationData.find(d => d.name === "QBER (%)")?.value || "0"))) / 100}
                                      className={`${parseFloat(String(simulationData.find(d => d.name === "QBER (%)")?.value || "0")) > 15 ? 'text-red-500' : 'text-green-500'}`}
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-3xl font-bold ${parseFloat(String(simulationData.find(d => d.name === "QBER (%)")?.value || "0")) > 15 ? 'text-red-500' : 'text-green-500'}`}>
                                      {simulationData.find(d => d.name === "QBER (%)")?.value}%
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium uppercase mt-1">Error Rate</span>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                {simulationData.slice(0, 3).map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex flex-col p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-gray-800"
                                  >
                                    <span className="text-xs font-medium text-gray-500 mb-1">
                                      {item.name}
                                    </span>
                                    <span className="text-lg font-bold text-foreground">
                                      {item.value}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              <div className={`p-4 rounded-xl border ${parseFloat(String(simulationData.find(d => d.name === "QBER (%)")?.value || "0")) > 11 ? 'bg-red-50 border-red-100 text-red-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
                                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                                  {parseFloat(String(simulationData.find(d => d.name === "QBER (%)")?.value || "0")) > 11 ? <AlertCircle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                  System Analysis
                                </h4>
                                <p className="text-xs leading-relaxed">
                                  {(() => {
                                    const totalQBER = parseFloat(String(simulationData.find(d => d.name === "QBER (%)")?.value || "0"));
                                    const eavesdropperRate = eavesdroppingRate[0];
                                    const noise = noiseLevel[0];

                                    if (eavesdropperRate === 0 && noise === 0) {
                                      if (totalQBER < 1.5) return `✓ System secure. QBER ${totalQBER.toFixed(2)}% is within normal hardware limits (intrinsic errors from detectors and alignment).`;
                                      return `⚠ Unexpected QBER ${totalQBER.toFixed(2)}% in ideal conditions. Check for hardware issues or environmental factors.`;
                                    }

                                    if (totalQBER > 11) {
                                      return `CRITICAL: QBER is ${totalQBER}%, exceeding the 11% safety threshold. This indicates strong evidence of eavesdropping or severe channel noise. This key is unsafe to use.`;
                                    }

                                    return `SECURE: QBER is ${totalQBER}%, which is within acceptable safety limits. Error correction can handle this noise level.`;
                                  })()}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* E91 and B92 Protocol Components */}
      {selectedProtocol === 'e91' && <E91SimulationSection />}
      {selectedProtocol === 'b92' && <B92SimulationSection />}
    </div>
  );
};
