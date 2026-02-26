import { useEffect, useMemo } from 'react';

interface CelebrationProps {
  show: boolean;
  onComplete?: () => void;
}

// 彩纸粒子 - 自然飘落效果
interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  width: number;
  height: number;
  duration: number;
  drift: number;
  rotation: number;
}

const colors = ['#4D83FF', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'];

const pseudoRandom = (index: number, salt: number) => {
  const value = Math.sin(index * 12.9898 + salt * 78.233 + 0.1234) * 43758.5453;
  return value - Math.floor(value);
};

export default function Celebration({ show, onComplete }: CelebrationProps) {
  const particles = useMemo(() => {
    if (!show) return [];
    const newParticles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: pseudoRandom(i, 1) * 100,
        color: colors[Math.floor(pseudoRandom(i, 2) * colors.length)],
        delay: pseudoRandom(i, 3) * 0.6,
        width: 8 + pseudoRandom(i, 4) * 6,
        height: 6 + pseudoRandom(i, 5) * 6,
        duration: 2.5 + pseudoRandom(i, 6) * 1.5,
        drift: (pseudoRandom(i, 7) - 0.5) * 150,
        rotation: pseudoRandom(i, 8) * 720 - 360,
      });
    }
    return newParticles;
  }, [show]);

  useEffect(() => {
    if (!show) return undefined;
    const timer = setTimeout(() => {
      onComplete?.();
    }, 4500);
    return () => clearTimeout(timer);
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: '-20px',
            width: particle.width,
            height: particle.height,
            backgroundColor: particle.color,
            borderRadius: '2px',
            animation: `confetti-fall-${particle.id % 3} ${particle.duration}s ease-out ${particle.delay}s forwards`,
            transform: `translateX(${particle.drift * 0.1}px)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall-0 {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) translateX(30px) rotate(360deg); opacity: 0; }
        }
        @keyframes confetti-fall-1 {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) translateX(-40px) rotate(-360deg); opacity: 0; }
        }
        @keyframes confetti-fall-2 {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) translateX(20px) rotate(540deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
