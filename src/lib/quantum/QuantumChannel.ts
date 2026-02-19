/**
 * Quantum Channel Models
 * 
 * Implements realistic noise channels using Kraus operator formalism.
 * These channels model physical processes in optical fiber transmission.
 * 
 * A quantum channel is a completely positive trace-preserving (CPTP) map:
 * ε(ρ) = Σᵢ Kᵢ ρ Kᵢ†
 * where Σᵢ Kᵢ†Kᵢ = I (completeness relation)
 */

import { Complex } from './Complex';
import { DensityMatrix, applyUnitary } from './QuantumState';

/**
 * Channel parameters for realistic fiber simulation
 */
export interface ChannelParameters {
  fiberLength: number;        // km
  wavelength: number;         // nm (typically 1550 for telecom)
  attenuationCoeff: number;   // dB/km (0.2 for standard fiber at 1550nm)
  temperature: number;        // Kelvin (affects thermal noise)
  detectorEfficiency: number; // 0-1
  darkCountRate: number;      // counts per second
  timingWindow: number;       // detection window in nanoseconds
}

/**
 * Default parameters for standard telecom fiber
 */
export const DEFAULT_CHANNEL_PARAMS: ChannelParameters = {
  fiberLength: 10,
  wavelength: 1550,
  attenuationCoeff: 0.20,
  temperature: 300,
  detectorEfficiency: 0.8,
  darkCountRate: 100,
  timingWindow: 1.0,
};

/**
 * Attenuation Channel (Photon Loss)
 * 
 * Models fiber attenuation using Beer-Lambert law.
 * This is NOT a standard quantum channel - it requires extending the Hilbert space.
 * We model it as an amplitude damping channel with parameter η.
 * 
 * Transmission probability: η = 10^(-αL/10)
 * where α is attenuation coefficient and L is length
 */
export function attenuationChannel(
  rho: DensityMatrix,
  params: ChannelParameters
): { transmitted: DensityMatrix | null; lossProbability: number } {
  // Calculate transmission probability from Beer-Lambert law
  const loss = params.attenuationCoeff * params.fiberLength; // dB
  const transmissionProb = Math.pow(10, -loss / 10);
  
  // Sample whether photon is lost
  if (Math.random() > transmissionProb) {
    return { transmitted: null, lossProbability: 1 - transmissionProb };
  }
  
  // If transmitted, apply amplitude damping
  const dampingProb = 1 - transmissionProb;
  const dampedState = amplitudeDampingChannel(rho, dampingProb);
  
  return { transmitted: dampedState, lossProbability: 1 - transmissionProb };
}

/**
 * Amplitude Damping Channel
 * 
 * Models energy dissipation (T₁ relaxation).
 * Kraus operators:
 * K₀ = |0⟩⟨0| + √(1-γ)|1⟩⟨1|
 * K₁ = √γ|0⟩⟨1|
 * 
 * γ = damping probability
 */
export function amplitudeDampingChannel(rho: DensityMatrix, gamma: number): DensityMatrix {
  // Kraus operators
  const K0: Complex[][] = [
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(Math.sqrt(1 - gamma), 0)]
  ];
  
  const K1: Complex[][] = [
    [new Complex(0, 0), new Complex(Math.sqrt(gamma), 0)],
    [new Complex(0, 0), new Complex(0, 0)]
  ];
  
  // Apply channel: ε(ρ) = K₀ρK₀† + K₁ρK₁†
  const rho0 = applyUnitary(rho, K0);
  const rho1 = applyUnitary(rho, K1);
  
  // Sum the results (need to properly combine density matrices)
  return addDensityMatricesWithNormalization(rho0, rho1, 1, 1);
}

/**
 * Depolarizing Channel
 * 
 * Models random Pauli errors from environmental interactions.
 * With probability p, the state is replaced by maximally mixed state.
 * 
 * Kraus operators:
 * K₀ = √(1-p)·I
 * K₁ = √(p/3)·X
 * K₂ = √(p/3)·Y
 * K₃ = √(p/3)·Z
 */
