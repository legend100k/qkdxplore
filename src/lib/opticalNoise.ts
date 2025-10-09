/**
 * Optical Photon Transmission Noise Model for BB84 QKD
 * 
 * This module implements physics-based optical noise models that affect
 * photon polarization states during quantum transmission in optical fibers.
 * 
 * References:
 * - Nielsen & Chuang, "Quantum Computation and Quantum Information"
 * - Scarani et al., "The security of practical quantum key distribution" (2009)
 * - Gisin et al., "Quantum cryptography" Nature Photonics (2007)
 */

/**
 * Optical noise parameters for photon transmission
 */
export interface OpticalNoiseParams {
  // Fiber transmission properties
  fiberLength: number;          // Distance in km
  wavelength: number;           // Wavelength in nm (850, 1310, or 1550)
  attenuationCoeff: number;     // Fiber attenuation in dB/km
  
  // Quantum noise channels
  depolarization: number;       // Depolarization probability (0-1)
  phaseDamping: number;         // Phase decoherence rate (0-1)
  amplitudeDamping: number;     // Photon loss probability (0-1)
  pmd: number;                  // Polarization mode dispersion in ps/√km
  thermalNoise: number;         // Thermal noise level (0-1)
}

/**
 * Polarization state representation
 */
export interface PolarizationState {
  basis: 'rectilinear' | 'diagonal';  // + or × basis
  bit: number;                         // 0 or 1
  amplitude: number;                   // Photon survival probability
  phase: number;                       // Relative phase (0-2π)
}

/**
 * Standard wavelengths for quantum communication with typical attenuation
 */
export const WAVELENGTH_PRESETS = {
  850: { attenuation: 2.5, name: "850 nm (Multi-mode)" },      // dB/km
  1310: { attenuation: 0.35, name: "1310 nm (O-band)" },       // dB/km
  1550: { attenuation: 0.20, name: "1550 nm (C-band)" },       // dB/km - optimal for long distance
};

/**
 * Calculate wavelength-dependent attenuation coefficient
 */
export function getAttenuationCoeff(wavelength: number): number {
  // Use preset if available
  if (wavelength in WAVELENGTH_PRESETS) {
    return WAVELENGTH_PRESETS[wavelength as keyof typeof WAVELENGTH_PRESETS].attenuation;
  }
  
  // Linear interpolation for intermediate wavelengths
  if (wavelength < 1310) {
    const ratio = (wavelength - 850) / (1310 - 850);
    return 2.5 - ratio * (2.5 - 0.35);
  } else {
    const ratio = (wavelength - 1310) / (1550 - 1310);
    return 0.35 - ratio * (0.35 - 0.20);
  }
}

/**
 * Calculate photon transmission probability using Beer-Lambert law
 * P_out = P_in × 10^(-α×L/10)
 */
export function calculatePhotonLoss(
  fiberLength: number,
  attenuationCoeff: number
): number {
  // Beer-Lambert law for optical fiber
  const transmissionFactor = Math.pow(10, -(attenuationCoeff * fiberLength) / 10);
  return 1 - transmissionFactor; // Return loss probability
}

/**
 * Apply depolarization noise - randomly rotates polarization state
 * Models scattering, birefringence, and mechanical stress in fiber
 */
export function applyDepolarization(
  state: PolarizationState,
  depolarizationRate: number
): PolarizationState {
  if (Math.random() < depolarizationRate) {
    // Depolarization: randomly flip to orthogonal polarization
    // In quantum terms, this is a bit flip error
    return {
      ...state,
      bit: 1 - state.bit,
      amplitude: state.amplitude * Math.sqrt(1 - depolarizationRate)
    };
  }
  return state;
}

/**
 * Apply phase damping noise - destroys phase coherence
 * Models dephasing from environmental interactions
 */
export function applyPhaseDamping(
  state: PolarizationState,
  phaseDampingRate: number
): PolarizationState {
  if (Math.random() < phaseDampingRate) {
    // Phase damping: randomize phase
    return {
      ...state,
      phase: Math.random() * 2 * Math.PI,
      amplitude: state.amplitude * Math.sqrt(1 - phaseDampingRate / 2)
    };
  }
  return state;
}

/**
 * Apply amplitude damping - photon absorption/loss
 * Models detector efficiency and fiber absorption
 */
export function applyAmplitudeDamping(
  state: PolarizationState,
  amplitudeDampingRate: number
): PolarizationState | null {
  // Amplitude damping: photon may be lost
  if (Math.random() < amplitudeDampingRate) {
    return null; // Photon lost
  }
  
  return {
    ...state,
    amplitude: state.amplitude * Math.sqrt(1 - amplitudeDampingRate)
  };
}

/**
 * Apply polarization mode dispersion (PMD)
 * Models differential delay between orthogonal polarization modes
 */
export function applyPMD(
  state: PolarizationState,
  pmd: number,
  fiberLength: number
): PolarizationState {
  // PMD causes polarization rotation proportional to √L
  const pmdEffect = pmd * Math.sqrt(fiberLength);
  
  // PMD probability increases with distance
  const rotationProb = Math.min(pmdEffect / 100, 0.5); // Cap at 50%
  
  if (Math.random() < rotationProb) {
    // PMD causes basis rotation - bit may flip
    return {
      ...state,
      bit: 1 - state.bit,
      phase: state.phase + Math.PI / 4 // 45-degree phase shift
    };
  }
  
  return state;
}

