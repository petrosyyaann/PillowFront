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
  const [summarySettings, setSummarySettings] = useState<SessionSettings | null>(null);
  const [summaryMetroSettings, setSummaryMetroSettings] = useState<MetronomeSettingsValues | null>(null);

  const [instruction, setInstruction] = useState<string>("");
  const [camError, setCamError] = useState<boolean>(false);
  const [countL, setCountL] = useState<number>(0);
  const [countR, setCountR] = useState<number>(0);
  const [errorsMap, setErrorsMap] = useState<Record<string, number>>({});
  const [shadow, setShadow] = useState<string>("none");

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const startRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const handleStart = (opts: SessionSettings) => {
    setPaused(false);
    setInstruction("");
    setCamError(false);
    setCountL(0);
    setCountR(0);
    setErrorsMap({});
    startRef.current = Date.now();
    setTimeLeft(opts.duration);
    setResults([]);
    setMetroSettings({
      bpm: opts.bpm,
      strongBeat: opts.strongBeat,
      sound: opts.sound,
    });
    setSettings(opts);
    setPatientName(opts.patientName);
    setShadow("white")
  };

  const handlePauseToggle = () => {
    setPaused(p => !p);
    setShadow("white")
  };

  const handleReset = () => {
    setSettings(null);
    setResults([]);
    setPatientName('');
    setSummarySettings(null);
    setSummaryMetroSettings(null);
    setShadow("white")
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
        countL,
        countR,
        errors: errorsMap,
        settings: settings,
        metroSettings: metroSettings,
      };
      setResults(rs => [...rs, sessionResult]);
      setSummarySettings(settings);
      setSummaryMetroSettings(metroSettings);
      setSettings(null);
    }
  }, [timeLeft, settings, countL, countR, errorsMap, metroSettings]);

  const onInstruction = (text: string) => setInstruction(text);
  const onCameraError = () => setCamError(true);
  const onCountL = () => setCountL(c => c + 1);
  const onCountR = () => setCountR(c => c + 1);
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
  if (!settings && results.length > 0 && summarySettings && summaryMetroSettings) {
    return <SummaryReport
      results={results}
      onExport={(data) =>
        exportPDF(patientName, data, summarySettings, summaryMetroSettings)
      }
      onReset={handleReset} />;
  }

  // Во время сессии
  return (
    <div className={styles.container}>
      <div style={{
        paddingTop: isMobile ? '50px' : '0'
      }} className={styles.headerBar}>
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
        {!isMobile && !settings?.disableMetronome && (
          <Metronome
            paused={paused}
            bpm={metroSettings.bpm}
            strongBeat={metroSettings.strongBeat}
            sound={metroSettings.sound}
          />
        )}
      </div>

      <div
        className={styles.mpContainer}
        style={{
          backgroundColor: shadow,
          transition: "background-color 0.3s ease"
        }}
      >
        <MPHandsPillow
          onWhite={() =>
            setShadow("white")
          }
          onGreen={() =>
            setShadow("rgb(0, 161,68)")
          }
          onYellow={() =>
            setShadow("rgb(252, 234, 118)")
          }
          degree={settings!.angle}
          line={settings!.line}
          paused={paused}
          onInstruction={onInstruction}
          onCameraError={onCameraError}
          startArmLeft={settings!.startArmLeft}
          onCountL={onCountL}
          onCountR={onCountR}
          onCountError={onCountError}
        />
        {settings && paused && !isMobile && !settings?.disableMetronome && (
          <div className={styles.metronomeEditor}>
            <MetronomeSettings
              values={metroSettings}
              onChange={setMetroSettings}
              disabled={paused}
            />
          </div>
        )}
      </div>

      <div style={{
        marginBottom: isMobile ? '70px' : '0'
      }} className={styles.bottomPanel}>
        <p className={styles.instruction}>
          <strong>Инструкция:</strong> {instruction}
        </p>
        {camError && <p className={styles.error}>Ошибка доступа к камере!</p>}
      </div>
    </div>
  );
};

export default App;
