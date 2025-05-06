import { FormEvent, useState, useEffect } from 'react';
import styles from './MetronomeSettings.module.css';

export interface MetronomeSettingsValues {
    bpm: number;
    strongBeat: number;
    sound: string;
}

interface MetronomeSettingsProps {
    values: MetronomeSettingsValues;
    onChange: (values: MetronomeSettingsValues) => void;
    disabled?: boolean;
}

export const MetronomeSettings = ({
    values,
    onChange,
    disabled = false,
}: MetronomeSettingsProps) => {
    const [bpm, setBpm] = useState(values.bpm);
    const [strongBeat, setStrongBeat] = useState(values.strongBeat);
    const [sound, setSound] = useState(values.sound);

    // при старте/смене settings подтягиваем внешние values
    useEffect(() => {
        setBpm(values.bpm);
        setStrongBeat(values.strongBeat);
        setSound(values.sound);
    }, [values]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onChange({ bpm, strongBeat, sound });
    };

    return (
        <form
            className={styles.panel}
            onBlur={handleSubmit}
            onSubmit={handleSubmit}
        >
            <div className={styles.field}>
                <label>Темп (BPM):</label>
                <input
                    type="number"
                    min={40}
                    max={240}
                    value={bpm}
                    disabled={!disabled}
                    onChange={e => setBpm(+e.target.value)}
                />
            </div>
            <div className={styles.field}>
                <label>Сильная доля:</label>
                <input
                    type="number"
                    min={2}
                    max={16}
                    value={strongBeat}
                    disabled={!disabled}
                    onChange={e => setStrongBeat(+e.target.value)}
                />
            </div>
            <div className={styles.field}>
                <label>Звук:</label>
                <select
                    value={sound}
                    disabled={!disabled}
                    onChange={e => setSound(e.target.value)}
                >
                    <option value="click">Click</option>
                    <option value="beep">Beep</option>
                    <option value="tick">Tick</option>
                </select>
            </div>
        </form>
    );
};


