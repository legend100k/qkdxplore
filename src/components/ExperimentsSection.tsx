import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Beaker, Play, Eye, Zap, Shield, BarChart3, FileText } from "lucide-react";
import EffectOfQubitsExperiment from "./experiments/EffectOfQubits/EffectOfQubitsExperiment";
import EffectOfChannelNoiseExperiment from "./experiments/EffectOfChannelNoise/EffectOfChannelNoiseExperiment";
import WithoutEavesdropperExperiment from "./experiments/WithoutEavesdropper/WithoutEavesdropperExperiment";
import WithEavesdropperExperiment from "./experiments/WithEavesdropper/WithEavesdropperExperiment";
import EffectOfDistanceExperiment from "./experiments/EffectOfDistance/EffectOfDistanceExperiment";
import OverallAnalysisExperiment from "./experiments/OverallAnalysis/OverallAnalysisExperiment";
import { ExperimentResult } from "./experiments/common/types";
export type { ExperimentResult };

const experimentConfigs = [
  {
    id: "effect-of-qubits",
    name: "Effect of Qubits",
    description: "Explore how the number of qubits affects the BB84 protocol performance and key generation process",
    icon: BarChart3,
    color: "quantum-blue",
  },
  {
    id: "effect-of-channel-noise",
    name: "Effect of Channel Noise",
    description: "Analyze how quantum channel noise impacts the success rate and error rate of the BB84 protocol",
    icon: Beaker,
    color: "quantum-blue",
  },
  {
    id: "with-eavesdropper", 
    name: "With Eavesdropper",
    description: "Simulate BB84 protocol with an eavesdropper using random basis selection",
    icon: Eye,
    color: "quantum-blue",
  },
  {
    id: "effect-of-distance",
    name: "Effect of Distance",
    description: "Study how transmission distance affects the fidelity and success rate of quantum key distribution",
    icon: Zap,
    color: "quantum-blue",
  },
  {
    id: "overall",
    name: "Overall Analysis",
    description: "Comprehensive analysis combining all factors and their cumulative effects on BB84 protocol",
    icon: FileText,
    color: "quantum-blue",
  }
];

