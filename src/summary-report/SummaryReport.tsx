import { MetronomeSettingsValues } from '../metronome/MetronomeSettings';
import { SessionSettings } from '../setup-form/SetupForm';
import styles from './SummaryReport.module.css';

export interface SessionResult {
    angle: number;
    time: number; // в секундах
    countL: number;
    countR: number;
    errors: Record<string, number>;
    settings: SessionSettings;
    metroSettings: MetronomeSettingsValues;
}

interface SummaryReportProps {
    results: SessionResult[];
    onExport: (data: SessionResult[]) => void;
    onReset: () => void;
}

export const SummaryReport = ({
    results,
    onExport,
    onReset,
}: SummaryReportProps) => {
    const totalL = results.reduce((sum, r) => sum + r.countL, 0);
    const totalR = results.reduce((sum, r) => sum + r.countR, 0);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Итоги упражнения</h2>
            {results.map(r => (
                <div key={r.angle} className="result-block">
                    <h3>
                        {r.angle}°: время {r.time}s,
                        Левой {r.countL}, Правой {r.countR}
                    </h3>
                    <ul>
                        {Object.entries(r.errors).map(([errText, cnt]) => (
                            <li key={errText}>
                                {errText}: {cnt}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
            <p className={styles.total}>
                <strong>Всего повторений левой:</strong> {totalL},&nbsp;
                <strong>правой:</strong> {totalR}
            </p>
            <div className={styles.containerButton}>
                <button
                    className={styles.button}
                    style={{ background: 'transparent', color: 'black' }}
                    onClick={onReset}
                >
                    ← Начать заново
                </button>
                <button className={styles.button} onClick={() => onExport(results)}>
                    Скачать PDF
                </button>
            </div>
        </div>
    );
}