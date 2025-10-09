# Optical Noise Model for BB84 Quantum Key Distribution

## Overview

This document describes the physics-based optical noise model implemented in the Quantum BB84 Playground. The model simulates realistic photon transmission through optical fibers, accounting for various noise sources that affect quantum key distribution in practical implementations.

## Motivation

Previous implementations used generic bit-flip noise models that didn't capture the physical mechanisms of how photons degrade during transmission. The new optical noise model provides:

1. **Realistic Physics**: Models actual optical phenomena like depolarization, phase damping, and photon loss
2. **Educational Value**: Demonstrates real challenges in quantum communication
3. **Distance Dependency**: Shows how fiber length affects key distribution
4. **Wavelength Effects**: Accounts for different optical wavelengths used in QKD

## Optical Noise Sources

### 1. Depolarization Noise

**Physical Cause**: Scattering, birefringence, and mechanical stress in optical fibers cause random rotations of photon polarization states.

**Effect on Photon**: Randomly flips the polarization state (|H⟩ ↔ |V⟩ or |D⟩ ↔ |A⟩)

**Quantum Channel**: Depolarizing channel represented by Kraus operators
```
ρ → (1-p)ρ + p(σ_x ρ σ_x)
```

**QBER Contribution**: ~25% error rate per depolarization event

### 2. Phase Damping

**Physical Cause**: Environmental decoherence from temperature fluctuations, vibrations, and electromagnetic interference destroys phase coherence.

**Effect on Photon**: Randomizes the relative phase between superposition states, particularly affecting diagonal basis (|+⟩, |-⟩)

**Quantum Channel**: Phase damping channel
```
ρ → (1-γ)ρ + γ(|0⟩⟨0|ρ|0⟩⟨0| + |1⟩⟨1|ρ|1⟩⟨1|)
```

**QBER Contribution**: ~12.5% error rate

### 3. Amplitude Damping (Photon Loss)

**Physical Cause**: Fiber absorption, coupling losses, and detector inefficiency cause photons to be lost during transmission.

**Effect on Photon**: Photon is absorbed and never reaches Bob's detector (modeled as NULL measurement)

**Quantum Channel**: Amplitude damping channel with loss probability λ
```
P_loss = 1 - 10^(-α×L/10)
```
where α is attenuation coefficient (dB/km) and L is fiber length (km)