export const ExperimentsSection = ({ onSaveExperiment }: { onSaveExperiment?: (result: ExperimentResult) => void }) => {
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ExperimentResult | null>(null);
  const [metrics, setMetrics] = useState<Array<{ name: string; value: number }>>([]);

  // Google Charts loader
  const loadGoogleCharts = useCallback(() => {
    return new Promise((resolve, reject) => {
      if ((window as any).google) {
        (window as any).google.load('visualization', '1', { packages: ['corechart', 'bar'] });
        (window as any).google.setOnLoadCallback(() => resolve((window as any).google));
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/charts/loader.js';
      script.async = true;
      script.onload = () => {
        (window as any).google.charts.load('current', { packages: ['corechart', 'bar'] });
        (window as any).google.charts.setOnLoadCallback(() => resolve((window as any).google));
      };
      script.onerror = () => reject(new Error('Failed to load Google Charts'));
      document.head.appendChild(script);
    });
  }, []);

  const renderMetricBarChart = useCallback((containerId: string, label: string, value: number, color: string, hAxisTitle: string) => {
    const google = (window as any).google;
    const container = document.getElementById(containerId);
    if (!google || !container) return;

    const dataTable = google.visualization.arrayToDataTable([
      ['Metric', 'Value'],
      [label, value],
    ]);

    const options = {
      chartArea: { width: '75%', height: '70%' },
      hAxis: {
        title: hAxisTitle,
        minValue: 0,
      },
      vAxis: {
        textPosition: 'none',
      },
      colors: [color],
      legend: { position: 'none' },
    } as any;

    const chart = new google.visualization.BarChart(container);
    chart.draw(dataTable, options);
  }, []);

  const computeMetricsFromResult = useCallback((result: ExperimentResult) => {
    const bits = result.usedBits || [];
    if (bits.length === 0) {
      setMetrics([]);
      return;
    }
    const totalBits = bits.length;
    const matchingBases = bits.filter(b => b.match).length;
    const keyBits = bits.filter(b => b.kept).length;
    const mismatches = bits.filter(b => typeof b.bobMeasurement === 'number' && b.aliceBit !== b.bobMeasurement).length;
    const qber = totalBits > 0 ? (mismatches / totalBits) * 100 : 0;
    setMetrics([
      { name: 'Total Bits', value: totalBits },
      { name: 'Matching Bases', value: matchingBases },
      { name: 'Key Bits', value: keyBits },
      { name: 'QBER (%)', value: Number(qber.toFixed(2)) },
    ]);
  }, []);

  const analysisSummary = useMemo(() => {
    const totalBitsMetric = metrics.find((metric) => metric.name === 'Total Bits');
    const matchingBasesMetric = metrics.find((metric) => metric.name === 'Matching Bases');
    const keyBitsMetric = metrics.find((metric) => metric.name === 'Key Bits');
    const qberMetric = metrics.find((metric) => metric.name === 'QBER (%)');

    if (!totalBitsMetric || !matchingBasesMetric || !keyBitsMetric || !qberMetric) {
      return '';
    }

    const totalBits = totalBitsMetric.value;
    const matchingBases = matchingBasesMetric.value;
    const keyBits = keyBitsMetric.value;
    const qber = qberMetric.value;

    if (totalBits === 0) {
      return 'No bits were processed in this experiment run, so no key material was generated.';
    }

    const matchingRate = (matchingBases / totalBits) * 100;
    const siftedRate = (keyBits / totalBits) * 100;

    let channelAssessment = 'significant disturbance in the channel.';
    if (qber < 5) {
      channelAssessment = 'a high-fidelity quantum channel.';
    } else if (qber < 15) {
      channelAssessment = 'moderate noise that may require additional error correction.';
    }

    return `Out of ${totalBits} transmitted bits, ${matchingBases} (${matchingRate.toFixed(1)}%) bases matched and ${keyBits} (${siftedRate.toFixed(1)}%) bits were retained for the key. The QBER is ${qber.toFixed(2)}%, indicating ${channelAssessment}`;
  }, [metrics]);

  useEffect(() => {
    if (!lastResult) return;
    computeMetricsFromResult(lastResult);
  }, [lastResult, computeMetricsFromResult]);

  useEffect(() => {
    if (metrics.length === 0) return;
    loadGoogleCharts().then(() => {
      const totalBits = Number(metrics[0]?.value || 0);
      const matchingBases = Number(metrics[1]?.value || 0);
      const keyBits = Number(metrics[2]?.value || 0);
      const qber = Number(metrics[3]?.value || 0);

      renderMetricBarChart('exp-chart-total-bits', 'Total Bits', totalBits, '#3b82f6', 'Count');
      renderMetricBarChart('exp-chart-matching-bases', 'Matching Bases', matchingBases, '#2563eb', 'Count');
      renderMetricBarChart('exp-chart-key-bits', 'Key Bits', keyBits, '#7c3aed', 'Count');
      renderMetricBarChart('exp-chart-qber', 'QBER (%)', qber, '#f59e0b', 'Percentage');
    }).catch(() => {
      // no-op fallback
    });
  }, [metrics, loadGoogleCharts, renderMetricBarChart]);

  const handleSaveExperiment = (result: ExperimentResult) => {
    setLastResult(result);
    if (onSaveExperiment) onSaveExperiment(result);
  };

  const renderExperiment = () => {
    switch (selectedExperiment) {
      case "effect-of-qubits":
        return <EffectOfQubitsExperiment onSaveExperiment={handleSaveExperiment} />;
      case "effect-of-channel-noise":
        return <EffectOfChannelNoiseExperiment onSaveExperiment={handleSaveExperiment} />;
      case "with-eavesdropper":
        return <WithEavesdropperExperiment onSaveExperiment={handleSaveExperiment} />;
      case "effect-of-distance":
        return <EffectOfDistanceExperiment onSaveExperiment={handleSaveExperiment} />;
      case "overall":
        return <OverallAnalysisExperiment onSaveExperiment={handleSaveExperiment} />;
      default:
        return (
          <div className="text-center p-8 text-muted-foreground">
            Select an experiment to begin
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-quantum-glow">
        <CardHeader>
          <CardTitle className="text-quantum-blue flex items-center gap-2">
            <Beaker className="w-6 h-6" />
            Quantum Cryptography Experiments
          </CardTitle>
          <p className="text-muted-foreground">
            Conduct systematic experiments to understand BB84 protocol behavior under various conditions
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {experimentConfigs.map((experiment) => {
              const Icon = experiment.icon;
              
              return (
                <Card 
                  key={experiment.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedExperiment === experiment.id 
                      ? `border-${experiment.color} bg-${experiment.color}/10 quantum-glow`
                      : 'border-muted-foreground/20 hover:border-quantum-glow/50'
                  }`}
                  onClick={() => setSelectedExperiment(experiment.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full bg-${experiment.color}/20`}>
                        <Icon className={`w-5 h-5 text-${experiment.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1 flex items-center gap-2">
                          {experiment.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{experiment.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {selectedExperiment && renderExperiment()}

        {lastResult && metrics.length === 4 && (
          <Card className="border-quantum-glow mt-4">
            <CardHeader>
              <CardTitle className="text-quantum-glow">
                Experiment Analysis
              </CardTitle>
              {analysisSummary && (
                <p className="text-muted-foreground text-sm">{analysisSummary}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-secondary/20">
                  <CardHeader>
                    <CardTitle className="text-sm">Total Bits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64" id="exp-chart-total-bits"></div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/20">
                  <CardHeader>
                    <CardTitle className="text-sm">Matching Bases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64" id="exp-chart-matching-bases"></div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/20">
                  <CardHeader>
                    <CardTitle className="text-sm">Key Bits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64" id="exp-chart-key-bits"></div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/20">
                  <CardHeader>
                    <CardTitle className="text-sm">QBER (%)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64" id="exp-chart-qber"></div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};