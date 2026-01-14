
import { useCallback } from 'react';

export const useSound = () => {
    const playSound = useCallback((type: 'move' | 'capture' | 'check' | 'win') => {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const context = new AudioContext();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        const now = context.currentTime;

        switch (type) {
            case 'move':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(400, now);
                oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;
            case 'capture':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.2);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.2);
                break;
            case 'check':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.setValueAtTime(800, now + 0.1);
                oscillator.frequency.setValueAtTime(1000, now + 0.2);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;
            case 'win':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523.25, now); // C5
                oscillator.frequency.setValueAtTime(659.25, now + 0.2); // E5
                oscillator.frequency.setValueAtTime(783.99, now + 0.4); // G5
                oscillator.frequency.setValueAtTime(1046.50, now + 0.6); // C6
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
                oscillator.start(now);
                oscillator.stop(now + 1.0);
                break;
        }
    }, []);

    return { playSound };
};
