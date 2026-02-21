/**
 * Comprehensive QKD Simulation Runner
 * 
 * Integrates all quantum modules into a unified simulation framework
 * with support for B92 and E91 protocols, realistic noise, and complete analysis.
 */

import {
  runB92Protocol,
  type B92Parameters,
  type B92SimulationResult,
  calculateB92KeyRate,
} from './B92Protocol';

import {
  runE91Protocol,
  type E91Parameters,
  type E91SimulationResult,
  calculateExpectedCHSH,
  analyzeDIQKDSecurity,
} from './E91Protocol';

import {
  runPostProcessing,
  type PostProcessingConfig,
  type PostProcessingResult,
  DEFAULT_CONFIG,
} from './PostProcessing';

import {
  type ChannelParameters,
  DEFAULT_CHANNEL_PARAMS,
} from './QuantumChannel';

import {
  type EveAttackConfig,
} from './Eavesdropper';

/**
 * Unified simulation configuration
 */
export interface QKDSimulationConfig {
  protocol: 'B92' | 'E91';
  numSignals: number; // bits for B92, pairs for E91
  channelParams: Partial<ChannelParameters>;
  eveConfig?: EveAttackConfig;
  postProcessingConfig?: Partial<PostProcessingConfig>;
  seed?: number;
}

/**
 * Complete simulation result with all analysis
 */
export interface QKDSimulationResult {
  protocol: 'B92' | 'E91';

  // Raw results
  b92Result?: B92SimulationResult;
  e91Result?: E91SimulationResult;

  // Post-processing
  postProcessingResult?: PostProcessingResult;

  // Analysis
  analysis: {
    qber: number;
    qberPercentage: string;
    keyRate: number; // bits per signal
    secureKeyRate: number;
    eveInformation: number;
    securityStatus: 'secure' | 'compromised' | 'unknown';
    chshSValue?: number;
    bellViolated?: boolean;
    lossRate: number;
    detectionEfficiency: number;
  };

  // Parameters used
  parameters: {
    fiberLength: number;
    wavelength: number;
    numSignals: number;
    eavesdroppingRate: number;
  };

  // Final key
  finalKey?: string;
  finalKeyLength: number;
}

/**
 * Run complete QKD simulation with all analysis
 */
export function runQKDSimulation(config: QKDSimulationConfig): QKDSimulationResult {
  // Merge with defaults
  const channelParams: ChannelParameters = {
    ...DEFAULT_CHANNEL_PARAMS,
    ...config.channelParams,
  };

  const postProcessingConfig: PostProcessingConfig = {
    ...DEFAULT_CONFIG,
    ...config.postProcessingConfig,
  };

  let b92Result: B92SimulationResult | undefined;
  let e91Result: E91SimulationResult | undefined;
  let postProcessingResult: PostProcessingResult | undefined;

  // Run protocol simulation
  if (config.protocol === 'B92') {
    const b92Params: B92Parameters = {
      numBits: config.numSignals,
      channelParams,
      eveConfig: config.eveConfig,
      seed: config.seed,
    };

    b92Result = runB92Protocol(b92Params);

    // Post-process
    if (b92Result.siftedKeyAlice.length > 0) {
      postProcessingResult = runPostProcessing(
        b92Result.siftedKeyAlice,
        b92Result.siftedKeyBob,
        postProcessingConfig
      );
    }
  } else {
    const e91Params: E91Parameters = {
      numPairs: config.numSignals,
      channelParams,
      eveConfig: config.eveConfig,
      seed: config.seed,
    };

    e91Result = runE91Protocol(e91Params);

    // Post-process
    if (e91Result.aliceSiftedKey.length > 0) {
      postProcessingResult = runPostProcessing(
        e91Result.aliceSiftedKey,
        e91Result.bobSiftedKey,
        postProcessingConfig
      );
    }
  }

  // Compile analysis
  const qber = b92Result?.qber || e91Result?.qber || 0;
  const eveInformation = b92Result?.eveMutualInformation || e91Result?.eveMutualInformation || 0;
  const secureKeyRate = b92Result?.secretKeyRate || e91Result?.secretKeyRate || 0;

  const result: QKDSimulationResult = {
    protocol: config.protocol,
    b92Result,
    e91Result,
    postProcessingResult,
    analysis: {
      qber,
      qberPercentage: `${(qber * 100).toFixed(2)}%`,
      keyRate: config.numSignals > 0
        ? (b92Result?.keyLength || e91Result?.keyLength || 0) / config.numSignals
        : 0,
      secureKeyRate,
      eveInformation,
      securityStatus: b92Result?.securityStatus || e91Result?.securityStatus || 'unknown',
      chshSValue: e91Result?.chshResult.S,
      bellViolated: e91Result?.chshResult.bellViolated,
      lossRate: b92Result?.lossRate || e91Result?.lostPairs / config.numSignals || 0,
      detectionEfficiency: 1 - (b92Result?.lossRate || e91Result?.lostPairs / config.numSignals || 0),
    },
    parameters: {
      fiberLength: channelParams.fiberLength,
      wavelength: channelParams.wavelength,
      numSignals: config.numSignals,
      eavesdroppingRate: config.eveConfig?.interceptionProbability || 0,
    },
    finalKey: postProcessingResult?.finalKey,
    finalKeyLength: postProcessingResult?.finalKeyLength || 0,
  };

  return result;
}

