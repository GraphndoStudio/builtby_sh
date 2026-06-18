"use client";

import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Signing in...");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setStatus(data.message ?? "Invalid password");
      return;
    }

    setStatus("Success. Redirecting...");
    window.location.href = "/admin";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 text-[#F8FAFC]">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 rounded-3xl border border-[rgba(255,255,255,.08)] bg-[#101010]/80 p-6 backdrop-blur-xl"
      >
        <p className="font-display text-xs uppercase tracking-[0.2em] text-[#2AFADF]">THE CREATIVE ENGINE</p>
        <h1 className="text-2xl font-semibold">Admin Login</h1>
        <p className="text-sm text-[#A1A1AA]">Enter your admin password to manage portfolio sections.</p>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-[rgba(255,255,255,.08)] bg-black/35 px-3 py-2 text-sm"
          placeholder="Admin password"
          required
        />
        <button
          type="submit"
          className="w-full rounded-full bg-gradient-to-b from-[#2AFADF] to-[#4C83FF] px-4 py-2 text-sm font-semibold text-black"
        >
          Sign In
        </button>
        <p className="text-sm text-[#2AFADF]">{status}</p>
      </form>
    </div>
  );
}
