import { useEffect, useState } from "react";
import AppShell from "../../layouts/AppShell";
import { useFetch } from "../../hooks/useFetch";
import { fetchSessionByPlate, patchPaymentSession } from "../../api/paymentsApi";

type PaymentPriceProps = {
  plate: string;
  onBack?: () => void;
  onPaymentFinished?: () => void;
};

function formatTimestamp(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function PaymentPrice({ plate, onBack, onPaymentFinished }: PaymentPriceProps) {
  const { data: session, loading, error: loadError } = useFetch(
    () => fetchSessionByPlate(plate),
  );

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"card" | "paypal" | null>(null);
  const [paymentState, setPaymentState] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    if (paymentState !== "success") return;
    const timer = window.setTimeout(() => {
      setIsPaymentModalOpen(false);
      setPaymentState("idle");
      setSelectedMethod(null);
      onPaymentFinished?.();
    }, 60_000);
    return () => window.clearTimeout(timer);
  }, [onPaymentFinished, paymentState]);

  function handleStartPayment() {
    setIsPaymentModalOpen(true);
    setPaymentState("idle");
    setSelectedMethod(null);
    setPaymentError("");
  }

  async function handleConfirmPayment() {
    if (!selectedMethod || !session) return;

    setPaymentState("processing");
    setPaymentError("");

    try {
      const result = await patchPaymentSession(session.session_id);
      if (result.exit_valid_until) {
        setPaymentState("success");
      } else {
        setPaymentState("error");
        setPaymentError("Zahlung wurde gebucht, aber Ausfahrt noch nicht freigegeben.");
      }
    } catch (err) {
      setPaymentState("error");
      setPaymentError(err instanceof Error ? err.message : "Zahlung fehlgeschlagen.");
    }
  }

  function handleCloseModal() {
    setIsPaymentModalOpen(false);
    setPaymentState("idle");
    setSelectedMethod(null);
    setPaymentError("");
  }

  return (
    <AppShell>
      <section className="flex min-h-screen flex-col bg-slate-100 px-6 py-6">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div className="inline-flex rounded-2xl bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm">
            Aktuelles Kennzeichen: {plate}
          </div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            Zurück
          </button>
        </header>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              Bezahlvorgang
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              Zahlung
            </h1>

            {loading ? (
              <div className="mt-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-3xl bg-slate-100" />
                ))}
              </div>
            ) : loadError ? (
              <div className="mt-6 rounded-2xl bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-800">
                {loadError}
              </div>
            ) : session ? (
              <div className="mt-6 space-y-5">
                <div className="rounded-3xl bg-slate-50 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Kennzeichen
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">{session.plate}</p>
                </div>

                <div className="rounded-3xl border border-slate-200 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Angekommen am
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {formatTimestamp(session.entry_time)}
                  </p>
                </div>

                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    Zu zahlen
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-emerald-900">
                    {session.remaining_amount.toFixed(2)} EUR
                  </p>
                  {session.amount_paid > 0 && (
                    <p className="mt-1 text-sm text-emerald-700">
                      Bereits bezahlt: {session.amount_paid.toFixed(2)} EUR
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleStartPayment}
                  disabled={session.remaining_amount <= 0}
                  className="w-full rounded-3xl bg-slate-900 px-6 py-5 text-xl font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {session.remaining_amount <= 0 ? "Bereits bezahlt" : "Bezahlen"}
                </button>
              </div>
            ) : (
              <p className="mt-6 text-lg text-slate-600">
                Für dieses Kennzeichen wurde keine aktive Parksitzung gefunden.
              </p>
            )}
          </div>
        </div>
      </section>

      {isPaymentModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-4 md:items-center">
          <div className="relative w-full max-w-[820px] overflow-hidden rounded-[2rem] bg-white p-6 shadow-2xl md:min-h-[560px] md:p-8">
            {paymentState === "success" ? (
              <div className="flex h-full min-h-[480px] flex-col items-center justify-center px-6 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
                  Zahlung erfolgreich
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                  Vielen Dank fürs Bezahlen
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                  Du hast jetzt 15 Minuten Zeit auszuparken. Dieser Screen schließt
                  sich automatisch in 1 Minute.
                </p>
                <button
                  type="button"
                  onClick={() => { handleCloseModal(); onPaymentFinished?.(); }}
                  className="mt-8 rounded-2xl bg-slate-900 px-6 py-4 text-lg font-semibold text-white transition hover:bg-slate-800"
                >
                  Zur Kennzeichen-Eingabe
                </button>
              </div>
            ) : (
              <div className="flex h-full min-h-[560px] flex-col items-center justify-center text-center">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="absolute right-6 top-6 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  X
                </button>

                <div className="w-full max-w-4xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Zahlungsquelle auswählen
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                    Wie möchtest du bezahlen?
                  </h2>
                  <p className="mt-6 text-base text-slate-600 md:text-lg">
                    Kennzeichen:{" "}
                    <span className="font-semibold text-slate-950">{plate}</span>
                  </p>
                  <p className="mt-3 text-base text-slate-600 md:text-lg">
                    Betrag:{" "}
                    <span className="font-semibold text-slate-950">
                      {session?.remaining_amount.toFixed(2) ?? "0.00"} EUR
                    </span>
                  </p>
                </div>

                <div className="h-8" />

                <div className="grid w-full max-w-4xl gap-5 md:grid-cols-2">
                  {(["card", "paypal"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setSelectedMethod(method)}
                      className={`rounded-[1.75rem] border px-6 py-7 text-left transition ${
                        selectedMethod === method
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <p className="text-sm font-semibold uppercase tracking-[0.2em]">
                        {method === "card" ? "Kartenzahlung" : "Onlinezahlung"}
                      </p>
                      <p className="mt-3 text-xl font-semibold md:text-2xl">
                        {method === "card" ? "Karte" : "PayPal"}
                      </p>
                      <p className="mt-2 text-sm leading-6 opacity-80">
                        {method === "card"
                          ? "Kartenzahlung direkt am Terminal."
                          : "Weiterleitung zu PayPal."}
                      </p>
                    </button>
                  ))}
                </div>

                {paymentState === "error" && paymentError && (
                  <div className="mt-4 w-full max-w-4xl rounded-2xl bg-rose-100 px-5 py-3 text-sm font-semibold text-rose-800">
                    {paymentError}
                  </div>
                )}

                <div className="h-8" />

                <div className="flex w-full max-w-4xl gap-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 rounded-2xl border border-slate-300 px-5 py-4 text-lg font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    disabled={!selectedMethod || paymentState === "processing"}
                    className="flex-1 rounded-2xl bg-emerald-600 px-5 py-4 text-lg font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    {paymentState === "processing" ? "Zahlung läuft…" : "Jetzt bezahlen"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

export default PaymentPrice;
