import { useState, useRef, useEffect } from "react";
import { SessionSettings, SetupForm } from "../setup-form/SetupForm";
import { SessionResult, SummaryReport } from "../summary-report/SummaryReport";
import { Metronome } from "../metronome/Metronome";
import { MetronomeSettings, MetronomeSettingsValues } from "../metronome/MetronomeSettings";
import MPHandsPillow from "../training/MPHandsPillow";
import styles from "./App.module.css";
import { PlayIcon } from "../icon/PlayIcon";
import { ClockIcon } from "../icon/ClockIcon";
import { PauseIcon } from "../icon/PauseIcon";
import { exportPDF } from "./exportPDF";
import { useIsMobile } from "../utils/useIsMobile";


const App = () => {
  const isMobile = useIsMobile();
  const [settings, setSettings] = useState<SessionSettings | null>(null);
  const [patientName, setPatientName] = useState<string>('');
  const [metroSettings, setMetroSettings] = useState<MetronomeSettingsValues>({
    bpm: 60,
    strongBeat: 4,
    sound: "click",
  });
  const [paused, setPaused] = useState<boolean>(false);
  const [results, setResults] = useState<SessionResult[]>([]);

  const [instruction, setInstruction] = useState<string>("");
  const [suggest, setSuggest] = useState<string>("");
  const [camError, setCamError] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [errorsMap, setErrorsMap] = useState<Record<string, number>>({});

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const startRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const handleStart = (opts: SessionSettings) => {
    setPaused(false);
    setInstruction("");
    setSuggest("");
    setCamError(false);
    setCount(0);
    setErrorsMap({});
    startRef.current = Date.now();
    setTimeLeft(opts.duration);
    setResults([]);
    setSettings(opts);
    setPatientName(opts.patientName);
  };

  const handlePauseToggle = () => {
    setPaused(p => !p);
  };

  const handleReset = () => {
    setSettings(null);
    setResults([]);
    setPatientName('');
  };


  // Countdown timer
  useEffect(() => {
    if (!settings) return;
    if (paused) {
      if (timerRef.current !== null) clearInterval(timerRef.current);
      return;
    }
    if (timerRef.current !== null) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => Math.max(t - 1, 0));
    }, 1000);
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, [settings, paused]);

  // End session when time runs out
  useEffect(() => {
    if (settings && timeLeft === 0) {
      const elapsed = Math.round((Date.now() - startRef.current) / 1000);
      const sessionResult: SessionResult = {
        angle: settings.angle,
        time: elapsed,
        count,
        errors: errorsMap,
      };
      setResults(rs => [...rs, sessionResult]);
      setSettings(null);
    }
  }, [timeLeft, settings, count, errorsMap]);

  const onInstruction = (text: string) => setInstruction(text);
  const onSuggest = (text: string) => setSuggest(text);
  const onCameraError = () => setCamError(true);
  const onCount = () => setCount(c => c + 1);
  const onCountError = (err: string) => {
    setErrorsMap(m => ({
      ...m,
      [err]: (m[err] || 0) + 1
    }));
  };

  // Начальный экран
  if (!settings && results.length === 0) {
    return <SetupForm onStart={handleStart} />;
  }

  // После завершения
  if (!settings && results.length > 0) {
    return <SummaryReport results={results}
      onExport={(data) => exportPDF(patientName, data)}
      onReset={handleReset} />;
  }

  // Во время сессии
  return (
    <div className={styles.container}>
      <div className={styles.headerBar}>
        <div className={styles.headerBarButtons}>
          <button
            className={styles.resetBtn}
            onClick={handleReset}
            disabled={!settings}
          >
            ← Начальный этап
          </button>
          <button
            className={styles.iconButton}
            onClick={handlePauseToggle}
            aria-label={paused ? "Возобновить" : "Пауза"}
          >
            {paused ? <PlayIcon /> : <PauseIcon />}
          </button>

          <div className={styles.timer} role="timer" aria-live="off">
            <ClockIcon />
            <span className={styles.timeValue}>{timeLeft}s</span>
          </div>
        </div>
        {!isMobile && (
          <Metronome
            paused={paused}
            bpm={metroSettings.bpm}
            strongBeat={metroSettings.strongBeat}
            sound={metroSettings.sound}
          />
        )}
      </div>
      <div className={styles.mpContainer}>
        <MPHandsPillow
          degree={settings!.angle}
          line={settings!.line}
          paused={paused}
          onInstruction={onInstruction}
          onCameraError={onCameraError}
          onSuggest={onSuggest}
          onCount={onCount}
          onCountError={onCountError}
        />
        {settings && paused && !isMobile && (
          <div className={styles.metronomeEditor}>
            <MetronomeSettings
              values={metroSettings}
              onChange={setMetroSettings}
              disabled={paused}
            />
          </div>
        )}
      </div>

      <div className={styles.bottomPanel}>
        <p className={styles.instruction}>
          <strong>Инструкция:</strong> {instruction}
        </p>
        <p className={styles.suggest}>
          <strong>Подсказка:</strong> {suggest}
        </p>
        {camError && <p className={styles.error}>Ошибка доступа к камере!</p>}
      </div>
    </div>
  );
};

export default App;