export function depolarizingChannel(rho: DensityMatrix, p: number): DensityMatrix {
  // Kraus operators
  const sqrtPOver3 = Math.sqrt(p / 3);
  
  const K0: Complex[][] = [
    [new Complex(Math.sqrt(1 - p), 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(Math.sqrt(1 - p), 0)]
  ];
  
  const K1: Complex[][] = [
    [new Complex(0, 0), new Complex(sqrtPOver3, 0)],
    [new Complex(sqrtPOver3, 0), new Complex(0, 0)]
  ];
  
  const K2: Complex[][] = [
    [new Complex(0, 0), new Complex(0, -sqrtPOver3)],
    [new Complex(0, sqrtPOver3), new Complex(0, 0)]
  ];
  
  const K3: Complex[][] = [
    [new Complex(sqrtPOver3, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(-sqrtPOver3, 0)]
  ];
  
  // Apply each Kraus operator
  const results = [K0, K1, K2, K3].map(K => applyUnitary(rho, K));
  
  // Sum results
  let sum = results[0];
  for (let i = 1; i < results.length; i++) {
    sum = addDensityMatricesWithNormalization(sum, results[i], 1, 1);
  }
  
  return sum;
}

/**
 * Phase Damping (Dephasing) Channel
 * 
 * Models loss of quantum coherence without energy dissipation (T₂ relaxation).
 * Destroys off-diagonal elements in computational basis.
 * 
 * Kraus operators:
 * K₀ = √(1-λ)·I
 * K₁ = √λ·|0⟩⟨0|
 * K₂ = √λ·|1⟩⟨1|
 */
export function phaseDampingChannel(rho: DensityMatrix, lambda: number): DensityMatrix {
  // Kraus operators
  const sqrtLambda = Math.sqrt(lambda);
  
  const K0: Complex[][] = [
    [new Complex(Math.sqrt(1 - lambda), 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(Math.sqrt(1 - lambda), 0)]
  ];
  
  const K1: Complex[][] = [
    [new Complex(sqrtLambda, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(0, 0)]
  ];
  
  const K2: Complex[][] = [
    [new Complex(0, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(sqrtLambda, 0)]
  ];
  
  // Apply each Kraus operator
  const results = [K0, K1, K2].map(K => applyUnitary(rho, K));
  
  // Sum results
  let sum = results[0];
  for (let i = 1; i < results.length; i++) {
    sum = addDensityMatricesWithNormalization(sum, results[i], 1, 1);
  }
  
  return sum;
}

/**
 * Bit Flip Channel
 * 
 * Models bit flip errors (X gate applied with probability p).
 */
export function bitFlipChannel(rho: DensityMatrix, p: number): DensityMatrix {
  const K0: Complex[][] = [
    [new Complex(Math.sqrt(1 - p), 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(Math.sqrt(1 - p), 0)]
  ];
  
  const K1: Complex[][] = [
    [new Complex(0, 0), new Complex(Math.sqrt(p), 0)],
    [new Complex(Math.sqrt(p), 0), new Complex(0, 0)]
  ];
  
  const rho0 = applyUnitary(rho, K0);
  const rho1 = applyUnitary(rho, K1);
  
  return addDensityMatricesWithNormalization(rho0, rho1, 1, 1);
}

/**
 * Phase Flip Channel
 * 
 * Models phase flip errors (Z gate applied with probability p).
 */
export function phaseFlipChannel(rho: DensityMatrix, p: number): DensityMatrix {
  const K0: Complex[][] = [
    [new Complex(Math.sqrt(1 - p), 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(Math.sqrt(1 - p), 0)]
  ];
  
  const K1: Complex[][] = [
    [new Complex(Math.sqrt(p), 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(-Math.sqrt(p), 0)]
  ];
  
  const rho0 = applyUnitary(rho, K0);
  const rho1 = applyUnitary(rho, K1);
  
  return addDensityMatricesWithNormalization(rho0, rho1, 1, 1);
}

/**
 * Bit-Phase Flip Channel
 * 
 * Models Y gate errors with probability p.
 */
export function bitPhaseFlipChannel(rho: DensityMatrix, p: number): DensityMatrix {
  const K0: Complex[][] = [
    [new Complex(Math.sqrt(1 - p), 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(Math.sqrt(1 - p), 0)]
  ];
  
  const K1: Complex[][] = [
    [new Complex(0, 0), new Complex(-Math.sqrt(p), 0)],
    [new Complex(Math.sqrt(p), 0), new Complex(0, 0)]
  ];
  
  const rho0 = applyUnitary(rho, K0);
  const rho1 = applyUnitary(rho, K1);
  
  return addDensityMatricesWithNormalization(rho0, rho1, 1, 1);
}

/**
 * Combined Optical Fiber Channel
 * 
 * Applies all relevant noise mechanisms in sequence:
 * 1. Attenuation (photon loss)
 * 2. Depolarization (scattering, birefringence)
 * 3. Phase damping (decoherence)
 * 4. PMD effects
 * 
 * Order matters physically!
 */
export function opticalFiberChannel(
  rho: DensityMatrix,
  params: ChannelParameters
): { 
  state: DensityMatrix | null;
  lossProbability: number;
  qber: number;
} {
  // Step 1: Attenuation
  const attenuationResult = attenuationChannel(rho, params);
  if (!attenuationResult.transmitted) {
    return {
      state: null,
      lossProbability: attenuationResult.lossProbability,
      qber: 0
    };
  }
  
  let currentState = attenuationResult.transmitted;
  
  // Step 2: Depolarization (depends on fiber length and quality)
  const depolarizationProb = calculateDepolarizationRate(params);
  currentState = depolarizingChannel(currentState, depolarizationProb);
  
  // Step 3: Phase damping
  const phaseDampingProb = calculatePhaseDampingRate(params);
  currentState = phaseDampingChannel(currentState, phaseDampingProb);
  
  // Step 4: PMD effects (polarization mode dispersion)
  const pmdProb = calculatePMDErrorRate(params);
  currentState = bitFlipChannel(currentState, pmdProb);
  
  // Calculate QBER from the final state
  const qber = calculateQBERFromState(currentState);
  
  return {
    state: currentState,
    lossProbability: attenuationResult.lossProbability,
    qber
  };
}

/**
 * Calculate depolarization rate from fiber parameters
 * Empirical model based on fiber quality
 */
function calculateDepolarizationRate(params: ChannelParameters): number {
  // Base depolarization + length-dependent term
  const baseRate = 0.001; // per km
  const lengthDependentRate = 0.0005 * params.fiberLength;
  return Math.min(baseRate + lengthDependentRate, 0.1);
}

/**
 * Calculate phase damping rate
 * Related to coherence time T₂
 */
function calculatePhaseDampingRate(params: ChannelParameters): number {
  // Phase damping increases with temperature and length
  const thermalFactor = 1 + (params.temperature - 300) / 300;
  const baseRate = 0.002;
  return Math.min(baseRate * params.fiberLength * thermalFactor, 0.15);
}

/**
 * Calculate PMD error rate
 * PMD causes polarization rotation
 */
function calculatePMDErrorRate(params: ChannelParameters): number {
  // PMD scales with √L
  const pmdCoefficient = 0.1; // ps/√km (typical for SMF)
  const pmdEffect = pmdCoefficient * Math.sqrt(params.fiberLength);
  return Math.min(pmdEffect / 100, 0.05);
}

/**
 * Calculate QBER from density matrix
 * QBER = probability of measuring wrong bit
 */
function calculateQBERFromState(rho: DensityMatrix): number {
  // For a state that should be |0⟩, QBER = ⟨1|ρ|1⟩ = ρ₁₁
  // For a state that should be |1⟩, QBER = ⟨0|ρ|0⟩ = ρ₀₀
  // We take the average for a general estimate
  
  // This is a simplified estimate - actual QBER depends on the prepared state
  const errorProb0 = rho.rho11.real; // Error if prepared |0⟩
  const errorProb1 = rho.rho00.real; // Error if prepared |1⟩
  
  return (errorProb0 + errorProb1) / 2;
}

/**
 * Helper function to add density matrices
 */
function addDensityMatricesWithNormalization(
  a: DensityMatrix,
  b: DensityMatrix,
  weightA: number,
  weightB: number
): DensityMatrix {
  return {
    rho00: a.rho00.mulScalar(weightA).add(b.rho00.mulScalar(weightB)),
    rho01: a.rho01.mulScalar(weightA).add(b.rho01.mulScalar(weightB)),
    rho10: a.rho10.mulScalar(weightA).add(b.rho10.mulScalar(weightB)),
    rho11: a.rho11.mulScalar(weightA).add(b.rho11.mulScalar(weightB)),
  };
}

/**
 * Detector Model with Dark Counts
 * 
 * Models realistic single-photon avalanche diodes (SPADs)
 */
export function detectorWithDarkCounts(
  transmittedState: DensityMatrix | null,
  params: ChannelParameters,
  basisAngle: number
): { detected: boolean; outcome: 0 | 1; darkCount: boolean } {
  // Dark count probability in timing window
  const darkCountProb = params.darkCountRate * params.timingWindow * 1e-9;
  
  // Check for dark count
  const hasDarkCount = Math.random() < darkCountProb;
  
  // If no photon transmitted, only dark counts can trigger detection
  if (!transmittedState) {
    if (hasDarkCount) {
      // Dark count gives random outcome
      return {
        detected: true,
        outcome: Math.random() > 0.5 ? 0 : 1,
        darkCount: true
      };
    }
    return { detected: false, outcome: 0, darkCount: false };
  }
  
  // Apply detector efficiency
  const efficiencyLoss = Math.random() > params.detectorEfficiency;
  
  if (efficiencyLoss && !hasDarkCount) {
    return { detected: false, outcome: 0, darkCount: false };
  }
  
  // Measure the state
  const measurement = measureInBasisWithDarkCount(
    transmittedState,
    basisAngle,
    hasDarkCount
  );
  
  return {
    detected: measurement.detected,
    outcome: measurement.outcome,
    darkCount: hasDarkCount
  };
}

/**
 * Measurement in arbitrary basis with dark count handling
 */
function measureInBasisWithDarkCount(
  rho: DensityMatrix,
  basisAngle: number,
  hasDarkCount: boolean
): { detected: boolean; outcome: 0 | 1 } {
  if (hasDarkCount) {
    // Dark count gives random outcome
    return {
      detected: true,
      outcome: Math.random() > 0.5 ? 0 : 1
    };
  }
  
  // Standard quantum measurement
  const halfAngle = basisAngle / 2;
  const cosHalf = Math.cos(halfAngle);
  const sinHalf = Math.sin(halfAngle);
  
  // Probability of measuring 0 in rotated basis
  const prob0 = rho.rho00.real * cosHalf * cosHalf +
                rho.rho11.real * sinHalf * sinHalf +
                2 * rho.rho01.real * cosHalf * sinHalf;
  
  const outcome = Math.random() < prob0 ? 0 : 1;
  
  return { detected: true, outcome };
}
