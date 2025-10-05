import React, { useState } from "react";
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

  const renderExperiment = () => {
    switch (selectedExperiment) {
      case "effect-of-qubits":
        return <EffectOfQubitsExperiment onSaveExperiment={onSaveExperiment} />;
      case "effect-of-channel-noise":
        return <EffectOfChannelNoiseExperiment onSaveExperiment={onSaveExperiment} />;
      case "with-eavesdropper":
        return <WithEavesdropperExperiment onSaveExperiment={onSaveExperiment} />;
      case "effect-of-distance":
        return <EffectOfDistanceExperiment onSaveExperiment={onSaveExperiment} />;
      case "overall":
        return <OverallAnalysisExperiment onSaveExperiment={onSaveExperiment} />;
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
      </div>
    </div>
  );
};