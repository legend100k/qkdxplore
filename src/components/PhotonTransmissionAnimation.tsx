import { Eye } from "lucide-react";

interface PhotonTransmissionAnimationProps {
  photonPosition: number;
  eavesdroppingRate?: number;
  className?: string;
}

export const PhotonTransmissionAnimation = ({ 
  photonPosition, 
  eavesdroppingRate = 0,
  className = ""
}: PhotonTransmissionAnimationProps) => {
  return (
    <div className={`relative h-20 bg-muted rounded-lg overflow-hidden ${className}`}>
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-quantum-blue font-bold">
        Alice
      </div>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-quantum-purple font-bold">
        Bob
      </div>
      <div 
        className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-quantum-glow rounded-full transition-all duration-100"
        style={{ left: `${photonPosition}%` }}
      >
      </div>
      {eavesdroppingRate > 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-destructive font-bold">
          <Eye className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};