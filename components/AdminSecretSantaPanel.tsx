"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adminAutoMatchRemaining,
  adminManualAssign,
  adminSetRoundActive,
  adminStartRound,
  adminUnassign,
} from "@/lib/secretsanta-actions";
import type { Person } from "@/types/crm";
import type { SecretSantaMappingRow, SecretSantaRound } from "@/types/secretsanta";

const accent = { fontFamily: "var(--font-accent)" };

const METHOD_LABELS = {
  self_pick: "Self-picked",
  auto_match: "Auto-matched",
  manual: "Manual",
} as const;

export default function AdminSecretSantaPanel({
  round,
  people,
  mapping,
  notPicked,
  totalParticipants,
}: {
  round: SecretSantaRound | null;
  people: Person[];
  mapping: SecretSantaMappingRow[];
  notPicked: (Person & { canSelfPick: boolean })[];
  totalParticipants: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedGiver, setSelectedGiver] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState("");

  const pickedCount = mapping.length;
  const currentYear = new Date().getFullYear();

  const assignedRecipientIds = useMemo(
    () => new Set(mapping.map((m) => m.recipient_person_id)),
    [mapping]
  );
  // Eligible recipients for a manual assignment: anyone in the participant
  // pool not already claimed as someone's recipient this round. (They may
  // have already picked their own giftee — that doesn't stop others from
  // being assigned to gift them.)
  const participants = useMemo(() => people.filter((p) => !p.secret_santa_opt_out), [people]);
  const availableAsRecipient = useMemo(
    () => participants.filter((p) => !assignedRecipientIds.has(p.id)),
    [participants, assignedRecipientIds]
  );

  function act(fn: () => Promise<{ error?: string; matched?: number }>, successMsg?: (r: { matched?: number }) => string) {
    setError("");
    setMessage("");
    startTransition(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else {
        if (successMsg) setMessage(successMsg(res));
        router.refresh();
      }
    });
  }

  if (!round) {
    return (
      <div className="max-w-lg">
        <p className="text-sm text-stone-mid mb-4">
          No Secret Santa round has been started yet.
        </p>
        <button
          onClick={() => act(() => adminStartRound(currentYear))}
          disabled={isPending}
          className="px-6 py-3 rounded-full bg-ink hover:bg-stone text-vellum font-bold text-xs tracking-widest uppercase"
          style={accent}
        >
          🎁 Start {currentYear} Secret Santa
        </button>
      </div>
    );
  }

  return (
    <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 font-medium">{error}</p>
      )}
      {message && (
        <p className="text-sm text-gold-deep bg-gold-wash/40 border border-gold-soft/50 rounded-xl px-4 py-3 mb-4 font-medium">{message}</p>
      )}

      {/* Round status */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-5 rounded-2xl border border-stone-edge bg-parchment-soft">
        <div>
          <p className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
            {round.year} Secret Santa
          </p>
          <p className="text-sm text-stone-mid mt-1">
            {pickedCount} of {totalParticipants} matched
            {round.is_active ? (
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-success-earthen">● Picking Open</span>
            ) : (
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-stone-light">● Picking Closed</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => act(() => adminSetRoundActive(round.id, !round.is_active))}
            className="px-4 py-2.5 rounded-lg border border-stone-edge text-stone-mid hover:border-gold hover:text-ink text-xs font-bold uppercase tracking-wider"
            style={accent}
          >
            {round.is_active ? "Close Picking" : "Reopen Picking"}
          </button>
          {notPicked.length > 0 && (
            <button
              onClick={() =>
                act(
                  () => adminAutoMatchRemaining(round.id),
                  (r) => `Auto-matched ${r.matched ?? 0} ${r.matched === 1 ? "person" : "people"}.`
                )
              }
              className="px-4 py-2.5 rounded-lg bg-ink hover:bg-stone text-vellum text-xs font-bold uppercase tracking-wider"
              style={accent}
            >
              Auto-Match Remaining ({notPicked.length})
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Not yet picked */}
        <section>
          <h3 className="text-xs font-bold tracking-widest uppercase text-stone-light mb-3" style={accent}>
            Haven&rsquo;t Picked Yet ({notPicked.length})
          </h3>
          {notPicked.length === 0 ? (
            <p className="text-sm text-stone-mid italic">Everyone has been matched. 🎉</p>
          ) : (
            <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
              {notPicked.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl border border-stone-edge bg-white text-sm">
                  <span className="font-medium text-ink truncate">{p.full_name}</span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${
                      p.canSelfPick ? "bg-gold-wash text-gold-deep" : "bg-stone-edge/30 text-stone-mid"
                    }`}
                  >
                    {p.canSelfPick ? "Can self-pick" : "Needs manual match"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Manual assign */}
          {notPicked.length > 0 && (
            <div className="mt-4 p-4 rounded-2xl border border-stone-edge bg-parchment-soft space-y-3">
              <p className="text-xs font-bold text-stone-mid uppercase tracking-wider" style={accent}>Manually Assign</p>
              <select value={selectedGiver} onChange={(e) => setSelectedGiver(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-edge bg-white text-sm">
                <option value="">Giver…</option>
                {notPicked.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
              <select value={selectedRecipient} onChange={(e) => setSelectedRecipient(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-edge bg-white text-sm">
                <option value="">Gifts…</option>
                {availableAsRecipient
                  .filter((p) => p.id !== selectedGiver)
                  .map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
              </select>
              <button
                onClick={() => {
                  if (!selectedGiver || !selectedRecipient) return;
                  act(() => adminManualAssign(round.id, selectedGiver, selectedRecipient));
                  setSelectedGiver("");
                  setSelectedRecipient("");
                }}
                disabled={!selectedGiver || !selectedRecipient}
                className="w-full px-4 py-2 rounded-lg bg-ink hover:bg-stone text-vellum text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                style={accent}
              >
                Assign
              </button>
            </div>
          )}
        </section>

        {/* Full mapping */}
        <section>
          <h3 className="text-xs font-bold tracking-widest uppercase text-stone-light mb-3" style={accent}>
            Full Mapping ({mapping.length})
          </h3>
          {mapping.length === 0 ? (
            <p className="text-sm text-stone-mid italic">No matches yet.</p>
          ) : (
            <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
              {mapping.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-stone-edge bg-white text-sm">
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-ink">{m.giver_name}</span>
                    <span className="text-stone-light mx-1.5">→</span>
                    <span className="font-medium text-ink">{m.recipient_name}</span>
                    <span className="ml-2 text-[9px] font-bold uppercase tracking-wider text-stone-light">
                      {METHOD_LABELS[m.assigned_method]}
                    </span>
                  </div>
                  <button
                    onClick={() => act(() => adminUnassign(round.id, m.giver_person_id))}
                    className="text-[10px] font-bold text-red-600 hover:underline uppercase tracking-wider flex-shrink-0"
                  >
                    Unassign
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
