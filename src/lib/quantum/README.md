# Quantum Key Distribution Simulation Library

A research-level simulation framework for Quantum Key Distribution (QKD) protocols implementing **B92** and **E91** with realistic physics modeling.

## Features

### 📊 Core Capabilities

- **Density Matrix Formalism**: Full mixed-state quantum representation
- **Realistic Noise Models**: Fiber attenuation, depolarization, phase damping, PMD
- **Eavesdropping Attacks**: Intercept-resend, beam splitting, optimal cloning
- **Hardware Imperfections**: Dark counts, detector efficiency, multi-photon pulses
- **Complete Post-Processing**: Cascade error correction, privacy amplification
- **Security Analysis**: CHSH inequality, mutual information bounds, finite-size effects

### 🔬 Protocols Implemented

| Protocol | Key Feature | Security Basis |
|----------|-------------|----------------|
| **B92** | Two non-orthogonal states | USD measurement |
| **E91** | Entanglement-based | Bell inequality violation |

## Installation

The library is part of the QKD_Xplore project. Import from:

```typescript
import {
  runQKDSimulation,
  runB92Protocol,
  runE91Protocol,
  analyzeKeyRateVsDistance,
} from '@/lib/quantum';
```

## Quick Start

### Basic B92 Simulation

```typescript
import { runQKDSimulation } from '@/lib/quantum';

const result = runQKDSimulation({
  protocol: 'B92',
  numSignals: 1000,
  channelParams: {
    fiberLength: 25, // km
    wavelength: 1550, // nm
    detectorEfficiency: 0.85,
    darkCountRate: 100, // Hz
  },
  eveConfig: {
    attackType: 'intercept-resend',
    interceptionProbability: 0.2,
  },
});

console.log(`QBER: ${(result.analysis.qber * 100).toFixed(2)}%`);
console.log(`Secure key rate: ${(result.analysis.secureKeyRate * 100).toFixed(2)}%`);
console.log(`Security: ${result.analysis.securityStatus}`);
console.log(`Final key: ${result.finalKey}`);
```

### E91 with CHSH Testing

```typescript
import { runQKDSimulation } from '@/lib/quantum';

const result = runQKDSimulation({
  protocol: 'E91',
  numSignals: 2000,
  channelParams: {
    fiberLength: 10,
    wavelength: 1550,
  },
});

console.log(`CHSH S-value: ${result.analysis.chshSValue?.toFixed(4)}`);
console.log(`Bell violated: ${result.analysis.bellViolated ? '✓ Yes' : '✗ No'}`);
console.log(`Security guaranteed: ${result.analysis.securityStatus === 'secure'}`);
```

### Distance Analysis

```typescript
import { analyzeKeyRateVsDistance } from '@/lib/quantum';

const distances = [0, 10, 20, 30, 40, 50, 75, 100]; // km

const analysis = analyzeKeyRateVsDistance('B92', distances, {
  numSignals: 10000,
});

// Plot key rate vs distance
analysis.forEach(({ distance, keyRate, secure }) => {
  console.log(`${distance} km: ${(keyRate * 100).toFixed(3)}% - ${secure ? '✓' : '✗'}`);
});
```

## Physics Implementation

### Quantum State Representation

Uses **density matrices** (ρ) instead of state vectors for proper mixed-state modeling:

```typescript
// Pure state |ψ⟩ = α|0⟩ + β|1⟩
// Density matrix ρ = |ψ⟩⟨ψ|
ρ = [
  [αα*, αβ*],
  [βα*, ββ*]
]

// Purity: Tr(ρ²) = 1 for pure states, <1 for mixed
```

### Quantum Channels (Kraus Operators)

**Amplitude Damping** (photon loss):
```
K₀ = |0⟩⟨0| + √(1-γ)|1⟩⟨1|
K₁ = √γ|0⟩⟨1|
```

**Depolarizing Channel**:
```
ε(ρ) = (1-p)ρ + p·I/2
```

**Phase Damping**:
```
Destroys off-diagonal coherence terms
```

### Realistic Fiber Optics

**Beer-Lambert Attenuation**:
```typescript
transmission = 10^(-α·L/10)
// α = 0.20 dB/km at 1550 nm
```

**Polarization Mode Dispersion**:
```typescript
PMD_error ∝ √L
```

### CHSH Inequality Testing (E91)

```typescript
S = E(a₁,b₁) - E(a₁,b₃) + E(a₃,b₁) + E(a₃,b₃)

Classical limit: |S| ≤ 2
Quantum maximum: S = 2√2 ≈ 2.828
```

Measurement bases:
- Alice: 0, π/4, π/2
- Bob: π/4, π/2, 3π/4

### B92 Unambiguous State Discrimination

Bob's measurement strategy:
- **Z basis**: If outcome |1⟩ → Alice sent |+⟩ (bit 1)
- **X basis**: If outcome |-⟩ → Alice sent |0⟩ (bit 0)
- **Other**: Inconclusive (50% in ideal case)

## Eavesdropping Models

### Intercept-Resend

Eve measures and resends, introducing **25% QBER** in BB84:

