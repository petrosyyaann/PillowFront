import React, { useEffect, useRef, useState } from 'react';
import styles from './Metronome.module.css';
import clickSound from '../sounds/click.mp3';
import beepSound from '../sounds/beep.mp3';
import tickSound from '../sounds/tick.mp3';

const SOUND_FILES: Record<string, string> = {
    click: clickSound,
    beep: beepSound,
    tick: tickSound,
};

interface MetronomeProps {
    paused: boolean;
    bpm: number;
    strongBeat: number;
    sound: keyof typeof SOUND_FILES;
}

export const Metronome: React.FC<MetronomeProps> = ({ paused, bpm, strongBeat, sound }) => {
    const weakAudioRef = useRef<HTMLAudioElement>(new Audio());
    const strongAudioRef = useRef<HTMLAudioElement>(new Audio());
    const [isStrongPulse, setIsStrongPulse] = useState(false);

    // Разблокировка аудио на первом клике пользователя
    useEffect(() => {
        const unlock = () => {
            [weakAudioRef.current, strongAudioRef.current].forEach(audio => {
                audio.volume = 0;
                audio.currentTime = 0;
                audio.play().then(() => {
                    audio.pause();
                    // Восстанавливаем уровни громкости
                    weakAudioRef.current.volume = 0.5;
                    strongAudioRef.current.volume = 1;
                }).catch(() => { });
            });
            window.removeEventListener('click', unlock);
        };
        window.addEventListener('click', unlock);
        return () => window.removeEventListener('click', unlock);
    }, []);

    // Предзагрузка звуков
    useEffect(() => {
        weakAudioRef.current.src = SOUND_FILES[sound] || SOUND_FILES.click;
        weakAudioRef.current.preload = 'auto';
        weakAudioRef.current.load();

        strongAudioRef.current.src = sound !== 'click' ? SOUND_FILES.click : SOUND_FILES.tick;
        strongAudioRef.current.preload = 'auto';
        strongAudioRef.current.load();
    }, [sound]);

    // Логика тика метронома
    useEffect(() => {
        if (paused || bpm <= 0) return;
        const intervalMs = 60000 / bpm;
        let count = 0;

        const id = window.setInterval(() => {
            count++;
            const isStrong = count % strongBeat === 0;
            setIsStrongPulse(isStrong);

            const player = isStrong ? strongAudioRef.current : weakAudioRef.current;
            player.volume = isStrong ? 1 : 0.5;
            player.currentTime = 0;
            player.play().catch(err => {
                if (err.name !== 'NotSupportedError') {
                    console.error('Audio playback error:', err);
                }
            });
        }, intervalMs);

        return () => void window.clearInterval(id);
    }, [paused, bpm, strongBeat, sound]);

    // Интервал для CSS-анимации пульса
    const pulseInterval = `${60000 / Math.max(bpm, 1)}ms`;

    return (
        <div
            className={styles.wrapper}
            style={{ '--interval': pulseInterval } as React.CSSProperties}
        >
            <div
                className={`${styles.pulse} ${isStrongPulse ? styles.pulseStrong : ''}`}
                aria-hidden="true"
            />
            <div className={styles.info}>
                <span className={styles.bpm}>
                    {bpm}<small>BPM</small>
                </span>
                <span className={styles.strong}>1 каждые {strongBeat}</span>
            </div>
        </div>
    );
};