**QBER Impact**: Does not directly increase QBER (lost photons don't contribute to errors), but reduces key rate

### 4. Polarization Mode Dispersion (PMD)

**Physical Cause**: Different polarization modes travel at slightly different speeds in optical fiber due to birefringence, causing temporal spreading.

**Effect on Photon**: Causes polarization rotation that increases with fiber length as √L

**Formula**: PMD coefficient typically 0.1-1.0 ps/√km for standard fiber

**QBER Contribution**: Increases with distance

### 5. Thermal Noise

**Physical Cause**: Dark counts in single-photon detectors due to thermal excitation (Johnson-Nyquist noise)

**Effect on Photon**: Random detection events even without photon arrival, causing false bit readings

**QBER Contribution**: ~5% error rate, independent of transmission

## Wavelength-Dependent Attenuation

The model supports three standard wavelengths used in quantum communication:

| Wavelength | Band | Attenuation | Typical Use |
|------------|------|-------------|-------------|
| 850 nm | Multi-mode | 2.5 dB/km | Short distance, free-space |
| 1310 nm | O-band | 0.35 dB/km | Metropolitan networks |
| 1550 nm | C-band | 0.20 dB/km | Long-distance fiber (optimal) |

**Beer-Lambert Law** for fiber transmission:
```
P_out = P_in × 10^(-α×L/10)
```

## Implementation

### Core Module: `src/lib/opticalNoise.ts`

Key functions:

- `applyOpticalNoise()`: Applies all noise channels to a photon state
- `calculatePhotonLoss()`: Computes transmission probability
- `calculateOpticalQBER()`: Estimates QBER from noise parameters
- `legacyNoiseToOptical()`: Converts generic noise to optical parameters

### Simulation Integration

1. **BB84 Simulation** (`src/components/experiments/common/utils.ts`):
   - Photons modeled as `PolarizationState` objects
   - Noise applied before Bob's measurement
   - Lost photons excluded from key generation

2. **Interactive Simulation** (`src/components/SimulationSection.tsx`):
   - Real-time photon transmission with optical noise
   - Visual representation of noise effects

3. **Experiments**:
   - **Effect of Channel Noise**: Varies depolarization and phase damping
   - **Effect of Distance**: Shows photon loss and PMD with fiber length

### Backend Support (`backend/app.py`)

Flask API endpoint `/api/bb84/simulate` accepts optical noise parameters:
```json
{
  "n_bits": 100,
  "optical_noise": {
    "depolarization": 0.02,
    "phase_damping": 0.015,
    "amplitude_damping": 0.05,
    "fiber_length": 50,
    "attenuation_coeff": 0.20
  }
}
```

## Scientific References

1. **Nielsen, M. A., & Chuang, I. L.** (2010). *Quantum Computation and Quantum Information*. Cambridge University Press.
   - Chapter 8: Quantum noise and quantum operations
   - Kraus operators for quantum channels

2. **Scarani, V., et al.** (2009). "The security of practical quantum key distribution". *Reviews of Modern Physics*, 81(3), 1301-1350.
   - Comprehensive review of QKD security proofs
   - Analysis of realistic channel imperfections

3. **Gisin, N., Ribordy, G., Tittel, W., & Zbinden, H.** (2002). "Quantum cryptography". *Reviews of Modern Physics*, 74(1), 145-195.
   - Foundational paper on practical QKD implementations
   - Discussion of fiber-optic quantum channels

4. **Xu, F., Ma, X., Zhang, Q., Lo, H. K., & Pan, J. W.** (2020). "Secure quantum key distribution with realistic devices". *Reviews of Modern Physics*, 92(2), 025002.
   - Modern perspective on device imperfections
   - Practical noise models for QKD systems

5. **Poppe, A., et al.** (2004). "Practical quantum key distribution with polarization entangled photons". *Optics Express*, 12(16), 3865-3871.
   - Experimental characterization of fiber-optic noise
   - PMD and polarization drift measurements

6. **Agrawal, G. P.** (2012). *Fiber-Optic Communication Systems* (4th ed.). Wiley.
   - Chapter 2: Optical fibers and their properties
   - Attenuation, dispersion, and nonlinear effects

7. **Preskill, J.** (1998). "Lecture Notes for Physics 229: Quantum Information and Computation". California Institute of Technology.
   - Quantum error channels and decoherence
   - Depolarizing and amplitude damping channels

## Quantum Bit Error Rate (QBER) Calculation

The total QBER is computed from individual noise contributions:

```typescript
QBER = depolarization × 0.25 +      // Bit flip errors
       phase_damping × 0.125 +       // Phase errors
       PMD × sqrt(L) / 100 +         // Distance-dependent rotation
       thermal_noise × 0.05           // Detector dark counts
```

Capped at 50% (maximum random error rate).

## Security Implications

- **QBER < 11%**: Secure key generation possible (below theoretical threshold)
- **11% < QBER < 15%**: Marginally secure, requires advanced error correction
- **QBER > 15%**: Compromised channel, discard key

The optical noise model demonstrates why practical QKD systems must:
1. Operate at optimal wavelengths (1550 nm)
2. Minimize fiber length (< 100 km for standard fiber)
3. Use high-quality single-photon detectors
4. Implement polarization stabilization
5. Account for environmental factors

## Future Enhancements

Potential additions to the model:
- Nonlinear effects (four-wave mixing, Raman scattering)
- Chromatic dispersion for ultrafast pulses
- Finite-key effects for short keys
- Device-independent noise modeling
- Integration with Qiskit Aer noise models

## Backward Compatibility

The legacy noise slider (0-100%) is automatically converted to optical parameters using `legacyNoiseToOptical()`, ensuring existing simulations continue to work while using the new physics-based model internally.

## Conclusion

This optical noise model bridges the gap between idealized quantum protocols and real-world implementations, providing users with a realistic understanding of challenges in quantum communication. By modeling actual physical phenomena, the playground becomes a more valuable educational and research tool for quantum key distribution.
