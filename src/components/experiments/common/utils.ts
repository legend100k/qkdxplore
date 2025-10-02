import { QuantumBit } from "./types";

export const simulateBB84 = (qubits: number, eavesdropping: number, noise: number) => {
  let matchingBases = 0;
  let errors = 0;
  let keyBits = 0;
  const simulationBits: QuantumBit[] = [];

  for (let i = 0; i < qubits; i++) {
    const aliceBasis = Math.random() > 0.5;
    const aliceBit = Math.random() > 0.5 ? 1 : 0;
    const isEavesdropped = Math.random() < eavesdropping / 100;

    // If eavesdropped, Eve measures with her random basis
    let evesMeasurement: number | null = null;
    let evesBasis: boolean | null = null;
    if (isEavesdropped) {
      evesBasis = Math.random() > 0.5; // Eve's random basis selection
      // Eve measures the qubit in her basis
      evesMeasurement = aliceBit; // Initially same as Alice's bit
      // If Eve's basis doesn't match Alice's, she has a 50% chance of getting the wrong result
      if (evesBasis !== aliceBasis) {
        evesMeasurement = Math.random() > 0.5 ? 1 - aliceBit : aliceBit;
      }
    }

    // Bob receives the possibly tampered qubit
    let bobResult = isEavesdropped ? (evesMeasurement !== null ? evesMeasurement : aliceBit) : aliceBit;

    // Bob measures in his basis
    const bobBasis = Math.random() > 0.5;
    // If Bob's basis doesn't match Alice's (original) basis, we have a measurement issue
    // In a real quantum system, only the basis matching matters, so we'll keep the bit value
    // but account for potential measurement differences if Eve interfered

    let hasError = false;

    // Apply noise
    if (Math.random() < noise / 100) {
      bobResult = 1 - bobResult;
      hasError = true;
    }

    const basisMatch = aliceBasis === bobBasis;
    const kept = basisMatch;

    if (basisMatch) {
      matchingBases++;
      keyBits++;
      if (bobResult !== aliceBit && !hasError) {
        errors++;
      }
    }

    simulationBits.push({
      id: i,
      aliceBit,
      aliceBasis: aliceBasis ? "Diagonal" : "Rectilinear",
      bobBasis: bobBasis ? "Diagonal" : "Rectilinear", 
      bobMeasurement: bobResult,
      match: basisMatch,
      kept: kept && bobResult === aliceBit,
      eavesdropped: isEavesdropped
    });
  }

  return {
    errorRate: matchingBases > 0 ? (errors / matchingBases) * 100 : 0,
    keyRate: (keyBits / qubits) * 100,
    keyLength: keyBits,
    basisMatchRate: (matchingBases / qubits) * 100
  };
};

