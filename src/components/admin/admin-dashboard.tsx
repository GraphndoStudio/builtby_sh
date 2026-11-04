"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { MediaKind, PortfolioContent } from "@/types/portfolio";

interface AdminDashboardProps {
  initialContent: PortfolioContent;
}

type SectionId =
  | "brand"
  | "loading"
  | "hero"
  | "about"
  | "experience"
  | "featured"
  | "services"
  | "toolbox"
  | "why"
  | "numbers"
  | "contact"
  | "footer"
  | "settings";

interface SidebarCategory {
  title: string;
  items: Array<{
    id: SectionId;
    label: string;
    icon: string;
    description: string;
  }>;
}

const sidebarCategories: SidebarCategory[] = [
  {
    title: "Identity & Header",
    items: [
      { id: "brand", label: "Brand & Navigation", icon: "💎", description: "Logo, tagline & menu links" },
      { id: "loading", label: "Loading Screen", icon: "⏳", description: "Name & splash text" },
      { id: "hero", label: "Hero Section", icon: "🚀", description: "Headline, roles & mockup media" },
    ],
  },
  {
    title: "Story & Profile",
    items: [
      { id: "about", label: "About Me", icon: "👤", description: "Bio, story & main portrait" },
      { id: "experience", label: "Experience Timeline", icon: "💼", description: "Roles, history & galleries" },
      { id: "why", label: "Why Work With Me", icon: "⭐", description: "Core values & strengths" },
    ],
  },
  {
    title: "Showcase & Skills",
    items: [
      { id: "featured", label: "Featured Works", icon: "🎨", description: "Case studies & projects" },
      { id: "services", label: "Services", icon: "🛠️", description: "Offerings & capabilities" },
      { id: "toolbox", label: "Toolbox & Tech", icon: "⚡", description: "Design & dev stack" },
      { id: "numbers", label: "Stats & Numbers", icon: "📊", description: "Impact counters" },
    ],
  },
  {
    title: "Contact & Footer",
    items: [
      { id: "contact", label: "Contact & Social", icon: "📬", description: "Email, phone & social handles" },
      { id: "footer", label: "Footer", icon: "📄", description: "Copyright & bottom text" },
    ],
  },
  {
    title: "Admin Account",
    items: [
      { id: "settings", label: "Security & Settings", icon: "🔒", description: "Credentials & account email" },
    ],
  },
];