/**
 * Apply thermal noise - temperature-dependent detector noise
 * Models dark counts and thermal photons in detectors
 */
export function applyThermalNoise(
  state: PolarizationState,
  thermalNoiseLevel: number
): PolarizationState {
  // Thermal noise can cause random bit flips in detection
  if (Math.random() < thermalNoiseLevel) {
    return {
      ...state,
      bit: 1 - state.bit
    };
  }
  return state;
}

/**
 * Calculate comprehensive optical QBER from noise parameters
 * 
 * QBER contributions:
 * - Depolarization: causes bit flips (contributes ~25% per error)
 * - Phase damping: causes measurement errors (contributes ~12.5% per error)
 * - Amplitude damping: causes loss (doesn't increase QBER directly)
 * - PMD: causes polarization rotation (contributes to errors)
 * - Thermal: causes detection errors
 */
export function calculateOpticalQBER(params: OpticalNoiseParams): number {
  const {
    depolarization,
    phaseDamping,
    amplitudeDamping,
    pmd,
    fiberLength,
    thermalNoise
  } = params;
  
  // Calculate contributions from each noise source
  const depolarizationContribution = depolarization * 0.25; // 25% error rate per depol event
  const phaseDampingContribution = phaseDamping * 0.125;    // 12.5% error rate
  const pmdContribution = Math.min((pmd * Math.sqrt(fiberLength)) / 100, 0.15);
  const thermalContribution = thermalNoise * 0.05;          // 5% error rate
  
  // Total QBER (capped at 50% - maximum for random errors)
  const totalQBER = Math.min(
    depolarizationContribution + 
    phaseDampingContribution + 
    pmdContribution + 
    thermalContribution,
    0.50
  );
  
  return totalQBER * 100; // Return as percentage
}

/**
 * Apply complete optical noise channel to a photon
 * Returns null if photon is lost, otherwise returns noisy state
 */
export function applyOpticalNoise(
  state: PolarizationState,
  params: OpticalNoiseParams
): PolarizationState | null {
  let noisyState = { ...state };
  
  // Apply noise channels in sequence (order matters physically)
  
  // 1. Amplitude damping (photon loss) - happens first in fiber
  const lossRate = calculatePhotonLoss(params.fiberLength, params.attenuationCoeff);
  const combinedAmplitudeDamping = Math.min(params.amplitudeDamping + lossRate, 1);
  noisyState = applyAmplitudeDamping(noisyState, combinedAmplitudeDamping);
  if (!noisyState) return null; // Photon lost
  
  // 2. Depolarization (polarization randomization)
  noisyState = applyDepolarization(noisyState, params.depolarization);
  
  // 3. PMD (polarization mode dispersion)
  noisyState = applyPMD(noisyState, params.pmd, params.fiberLength);
  
  // 4. Phase damping (decoherence)
  noisyState = applyPhaseDamping(noisyState, params.phaseDamping);
  
  // 5. Thermal noise (detector noise)
  noisyState = applyThermalNoise(noisyState, params.thermalNoise);
  
  return noisyState;
}

/**
 * Get default optical noise parameters for a given scenario
 */
export function getDefaultOpticalParams(scenario: 'ideal' | 'urban' | 'long-distance'): OpticalNoiseParams {
  switch (scenario) {
    case 'ideal':
      return {
        fiberLength: 1,
        wavelength: 1550,
        attenuationCoeff: 0.20,
        depolarization: 0.001,
        phaseDamping: 0.001,
        amplitudeDamping: 0.01,
        pmd: 0.1,
        thermalNoise: 0.001
      };
    
    case 'urban':
      return {
        fiberLength: 20,
        wavelength: 1310,
        attenuationCoeff: 0.35,
        depolarization: 0.02,
        phaseDamping: 0.015,
        amplitudeDamping: 0.05,
        pmd: 0.5,
        thermalNoise: 0.01
      };
    
    case 'long-distance':
      return {
        fiberLength: 100,
        wavelength: 1550,
        attenuationCoeff: 0.20,
        depolarization: 0.05,
        phaseDamping: 0.04,
        amplitudeDamping: 0.10,
        pmd: 1.0,
        thermalNoise: 0.02
      };
  }
}

/**
 * Convert legacy noise percentage (0-100) to optical noise parameters
 * This maintains backward compatibility with existing simulations
 */
export function legacyNoiseToOptical(
  noisePercent: number,
  fiberLength: number = 10
): OpticalNoiseParams {
  const normalizedNoise = noisePercent / 100;
  
  return {
    fiberLength,
    wavelength: 1550,
    attenuationCoeff: getAttenuationCoeff(1550),
    depolarization: normalizedNoise * 0.4,      // 40% of noise is depolarization
    phaseDamping: normalizedNoise * 0.3,        // 30% is phase damping
    amplitudeDamping: normalizedNoise * 0.2,    // 20% is amplitude damping
    pmd: normalizedNoise * 2,                   // PMD scales with noise
    thermalNoise: normalizedNoise * 0.1         // 10% is thermal
  };
}
