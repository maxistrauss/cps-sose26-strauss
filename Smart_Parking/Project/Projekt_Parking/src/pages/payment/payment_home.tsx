import { useEffect, useState } from "react";
import AppShell from "../../layouts/AppShell";
import { fetchSessionByPlate } from "../../api/paymentsApi";
import { ApiError } from "../../api/apiClient";

const letterRows = [
  ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
  ["J", "K", "L", "M", "N", "O", "P", "Q", "R"],
  ["S", "T", "U", "V", "W", "X", "Y", "Z", "-"],
];

const numberRows = [
  ["0", "1", "2", "3", "4"],
  ["5", "6", "7", "8", "9"],
];

function sanitizePlateInput(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9 -]/g, "");
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(value);
}

type PaymentHomeProps = {
  onBack?: () => void;
  onContinue?: (plate: string) => void;
};

function PaymentHome({ onBack, onContinue }: PaymentHomeProps) {
  const [now, setNow] = useState(() => new Date());
  const [plate, setPlate] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error" | "idle">("idle");
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  function handleKeypadPress(value: string) {
    setPlate((current) => `${current}${value}`);
    setFeedback("");
    setFeedbackTone("idle");
  }

  async function handleCheckPlate() {
    const trimmed = plate.trim();
    if (!trimmed) return;

    setIsChecking(true);
    setFeedback("");
    setFeedbackTone("idle");

    try {
      await fetchSessionByPlate(trimmed);
      setFeedback("Kennzeichen gefunden. Weiterleitung zum Bezahlvorgang…");
      setFeedbackTone("success");
      onContinue?.(trimmed);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setFeedback("Kennzeichen nicht gefunden. Bitte prüfe die Eingabe.");
      } else if (err instanceof ApiError && err.status === 0) {
        setFeedback("Server nicht erreichbar. Bitte versuche es erneut.");
      } else {
        setFeedback("Fehler bei der Abfrage. Bitte versuche es erneut.");
      }
      setFeedbackTone("error");
    } finally {
      setIsChecking(false);
    }
  }

  function handleClear() {
    setPlate("");
    setFeedback("");
    setFeedbackTone("idle");
  }

  return (
    <AppShell>
      <section className="flex min-h-screen flex-col bg-slate-100 px-6 py-6">
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="inline-flex rounded-2xl bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm">
              {formatDateTime(now)}
            </div>
            <button
              type="button"
              onClick={onBack}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              Zurück
            </button>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-[75vw] max-w-[1200px] rounded-[2rem] bg-white p-8 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              Bezahl-Dashboard
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              Kennzeichen eingeben
            </h1>
            <p className="mt-3 text-base text-slate-600">
              Gib das Kennzeichen ein oder nutze die Tasten für Buchstaben und Zahlen.
            </p>

            <div className="mt-8">
              <label
                htmlFor="plate-input"
                className="mb-3 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-500"
              >
                Kennzeichen
              </label>
              <input
                id="plate-input"
                type="text"
                value={plate}
                onChange={(event) => {
                  setPlate(sanitizePlateInput(event.target.value));
                  setFeedback("");
                  setFeedbackTone("idle");
                }}
                placeholder="R-AB 1234"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5 text-center text-3xl font-semibold tracking-[0.18em] text-slate-950 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>

            {feedbackTone !== "idle" && feedback ? (
              <div
                className={`mt-4 rounded-2xl px-5 py-4 text-sm font-semibold ${
                  feedbackTone === "error"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {feedback}
              </div>
            ) : null}

            <div className="mt-8 space-y-2.5">
              {letterRows.map((row, index) => (
                <div key={`letters-${index}`} className="grid grid-cols-9 gap-2">
                  {row.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleKeypadPress(value)}
                      className="rounded-xl bg-slate-700 px-2 py-2.5 text-base font-semibold text-white shadow-md transition hover:bg-slate-600"
                    >
                      {value}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              {numberRows.map((row, index) => (
                <div key={`numbers-${index}`} className="grid grid-cols-5 gap-4">
                  {row.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleKeypadPress(value)}
                      className="rounded-xl bg-slate-700 px-2 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-slate-600"
                    >
                      {value}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-4">
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 rounded-2xl border border-slate-300 px-5 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Leeren
              </button>
              <button
                type="button"
                onClick={handleCheckPlate}
                disabled={!plate.trim() || isChecking}
                className="flex-1 rounded-2xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {isChecking ? "Suche läuft…" : "Bezahlen"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export default PaymentHome;
