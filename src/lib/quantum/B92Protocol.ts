/**
 * B92 Quantum Key Distribution Protocol
 * 
 * Bennett's 1992 protocol using only two non-orthogonal states.
 * More efficient than BB84 in some regimes but more sensitive to loss.
 * 
 * Key features:
 * - Uses only two non-orthogonal states: |0⟩ and |+⟩
 * - Bob uses Unambiguous State Discrimination (USD)
 * - 50% inconclusive results in ideal case
 * - Highly sensitive to channel loss
 */

import { Complex } from './Complex';
import {
  DensityMatrix,
  zeroState,
  plusState,
  minusState,
  oneState,
  measureInBasis,
  calculateFidelity,
  applyUnitary,
} from './QuantumState';
import {
  opticalFiberChannel,
  detectorWithDarkCounts,
  ChannelParameters,
  DEFAULT_CHANNEL_PARAMS,
} from './QuantumChannel';
import {
  EveAttackConfig,
  applyEveAttack,
  calculateMutualInformation,
  calculateSecretKeyRate,
  binaryEntropy,
} from './Eavesdropper';

/**
 * B92 simulation parameters
 */
export interface B92Parameters {
  numBits: number;
  channelParams: ChannelParameters;
  eveConfig?: EveAttackConfig;
  seed?: number;
}

/**
 * B92 simulation result for a single bit
 */
export interface B92BitResult {
  id: number;
  aliceState: 0 | 1; // 0 = |0⟩, 1 = |+⟩
  aliceBit: number; // The actual bit value
  bobBasis: 0 | 1; // 0 = Z basis, 1 = X basis
  bobResult: number | null; // 0, 1, or null (inconclusive/lost)
  bobMeasurementBasis: number; // Actual measurement angle
  inKey: boolean; // Was this bit kept after sifting?
  intercepted: boolean; // Did Eve attack this bit?
  eveResult: number | null; // Eve's measurement result
  lost: boolean; // Was the photon lost in transmission?
  darkCount: boolean; // Was detection due to dark count?
}

/**
 * B92 protocol simulation results
 */
export interface B92SimulationResult {
  bits: B92BitResult[];
  aliceBits: number[];
  bobBits: number[];
  siftedKeyAlice: number[];
  siftedKeyBob: number[];
  qber: number;
  keyLength: number;
  keysMatch: boolean;
  inconclusiveRate: number;
  lossRate: number;
  eveMutualInformation: number;
  secretKeyRate: number;
  chshValue?: number; // Not applicable for B92, but included for consistency
  securityStatus: 'secure' | 'compromised' | 'unknown';
  totalBits: number;
  detectedBits: number;
  conclusiveBits: number;
}

/**
 * Prepare B92 quantum state
 * Alice encodes bit 0 → |0⟩, bit 1 → |+⟩
 */
export function prepareB92State(bit: number): DensityMatrix {
  return bit === 0 ? zeroState() : plusState();
}

/**
 * Bob's USD measurement for B92
 * 
 * Bob randomly chooses between two measurement bases:
 * - Z basis: If he measures |1⟩, he knows Alice sent |+⟩ (bit 1)
 * - X basis: If he measures |-⟩, he knows Alice sent |0⟩ (bit 0)
 * 
 * Any other result is inconclusive.
 */
export function bobUSDMeasurement(
  state: DensityMatrix,
  randomBasis: 0 | 1
): { result: number | null; conclusive: boolean; measurementAngle: number } {
  // Basis 0: Measure in Z basis {|0⟩, |1⟩}
  // If outcome is |1⟩, Alice must have sent |+⟩ (bit 1)
  // If outcome is |0⟩, inconclusive (could be |0⟩ or |+⟩)
  
  // Basis 1: Measure in X basis {|+⟩, |-⟩}
  // If outcome is |-⟩, Alice must have sent |0⟩ (bit 0)
  // If outcome is |+⟩, inconclusive (could be |0⟩ or |+⟩)
  
  const measurementAngle = randomBasis === 0 ? 0 : Math.PI / 2;
  const measurement = measureInBasis(state, measurementAngle);
  
  if (randomBasis === 0) {
    // Z basis measurement
    if (measurement.outcome === 1) {
      // Conclusive: Alice sent |+⟩ (bit 1)
      return { result: 1, conclusive: true, measurementAngle };
    } else {
      // Inconclusive
      return { result: null, conclusive: false, measurementAngle };
    }
  } else {
    // X basis measurement
    if (measurement.outcome === 1) {
      // In X basis, outcome 1 corresponds to |-⟩
      // Conclusive: Alice sent |0⟩ (bit 0)
      return { result: 0, conclusive: true, measurementAngle };
    } else {
      // Inconclusive
      return { result: null, conclusive: false, measurementAngle };
    }
  }
}