```typescript
const result = runQKDSimulation({
  eveConfig: {
    attackType: 'intercept-resend',
    interceptionProbability: 0.5,
  },
});
```

### Beam Splitting (PNS Attack)

Eve taps multi-photon pulses:

```typescript
// Particularly dangerous for weak coherent pulses
// Countered by decoy state protocols
```

### Optimal Quantum Cloning

Best individual attack with fidelity **F = 5/6**:

```typescript
const result = runQKDSimulation({
  eveConfig: {
    attackType: 'optimal-cloning',
    interceptionProbability: 1.0,
  },
});
// Introduces QBER = 1/6 ≈ 16.67%
```

## Post-Processing Pipeline

### 1. Sifting

```typescript
// Keep only matching bases (BB84/E91) or conclusive results (B92)
const { aliceSifted, bobSifted } = siftKeys(
  aliceBits,
  bobBits,
  basisInfo,
  'B92'
);
```

### 2. QBER Estimation

```typescript
const { qber, sampleSize, errors } = calculateQBER(
  aliceKey,
  bobKey,
  0.2 // Sample 20%
);
```

### 3. Error Correction (Cascade)

```typescript
const { correctedKey, bitsRevealed, iterations } = cascadeErrorCorrection(
  aliceKey,
  bobKey,
  qber
);
// Optimal block size: B ≈ 0.73 / QBER
```

### 4. Privacy Amplification

```typescript
const { finalKey, amplificationFactor } = privacyAmplification(
  correctedKey,
  eveInformation,
  128, // Security parameter (bits)
  'toeplitz'
);
// Final length: l = n - H_Eve - s
```

## Security Analysis

### Secret Key Rate (Devetak-Winter Bound)

```typescript
R = I(A:B) - I(A:E)
  = (1 - H₂(QBER)) - Eve_mutual_information
```

### Finite-Size Effects

```typescript
const { secureKeyLength, statisticalFluctuation } = finiteSizeSecurityAnalysis(
  keyLength,
  qber,
  1e-10 // Security parameter
);
```

### Device-Independent Security (E91)

```typescript
const { maxEveInformation, minSecretKeyRate, secure } = analyzeDIQKDSecurity(
  chshResult
);
// Security from CHSH violation alone, no device trust required
```

## Advanced Usage

### Protocol Comparison

```typescript
import { compareProtocols } from '@/lib/quantum';

const comparison = compareProtocols(10000, {
  fiberLength: 25,
  wavelength: 1550,
});

console.log(comparison.recommendation);
// "B92 recommended: Higher key rate with comparable security."
```

### Generate Report

```typescript
import { generateSimulationReport } from '@/lib/quantum';

const report = generateSimulationReport(result);

console.log(report.summary);
console.log(report.securityAnalysis);
console.log(report.performanceMetrics);
console.log(report.recommendations);
```

### Custom Channel Parameters

```typescript
const customChannel: ChannelParameters = {
  fiberLength: 50,
  wavelength: 1310, // O-band
  attenuationCoeff: 0.35, // dB/km
  temperature: 293, // Kelvin
  detectorEfficiency: 0.9,
  darkCountRate: 50, // Hz
  timingWindow: 0.5, // ns
};
```

## Performance Benchmarks

| Distance | B92 Key Rate | E91 Key Rate | Max Secure Distance |
|----------|--------------|--------------|---------------------|
| 10 km    | ~45%         | ~40%         | B92: ~80 km         |
| 25 km    | ~30%         | ~28%         | E91: ~60 km         |
| 50 km    | ~15%         | ~12%         |                     |
| 75 km    | ~5%          | ~3%          |                     |
| 100 km   | ~1%          | ~0.5%        |                     |

*Assumes: 1550 nm, 0.2 dB/km, 85% detector efficiency, 100 Hz dark counts*

## Mathematical Reference

### Binary Entropy Function

```
H₂(p) = -p·log₂(p) - (1-p)·log₂(1-p)
```

### Key Formulas

- **QBER**: errors / total_bits
- **Mutual Information**: I(A:E) = 1 - H₂(QBER)
- **Secret Key Rate**: R = β·I(A:B) - χ(A:E)
- **CHSH**: S = E(a,b) - E(a,b') + E(a',b) + E(a',b')

## References

1. **Nielsen & Chuang** - "Quantum Computation and Quantum Information" (2010)
2. **Scarani et al.** - "The security of practical quantum key distribution" RMP 81, 1301 (2009)
3. **Ekert** - "Quantum cryptography based on Bell's theorem" PRL 67, 661 (1991)
4. **Bennett** - "Quantum cryptography using any two nonorthogonal states" PRL 68, 3121 (1992)
5. **Devetak & Winter** - "Distillation of secret key and entanglement from quantum states" Proc. R. Soc. A 461, 207 (2005)

## Contributing

This is a research-level simulation library. When contributing:

1. Ensure all quantum operations are physically valid (CPTP maps)
2. Include proper references for implemented protocols
3. Add test cases with known analytical results
4. Document all approximations and assumptions

## License

Part of the QKD_Xplore educational project.
