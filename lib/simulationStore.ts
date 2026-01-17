import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface SimulationState {
  voltage: number;
  frequency: number;
  mass: number;
  temperature: number;
  particleCount: number;
  isRunning: boolean;
  showGrid: boolean;
  simulationData: { time: number; value: number }[];
  setVoltage: (voltage: number) => void;
  setFrequency: (frequency: number) => void;
  setMass: (mass: number) => void;
  setTemperature: (temperature: number) => void;
  setParticleCount: (count: number) => void;
  setIsRunning: (running: boolean) => void;
  setShowGrid: (show: boolean) => void;
  updateSimulationData: (data: { time: number; value: number }[]) => void;
  resetSimulation: () => void;
}

export const useSimulationStore = create<SimulationState>()(
  devtools(
    persist(
      (set, get) => ({
        voltage: 5,
        frequency: 100,
        mass: 1.5,
        temperature: 25,
        particleCount: 100,
        isRunning: false,
        showGrid: true,
        simulationData: [],
        
        setVoltage: (voltage) => set({ voltage }),
        setFrequency: (frequency) => set({ frequency }),
        setMass: (mass) => set({ mass }),
        setTemperature: (temperature) => set({ temperature }),
        setParticleCount: (count) => set({ particleCount: count }),
        setIsRunning: (isRunning) => set({ isRunning }),
        setShowGrid: (show) => set({ showGrid: show }),
        
        updateSimulationData: (data) => set({ simulationData: data }),
        
        resetSimulation: () => set({
          voltage: 5,
          frequency: 100,
          mass: 1.5,
          temperature: 25,
          particleCount: 100,
          isRunning: false,
          showGrid: true,
          simulationData: [],
        }),
      }),
      {
        name: 'simulation-storage',
      }
    )
  )
);