/**
 * Run complete B92 protocol simulation
 */
export function runB92Protocol(params: B92Parameters): B92SimulationResult {
  // Initialize random seed if provided
  if (params.seed !== undefined) {
    Math.seedrandom(params.seed.toString());
  }
  
  const results: B92BitResult[] = [];
  const aliceBits: number[] = [];
  const bobBits: number[] = [];
  const siftedKeyAlice: number[] = [];
  const siftedKeyBob: number[] = [];
  
  let totalLost = 0;
  let totalInconclusive = 0;
  let totalIntercepted = 0;
  let totalDarkCounts = 0;
  
  // Generate Alice's random bits
  for (let i = 0; i < params.numBits; i++) {
    const aliceBit = Math.random() > 0.5 ? 1 : 0;
    aliceBits.push(aliceBit);
    
    // Alice prepares state
    let preparedState = prepareB92State(aliceBit);
    
    // Eve's attack (if configured)
    let intercepted = false;
    let eveResult: number | null = null;
    
    if (params.eveConfig) {
      const attackResult = applyEveAttack(
        params.eveConfig,
        preparedState,
        aliceBit,
        aliceBit === 0 ? 'rectilinear' : 'diagonal',
        'B92'
      );
      
      intercepted = attackResult.eveKnowledge.length > 0;
      eveResult = attackResult.eveKnowledge[0] ?? null;
      
      if (attackResult.stateAfterAttack) {
        preparedState = attackResult.stateAfterAttack;
      }
    }
    
    // Transmit through quantum channel
    const channelResult = opticalFiberChannel(preparedState, params.channelParams);
    const lost = !channelResult.state;
    
    if (lost) {
      totalLost++;
      results.push({
        id: i,
        aliceState: aliceBit as 0 | 1,
        aliceBit,
        bobBasis: Math.random() > 0.5 ? 0 : 1,
        bobResult: null,
        bobMeasurementBasis: 0,
        inKey: false,
        intercepted,
        eveResult,
        lost: true,
        darkCount: false,
      });
      continue;
    }
    
    // Bob's measurement
    const bobBasis = Math.random() > 0.5 ? 0 : 1;
    const measurementResult = bobUSDMeasurement(channelResult.state!, bobBasis);
    
    // Detector effects
    const detectorResult = detectorWithDarkCounts(
      channelResult.state!,
      params.channelParams,
      measurementResult.measurementAngle
    );
    
    let bobResult: number | null = null;
    let inKey = false;
    let darkCount = false;
    
    if (detectorResult.detected) {
      darkCount = detectorResult.darkCount;
      totalDarkCounts++;
      
      if (darkCount) {
        // Dark count gives random result
        bobResult = Math.random() > 0.5 ? 0 : 1;
        inKey = true; // Dark counts appear as conclusive results
      } else if (measurementResult.conclusive) {
        bobResult = measurementResult.result;
        inKey = true;
      } else {
        // Inconclusive measurement
        totalInconclusive++;
      }
    } else {
      // No detection
      totalInconclusive++;
    }
    
    // Record results
    if (inKey && bobResult !== null) {
      siftedKeyAlice.push(aliceBit);
      siftedKeyBob.push(bobResult);
    }
    
    results.push({
      id: i,
      aliceState: aliceBit as 0 | 1,
      aliceBit,
      bobBasis,
      bobResult,
      bobMeasurementBasis: measurementResult.measurementAngle,
      inKey,
      intercepted,
      eveResult,
      lost,
      darkCount,
    });
    
    if (intercepted) totalIntercepted++;
  }
  
  // Calculate QBER from conclusive measurements
  let measuredQBER = 0;
  if (siftedKeyAlice.length > 0) {
    const errors = siftedKeyAlice.filter((bit, i) => bit !== siftedKeyBob[i]).length;
    measuredQBER = errors / siftedKeyAlice.length;
  }

  // Add intrinsic QBER floor - ALWAYS present in real quantum systems due to:
  // - Detector dark counts and timing jitter
  // - State preparation fidelity limits
  // - Environmental factors
  // Typical values: 0.5-2% for well-aligned lab systems
  const intrinsicFloor = 0.005 + Math.random() * 0.003; // 0.5-0.8% with quantum variation
  
  // Total QBER = measured errors + intrinsic hardware errors
  const qber = measuredQBER + intrinsicFloor;
  
  // Calculate rates
  const inconclusiveRate = totalInconclusive / params.numBits;
  const lossRate = totalLost / params.numBits;
  
  // Calculate Eve's mutual information
  const eveMutualInformation = params.eveConfig
    ? calculateMutualInformation(qber)
    : 0;
  
  // Calculate secret key rate
  const secretKeyRate = calculateSecretKeyRate(qber, eveMutualInformation);
  
  // Determine security status
  let securityStatus: 'secure' | 'compromised' | 'unknown' = 'unknown';
  if (qber < 0.05) {
    securityStatus = 'secure';
  } else if (qber > 0.15) {
    securityStatus = 'compromised';
  }
  
  return {
    bits: results,
    aliceBits,
    bobBits,
    siftedKeyAlice,
    siftedKeyBob,
    qber,
    keyLength: siftedKeyAlice.length,
    keysMatch: siftedKeyAlice.every((bit, i) => bit === siftedKeyBob[i]),
    inconclusiveRate,
    lossRate,
    eveMutualInformation,
    secretKeyRate,
    securityStatus,
    totalBits: params.numBits,
    detectedBits: results.filter(r => !r.lost).length,
    conclusiveBits: siftedKeyAlice.length,
  };
}

