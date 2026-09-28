"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";

type User = {
  id: number;
  name: string;
  email: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        window.location.href = "/login";
        return;
      }

      setUser(currentUser);
      setLoading(false);
    }

    loadUser();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070a13] flex items-center justify-center text-white">
        <p className="text-white/50">Loading DataPilot...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070a13] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-sm text-blue-400">DataPilot</p>

          <h1 className="mt-2 text-4xl font-bold">
            Welcome back, {user?.name}
          </h1>

          <p className="mt-2 text-white/50">
            Your AI-powered business intelligence workspace.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-white/40">Datasets</p>
            <p className="mt-3 text-3xl font-bold">0</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-white/40">Analyses</p>
            <p className="mt-3 text-3xl font-bold">0</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-white/40">Insights</p>
            <p className="mt-3 text-3xl font-bold">0</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <h2 className="text-xl font-semibold">
            Your workspace
          </h2>

          <p className="mt-2 text-sm text-white/40">
            Upload a dataset to start analyzing your business data.
          </p>
        </div>
      </div>
    </main>
  );
}