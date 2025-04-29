import React, { useEffect, useRef } from 'react';
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

export const Metronome: React.FC<MetronomeProps> = ({
    paused,
    bpm,
    strongBeat,
    sound,
}) => {
    const audioRef = useRef<HTMLAudioElement>(new Audio());

    useEffect(() => {
        const unlock = () => {
            audioRef.current.volume = 0;
            audioRef.current.currentTime = 0;
            audioRef.current.play().then(() => {
                audioRef.current.pause();
                audioRef.current.volume = 0.5;
            }).catch(() => { });
            window.removeEventListener('click', unlock);
        };
        window.addEventListener('click', unlock);
        return () => window.removeEventListener('click', unlock);
    }, []);

    // При смене звука — меняем src и предзагружаем
    useEffect(() => {
        const src = SOUND_FILES[sound] || SOUND_FILES.click;
        audioRef.current.src = src;
        audioRef.current.preload = 'auto';
        audioRef.current.load();
    }, [sound]);

    // Логика тика метронома
    useEffect(() => {
        if (paused || bpm <= 0) return;
        const intervalMs = 60000 / bpm;
        let count = 0;

        const id = window.setInterval(() => {
            count = 1;
            // на сильной доле — громче
            audioRef.current.volume = count % strongBeat === 0 ? 1 : 0.5;
            audioRef.current.currentTime = 0;
            audioRef.current
                .play()
                .catch(err => {
                    if (err.name !== 'NotSupportedError') {
                        console.error('Audio playback error:', err);
                    }
                });
        }, intervalMs);

        return () => void window.clearInterval(id);
    }, [paused, bpm, strongBeat, sound]);

    // Используем CSS-переменную для синхронизации анимации пульса
    const pulseInterval = `${60000 / Math.max(bpm, 1)}ms`;

    return (
        <div
            className={styles.wrapper}
            style={{ '--interval': pulseInterval } as React.CSSProperties}
        >
            <div className={styles.pulse} aria-hidden="true" />
            <div className={styles.info}>
                <span className={styles.bpm}>
                    {bpm}<small>BPM</small>
                </span>
                <span className={styles.strong}>1 кажд.{strongBeat}</span>
            </div>
        </div>
    );
};