export const generateAnalysis = (experimentId: string, data: Record<string, unknown>[]) => {
  switch (experimentId) {
    case "effect-of-qubits": {
      const maxQubits = Math.max(...data.map(d => Number(d.qubits)));
      const keyAtMax = data.find(d => Number(d.qubits) === maxQubits)?.keyLength || 0;
      const experimentText = `Experiment 1: Effect of Qubits
Aim: To study the fundamental role of qubits and their quantum properties in the BB84 protocol.
Objective: To understand how the principles of superposition, measurement disturbance, and the no-cloning theorem provide the security foundation for Quantum Key Distribution (QKD).
Apparatus: Q-Xplore Virtual Lab (Web-based interface powered by Qiskit)
Theory:
The BB84 protocol leverages the unique properties of quantum bits, or qubits, which is the fundamental unit of quantum information. Unlike a classical bit, which is definitively 0 or 1, a qubit can exist in a superposition of both states simultaneously, represented as |ψ⟩ = α|0⟩ + β|1⟩, where α and β are complex probability amplitudes (|α|² + |β|² = 1).
In BB84, information is encoded onto qubits using two non-orthogonal bases:
The Rectilinear Basis (+): |0⟩₊ = |→⟩ (Horizontal polarization), |1⟩₊ = |↑⟩ (Vertical polarization)
The Diagonal Basis (×): |0⟩ₓ = |↗⟩ = (|→⟩ + |↑⟩)/√2 (45° polarization), |1⟩ₓ = |↖⟩ = (|→⟩ - |↑⟩)/√2 (135° polarization)
The protocol's security is not mathematical but physical, relying on three core principles:
Measurement Disturbance: Measuring a quantum system irrevocably collapses its state. If Bob measures a qubit in a basis different from the one Alice used to prepare it, the result is random (50% chance of |0⟩ or |1⟩), and the original information is lost.
No-Cloning Theorem: It is impossible to create an identical copy (clone) of an arbitrary unknown quantum state. An evesdropper, Eve, cannot perfectly intercept, copy, and resend a qubit without altering the original.
Heisenberg Uncertainty Principle: Certain pairs of physical properties (like polarization in different bases) cannot be simultaneously known with perfect accuracy. This makes it impossible to measure a quantum state in multiple ways without introducing errors.
These properties ensure that any attempt to gain information about the key introduces detectable anomalies.
Procedure:
Go to the Q-Xplore Virtual Lab simulator.
Run the BB84 simulation without any evesdropper and with low channel noise.
Note the QBER and the successful generation of a secure key.
Take a screenshot of the results screen showing the low QBER.

Qubit scaling demonstrates improved statistical security. With ${maxQubits} qubits, ${keyAtMax} key bits generated. Higher qubit counts provide better eavesdropping detection confidence.`;
      return experimentText;
    }
    
    case "effect-of-channel-noise": {
      const maxNoise = Math.max(...data.map(d => Number(d.noise)));
      const errorAtMaxNoise = data.find(d => Number(d.noise) === maxNoise)?.errorRate || 0;
      return `Channel noise significantly affects BB84 performance. At ${maxNoise}% noise, error rate reaches ${errorAtMaxNoise.toFixed(1)}%. The linear relationship demonstrates quantum channel sensitivity.`;
    }
    
    case "without-eavesdropper": {
      const errorRate = data[0]?.errorRate || 0;
      return `Baseline experiment without eavesdropping shows ${errorRate.toFixed(2)}% error rate. This establishes a baseline for protocol performance with minimal errors due to quantum channel imperfections.`;
    }
    
    case "with-eavesdropper": {
      const maxEaves = Math.max(...data.map(d => Number(d.eavesdropping)));
      const detectionAtMax = data.find(d => Number(d.eavesdropping) === maxEaves)?.detectionProbability || 0;
      return `Eavesdropping detection shows clear correlation with error rates. At ${maxEaves}% interception, detection probability reaches ${detectionAtMax.toFixed(1)}%, demonstrating quantum security principles. The BB84 protocol successfully detects eavesdropping attempts by monitoring error rates.`;
    }
    
    case "effect-of-distance": {
      const maxDistance = Math.max(...data.map(d => Number(d.distance)));
      const lossAtMax = data.find(d => Number(d.distance) === maxDistance)?.photonLoss || 0;
      return `Distance significantly impacts quantum key distribution. At ${maxDistance}km, photon loss reaches ${lossAtMax.toFixed(1)}% due to fiber optic attenuation. This demonstrates the practical limitations of terrestrial QKD systems.`;
    }
    
    case "overall": {
      const avgError = data.reduce((sum, d) => sum + Number(d.errorRate), 0) / data.length;
      return `Comprehensive analysis combining all factors shows average error rate of ${avgError.toFixed(1)}%. This experiment demonstrates how multiple parameters (distance, noise, eavesdropping) interact to affect the BB84 protocol performance in real-world conditions.`;
    }
    
    default:
      return "Experiment completed successfully. Data shows expected quantum behavior patterns.";
  }
};

export const getXAxisLabel = (experimentId: string) => {
  switch (experimentId) {
    case "effect-of-qubits":
      return "Number of Qubits";
    case "effect-of-channel-noise":
      return "Noise Level (%)";
    case "without-eavesdropper":
      return "Run";
    case "with-eavesdropper":
      return "Eavesdropping Rate (%)";
    case "effect-of-distance":
      return "Distance (km)";
    case "overall":
      return "Iteration";
    default:
      return "X-Axis";
  }
};