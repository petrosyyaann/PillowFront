import React, { useState, FormEvent } from "react";
import styles from "./SetupForm.module.css";

export interface SessionSettings {
    patientName: string; // ФИО пациента
    angle: number;      // угол 40–100°
    duration: number;   // длительность в секундах
    line: number;       // толщина/позиция линии
    bpm: number;        // темп метронома
    strongBeat: number; // сильная доля раз в X
    sound: string;      // название звука
}

interface SetupFormProps {
    onStart: (settings: SessionSettings) => void;
}

export const SetupForm: React.FC<SetupFormProps> = ({ onStart }) => {
    const [patientName, setPatientName] = useState<string>('');
    const [angle, setAngle] = useState<number>(60);
    const [duration, setDuration] = useState<number>(60);
    const [line, setLine] = useState<number>(0.11);
    const [bpm, setBpm] = useState<number>(60);
    const [strongBeat, setStrongBeat] = useState<number>(4);
    const [sound, setSound] = useState<string>("click");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onStart({ patientName, angle, duration, line, bpm, strongBeat, sound });
    };

    return (
        <form onSubmit={handleSubmit} className={styles.container}>
            <h2 className={styles.title}>Параметры сессии</h2>
            <div className={styles.field}>
                <label className={styles.label}>ФИО пациента:</label>
                <input
                    type="text"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    className={styles.input}
                    placeholder="Иванов Иван Иванович"
                    required
                />
            </div>
            <div className={styles.field}>
                <label className={styles.label}>Угол (10–180°):</label>
                <input
                    type="number"
                    min={0}
                    max={180}
                    value={angle}
                    onChange={e => setAngle(+e.target.value)}
                    className={styles.input}
                />
                <span className={styles.unit}>°</span>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Время (сек):</label>
                <input
                    type="number"
                    min={0}
                    value={duration}
                    onChange={e => setDuration(+e.target.value)}
                    className={styles.input}
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Линия (0.01–1):</label>
                <input
                    type="number"
                    step={0.01}
                    min={0.01}
                    max={1}
                    value={line}
                    onChange={e => setLine(+e.target.value)}
                    className={styles.input}
                />
            </div>

            <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Метроном</legend>
                <div className={styles.field}>
                    <label className={styles.label}>Темп (BPM):</label>
                    <input
                        type="number"
                        min={40}
                        max={240}
                        value={bpm}
                        onChange={e => setBpm(+e.target.value)}
                        className={styles.input}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Сильная доля (раз в X):</label>
                    <input
                        type="number"
                        min={2}
                        max={16}
                        value={strongBeat}
                        onChange={e => setStrongBeat(+e.target.value)}
                        className={styles.input}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Звук:</label>
                    <select
                        value={sound}
                        onChange={e => setSound(e.target.value)}
                        className={styles.select}
                    >
                        <option value="click">Клик</option>
                        <option value="beep">Бип</option>
                        <option value="tick">Тик</option>
                    </select>
                </div>
            </fieldset>

            <button type="submit" className={styles.button}>
                Начать упражнение
            </button>
        </form>
    );
};
