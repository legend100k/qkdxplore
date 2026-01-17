"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useSimulationStore } from "@/lib/simulationStore";

interface ControlPanelProps {
  // Add any props if needed
}

export function ControlPanel({}: ControlPanelProps) {
  const {
    voltage,
    frequency,
    mass,
    temperature,
    particleCount,
    isRunning,
    showGrid,
    setVoltage,
    setFrequency,
    setMass,
    setTemperature,
    setParticleCount,
    setIsRunning,
    setShowGrid,
    resetSimulation
  } = useSimulationStore();

  const handleRunSimulation = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    resetSimulation();
  };

  const handleVoltageChange = (value: number[]) => {
    setVoltage(value[0]);
  };

  const handleFrequencyChange = (value: number[]) => {
    setFrequency(value[0]);
  };

  const handleMassChange = (value: number[]) => {
    setMass(value[0]);
  };

  const handleTemperatureChange = (value: number[]) => {
    setTemperature(value[0]);
  };

  return (
    <Card className="h-full border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Simulation Controls</CardTitle>
            <CardDescription className="text-xs">Adjust parameters to run your experiment</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={handleRunSimulation}
              className={`${isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isRunning ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {isRunning ? "Pause" : "Run"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <Label htmlFor="voltage" className="text-sm font-medium">Voltage (V)</Label>
              <span className="text-sm text-slate-500">{voltage}V</span>
            </div>
            <Slider
              id="voltage"
              min={0}
              max={20}
              step={0.1}
              value={[voltage]}
              onValueChange={handleVoltageChange}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label htmlFor="frequency" className="text-sm font-medium">Frequency (Hz)</Label>
              <span className="text-sm text-slate-500">{frequency}Hz</span>
            </div>
            <Slider
              id="frequency"
              min={0}
              max={1000}
              step={1}
              value={[frequency]}
              onValueChange={handleFrequencyChange}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label htmlFor="mass" className="text-sm font-medium">Mass (kg)</Label>
              <span className="text-sm text-slate-500">{mass}kg</span>
            </div>
            <Slider
              id="mass"
              min={0.1}
              max={10}
              step={0.1}
              value={[mass]}
              onValueChange={handleMassChange}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label htmlFor="temperature" className="text-sm font-medium">Temperature (°C)</Label>
              <span className="text-sm text-slate-500">{temperature}°C</span>
            </div>
            <Slider
              id="temperature"
              min={-50}
              max={100}
              step={1}
              value={[temperature]}
              onValueChange={handleTemperatureChange}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label htmlFor="particles" className="text-sm font-medium">Particle Count</Label>
            </div>
            <Input
              id="particles"
              type="number"
              value={particleCount}
              onChange={(e) => setParticleCount(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Label htmlFor="grid" className="text-sm font-medium">Show Grid</Label>
            <Switch
              id="grid"
              checked={showGrid}
              onCheckedChange={setShowGrid}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}