/**
 * Distance-dependent key rate analysis
 * 
 * Simulates QKD performance over various distances
 */
export interface DistanceAnalysisResult {
  distance: number; // km
  keyRate: number;
  qber: number;
  secure: boolean;
  chshSValue?: number;
}

export function analyzeKeyRateVsDistance(
  protocol: 'B92' | 'E91',
  distances: number[],
  baseConfig: Omit<QKDSimulationConfig, 'channelParams'>
): DistanceAnalysisResult[] {
  const results: DistanceAnalysisResult[] = [];

  for (const distance of distances) {
    const simConfig: QKDSimulationConfig = {
      ...baseConfig,
      protocol,
      channelParams: {
        fiberLength: distance,
      },
    };

    const result = runQKDSimulation(simConfig);

    results.push({
      distance,
      keyRate: result.analysis.secureKeyRate,
      qber: result.analysis.qber,
      secure: result.analysis.securityStatus === 'secure',
      chshSValue: result.analysis.chshSValue,
    });
  }

  return results;
}

/**
 * Eavesdropping sensitivity analysis
 * 
 * Tests protocol robustness against various eavesdropping levels
 */
export interface EavesdroppingAnalysisResult {
  eavesdroppingRate: number;
  qber: number;
  keyRate: number;
  eveInformation: number;
  secure: boolean;
  chshSValue?: number;
}

export function analyzeEavesdroppingSensitivity(
  protocol: 'B92' | 'E91',
  eavesdroppingRates: number[],
  baseConfig: Omit<QKDSimulationConfig, 'eveConfig'>
): EavesdroppingAnalysisResult[] {
  const results: EavesdroppingAnalysisResult[] = [];

  for (const rate of eavesdroppingRates) {
    const simConfig: QKDSimulationConfig = {
      ...baseConfig,
      protocol,
      eveConfig: {
        attackType: 'intercept-resend',
        interceptionProbability: rate,
      },
    };

    const result = runQKDSimulation(simConfig);

    results.push({
      eavesdroppingRate: rate,
      qber: result.analysis.qber,
      keyRate: result.analysis.secureKeyRate,
      eveInformation: result.analysis.eveInformation,
      secure: result.analysis.securityStatus === 'secure',
      chshSValue: result.analysis.chshSValue,
    });
  }

  return results;
}

/**
 * Compare B92 and E91 protocols
 */
export interface ProtocolComparison {
  b92: {
    keyRate: number;
    qber: number;
    maxDistance: number;
    secure: boolean;
  };
  e91: {
    keyRate: number;
    qber: number;
    chshSValue: number;
    bellViolated: boolean;
    secure: boolean;
  };
  recommendation: string;
}

export function compareProtocols(
  numSignals: number,
  channelParams: Partial<ChannelParameters>
): ProtocolComparison {
  // Run B92
  const b92Result = runQKDSimulation({
    protocol: 'B92',
    numSignals,
    channelParams,
  });

  // Run E91
  const e91Result = runQKDSimulation({
    protocol: 'E91',
    numSignals,
    channelParams,
  });

  // Calculate max distance for B92
  const b92KeyRateInfo = calculateB92KeyRate(
    channelParams.fiberLength || 10,
    channelParams.detectorEfficiency || 0.8,
    channelParams.darkCountRate || 100
  );

  // Generate recommendation
  let recommendation = '';

  const b92Secure = b92Result.analysis.securityStatus === 'secure';
  const e91Secure = e91Result.analysis.securityStatus === 'secure';

  if (!b92Secure && !e91Secure) {
    recommendation = 'Channel conditions too harsh for secure QKD. Reduce distance or improve equipment.';
  } else if (b92Secure && !e91Secure) {
    recommendation = 'B92 recommended: Better performance in current conditions. E91 requires better entanglement quality.';
  } else if (!b92Secure && e91Secure) {
    recommendation = 'E91 recommended: Entanglement-based security provides advantage. B92 too sensitive to loss.';
  } else {
    // Both secure
    if (b92Result.analysis.keyRate > e91Result.analysis.keyRate * 1.2) {
      recommendation = 'B92 recommended: Higher key rate with comparable security.';
    } else if (e91Result.analysis.keyRate > b92Result.analysis.keyRate * 1.2) {
      recommendation = 'E91 recommended: Higher key rate with device-independent security potential.';
    } else {
      recommendation = 'Both protocols viable. Choose based on implementation constraints.';
    }
  }

  return {
    b92: {
      keyRate: b92Result.analysis.keyRate,
      qber: b92Result.analysis.qber,
      maxDistance: b92KeyRateInfo.optimalDistance,
      secure: b92Result.analysis.securityStatus === 'secure',
    },
    e91: {
      keyRate: e91Result.analysis.keyRate,
      qber: e91Result.analysis.qber,
      chshSValue: e91Result.analysis.chshSValue || 0,
      bellViolated: e91Result.analysis.bellViolated || false,
      secure: e91Result.analysis.securityStatus === 'secure',
    },
    recommendation,
  };
}

