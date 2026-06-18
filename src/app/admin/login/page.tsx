"use client";

import { FormEvent, useEffect, useState } from "react";

type AuthMode = "sign-in" | "register";

export default function AdminLoginPage() {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [setupLoaded, setSetupLoaded] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSetupStatus() {
      setStatus("Checking admin setup...");
      try {
        const response = await fetch("/api/admin/setup", { cache: "no-store" });
        const data = (await response.json()) as { registered?: boolean };
        if (!active) {
          return;
        }

        const isRegistered = Boolean(data.registered);
        setRegistered(isRegistered);
        setMode(isRegistered ? "sign-in" : "register");
        setStatus(
          isRegistered
            ? "Sign in with your admin email and password."
            : "Create your one-time admin account.",
        );
      } catch {
        if (active) {
          setStatus("Could not check setup status. Refresh and try again.");
        }
      } finally {
        if (active) {
          setSetupLoaded(true);
        }
      }
    }

    void loadSetupStatus();
    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!setupLoaded) {
      return;
    }

    if (mode === "register") {
      setStatus("Creating admin account...");

      const response = await fetch("/api/admin/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          confirmPassword,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        setStatus(data.message ?? "Could not register.");
        return;
      }

      setStatus("Account created. Redirecting...");
      window.location.href = "/admin";
      return;
    }

    setStatus("Signing in...");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      if (response.status === 409) {
        setRegistered(false);
        setMode("register");
      }
      setStatus(data.message ?? "Invalid credentials");
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
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold">
            {mode === "register" ? "Create Admin Account" : "Admin Login"}
          </h1>
          {!registered ? (
            <button
              type="button"
              onClick={() =>
                setMode((current) =>
                  current === "register" ? "sign-in" : "register",
                )
              }
              className="rounded-full border border-[rgba(255,255,255,.08)] px-3 py-1 text-xs text-[#A1A1AA]"
            >
              {mode === "register" ? "Have account?" : "Register"}
            </button>
          ) : null}
        </div>
        <p className="text-sm text-[#A1A1AA]">
          {mode === "register"
            ? "Register once with email and password to secure your admin panel."
            : "Sign in with your registered admin account."}
        </p>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-[rgba(255,255,255,.08)] bg-black/35 px-3 py-2 text-sm"
          placeholder="Admin email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-[rgba(255,255,255,.08)] bg-black/35 px-3 py-2 text-sm"
          placeholder={mode === "register" ? "Create password" : "Password"}
          required
        />
        {mode === "register" ? (
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-xl border border-[rgba(255,255,255,.08)] bg-black/35 px-3 py-2 text-sm"
            placeholder="Confirm password"
            required
          />
        ) : null}
        <button
          type="submit"
          disabled={!setupLoaded}
          className="w-full rounded-full bg-gradient-to-b from-[#2AFADF] to-[#4C83FF] px-4 py-2 text-sm font-semibold text-black"
        >
          {mode === "register" ? "Register & Sign In" : "Sign In"}
        </button>
        <p className="text-sm text-[#2AFADF]">{status}</p>
      </form>
    </div>
  );
}