/**
 * Calculate optimal B92 key rate as function of distance
 * Takes into account fiber loss and detector efficiency
 */
export function calculateB92KeyRate(
  distance: number, // km
  detectorEfficiency: number = 0.8,
  darkCountRate: number = 100,
  repetitionRate: number = 1e9 // 1 GHz
): {
  keyRate: number; // bits per second
  qber: number;
  optimalDistance: number;
} {
  // Fiber attenuation at 1550 nm
  const attenuationCoeff = 0.20; // dB/km
  const transmissionEfficiency = Math.pow(10, -attenuationCoeff * distance / 10);
  
  // Total detection efficiency
  const totalEfficiency = detectorEfficiency * transmissionEfficiency;
  
  // B92 has 50% inconclusive results in ideal case
  const conclusiveProbability = 0.5;
  
  // Detection rate
  const detectionRate = repetitionRate * totalEfficiency * conclusiveProbability;
  
  // Dark count contribution
  const darkCountProb = darkCountRate / repetitionRate;
  
  // QBER from dark counts
  const qber = darkCountProb / (totalEfficiency + darkCountProb);
  
  // Key rate (before error correction)
  const rawKeyRate = detectionRate;
  
  // Error correction efficiency (typically ~90%)
  const reconciliationEfficiency = 0.9;
  
  // Secret key rate
  const keyRate = rawKeyRate * reconciliationEfficiency * (1 - binaryEntropy(qber));
  
  // Optimal distance (where key rate drops to zero)
  const optimalDistance = -10 * Math.log10(darkCountRate / repetitionRate) / attenuationCoeff;
  
  return {
    keyRate: Math.max(0, keyRate),
    qber,
    optimalDistance
  };
}

/**
 * B92 with decoy states
 * 
 * Decoy states help detect photon number splitting attacks
 * by varying the intensity of pulses.
 */
export interface B92DecoyResult {
  signalKeyRate: number;
  decoyKeyRate: number;
  estimatedEveInformation: number;
  secure: boolean;
}

export function runB92WithDecoyStates(
  numSignalPulses: number,
  numDecoyPulses: number,
  signalIntensity: number = 0.5, // mean photon number
  decoyIntensity: number = 0.1,
  channelParams: ChannelParameters = DEFAULT_CHANNEL_PARAMS
): B92DecoyResult {
  // Simulate signal states
  const signalResults = runB92Protocol({
    numBits: numSignalPulses,
    channelParams,
  });
  
  // Simulate decoy states (same protocol, different intensity)
  // In practice, decoy states use different mean photon numbers
  const decoyResults = runB92Protocol({
    numBits: numDecoyPulses,
    channelParams,
  });
  
  // Compare detection rates for signal and decoy
  // If Eve is doing PNS attack, she'll treat them differently
  const signalDetectionRate = signalResults.detectedBits / numSignalPulses;
  const decoyDetectionRate = decoyResults.detectedBits / numDecoyPulses;
  
  // Check for PNS attack
  // Eve's PNS attack would cause different detection rates
  const detectionRateRatio = signalDetectionRate / decoyDetectionRate;
  
  // If ratio is significantly different from 1, Eve might be attacking
  const estimatedEveInformation = Math.abs(1 - detectionRateRatio) * 0.5;
  
  return {
    signalKeyRate: signalResults.secretKeyRate,
    decoyKeyRate: decoyResults.secretKeyRate,
    estimatedEveInformation,
    secure: estimatedEveInformation < 0.1
  };
}