/* Reusable Media Preview Card with Live Upload */
function MediaField({
  label,
  url,
  mediaKind = "image",
  helperText,
  onUrlChange,
  onKindChange,
  onUpload,
  isUploading,
}: {
  label: string;
  url: string;
  mediaKind?: MediaKind;
  helperText?: string;
  onUrlChange: (url: string) => void;
  onKindChange?: (kind: MediaKind) => void;
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    setPreviewError(false);
  }, [url]);

  return (
    <div className="space-y-2 rounded-2xl border border-white/10 bg-black/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-brand-text">
            {label}
          </label>
          {helperText ? <p className="text-xs text-brand-muted">{helperText}</p> : null}
        </div>
        {onKindChange ? (
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/60 p-1 text-xs">
            <button
              type="button"
              onClick={() => onKindChange("image")}
              className={`rounded px-2 py-0.5 transition ${
                mediaKind === "image"
                  ? "bg-brand-accent text-black font-semibold"
                  : "text-brand-muted hover:text-white"
              }`}
            >
              Image
            </button>
            <button
              type="button"
              onClick={() => onKindChange("video")}
              className={`rounded px-2 py-0.5 transition ${
                mediaKind === "video"
                  ? "bg-brand-accent text-black font-semibold"
                  : "text-brand-muted hover:text-white"
              }`}
            >
              Video
            </button>
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          type="text"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="Paste media URL or upload file below..."
          className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-brand-accent focus:outline-none"
        />
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={mediaKind === "video" ? "video/*" : "image/*,video/*"}
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                await onUpload(file);
                e.target.value = "";
              }
            }}
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-brand-accent/40 bg-brand-accent/10 px-4 py-2.5 text-xs font-semibold text-brand-accent transition hover:bg-brand-accent/20 disabled:opacity-50"
          >
            {isUploading ? (
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-brand-accent border-t-transparent" />
            ) : (
              <span>↑ Upload</span>
            )}
          </button>
        </div>
      </div>

      {/* Live Preview Box */}
      {url ? (
        <div className="relative mt-2 overflow-hidden rounded-xl border border-white/10 bg-zinc-950">
          {mediaKind === "video" ? (
            <video
              src={url}
              controls
              className="max-h-56 w-full object-contain"
              onError={() => setPreviewError(true)}
            />
          ) : !previewError ? (
            <div className="relative h-44 w-full">
              <Image
                src={url}
                alt="Preview"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-contain"
                onError={() => setPreviewError(true)}
              />
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center p-3 text-center text-xs text-red-400">
              Could not load image preview. Check that the URL is valid.
            </div>
          )}
          <div className="flex items-center justify-between border-t border-white/5 bg-black/60 px-3 py-1.5 text-[11px] text-brand-muted">
            <span className="truncate max-w-[80%]">{url}</span>
            <button
              type="button"
              onClick={() => onUrlChange("")}
              className="text-red-400 hover:underline"
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* Tag Editor for Tools/Skills */
function TagListEditor({
  title,
  tags,
  onChange,
}: {
  title: string;
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [inputVal, setInputVal] = useState("");

  const addTag = () => {
    const trimmed = inputVal.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputVal("");
    }
  };

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-black/30 p-3.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
        {title}
      </label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-xs text-brand-text"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((_, i) => i !== index))}
              className="text-brand-muted hover:text-red-400 font-bold"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="Type tool name and press Enter..."
          className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-brand-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={addTag}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export function AdminDashboard({ initialContent }: AdminDashboardProps) {
  const [content, setContent] = useState<PortfolioContent>(initialContent);
  const [activeSection, setActiveSection] = useState<SectionId>("brand");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusNotification, setStatusNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Expanded card tracking
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    "work-0": true,
    "exp-0": true,
    "mockup-0": true,
  });

  // Settings states
  const [accountEmail, setAccountEmail] = useState("");
  const [emailLocked, setEmailLocked] = useState(true);
  const [otpConfigured, setOtpConfigured] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newLoginPassword, setNewLoginPassword] = useState("");
  const [confirmNewLoginPassword, setConfirmNewLoginPassword] = useState("");
  const [passwordState, setPasswordState] = useState("");
  const [emailChangeCurrentPassword, setEmailChangeCurrentPassword] = useState("");
  const [pendingNewEmail, setPendingNewEmail] = useState("");
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [emailChangeState, setEmailChangeState] = useState("");
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Auto-dismiss notifications after 4 seconds
  useEffect(() => {
    if (statusNotification) {
      const t = setTimeout(() => setStatusNotification(null), 4000);
      return () => clearTimeout(t);
    }
  }, [statusNotification]);

  // Load account settings
  useEffect(() => {
    let active = true;
    async function loadSettings() {
      try {
        const response = await fetch("/api/admin/settings/credentials", {
          cache: "no-store",
        });
        if (!response.ok) return;

        const data = (await response.json()) as {
          email?: string;
          emailLocked?: boolean;
          otpConfigured?: boolean;
        };
        if (!active) return;

        setAccountEmail(data.email ?? "");
        setEmailLocked(data.emailLocked ?? true);
        setOtpConfigured(Boolean(data.otpConfigured));
      } catch {
        // Ignored
      }
    }

    void loadSettings();
    return () => {
      active = false;
    };
  }, []);

  // Keyboard shortcut Ctrl+S or Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        void saveContent();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [content]);

  function editContent(mutator: (draft: PortfolioContent) => void) {
    const next = structuredClone(content);
    mutator(next);
    setContent(next);
    setIsDirty(true);
  }

  function toggleCard(cardKey: string) {
    setExpandedCards((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  }

  async function uploadMedia(file: File): Promise<{ url: string; kind: MediaKind }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as {
      url?: string;
      kind?: MediaKind;
      message?: string;
    };

    if (!response.ok || !data.url) {
      throw new Error(data.message ?? "Upload failed");
    }

    return {
      url: data.url,
      kind: data.kind ?? (file.type.startsWith("video/") ? "video" : "image"),
    };
  }

  async function handleMediaUpload(
    file: File,
    fieldKey: string,
    onSuccess: (url: string, kind: MediaKind) => void,
  ) {
    setUploadingField(fieldKey);
    try {
      const { url, kind } = await uploadMedia(file);
      onSuccess(url, kind);
      setStatusNotification({
        type: "success",
        message: "File uploaded successfully!",
      });
      setIsDirty(true);
    } catch (err) {
      setStatusNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Upload failed",
      });
    } finally {
      setUploadingField(null);
    }
  }

  async function saveContent() {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      const data = (await response.json()) as {
        message?: string;
        content?: PortfolioContent;
      };

      if (!response.ok) {
        setStatusNotification({
          type: "error",
          message: data.message ?? "Failed to save changes.",
        });
        return;
      }

      if (data.content) {
        setContent(data.content);
      }
      setIsDirty(false);
      setStatusNotification({
        type: "success",
        message: "All changes saved successfully! Live site updated.",
      });
    } catch (err) {
      setStatusNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Save failed.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  async function resetCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordState("Updating password...");

    const response = await fetch("/api/admin/settings/credentials", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword,
        password: newLoginPassword,
        confirmPassword: confirmNewLoginPassword,
      }),
    });

    const data = (await response.json()) as { message?: string };
    if (!response.ok) {
      setPasswordState(data.message ?? "Could not update password.");
      return;
    }

    setCurrentPassword("");
    setNewLoginPassword("");
    setConfirmNewLoginPassword("");
    setPasswordState(data.message ?? "Password updated successfully!");
  }

  async function changeEmailWithOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailChangeState("Processing email change...");

    const response = await fetch("/api/admin/settings/email", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: emailChangeCurrentPassword,
        nextEmail: pendingNewEmail,
        otpCode: emailOtpCode,
      }),
    });

    const data = (await response.json()) as { message?: string };
    if (!response.ok) {
      setEmailChangeState(data.message ?? "Could not change email.");
      return;
    }

    setAccountEmail(pendingNewEmail.trim().toLowerCase());
    setEmailChangeCurrentPassword("");
    setPendingNewEmail("");
    setEmailOtpCode("");
    setEmailChangeState(data.message ?? "Admin email updated successfully.");
  }

  const activeSectionInfo = useMemo(() => {
    for (const cat of sidebarCategories) {
      const match = cat.items.find((i) => i.id === activeSection);
      if (match) return match;
    }
    return { id: activeSection, label: "Editor", icon: "✏️", description: "" };
  }, [activeSection]);

  const fieldClass =
    "w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent";

  return (
    <div className="min-h-screen bg-[#070709] text-brand-text">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0c0d12]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-accent text-black font-bold text-base shadow-[0_0_20px_rgba(42,250,223,0.3)]">
              SH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-semibold tracking-wide text-white">
                  PORTFOLIO ADMIN
                </span>
                <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 text-[10px] font-medium text-brand-accent">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-brand-muted hidden sm:block">
                Editing: <span className="text-brand-text font-medium">{activeSectionInfo.label}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              <span>↗</span>
              <span className="hidden sm:inline">View Live Site</span>
            </a>

            <button
              type="button"
              onClick={saveContent}
              disabled={isSaving}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold shadow-md transition ${
                isDirty
                  ? "bg-gradient-accent text-black shadow-[0_0_22px_rgba(42,250,223,0.4)] hover:brightness-110"
                  : "bg-white/10 text-zinc-300 hover:bg-white/15"
              }`}
            >
              {isSaving ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  Saving...
                </>
              ) : isDirty ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
                  Save Changes (Ctrl+S)
                </>
              ) : (
                <>
                  <span className="text-brand-accent">✓</span>
                  Saved
                </>
              )}
            </button>

            <button
              type="button"
              onClick={logout}
              title="Sign out of admin"
              className="rounded-full border border-white/10 p-2 text-xs text-zinc-400 transition hover:border-red-400/40 hover:text-red-400"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Status Banner */}
      {statusNotification ? (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 text-xs shadow-2xl backdrop-blur-xl transition-all ${
            statusNotification.type === "success"
              ? "border-brand-accent/40 bg-zinc-900/95 text-brand-accent"
              : statusNotification.type === "error"
              ? "border-red-500/40 bg-zinc-900/95 text-red-400"
              : "border-white/20 bg-zinc-900/95 text-white"
          }`}
        >
          <span>
            {statusNotification.type === "success" ? "✓" : statusNotification.type === "error" ? "⚠️" : "ℹ"}
          </span>
          <span className="font-medium text-white">{statusNotification.message}</span>
          <button
            type="button"
            onClick={() => setStatusNotification(null)}
            className="ml-2 text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      ) : null}

      {/* Floating Save Bar when dirty */}
      {isDirty ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 rounded-full border border-brand-accent/40 bg-black/90 px-5 py-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs text-zinc-200">Unsaved edits</span>
          </div>
          <button
            type="button"
            onClick={saveContent}
            disabled={isSaving}
            className="rounded-full bg-gradient-accent px-4 py-1.5 text-xs font-semibold text-black transition hover:brightness-110"
          >
            {isSaving ? "Saving..." : "Save Now"}
          </button>
        </div>
      ) : null}

      {/* Main Workspace Layout */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Navigation Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#111218]/80 p-3 backdrop-blur-xl lg:sticky lg:top-20">
              <div className="space-y-5">
                {sidebarCategories.map((category) => (
                  <div key={category.title} className="space-y-1">
                    <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      {category.title}
                    </p>
                    {category.items.map((item) => {
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveSection(item.id)}
                          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                            isActive
                              ? "border border-brand-accent/30 bg-brand-accent/15 text-brand-accent shadow-[0_0_20px_rgba(42,250,223,0.15)]"
                              : "text-zinc-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <span className="text-base">{item.icon}</span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium">{item.label}</p>
                            <p className="truncate text-[10px] text-zinc-500">{item.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {accountEmail ? (
                <div className="mt-4 border-t border-white/10 pt-3 px-2 text-[11px] text-zinc-500">
                  Signed in as: <span className="text-zinc-300 font-medium truncate block">{accountEmail}</span>
                </div>
              ) : null}
            </div>
          </aside>

          {/* Section Editor Area */}
          <main className="space-y-6 rounded-3xl border border-white/10 bg-[#111218]/70 p-5 md:p-8 backdrop-blur-xl">
            {/* Header info for currently active section */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activeSectionInfo.icon}</span>
                <div>
                  <h2 className="font-display text-2xl text-white">{activeSectionInfo.label}</h2>
                  <p className="text-xs text-brand-muted">{activeSectionInfo.description}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={saveContent}
                disabled={isSaving}
                className="rounded-full bg-brand-accent/10 border border-brand-accent/30 px-4 py-2 text-xs font-semibold text-brand-accent hover:bg-brand-accent/20"
              >
                Save {activeSectionInfo.label}
              </button>
            </div>

            {/* SECTION: BRAND & NAVIGATION */}
            {activeSection === "brand" ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Brand Name</label>
                    <input
                      value={content.brand.name}
                      onChange={(e) =>
                        editContent((d) => {
                          d.brand.name = e.target.value;
                        })
                      }
                      className={fieldClass}
                      placeholder="e.g. THE CREATIVE ENGINE"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Brand Tagline</label>
                    <input
                      value={content.brand.tagline}
                      onChange={(e) =>
                        editContent((d) => {
                          d.brand.tagline = e.target.value;
                        })
                      }
                      className={fieldClass}
                      placeholder="e.g. Design. Build. Elevate."
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Short Navbar Brand Name</label>
                    <input
                      value={content.brand.shortName ?? ""}
                      onChange={(e) =>
                        editContent((d) => {
                          d.brand.shortName = e.target.value;
                        })
                      }
                      className={fieldClass}
                      placeholder="e.g. BuiltBy.sh"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Navbar CTA Button Label</label>
                    <input
                      value={content.brand.navCtaLabel ?? ""}
                      onChange={(e) =>
                        editContent((d) => {
                          d.brand.navCtaLabel = e.target.value;
                        })
                      }
                      className={fieldClass}
                      placeholder="e.g. Say Hello"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Navbar CTA Button Target</label>
                    <input
                      value={content.brand.navCtaHref ?? ""}
                      onChange={(e) =>
                        editContent((d) => {
                          d.brand.navCtaHref = e.target.value;
                        })
                      }
                      className={fieldClass}
                      placeholder="e.g. #contact"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Header Navigation Links</h3>
                      <p className="text-xs text-brand-muted">Items shown in the floating desktop and mobile nav.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        editContent((d) => {
                          d.navigation.push({ label: "New Link", href: "#" });
                        })
                      }
                      className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-brand-accent hover:bg-white/10"
                    >
                      + Add Menu Link
                    </button>
                  </div>

                  <div className="space-y-2">
                    {content.navigation.map((item, index) => (
                      <div
                        key={`nav-${index}`}
                        className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-black/30 p-2.5 sm:flex-nowrap"
                      >
                        <input
                          value={item.label}
                          onChange={(e) =>
                            editContent((d) => {
                              d.navigation[index].label = e.target.value;
                            })
                          }
                          placeholder="Link Label"
                          className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-brand-accent focus:outline-none"
                        />
                        <input
                          value={item.href}
                          onChange={(e) =>
                            editContent((d) => {
                              d.navigation[index].href = e.target.value;
                            })
                          }
                          placeholder="Anchor e.g. #hero"
                          className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-brand-accent focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            editContent((d) => {
                              d.navigation.splice(index, 1);
                            })
                          }
                          className="rounded-lg p-2 text-xs text-zinc-500 hover:bg-red-500/20 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {/* SECTION: LOADING SCREEN */}
            {activeSection === "loading" ? (
              <div className="max-w-xl space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-brand-muted">Display Name on Splash</label>
                  <input
                    value={content.loading.displayName}
                    onChange={(e) =>
                      editContent((d) => {
                        d.loading.displayName = e.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="e.g. SHARUKH"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-brand-muted">Splash Status Subtitle</label>
                  <input
                    value={content.loading.statusText}
                    onChange={(e) =>
                      editContent((d) => {
                        d.loading.statusText = e.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="e.g. Initializing Portfolio..."
                  />
                </div>
              </div>
            ) : null}

            {/* SECTION: HERO */}
            {activeSection === "hero" ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Full Display Name</label>
                    <input
                      value={content.hero.displayName}
                      onChange={(e) =>
                        editContent((d) => {
                          d.hero.displayName = e.target.value;
                        })
                      }
                      className={fieldClass}
                      placeholder="e.g. SHARUKH"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Primary Role</label>
                    <input
                      value={content.hero.rolePrimary}
                      onChange={(e) =>
                        editContent((d) => {
                          d.hero.rolePrimary = e.target.value;
                        })
                      }
                      className={fieldClass}
                      placeholder="e.g. Frontend Developer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Secondary Role</label>
                    <input
                      value={content.hero.roleSecondary}
                      onChange={(e) =>
                        editContent((d) => {
                          d.hero.roleSecondary = e.target.value;
                        })
                      }
                      className={fieldClass}
                      placeholder="e.g. Graphic Designer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Third Role / Specialty</label>
                    <input
                      value={content.hero.roleMorph}
                      onChange={(e) =>
                        editContent((d) => {
                          d.hero.roleMorph = e.target.value;
                        })
                      }
                      className={fieldClass}
                      placeholder="e.g. Motion UI"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Live Availability Status</label>
                    <input
                      value={content.hero.availabilityText ?? ""}
                      onChange={(e) =>
                        editContent((d) => {
                          d.hero.availabilityText = e.target.value;
                        })
                      }
                      className={fieldClass}
                      placeholder="e.g. Available for Select Projects"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Location / Scope</label>
                    <input
                      value={content.hero.locationText ?? ""}
                      onChange={(e) =>
                        editContent((d) => {
                          d.hero.locationText = e.target.value;
                        })
                      }
                      className={fieldClass}
                      placeholder="e.g. India · Worldwide"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-brand-muted">Editorial Main Headline</label>
                  <input
                    value={content.hero.headline ?? ""}
                    onChange={(e) =>
                      editContent((d) => {
                        d.hero.headline = e.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="e.g. Designing products that shape experiences. Engineering code that connects."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-brand-muted">Connecting Human Story / Bio Paragraph</label>
                  <textarea
                    rows={3}
                    value={content.hero.story ?? ""}
                    onChange={(e) =>
                      editContent((d) => {
                        d.hero.story = e.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="e.g. From concept to creation. I combine intentional graphic design with modern frontend engineering..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-brand-muted">Short Subheadline (Secondary)</label>
                  <textarea
                    rows={2}
                    value={content.hero.subheadline}
                    onChange={(e) =>
                      editContent((d) => {
                        d.hero.subheadline = e.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Short punchy bio"
                  />
                </div>

                {/* CTA Action Buttons */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Primary CTA Label</label>
                    <input
                      value={content.hero.primaryCtaLabel}
                      onChange={(e) =>
                        editContent((d) => {
                          d.hero.primaryCtaLabel = e.target.value;
                        })
                      }
                      className={fieldClass}
                      placeholder="e.g. See My Work"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Primary CTA Target</label>
                    <input
                      value={content.hero.primaryCtaHref}
                      onChange={(e) =>
                        editContent((d) => {
                          d.hero.primaryCtaHref = e.target.value;
                        })
                      }
                      className={fieldClass}
                      placeholder="e.g. #featured-works"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Secondary CTA Label</label>
                    <input
                      value={content.hero.secondaryCtaLabel}
                      onChange={(e) =>
                        editContent((d) => {
                          d.hero.secondaryCtaLabel = e.target.value;
                        })
                      }
                      className={fieldClass}
                      placeholder="e.g. Start a Project"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Secondary CTA Target</label>
                    <input
                      value={content.hero.secondaryCtaHref}
                      onChange={(e) =>
                        editContent((d) => {
                          d.hero.secondaryCtaHref = e.target.value;
                        })
                      }
                      className={fieldClass}
                      placeholder="e.g. #contact"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-brand-muted">Resume URL / File</label>
                  <input
                    value={content.hero.resumeUrl}
                    onChange={(e) =>
                      editContent((d) => {
                        d.hero.resumeUrl = e.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Link or PDF path"
                  />
                </div>

                {/* Hero Media: Dedicated Portrait & Floating Card Image */}
                <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-white/10">
                  <MediaField
                    label="Hero Centerpiece Portrait"
                    url={content.hero.portraitUrl || content.about.imageUrl}
                    mediaKind="image"
                    helperText="Portrait displayed on the hero stage (overrides about portrait if set)"
                    isUploading={uploadingField === "hero-portrait"}
                    onUrlChange={(url) =>
                      editContent((d) => {
                        d.hero.portraitUrl = url;
                      })
                    }
                    onUpload={(file) =>
                      handleMediaUpload(file, "hero-portrait", (url) => {
                        editContent((d) => {
                          d.hero.portraitUrl = url;
                        });
                      })
                    }
                  />

                  <MediaField
                    label="Studio Archive Card Thumbnail"
                    url={content.hero.archiveThumbnailUrl || content.about.posterImageUrl || "/uploads/1781775293542-artboard-1-300x.png"}
                    mediaKind="image"
                    helperText="Artwork shown in the floating Studio Archive badge"
                    isUploading={uploadingField === "hero-archive-thumb"}
                    onUrlChange={(url) =>
                      editContent((d) => {
                        d.hero.archiveThumbnailUrl = url;
                      })
                    }
                    onUpload={(file) =>
                      handleMediaUpload(file, "hero-archive-thumb", (url) => {
                        editContent((d) => {
                          d.hero.archiveThumbnailUrl = url;
                        });
                      })
                    }
                  />
                </div>

                {/* Hero Mockup Media Cards */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Hero Mockup Carousel</h3>
                      <p className="text-xs text-brand-muted">Visuals displayed in the 3D hero frame.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        editContent((d) => {
                          d.hero.mockupMedia.push({
                            id: `mockup-${Date.now()}`,
                            mediaKind: "image",
                            mediaUrl: "",
                            caption: "Showcase asset",
                          });
                        })
                      }
                      className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-brand-accent hover:bg-white/10"
                    >
                      + Add Slide
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {content.hero.mockupMedia.map((mockup, index) => (
                      <div
                        key={mockup.id}
                        className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-brand-accent">
                            Slide #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              editContent((d) => {
                                d.hero.mockupMedia.splice(index, 1);
                              })
                            }
                            className="text-xs text-zinc-500 hover:text-red-400"
                          >
                            Remove
                          </button>
                        </div>

                        <MediaField
                          label="Mockup Asset"
                          url={mockup.mediaUrl}
                          mediaKind={mockup.mediaKind}
                          isUploading={uploadingField === `hero-${index}`}
                          onUrlChange={(url) =>
                            editContent((d) => {
                              d.hero.mockupMedia[index].mediaUrl = url;
                            })
                          }
                          onKindChange={(kind) =>
                            editContent((d) => {
                              d.hero.mockupMedia[index].mediaKind = kind;
                            })
                          }
                          onUpload={(file) =>
                            handleMediaUpload(file, `hero-${index}`, (url, kind) => {
                              editContent((d) => {
                                d.hero.mockupMedia[index].mediaUrl = url;
                                d.hero.mockupMedia[index].mediaKind = kind;
                              });
                            })
                          }
                        />

                        <input
                          value={mockup.caption}
                          onChange={(e) =>
                            editContent((d) => {
                              d.hero.mockupMedia[index].caption = e.target.value;
                            })
                          }
                          className={fieldClass}
                          placeholder="Caption / Tagline"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {/* SECTION: ABOUT */}
            {activeSection === "about" ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Section Tag</label>
                    <input
                      value={content.about.title}
                      onChange={(e) =>
                        editContent((d) => {
                          d.about.title = e.target.value;
                        })
                      }
                      className={fieldClass}
                      placeholder="e.g. WHO I AM"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Main Statement Heading</label>
                    <input
                      value={content.about.heading}
                      onChange={(e) =>
                        editContent((d) => {
                          d.about.heading = e.target.value;
                        })
                      }
                      className={fieldClass}
                      placeholder="e.g. A designer-developer crafting memorable digital experiences."
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-brand-muted">Primary Story / Paragraph 1 (Design Roots)</label>
                  <textarea
                    rows={3}
                    value={content.about.description}
                    onChange={(e) =>
                      editContent((d) => {
                        d.about.description = e.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="My creative foundation started in graphic design—obsessing over composition..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-brand-muted">Evolution Story / Paragraph 2 (Frontend Engineering)</label>
                  <textarea
                    rows={3}
                    value={content.about.storyParagraphTwo ?? ""}
                    onChange={(e) =>
                      editContent((d) => {
                        d.about.storyParagraphTwo = e.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="To bring those designs to life, I expanded into modern frontend engineering..."
                  />
                </div>

                {/* Media Showcase: Headshot & Graphic Design Poster */}
                <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-white/10">
                  <MediaField
                    label="Creator Portrait Image"
                    url={content.about.imageUrl}
                    mediaKind="image"
                    helperText="Primary high-resolution portrait or workspace photo"
                    isUploading={uploadingField === "about-portrait"}
                    onUrlChange={(url) =>
                      editContent((d) => {
                        d.about.imageUrl = url;
                      })
                    }
                    onUpload={(file) =>
                      handleMediaUpload(file, "about-portrait", (url) => {
                        editContent((d) => {
                          d.about.imageUrl = url;
                        });
                      })
                    }
                  />

                  <MediaField
                    label="Visual Archive Graphic Poster Artwork"
                    url={content.about.posterImageUrl || "/uploads/1781775293542-artboard-1-300x.png"}
                    mediaKind="image"
                    helperText="Graphic design showcase artwork displayed in the About section"
                    isUploading={uploadingField === "about-poster"}
                    onUrlChange={(url) =>
                      editContent((d) => {
                        d.about.posterImageUrl = url;
                      })
                    }
                    onUpload={(file) =>
                      handleMediaUpload(file, "about-poster", (url) => {
                        editContent((d) => {
                          d.about.posterImageUrl = url;
                        });
                      })
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Poster Archive Tag</label>
                    <input
                      value={content.about.posterTag ?? ""}
                      onChange={(e) =>
                        editContent((d) => {
                          d.about.posterTag = e.target.value;
                        })
                      }
                      className={fieldClass}
                      placeholder="e.g. Visual Archive 01 / Graphic Poster System"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Poster Attribution / Studio</label>
                    <input
                      value={content.about.posterCredit ?? ""}
                      onChange={(e) =>
                        editContent((d) => {
                          d.about.posterCredit = e.target.value;
                        })
                      }
                      className={fieldClass}
                      placeholder="e.g. Graphndo Studio"
                    />
                  </div>
                </div>

                {/* 3 Pillars Editor */}
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-accent">
                    Core Craft Pillars (3-Column Showcase)
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2 rounded-xl border border-white/10 bg-black/30 p-3">
                      <label className="text-[11px] font-semibold text-white">Pillar 1</label>
                      <input
                        value={content.about.pillarOneTitle ?? ""}
                        onChange={(e) =>
                          editContent((d) => {
                            d.about.pillarOneTitle = e.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="e.g. 01 / Visual Heritage"
                      />
                      <input
                        value={content.about.pillarOneDesc ?? ""}
                        onChange={(e) =>
                          editContent((d) => {
                            d.about.pillarOneDesc = e.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="e.g. Brand & Typography"
                      />
                    </div>

                    <div className="space-y-2 rounded-xl border border-white/10 bg-black/30 p-3">
                      <label className="text-[11px] font-semibold text-white">Pillar 2</label>
                      <input
                        value={content.about.pillarTwoTitle ?? ""}
                        onChange={(e) =>
                          editContent((d) => {
                            d.about.pillarTwoTitle = e.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="e.g. 02 / Technical Craft"
                      />
                      <input
                        value={content.about.pillarTwoDesc ?? ""}
                        onChange={(e) =>
                          editContent((d) => {
                            d.about.pillarTwoDesc = e.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="e.g. Next.js & TypeScript"
                      />
                    </div>

                    <div className="space-y-2 rounded-xl border border-white/10 bg-black/30 p-3">
                      <label className="text-[11px] font-semibold text-white">Pillar 3</label>
                      <input
                        value={content.about.pillarThreeTitle ?? ""}
                        onChange={(e) =>
                          editContent((d) => {
                            d.about.pillarThreeTitle = e.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="e.g. 03 / Fluid Motion"
                      />
                      <input
                        value={content.about.pillarThreeDesc ?? ""}
                        onChange={(e) =>
                          editContent((d) => {
                            d.about.pillarThreeDesc = e.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="e.g. GSAP & Interaction"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* SECTION: EXPERIENCE */}
            {activeSection === "experience" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <p className="text-xs text-brand-muted">
                    Work history timeline. Each experience item can hold its own gallery showcase.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `exp-${Date.now()}`;
                      editContent((d) => {
                        d.experience.unshift({
                          id: newId,
                          year: new Date().getFullYear().toString(),
                          title: "New Role",
                          organization: "Company or Client",
                          summary: "Overview of responsibilities and achievements.",
                          gallery: [],
                        });
                      });
                      setExpandedCards((prev) => ({ ...prev, [newId]: true }));
                    }}
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-brand-accent hover:bg-white/10"
                  >
                    + Add Experience Role
                  </button>
                </div>

                <div className="space-y-4">
                  {content.experience.map((exp, expIndex) => {
                    const isExpanded = expandedCards[exp.id] ?? false;
                    return (
                      <div
                        key={exp.id}
                        className="rounded-2xl border border-white/10 bg-black/35 overflow-hidden transition"
                      >
                        {/* Header bar of experience card */}
                        <div
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 select-none"
                          onClick={() => toggleCard(exp.id)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="rounded-lg bg-brand-accent/20 px-2 py-1 font-numbers text-xs font-semibold text-brand-accent">
                              {exp.year}
                            </span>
                            <div>
                              <h4 className="text-sm font-semibold text-white">{exp.title}</h4>
                              <p className="text-xs text-brand-muted">{exp.organization}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              disabled={expIndex === 0}
                              onClick={() =>
                                editContent((d) => {
                                  const [moved] = d.experience.splice(expIndex, 1);
                                  d.experience.splice(expIndex - 1, 0, moved);
                                })
                              }
                              className="rounded p-1 text-xs text-zinc-500 hover:text-white disabled:opacity-30"
                              title="Move Up"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={expIndex === content.experience.length - 1}
                              onClick={() =>
                                editContent((d) => {
                                  const [moved] = d.experience.splice(expIndex, 1);
                                  d.experience.splice(expIndex + 1, 0, moved);
                                })
                              }
                              className="rounded p-1 text-xs text-zinc-500 hover:text-white disabled:opacity-30"
                              title="Move Down"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete "${exp.title}"?`)) {
                                  editContent((d) => {
                                    d.experience.splice(expIndex, 1);
                                  });
                                }
                              }}
                              className="rounded p-1 text-xs text-red-400 hover:bg-red-500/20"
                              title="Delete"
                            >
                              ✕
                            </button>
                            <span className="text-zinc-500 text-xs px-1">
                              {isExpanded ? "Collapse ▲" : "Edit ▼"}
                            </span>
                          </div>
                        </div>

                        {/* Collapsible content */}
                        {isExpanded ? (
                          <div className="p-4 pt-0 space-y-4 border-t border-white/5">
                            <div className="grid gap-3 sm:grid-cols-3 pt-3">
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-brand-muted">Year / Period</label>
                                <input
                                  value={exp.year}
                                  onChange={(e) =>
                                    editContent((d) => {
                                      d.experience[expIndex].year = e.target.value;
                                    })
                                  }
                                  className={fieldClass}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-brand-muted">Job Title</label>
                                <input
                                  value={exp.title}
                                  onChange={(e) =>
                                    editContent((d) => {
                                      d.experience[expIndex].title = e.target.value;
                                    })
                                  }
                                  className={fieldClass}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-brand-muted">Company / Org</label>
                                <input
                                  value={exp.organization}
                                  onChange={(e) =>
                                    editContent((d) => {
                                      d.experience[expIndex].organization = e.target.value;
                                    })
                                  }
                                  className={fieldClass}
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-medium text-brand-muted">Summary Description</label>
                              <textarea
                                rows={2}
                                value={exp.summary}
                                onChange={(e) =>
                                  editContent((d) => {
                                    d.experience[expIndex].summary = e.target.value;
                                  })
                                }
                                className={fieldClass}
                              />
                            </div>

                            {/* Experience Gallery */}
                            <div className="space-y-2 rounded-xl border border-white/5 bg-black/40 p-3">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-brand-muted uppercase">
                                  Gallery Items ({exp.gallery.length})
                                </label>
                                <button
                                  type="button"
                                  onClick={() =>
                                    editContent((d) => {
                                      d.experience[expIndex].gallery.push({
                                        id: `gal-${Date.now()}`,
                                        mediaKind: "image",
                                        mediaUrl: "",
                                        caption: "Project snapshot",
                                      });
                                    })
                                  }
                                  className="text-xs text-brand-accent hover:underline"
                                >
                                  + Add Media Image
                                </button>
                              </div>

                              <div className="space-y-3">
                                {exp.gallery.map((item, galIndex) => (
                                  <div
                                    key={item.id}
                                    className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-2"
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="text-[11px] text-brand-muted">Image #{galIndex + 1}</span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          editContent((d) => {
                                            d.experience[expIndex].gallery.splice(galIndex, 1);
                                          })
                                        }
                                        className="text-xs text-red-400 hover:underline"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                    <MediaField
                                      label="Image File or URL"
                                      url={item.mediaUrl}
                                      mediaKind={item.mediaKind}
                                      isUploading={uploadingField === `exp-${expIndex}-gal-${galIndex}`}
                                      onUrlChange={(url) =>
                                        editContent((d) => {
                                          d.experience[expIndex].gallery[galIndex].mediaUrl = url;
                                        })
                                      }
                                      onKindChange={(kind) =>
                                        editContent((d) => {
                                          d.experience[expIndex].gallery[galIndex].mediaKind = kind;
                                        })
                                      }
                                      onUpload={(file) =>
                                        handleMediaUpload(
                                          file,
                                          `exp-${expIndex}-gal-${galIndex}`,
                                          (url, kind) => {
                                            editContent((d) => {
                                              d.experience[expIndex].gallery[galIndex].mediaUrl = url;
                                              d.experience[expIndex].gallery[galIndex].mediaKind = kind;
                                            });
                                          },
                                        )
                                      }
                                    />
                                    <input
                                      value={item.caption}
                                      onChange={(e) =>
                                        editContent((d) => {
                                          d.experience[expIndex].gallery[galIndex].caption = e.target.value;
                                        })
                                      }
                                      className={fieldClass}
                                      placeholder="Image caption"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* SECTION: FEATURED WORKS */}
            {activeSection === "featured" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <p className="text-xs text-brand-muted">
                    Showcase projects with deep case study breakdown (challenge, research, design, outcome).
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `work-${Date.now()}`;
                      editContent((d) => {
                        d.featuredWorks.push({
                          id: newId,
                          title: "New Featured Project",
                          subtitle: "Category / Client",
                          mediaKind: "image",
                          mediaUrl: "",
                          challenge: "Describe client or product challenge.",
                          research: "Describe research and discovery.",
                          design: "Describe creative design approach.",
                          result: "Describe measurable metrics and impact.",
                          tools: ["Figma", "Next.js"],
                          caseStudyUrl: "#",
                        });
                      });
                      setExpandedCards((prev) => ({ ...prev, [newId]: true }));
                    }}
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-brand-accent hover:bg-white/10"
                  >
                    + Add Featured Project
                  </button>
                </div>

                <div className="space-y-4">
                  {content.featuredWorks.map((work, workIndex) => {
                    const isExpanded = expandedCards[work.id] ?? false;
                    return (
                      <div
                        key={work.id}
                        className="rounded-2xl border border-white/10 bg-black/35 overflow-hidden transition"
                      >
                        {/* Header bar */}
                        <div
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 select-none"
                          onClick={() => toggleCard(work.id)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-accent/20 text-brand-accent text-xs font-bold font-numbers">
                              {workIndex + 1}
                            </span>
                            <div>
                              <h4 className="text-sm font-semibold text-white">{work.title}</h4>
                              <p className="text-xs text-brand-muted">{work.subtitle}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              disabled={workIndex === 0}
                              onClick={() =>
                                editContent((d) => {
                                  const [moved] = d.featuredWorks.splice(workIndex, 1);
                                  d.featuredWorks.splice(workIndex - 1, 0, moved);
                                })
                              }
                              className="rounded p-1 text-xs text-zinc-500 hover:text-white disabled:opacity-30"
                              title="Move Up"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={workIndex === content.featuredWorks.length - 1}
                              onClick={() =>
                                editContent((d) => {
                                  const [moved] = d.featuredWorks.splice(workIndex, 1);
                                  d.featuredWorks.splice(workIndex + 1, 0, moved);
                                })
                              }
                              className="rounded p-1 text-xs text-zinc-500 hover:text-white disabled:opacity-30"
                              title="Move Down"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete project "${work.title}"?`)) {
                                  editContent((d) => {
                                    d.featuredWorks.splice(workIndex, 1);
                                  });
                                }
                              }}
                              className="rounded p-1 text-xs text-red-400 hover:bg-red-500/20"
                              title="Delete"
                            >
                              ✕
                            </button>
                            <span className="text-zinc-500 text-xs px-1">
                              {isExpanded ? "Collapse ▲" : "Edit ▼"}
                            </span>
                          </div>
                        </div>

                        {/* Collapsible form */}
                        {isExpanded ? (
                          <div className="p-5 pt-0 space-y-4 border-t border-white/5">
                            <div className="grid gap-3 sm:grid-cols-2 pt-4">
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-brand-muted">Project Title</label>
                                <input
                                  value={work.title}
                                  onChange={(e) =>
                                    editContent((d) => {
                                      d.featuredWorks[workIndex].title = e.target.value;
                                    })
                                  }
                                  className={fieldClass}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-brand-muted">Category / Subtitle</label>
                                <input
                                  value={work.subtitle}
                                  onChange={(e) =>
                                    editContent((d) => {
                                      d.featuredWorks[workIndex].subtitle = e.target.value;
                                    })
                                  }
                                  className={fieldClass}
                                />
                              </div>
                            </div>

                            <MediaField
                              label="Project Cover Media"
                              url={work.mediaUrl}
                              mediaKind={work.mediaKind}
                              isUploading={uploadingField === `work-${workIndex}`}
                              onUrlChange={(url) =>
                                editContent((d) => {
                                  d.featuredWorks[workIndex].mediaUrl = url;
                                })
                              }
                              onKindChange={(kind) =>
                                editContent((d) => {
                                  d.featuredWorks[workIndex].mediaKind = kind;
                                })
                              }
                              onUpload={(file) =>
                                handleMediaUpload(file, `work-${workIndex}`, (url, kind) => {
                                  editContent((d) => {
                                    d.featuredWorks[workIndex].mediaUrl = url;
                                    d.featuredWorks[workIndex].mediaKind = kind;
                                  });
                                })
                              }
                            />

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-brand-muted">1. The Challenge</label>
                                <textarea
                                  rows={3}
                                  value={work.challenge}
                                  onChange={(e) =>
                                    editContent((d) => {
                                      d.featuredWorks[workIndex].challenge = e.target.value;
                                    })
                                  }
                                  className={fieldClass}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-brand-muted">2. Research & Discovery</label>
                                <textarea
                                  rows={3}
                                  value={work.research}
                                  onChange={(e) =>
                                    editContent((d) => {
                                      d.featuredWorks[workIndex].research = e.target.value;
                                    })
                                  }
                                  className={fieldClass}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-brand-muted">3. Creative Design Approach</label>
                                <textarea
                                  rows={3}
                                  value={work.design}
                                  onChange={(e) =>
                                    editContent((d) => {
                                      d.featuredWorks[workIndex].design = e.target.value;
                                    })
                                  }
                                  className={fieldClass}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-brand-muted">4. Result & Impact</label>
                                <textarea
                                  rows={3}
                                  value={work.result}
                                  onChange={(e) =>
                                    editContent((d) => {
                                      d.featuredWorks[workIndex].result = e.target.value;
                                    })
                                  }
                                  className={fieldClass}
                                />
                              </div>
                            </div>

                            <TagListEditor
                              title="Tools & Technologies Used"
                              tags={work.tools}
                              onChange={(tags) =>
                                editContent((d) => {
                                  d.featuredWorks[workIndex].tools = tags;
                                })
                              }
                            />

                            <div className="grid gap-3 sm:grid-cols-3">
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-brand-muted">Case Study URL (Behance / Article)</label>
                                <input
                                  value={work.caseStudyUrl ?? ""}
                                  onChange={(e) =>
                                    editContent((d) => {
                                      d.featuredWorks[workIndex].caseStudyUrl = e.target.value;
                                    })
                                  }
                                  placeholder="https://behance.net/..."
                                  className={fieldClass}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-brand-muted">Live Project URL</label>
                                <input
                                  value={work.liveUrl ?? ""}
                                  onChange={(e) =>
                                    editContent((d) => {
                                      d.featuredWorks[workIndex].liveUrl = e.target.value;
                                    })
                                  }
                                  placeholder="https://example.com"
                                  className={fieldClass}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-brand-muted">GitHub Repository URL</label>
                                <input
                                  value={work.githubUrl ?? ""}
                                  onChange={(e) =>
                                    editContent((d) => {
                                      d.featuredWorks[workIndex].githubUrl = e.target.value;
                                    })
                                  }
                                  placeholder="https://github.com/..."
                                  className={fieldClass}
                                />
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* SECTION: SERVICES */}
            {activeSection === "services" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <p className="text-xs text-brand-muted">Capabilities offered to clients.</p>
                  <button
                    type="button"
                    onClick={() =>
                      editContent((d) => {
                        d.services.push({
                          id: `svc-${Date.now()}`,
                          title: "New Capability",
                          description: "Description of what this service covers.",
                        });
                      })
                    }
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-brand-accent hover:bg-white/10"
                  >
                    + Add Service
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {content.services.map((service, index) => (
                    <div
                      key={service.id}
                      className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-brand-accent">
                          Service #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            editContent((d) => {
                              d.services.splice(index, 1);
                            })
                          }
                          className="text-xs text-zinc-500 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>

                      <input
                        value={service.title}
                        onChange={(e) =>
                          editContent((d) => {
                            d.services[index].title = e.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="Service Title"
                      />

                      <textarea
                        rows={3}
                        value={service.description}
                        onChange={(e) =>
                          editContent((d) => {
                            d.services[index].description = e.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="Service Description"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* SECTION: TOOLBOX */}
            {activeSection === "toolbox" ? (
              <div className="space-y-6">
                <p className="text-xs text-brand-muted">
                  Software, languages, and frameworks categorized by purpose.
                </p>

                <TagListEditor
                  title="Design Stack & Tools"
                  tags={content.toolbox.design}
                  onChange={(tags) =>
                    editContent((d) => {
                      d.toolbox.design = tags;
                    })
                  }
                />

                <TagListEditor
                  title="Development Stack & Frameworks"
                  tags={content.toolbox.development}
                  onChange={(tags) =>
                    editContent((d) => {
                      d.toolbox.development = tags;
                    })
                  }
                />

                <TagListEditor
                  title="Currently Learning & Exploring"
                  tags={content.toolbox.learning}
                  onChange={(tags) =>
                    editContent((d) => {
                      d.toolbox.learning = tags;
                    })
                  }
                />
              </div>
            ) : null}

            {/* SECTION: WHY WORK WITH ME */}
            {activeSection === "why" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <p className="text-xs text-brand-muted">Your core values and strengths.</p>
                  <button
                    type="button"
                    onClick={() =>
                      editContent((d) => {
                        d.whyWorkWithMe.push({
                          id: `why-${Date.now()}`,
                          title: "Core Value",
                          description: "Why this matters to clients.",
                        });
                      })
                    }
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-brand-accent hover:bg-white/10"
                  >
                    + Add Value
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {content.whyWorkWithMe.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-brand-accent">
                          Card #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            editContent((d) => {
                              d.whyWorkWithMe.splice(index, 1);
                            })
                          }
                          className="text-xs text-zinc-500 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>

                      <input
                        value={item.title}
                        onChange={(e) =>
                          editContent((d) => {
                            d.whyWorkWithMe[index].title = e.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="Value Title"
                      />

                      <textarea
                        rows={3}
                        value={item.description}
                        onChange={(e) =>
                          editContent((d) => {
                            d.whyWorkWithMe[index].description = e.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="Value Description"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* SECTION: NUMBERS */}
            {activeSection === "numbers" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <p className="text-xs text-brand-muted">
                    Animated statistical counters (years of experience, projects delivered, etc.).
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      editContent((d) => {
                        d.numbers.push({
                          id: `stat-${Date.now()}`,
                          value: 10,
                          suffix: "+",
                          label: "Projects Completed",
                        });
                      })
                    }
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-brand-accent hover:bg-white/10"
                  >
                    + Add Counter
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                  {content.numbers.map((stat, index) => (
                    <div
                      key={stat.id}
                      className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-brand-accent">
                          Stat #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            editContent((d) => {
                              d.numbers.splice(index, 1);
                            })
                          }
                          className="text-xs text-zinc-500 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-brand-muted">Value</label>
                          <input
                            type="number"
                            value={stat.value}
                            onChange={(e) =>
                              editContent((d) => {
                                d.numbers[index].value = Number(e.target.value) || 0;
                              })
                            }
                            className={fieldClass}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-brand-muted">Suffix</label>
                          <input
                            value={stat.suffix ?? ""}
                            onChange={(e) =>
                              editContent((d) => {
                                d.numbers[index].suffix = e.target.value;
                              })
                            }
                            className={fieldClass}
                            placeholder="e.g. +"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-brand-muted">Label</label>
                        <input
                          value={stat.label}
                          onChange={(e) =>
                            editContent((d) => {
                              d.numbers[index].label = e.target.value;
                            })
                          }
                          className={fieldClass}
                          placeholder="Label"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* SECTION: CONTACT & SOCIAL */}
            {activeSection === "contact" ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Contact Section Title</label>
                    <input
                      value={content.contact.title}
                      onChange={(e) =>
                        editContent((d) => {
                          d.contact.title = e.target.value;
                        })
                      }
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Location</label>
                    <input
                      value={content.contact.location}
                      onChange={(e) =>
                        editContent((d) => {
                          d.contact.location = e.target.value;
                        })
                      }
                      className={fieldClass}
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-brand-muted">Description / Prompt</label>
                  <textarea
                    rows={2}
                    value={content.contact.description}
                    onChange={(e) =>
                      editContent((d) => {
                        d.contact.description = e.target.value;
                      })
                    }
                    className={fieldClass}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Email Address</label>
                    <input
                      type="email"
                      value={content.contact.email}
                      onChange={(e) =>
                        editContent((d) => {
                          d.contact.email = e.target.value;
                        })
                      }
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Phone Number</label>
                    <input
                      value={content.contact.phone}
                      onChange={(e) =>
                        editContent((d) => {
                          d.contact.phone = e.target.value;
                        })
                      }
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/10">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-accent">
                    Social &amp; Professional Channels
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-brand-muted">Instagram URL</label>
                      <input
                        value={content.contact.instagramUrl}
                        onChange={(e) =>
                          editContent((d) => {
                            d.contact.instagramUrl = e.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-brand-muted">LinkedIn URL</label>
                      <input
                        value={content.contact.linkedinUrl}
                        onChange={(e) =>
                          editContent((d) => {
                            d.contact.linkedinUrl = e.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-brand-muted">WhatsApp URL</label>
                      <input
                        value={content.contact.whatsappUrl}
                        onChange={(e) =>
                          editContent((d) => {
                            d.contact.whatsappUrl = e.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="https://wa.me/..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-brand-muted">GitHub Profile URL</label>
                      <input
                        value={content.contact.githubUrl ?? ""}
                        onChange={(e) =>
                          editContent((d) => {
                            d.contact.githubUrl = e.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="https://github.com/..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-brand-muted">Behance / Dribbble Portfolio URL</label>
                      <input
                        value={content.contact.behanceUrl ?? ""}
                        onChange={(e) =>
                          editContent((d) => {
                            d.contact.behanceUrl = e.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="https://behance.net/..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-brand-muted">Availability Status Badge</label>
                      <input
                        value={content.contact.availabilityStatus ?? ""}
                        onChange={(e) =>
                          editContent((d) => {
                            d.contact.availabilityStatus = e.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="e.g. Available for select projects"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Bottom Project CTA Button Label</label>
                    <input
                      value={content.contact.projectCtaLabel}
                      onChange={(e) =>
                        editContent((d) => {
                          d.contact.projectCtaLabel = e.target.value;
                        })
                      }
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-brand-muted">Bottom Project CTA Target</label>
                    <input
                      value={content.contact.projectCtaHref}
                      onChange={(e) =>
                        editContent((d) => {
                          d.contact.projectCtaHref = e.target.value;
                        })
                      }
                      className={fieldClass}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {/* SECTION: FOOTER */}
            {activeSection === "footer" ? (
              <div className="space-y-4 max-w-xl">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-brand-muted">Headline (Line One)</label>
                  <input
                    value={content.footer.lineOne}
                    onChange={(e) =>
                      editContent((d) => {
                        d.footer.lineOne = e.target.value;
                      })
                    }
                    className={fieldClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-brand-muted">Subtext (Line Two)</label>
                  <input
                    value={content.footer.lineTwo}
                    onChange={(e) =>
                      editContent((d) => {
                        d.footer.lineTwo = e.target.value;
                      })
                    }
                    className={fieldClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-brand-muted">Credit Badge</label>
                  <input
                    value={content.footer.credit}
                    onChange={(e) =>
                      editContent((d) => {
                        d.footer.credit = e.target.value;
                      })
                    }
                    className={fieldClass}
                  />
                </div>
              </div>
            ) : null}

            {/* SECTION: SETTINGS & SECURITY */}
            {activeSection === "settings" ? (
              <div className="space-y-8 max-w-2xl">
                {/* Account details */}
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-2">
                  <h3 className="text-sm font-semibold text-white">Current Admin Account</h3>
                  <div className="flex items-center gap-2 text-xs text-brand-muted">
                    <span>Registered Email:</span>
                    <span className="font-mono text-brand-accent">{accountEmail || "Loading..."}</span>
                  </div>
                </div>

                {/* Change Password */}
                <form onSubmit={resetCredentials} className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Change Admin Password</h3>
                    <p className="text-xs text-brand-muted">Requires your existing password to verify identity.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-brand-muted">Current Password</label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-brand-muted">New Password (min 8 characters)</label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={newLoginPassword}
                        onChange={(e) => setNewLoginPassword(e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-brand-muted">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={confirmNewLoginPassword}
                        onChange={(e) => setConfirmNewLoginPassword(e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="submit"
                      className="rounded-xl bg-gradient-accent px-4 py-2 text-xs font-semibold text-black hover:brightness-110"
                    >
                      Update Password
                    </button>
                    {passwordState ? (
                      <span className="text-xs text-brand-accent">{passwordState}</span>
                    ) : null}
                  </div>
                </form>

                {/* Email change */}
                <form onSubmit={changeEmailWithOtp} className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Change Admin Email</h3>
                    <p className="text-xs text-brand-muted">
                      {emailLocked && !otpConfigured
                        ? "Email updates require setting ADMIN_EMAIL_CHANGE_OTP in your environment variables."
                        : "Enter current password and one-time OTP."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-brand-muted">Current Password</label>
                      <input
                        type="password"
                        required
                        disabled={emailLocked && !otpConfigured}
                        value={emailChangeCurrentPassword}
                        onChange={(e) => setEmailChangeCurrentPassword(e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-brand-muted">New Email Address</label>
                      <input
                        type="email"
                        required
                        disabled={emailLocked && !otpConfigured}
                        value={pendingNewEmail}
                        onChange={(e) => setPendingNewEmail(e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-brand-muted">OTP Code</label>
                      <input
                        type="text"
                        required
                        disabled={emailLocked && !otpConfigured}
                        value={emailOtpCode}
                        onChange={(e) => setEmailOtpCode(e.target.value)}
                        className={fieldClass}
                        placeholder="6-digit security code"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="submit"
                      disabled={emailLocked && !otpConfigured}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white hover:bg-white/10 disabled:opacity-40"
                    >
                      Verify & Change Email
                    </button>
                    {emailChangeState ? (
                      <span className="text-xs text-brand-accent">{emailChangeState}</span>
                    ) : null}
                  </div>
                </form>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}
