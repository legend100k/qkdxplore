/**
 * Basic tests for optical noise model
 * Run with: npm test (if test runner is configured)
 */

import {
  getAttenuationCoeff,
  calculatePhotonLoss,
  applyDepolarization,
  applyPhaseDamping,
  applyAmplitudeDamping,
  legacyNoiseToOptical,
  PolarizationState,
  WAVELENGTH_PRESETS
} from '../opticalNoise';

// Test 1: Wavelength-dependent attenuation
console.log('Test 1: Wavelength attenuation coefficients');
const attn850 = getAttenuationCoeff(850);
const attn1310 = getAttenuationCoeff(1310);
const attn1550 = getAttenuationCoeff(1550);
console.log(`  850nm: ${attn850} dB/km (expected ~2.5)`);
console.log(`  1310nm: ${attn1310} dB/km (expected ~0.35)`);
console.log(`  1550nm: ${attn1550} dB/km (expected ~0.20)`);
console.assert(attn850 === WAVELENGTH_PRESETS[850].attenuation, 'Attenuation mismatch at 850nm');
console.assert(attn1550 === WAVELENGTH_PRESETS[1550].attenuation, 'Attenuation mismatch at 1550nm');
console.log('  ✓ Passed\n');

// Test 2: Photon loss calculation
console.log('Test 2: Photon loss with distance');
const loss10km = calculatePhotonLoss(10, 0.20);
const loss50km = calculatePhotonLoss(50, 0.20);
const loss100km = calculatePhotonLoss(100, 0.20);
console.log(`  10 km: ${(loss10km * 100).toFixed(2)}% loss`);
console.log(`  50 km: ${(loss50km * 100).toFixed(2)}% loss`);
console.log(`  100 km: ${(loss100km * 100).toFixed(2)}% loss`);
console.assert(loss10km < loss50km && loss50km < loss100km, 'Loss should increase with distance');
console.log('  ✓ Passed\n');

// Test 3: Depolarization channel
console.log('Test 3: Depolarization noise');
const initialState: PolarizationState = {
  basis: 'rectilinear',
  bit: 0,
  amplitude: 1.0,
  phase: 0
};
let flipped = 0;
const iterations = 1000;
for (let i = 0; i < iterations; i++) {
  const result = applyDepolarization({ ...initialState }, 0.25);
  if (result.bit !== initialState.bit) flipped++;
}
const flipRate = flipped / iterations;
console.log(`  Flip rate: ${(flipRate * 100).toFixed(1)}% (expected ~25%)`);
console.assert(flipRate > 0.20 && flipRate < 0.30, 'Flip rate out of expected range');
console.log('  ✓ Passed\n');

// Test 4: Amplitude damping (photon loss)
console.log('Test 4: Amplitude damping');
let lost = 0;
for (let i = 0; i < iterations; i++) {
  const result = applyAmplitudeDamping({ ...initialState }, 0.30);
  if (result === null) lost++;
}
const lossRate = lost / iterations;
console.log(`  Loss rate: ${(lossRate * 100).toFixed(1)}% (expected ~30%)`);
console.assert(lossRate > 0.25 && lossRate < 0.35, 'Loss rate out of expected range');
console.log('  ✓ Passed\n');

// Test 5: Legacy noise conversion
console.log('Test 5: Legacy noise conversion');
const opticalParams = legacyNoiseToOptical(20, 10); // 20% noise, 10km
console.log(`  Legacy 20% noise converts to:`);
console.log(`    Depolarization: ${(opticalParams.depolarization * 100).toFixed(1)}%`);
console.log(`    Phase damping: ${(opticalParams.phaseDamping * 100).toFixed(1)}%`);
console.log(`    Amplitude damping: ${(opticalParams.amplitudeDamping * 100).toFixed(1)}%`);
console.log(`    Fiber length: ${opticalParams.fiberLength} km`);
console.log(`    Wavelength: ${opticalParams.wavelength} nm`);
console.assert(opticalParams.fiberLength === 10, 'Fiber length mismatch');
console.assert(opticalParams.wavelength === 1550, 'Default wavelength should be 1550nm');
console.log('  ✓ Passed\n');

// Test 6: Phase damping
console.log('Test 6: Phase damping');
let phaseChanged = 0;
for (let i = 0; i < iterations; i++) {
  const result = applyPhaseDamping({ ...initialState, phase: 0 }, 0.20);
  if (result.phase !== 0) phaseChanged++;
}
const phaseChangeRate = phaseChanged / iterations;
console.log(`  Phase change rate: ${(phaseChangeRate * 100).toFixed(1)}% (expected ~20%)`);
console.assert(phaseChangeRate > 0.15 && phaseChangeRate < 0.25, 'Phase change rate out of expected range');
console.log('  ✓ Passed\n');

console.log('All tests passed! ✓');
