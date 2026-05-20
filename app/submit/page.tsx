"use client";

import { useState, useEffect } from "react";
import PasswordGate from "@/components/PasswordGate";
import StoneForm from "@/components/StoneForm";
import PageHeader from "@/components/PageHeader";

const STORAGE_KEY = "stones_submission_access";

export default function SubmitPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setAuthenticated(true);
    }
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-[#c4b090] text-sm">Loading…</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex-1 flex flex-col">
        <PageHeader title="Submit Your Stone" backHref="/100stones" />
        <PasswordGate
          verifyEndpoint="/api/verify-submission"
          storageKey={STORAGE_KEY}
          title="This is a sacred space"
          description="Enter the event password to share your stone of remembrance with the community."
          onSuccess={() => setAuthenticated(true)}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <PageHeader
        title="Submit Your Stone"
        subtitle="What do you want to remember God did in you during these 100 days?"
        backHref="/100stones"
      />

      <div className="flex-1 py-10 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto mb-8 p-4 bg-[#fdf8f0] border border-[#e8d4b0] rounded-2xl">
          <p className="text-sm text-[#7a5a3a] italic leading-relaxed text-center">
            In Joshua 4, Israel set up stones so future generations would ask,
            &ldquo;What do these stones mean?&rdquo; Your story may become someone
            else&apos;s courage.
          </p>
        </div>

        <StoneForm />
      </div>
    </div>
  );
}
