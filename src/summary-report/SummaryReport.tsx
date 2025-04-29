import styles from './SummaryReport.module.css';

export interface SessionResult {
    angle: number;
    time: number; // в секундах
    count: number; // число повторений
    errors: Record<string, number>;
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
    const totalReps = results.reduce((sum, r) => sum + r.count, 0);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Итоги упражнения</h2>
            {results.map(r => (
                <div key={r.angle} className="result-block">
                    <h3>{r.angle}°: время {r.time}s, повторений {r.count}</h3>
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
                <strong>Общее число повторений:</strong> {totalReps}
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