/**
 * Generate simulation report
 */
export interface SimulationReport {
  summary: string;
  securityAnalysis: string;
  performanceMetrics: Record<string, string>;
  recommendations: string[];
}

export function generateSimulationReport(result: QKDSimulationResult): SimulationReport {
  const { protocol, analysis, parameters, finalKeyLength } = result;

  // Summary
  const summary = `${protocol} QKD Simulation Report
==============================
Simulated ${parameters.numSignals} ${protocol === 'B92' ? 'bits' : 'pairs'} over ${parameters.fiberLength} km fiber.
Final secure key: ${finalKeyLength} bits (${(analysis.keyRate * 100).toFixed(2)}% efficiency)
QBER: ${analysis.qberPercentage}
Security Status: ${analysis.securityStatus.toUpperCase()}`;

  // Security analysis
  let securityAnalysis = '';

  if (protocol === 'E91') {
    securityAnalysis = `CHSH S-value: ${analysis.chshSValue?.toFixed(4) || 'N/A'}
Bell Inequality: ${analysis.bellViolated ? 'VIOLATED ✓' : 'NOT violated ✗'}
Classical limit: S ≤ 2, Quantum maximum: S = 2√2 ≈ 2.828
Eve's mutual information: ${(analysis.eveInformation * 100).toFixed(2)}% of key`;

    if (analysis.bellViolated) {
      securityAnalysis += '\n\n✓ Security guaranteed by Bell inequality violation';
      securityAnalysis += '\n✓ Entanglement verified - no local hidden variable explanation';
    } else {
      securityAnalysis += '\n\n✗ No Bell violation - security not guaranteed';
      securityAnalysis += '\n✗ Possible eavesdropping or excessive noise';
    }
  } else {
    securityAnalysis = `B92 Protocol Security Analysis
QBER-based security bound: ${(0.15 * 100).toFixed(0)}% maximum for secure key
Current QBER: ${analysis.qberPercentage}
Eve's information: ${(analysis.eveInformation * 100).toFixed(2)}%
Secret key rate: ${analysis.secureKeyRate.toFixed(4)} bits per signal`;

    if (analysis.securityStatus === 'secure') {
      securityAnalysis += '\n\n✓ QBER below threshold - secure key distillation possible';
    } else {
      securityAnalysis += '\n\n✗ QBER too high - key may be compromised';
    }
  }

  // Performance metrics
  const performanceMetrics: Record<string, string> = {
    'Protocol': protocol,
    'Fiber Length': `${parameters.fiberLength} km`,
    'Wavelength': `${parameters.wavelength} nm`,
    'Signals Sent': parameters.numSignals.toString(),
    'Detection Efficiency': `${(analysis.detectionEfficiency * 100).toFixed(1)}%`,
    'Loss Rate': `${(analysis.lossRate * 100).toFixed(1)}%`,
    'Raw Key Length': (analysis.keyRate * parameters.numSignals).toFixed(0),
    'Final Key Length': finalKeyLength.toString(),
    'Key Rate': `${(analysis.keyRate * 100).toFixed(2)}%`,
    'QBER': analysis.qberPercentage,
  };

  if (protocol === 'E91') {
    performanceMetrics['CHSH S-value'] = analysis.chshSValue?.toFixed(4) || 'N/A';
    performanceMetrics['Bell Violation'] = analysis.bellViolated ? 'Yes ✓' : 'No ✗';
  }

  // Recommendations
  const recommendations: string[] = [];

  if (analysis.qber > 0.10) {
    recommendations.push('High QBER detected. Consider reducing distance or improving detector quality.');
  }

  if (analysis.lossRate > 0.8) {
    recommendations.push('Excessive photon loss. Consider using quantum repeaters or shorter distance.');
  }

  if (protocol === 'B92' && analysis.keyRate < 0.01) {
    recommendations.push('B92 key rate very low. Consider switching to E91 or BB84 for better performance.');
  }

  if (protocol === 'E91' && !analysis.bellViolated) {
    recommendations.push('Bell inequality not violated. Check entanglement source quality and reduce noise.');
  }

  if (analysis.secureKeyRate > 0.1) {
    recommendations.push('Excellent key rate! System operating in optimal regime.');
  }

  if (recommendations.length === 0) {
    recommendations.push('System operating optimally. No improvements needed.');
  }

  return {
    summary,
    securityAnalysis,
    performanceMetrics,
    recommendations,
  };
}

/**
 * Export all types and functions
 */
export {
  runB92Protocol,
  runE91Protocol,
  runPostProcessing,
  type B92Parameters,
  type B92SimulationResult,
  type E91Parameters,
  type E91SimulationResult,
  type PostProcessingConfig,
  type PostProcessingResult,
  type ChannelParameters,
  type EveAttackConfig,
  DEFAULT_CHANNEL_PARAMS,
  DEFAULT_CONFIG,
};
