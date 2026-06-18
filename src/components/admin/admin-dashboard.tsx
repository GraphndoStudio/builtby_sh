"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import type { PortfolioContent } from "@/types/portfolio";

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

const sidebarSections: Array<{ id: SectionId; label: string }> = [
  { id: "brand", label: "Brand & Navigation" },
  { id: "loading", label: "Loading" },
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "featured", label: "Featured Works" },
  { id: "services", label: "Services" },
  { id: "toolbox", label: "Toolbox" },
  { id: "why", label: "Why Work With Me" },
  { id: "numbers", label: "Numbers" },
  { id: "contact", label: "Contact & Social" },
  { id: "footer", label: "Footer" },
  { id: "settings", label: "Settings" },
];

const fieldClass =
  "w-full rounded-xl border border-[rgba(255,255,255,.08)] bg-black/35 px-3 py-2 text-sm";
const cardClass =
  "space-y-3 rounded-2xl border border-[rgba(255,255,255,.08)] bg-black/30 p-4";

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-[#A1A1AA]">{subtitle}</p> : null}
    </div>
  );
}

export function AdminDashboard({ initialContent }: AdminDashboardProps) {
  const [content, setContent] = useState<PortfolioContent>(initialContent);
  const [activeSection, setActiveSection] = useState<SectionId>("brand");
  const [saveState, setSaveState] = useState("");
  const [uploadState, setUploadState] = useState("");
  const [passwordState, setPasswordState] = useState("");
  const [emailChangeState, setEmailChangeState] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [emailLocked, setEmailLocked] = useState(true);
  const [otpConfigured, setOtpConfigured] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newLoginPassword, setNewLoginPassword] = useState("");
  const [confirmNewLoginPassword, setConfirmNewLoginPassword] = useState("");
  const [emailChangeCurrentPassword, setEmailChangeCurrentPassword] = useState("");
  const [pendingNewEmail, setPendingNewEmail] = useState("");
  const [emailOtpCode, setEmailOtpCode] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const response = await fetch("/api/admin/settings/credentials", {
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          email?: string;
          emailLocked?: boolean;
          otpConfigured?: boolean;
        };
        if (!active) {
          return;
        }

        setAccountEmail(data.email ?? "");
        setEmailLocked(data.emailLocked ?? true);
        setOtpConfigured(Boolean(data.otpConfigured));
      } catch {
        if (active) {
          setPasswordState("Could not load admin settings.");
        }
      }
    }

    void loadSettings();
    return () => {
      active = false;
    };
  }, []);

  function editContent(mutator: (draft: PortfolioContent) => void) {
    const next = structuredClone(content);
    mutator(next);
    setContent(next);
  }

  async function saveContent() {
    setSaveState("Saving...");

    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(content),
    });

    const data = (await response.json()) as {
      message?: string;
      content?: PortfolioContent;
    };

    if (!response.ok) {
      setSaveState(data.message ?? "Save failed");
      return;
    }

    if (data.content) {
      setContent(data.content);
    }

    setSaveState("Saved successfully.");
  }

  async function uploadMedia(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as { url?: string; message?: string };
    if (!response.ok || !data.url) {
      throw new Error(data.message ?? "Upload failed");
    }

    return data.url;
  }

  async function uploadTo(
    event: ChangeEvent<HTMLInputElement>,
    onUploaded: (url: string) => void,
    label: string,
  ) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadState(`Uploading ${label}...`);
    try {
      const url = await uploadMedia(file);
      onUploaded(url);
      setUploadState(`Uploaded ${label}: ${url}`);
    } catch (error) {
      setUploadState(error instanceof Error ? error.message : "Upload failed");
    }

    event.target.value = "";
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
      headers: {
        "Content-Type": "application/json",
      },
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
    setPasswordState(data.message ?? "Password updated successfully.");
  }

  async function changeEmailWithOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailChangeState("Processing email change...");

    const response = await fetch("/api/admin/settings/email", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
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
    setEmailChangeState(data.message ?? "Admin email updated.");
  }

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-6 text-[#F8FAFC] md:px-6">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="rounded-3xl border border-[rgba(255,255,255,.08)] bg-[#101010]/80 p-5 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-sm uppercase tracking-[0.18em] text-[#2AFADF]">
                THE CREATIVE ENGINE
              </p>
              <h1 className="mt-1 text-2xl font-semibold">Simple Admin Panel</h1>
              <p className="mt-1 text-sm text-[#A1A1AA]">
                Pick a section from the sidebar and edit with form fields.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={saveContent}
                className="rounded-full bg-gradient-to-b from-[#2AFADF] to-[#4C83FF] px-4 py-2 text-sm font-semibold text-black"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-[rgba(255,255,255,.08)] px-4 py-2 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-[#2AFADF]">{saveState}</p>
          <p className="text-xs text-[#2AFADF]">{uploadState}</p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-3xl border border-[rgba(255,255,255,.08)] bg-[#101010]/80 p-3 lg:sticky lg:top-4 lg:h-fit">
            <nav className="space-y-1">
              {sidebarSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                    activeSection === section.id
                      ? "bg-[#2AFADF]/15 text-[#2AFADF]"
                      : "text-[#F8FAFC] hover:bg-white/5"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </aside>

          <section className="space-y-4 rounded-3xl border border-[rgba(255,255,255,.08)] bg-[#101010]/80 p-5 backdrop-blur-xl">
            {activeSection === "brand" ? (
              <div className="space-y-4">
                <SectionTitle
                  title="Brand & Navigation"
                  subtitle="Edit brand details and menu items."
                />

                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={content.brand.name}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.brand.name = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Brand name"
                  />
                  <input
                    value={content.brand.tagline}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.brand.tagline = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Tagline"
                  />
                </div>

                <div className={cardClass}>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#A1A1AA]">
                    Navigation
                  </p>
                  {content.navigation.map((item, index) => (
                    <div
                      key={`nav-${index}`}
                      className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"
                    >
                      <input
                        value={item.label}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.navigation[index].label = event.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="Label"
                      />
                      <input
                        value={item.href}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.navigation[index].href = event.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="#section"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          editContent((draft) => {
                            draft.navigation.splice(index, 1);
                          })
                        }
                        className="rounded-xl border border-[rgba(255,255,255,.08)] px-3 py-2 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      editContent((draft) => {
                        draft.navigation.push({ label: "New", href: "#new" });
                      })
                    }
                    className="rounded-full border border-[rgba(255,255,255,.08)] px-4 py-2 text-xs"
                  >
                    Add Menu Item
                  </button>
                </div>
              </div>
            ) : null}

            {activeSection === "loading" ? (
              <div className="space-y-4">
                <SectionTitle title="Loading Screen" />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={content.loading.displayName}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.loading.displayName = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Display name"
                  />
                  <input
                    value={content.loading.statusText}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.loading.statusText = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Status text"
                  />
                </div>
              </div>
            ) : null}

            {activeSection === "hero" ? (
              <div className="space-y-4">
                <SectionTitle
                  title="Hero Section"
                  subtitle="Text fields plus hero mockup media."
                />

                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={content.hero.displayName}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.hero.displayName = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Display name"
                  />
                  <input
                    value={content.hero.subheadline}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.hero.subheadline = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Subheadline"
                  />
                  <input
                    value={content.hero.rolePrimary}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.hero.rolePrimary = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Role primary"
                  />
                  <input
                    value={content.hero.roleSecondary}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.hero.roleSecondary = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Role secondary"
                  />
                  <input
                    value={content.hero.roleMorph}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.hero.roleMorph = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Role morph"
                  />
                  <input
                    value={content.hero.resumeUrl}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.hero.resumeUrl = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Resume URL"
                  />
                  <input
                    value={content.hero.primaryCtaLabel}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.hero.primaryCtaLabel = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Primary CTA label"
                  />
                  <input
                    value={content.hero.primaryCtaHref}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.hero.primaryCtaHref = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Primary CTA href"
                  />
                  <input
                    value={content.hero.secondaryCtaLabel}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.hero.secondaryCtaLabel = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Secondary CTA label"
                  />
                  <input
                    value={content.hero.secondaryCtaHref}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.hero.secondaryCtaHref = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Secondary CTA href"
                  />
                </div>

                <div className={cardClass}>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#A1A1AA]">
                    Hero Mockup Media
                  </p>
                  {content.hero.mockupMedia.map((item, index) => (
                    <div key={item.id} className={cardClass}>
                      <div className="grid gap-2 md:grid-cols-2">
                        <input
                          value={item.id}
                          onChange={(event) =>
                            editContent((draft) => {
                              draft.hero.mockupMedia[index].id = event.target.value;
                            })
                          }
                          className={fieldClass}
                          placeholder="ID"
                        />
                        <input
                          value={item.caption}
                          onChange={(event) =>
                            editContent((draft) => {
                              draft.hero.mockupMedia[index].caption =
                                event.target.value;
                            })
                          }
                          className={fieldClass}
                          placeholder="Caption"
                        />
                        <select
                          value={item.mediaKind}
                          onChange={(event) =>
                            editContent((draft) => {
                              draft.hero.mockupMedia[index].mediaKind =
                                event.target.value as "image" | "video";
                            })
                          }
                          className={fieldClass}
                        >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                        <input
                          value={item.mediaUrl}
                          onChange={(event) =>
                            editContent((draft) => {
                              draft.hero.mockupMedia[index].mediaUrl =
                                event.target.value;
                            })
                          }
                          className={fieldClass}
                          placeholder="Media URL"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="file"
                          onChange={(event) =>
                            uploadTo(
                              event,
                              (url) =>
                                editContent((draft) => {
                                  draft.hero.mockupMedia[index].mediaUrl = url;
                                }),
                              `hero media ${index + 1}`,
                            )
                          }
                          className="text-xs"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            editContent((draft) => {
                              draft.hero.mockupMedia.splice(index, 1);
                            })
                          }
                          className="rounded-xl border border-[rgba(255,255,255,.08)] px-3 py-2 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      editContent((draft) => {
                        draft.hero.mockupMedia.push({
                          id: `mockup-${draft.hero.mockupMedia.length + 1}`,
                          mediaKind: "image",
                          mediaUrl: "",
                          caption: "",
                        });
                      })
                    }
                    className="rounded-full border border-[rgba(255,255,255,.08)] px-4 py-2 text-xs"
                  >
                    Add Hero Media
                  </button>
                </div>
              </div>
            ) : null}

            {activeSection === "about" ? (
              <div className="space-y-4">
                <SectionTitle
                  title="About Section"
                  subtitle="Use URL or upload for profile image."
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={content.about.title}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.about.title = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Title"
                  />
                  <input
                    value={content.about.heading}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.about.heading = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Heading"
                  />
                  <input
                    value={content.about.imageUrl}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.about.imageUrl = event.target.value;
                      })
                    }
                    className={`${fieldClass} md:col-span-2`}
                    placeholder="Image URL"
                  />
                  <textarea
                    value={content.about.description}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.about.description = event.target.value;
                      })
                    }
                    rows={4}
                    className={`${fieldClass} md:col-span-2`}
                    placeholder="Description"
                  />
                </div>
                <input
                  type="file"
                  onChange={(event) =>
                    uploadTo(
                      event,
                      (url) =>
                        editContent((draft) => {
                          draft.about.imageUrl = url;
                        }),
                      "about image",
                    )
                  }
                  className="text-xs"
                />
              </div>
            ) : null}

            {activeSection === "experience" ? (
              <div className="space-y-4">
                <SectionTitle
                  title="Experience Section"
                  subtitle="Each item can have its own work gallery."
                />
                {content.experience.map((item, expIndex) => (
                  <div key={item.id} className={cardClass}>
                    <div className="grid gap-2 md:grid-cols-2">
                      <input
                        value={item.id}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.experience[expIndex].id = event.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="ID"
                      />
                      <input
                        value={item.year}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.experience[expIndex].year = event.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="Year"
                      />
                      <input
                        value={item.title}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.experience[expIndex].title = event.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="Title"
                      />
                      <input
                        value={item.organization}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.experience[expIndex].organization =
                              event.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="Organization"
                      />
                      <textarea
                        value={item.summary}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.experience[expIndex].summary =
                              event.target.value;
                          })
                        }
                        rows={3}
                        className={`${fieldClass} md:col-span-2`}
                        placeholder="Summary"
                      />
                    </div>

                    <div className={cardClass}>
                      <p className="text-xs uppercase tracking-[0.16em] text-[#A1A1AA]">
                        Gallery
                      </p>
                      {item.gallery.map((media, mediaIndex) => (
                        <div key={media.id} className={cardClass}>
                          <div className="grid gap-2 md:grid-cols-2">
                            <input
                              value={media.id}
                              onChange={(event) =>
                                editContent((draft) => {
                                  draft.experience[expIndex].gallery[
                                    mediaIndex
                                  ].id = event.target.value;
                                })
                              }
                              className={fieldClass}
                              placeholder="Media ID"
                            />
                            <input
                              value={media.caption}
                              onChange={(event) =>
                                editContent((draft) => {
                                  draft.experience[expIndex].gallery[
                                    mediaIndex
                                  ].caption = event.target.value;
                                })
                              }
                              className={fieldClass}
                              placeholder="Caption"
                            />
                            <select
                              value={media.mediaKind}
                              onChange={(event) =>
                                editContent((draft) => {
                                  draft.experience[expIndex].gallery[
                                    mediaIndex
                                  ].mediaKind = event.target.value as
                                    | "image"
                                    | "video";
                                })
                              }
                              className={fieldClass}
                            >
                              <option value="image">Image</option>
                              <option value="video">Video</option>
                            </select>
                            <input
                              value={media.mediaUrl}
                              onChange={(event) =>
                                editContent((draft) => {
                                  draft.experience[expIndex].gallery[
                                    mediaIndex
                                  ].mediaUrl = event.target.value;
                                })
                              }
                              className={fieldClass}
                              placeholder="Media URL"
                            />
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="file"
                              onChange={(event) =>
                                uploadTo(
                                  event,
                                  (url) =>
                                    editContent((draft) => {
                                      draft.experience[expIndex].gallery[
                                        mediaIndex
                                      ].mediaUrl = url;
                                    }),
                                  `experience media ${mediaIndex + 1}`,
                                )
                              }
                              className="text-xs"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                editContent((draft) => {
                                  draft.experience[expIndex].gallery.splice(
                                    mediaIndex,
                                    1,
                                  );
                                })
                              }
                              className="rounded-xl border border-[rgba(255,255,255,.08)] px-3 py-2 text-xs"
                            >
                              Remove Media
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          editContent((draft) => {
                            draft.experience[expIndex].gallery.push({
                              id: `exp-${expIndex + 1}-media-${
                                draft.experience[expIndex].gallery.length + 1
                              }`,
                              mediaKind: "image",
                              mediaUrl: "",
                              caption: "",
                            });
                          })
                        }
                        className="rounded-full border border-[rgba(255,255,255,.08)] px-4 py-2 text-xs"
                      >
                        Add Gallery Media
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        editContent((draft) => {
                          draft.experience.splice(expIndex, 1);
                        })
                      }
                      className="rounded-xl border border-[rgba(255,255,255,.08)] px-3 py-2 text-xs"
                    >
                      Remove Experience Item
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    editContent((draft) => {
                      draft.experience.push({
                        id: `exp-${draft.experience.length + 1}`,
                        year: "",
                        title: "",
                        organization: "",
                        summary: "",
                        gallery: [],
                      });
                    })
                  }
                  className="rounded-full border border-[rgba(255,255,255,.08)] px-4 py-2 text-xs"
                >
                  Add Experience Item
                </button>
              </div>
            ) : null}

            {activeSection === "featured" ? (
              <div className="space-y-4">
                <SectionTitle
                  title="Featured Works"
                  subtitle="No code view, only direct fields."
                />
                {content.featuredWorks.map((item, index) => (
                  <div key={item.id} className={cardClass}>
                    <div className="grid gap-2 md:grid-cols-2">
                      <input
                        value={item.id}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.featuredWorks[index].id = event.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="ID"
                      />
                      <input
                        value={item.title}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.featuredWorks[index].title =
                              event.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="Title"
                      />
                      <input
                        value={item.subtitle}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.featuredWorks[index].subtitle =
                              event.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="Subtitle"
                      />
                      <select
                        value={item.mediaKind}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.featuredWorks[index].mediaKind =
                              event.target.value as "image" | "video";
                          })
                        }
                        className={fieldClass}
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                      <input
                        value={item.mediaUrl}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.featuredWorks[index].mediaUrl =
                              event.target.value;
                          })
                        }
                        className={`${fieldClass} md:col-span-2`}
                        placeholder="Media URL"
                      />
                      <textarea
                        value={item.challenge}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.featuredWorks[index].challenge =
                              event.target.value;
                          })
                        }
                        rows={2}
                        className={fieldClass}
                        placeholder="Challenge"
                      />
                      <textarea
                        value={item.research}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.featuredWorks[index].research =
                              event.target.value;
                          })
                        }
                        rows={2}
                        className={fieldClass}
                        placeholder="Research"
                      />
                      <textarea
                        value={item.design}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.featuredWorks[index].design =
                              event.target.value;
                          })
                        }
                        rows={2}
                        className={fieldClass}
                        placeholder="Design"
                      />
                      <textarea
                        value={item.result}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.featuredWorks[index].result =
                              event.target.value;
                          })
                        }
                        rows={2}
                        className={fieldClass}
                        placeholder="Result"
                      />
                      <input
                        value={item.tools.join(", ")}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.featuredWorks[index].tools = event.target.value
                              .split(",")
                              .map((tool) => tool.trim())
                              .filter(Boolean);
                          })
                        }
                        className={fieldClass}
                        placeholder="Tools (comma separated)"
                      />
                      <input
                        value={item.caseStudyUrl ?? ""}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.featuredWorks[index].caseStudyUrl =
                              event.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="Case study URL"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        onChange={(event) =>
                          uploadTo(
                            event,
                            (url) =>
                              editContent((draft) => {
                                draft.featuredWorks[index].mediaUrl = url;
                              }),
                            `featured work ${index + 1}`,
                          )
                        }
                        className="text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          editContent((draft) => {
                            draft.featuredWorks.splice(index, 1);
                          })
                        }
                        className="rounded-xl border border-[rgba(255,255,255,.08)] px-3 py-2 text-xs"
                      >
                        Remove Work
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    editContent((draft) => {
                      draft.featuredWorks.push({
                        id: `work-${draft.featuredWorks.length + 1}`,
                        title: "",
                        subtitle: "",
                        mediaKind: "image",
                        mediaUrl: "",
                        challenge: "",
                        research: "",
                        design: "",
                        result: "",
                        tools: [],
                        caseStudyUrl: "#",
                      });
                    })
                  }
                  className="rounded-full border border-[rgba(255,255,255,.08)] px-4 py-2 text-xs"
                >
                  Add Featured Work
                </button>
              </div>
            ) : null}

            {activeSection === "services" ? (
              <div className="space-y-4">
                <SectionTitle title="Services" />
                {content.services.map((item, index) => (
                  <div key={item.id} className={cardClass}>
                    <div className="grid gap-2 md:grid-cols-2">
                      <input
                        value={item.id}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.services[index].id = event.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="ID"
                      />
                      <input
                        value={item.title}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.services[index].title = event.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="Title"
                      />
                      <textarea
                        value={item.description}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.services[index].description =
                              event.target.value;
                          })
                        }
                        rows={2}
                        className={`${fieldClass} md:col-span-2`}
                        placeholder="Description"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        editContent((draft) => {
                          draft.services.splice(index, 1);
                        })
                      }
                      className="rounded-xl border border-[rgba(255,255,255,.08)] px-3 py-2 text-xs"
                    >
                      Remove Service
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    editContent((draft) => {
                      draft.services.push({
                        id: `srv-${draft.services.length + 1}`,
                        title: "",
                        description: "",
                      });
                    })
                  }
                  className="rounded-full border border-[rgba(255,255,255,.08)] px-4 py-2 text-xs"
                >
                  Add Service
                </button>
              </div>
            ) : null}

            {activeSection === "toolbox" ? (
              <div className="space-y-4">
                <SectionTitle title="Toolbox" />
                <div className="grid gap-3 md:grid-cols-3">
                  <textarea
                    value={content.toolbox.design.join("\n")}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.toolbox.design = event.target.value
                          .split("\n")
                          .map((item) => item.trim())
                          .filter(Boolean);
                      })
                    }
                    rows={12}
                    className={fieldClass}
                    placeholder="One tool per line"
                  />
                  <textarea
                    value={content.toolbox.development.join("\n")}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.toolbox.development = event.target.value
                          .split("\n")
                          .map((item) => item.trim())
                          .filter(Boolean);
                      })
                    }
                    rows={12}
                    className={fieldClass}
                    placeholder="One tool per line"
                  />
                  <textarea
                    value={content.toolbox.learning.join("\n")}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.toolbox.learning = event.target.value
                          .split("\n")
                          .map((item) => item.trim())
                          .filter(Boolean);
                      })
                    }
                    rows={12}
                    className={fieldClass}
                    placeholder="One tool per line"
                  />
                </div>
              </div>
            ) : null}

            {activeSection === "why" ? (
              <div className="space-y-4">
                <SectionTitle title="Why Work With Me" />
                {content.whyWorkWithMe.map((item, index) => (
                  <div key={item.id} className={cardClass}>
                    <div className="grid gap-2 md:grid-cols-2">
                      <input
                        value={item.id}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.whyWorkWithMe[index].id = event.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="ID"
                      />
                      <input
                        value={item.title}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.whyWorkWithMe[index].title = event.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="Title"
                      />
                      <textarea
                        value={item.description}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.whyWorkWithMe[index].description =
                              event.target.value;
                          })
                        }
                        rows={2}
                        className={`${fieldClass} md:col-span-2`}
                        placeholder="Description"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        editContent((draft) => {
                          draft.whyWorkWithMe.splice(index, 1);
                        })
                      }
                      className="rounded-xl border border-[rgba(255,255,255,.08)] px-3 py-2 text-xs"
                    >
                      Remove Item
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    editContent((draft) => {
                      draft.whyWorkWithMe.push({
                        id: `why-${draft.whyWorkWithMe.length + 1}`,
                        title: "",
                        description: "",
                      });
                    })
                  }
                  className="rounded-full border border-[rgba(255,255,255,.08)] px-4 py-2 text-xs"
                >
                  Add Item
                </button>
              </div>
            ) : null}

            {activeSection === "numbers" ? (
              <div className="space-y-4">
                <SectionTitle title="Numbers" />
                {content.numbers.map((item, index) => (
                  <div key={item.id} className={cardClass}>
                    <div className="grid gap-2 md:grid-cols-4">
                      <input
                        value={item.id}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.numbers[index].id = event.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="ID"
                      />
                      <input
                        type="number"
                        value={item.value}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.numbers[index].value = Number(
                              event.target.value,
                            );
                          })
                        }
                        className={fieldClass}
                        placeholder="Value"
                      />
                      <input
                        value={item.suffix ?? ""}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.numbers[index].suffix = event.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="Suffix"
                      />
                      <input
                        value={item.label}
                        onChange={(event) =>
                          editContent((draft) => {
                            draft.numbers[index].label = event.target.value;
                          })
                        }
                        className={fieldClass}
                        placeholder="Label"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        editContent((draft) => {
                          draft.numbers.splice(index, 1);
                        })
                      }
                      className="rounded-xl border border-[rgba(255,255,255,.08)] px-3 py-2 text-xs"
                    >
                      Remove Number
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    editContent((draft) => {
                      draft.numbers.push({
                        id: `num-${draft.numbers.length + 1}`,
                        value: 0,
                        suffix: "",
                        label: "",
                      });
                    })
                  }
                  className="rounded-full border border-[rgba(255,255,255,.08)] px-4 py-2 text-xs"
                >
                  Add Number
                </button>
              </div>
            ) : null}

            {activeSection === "contact" ? (
              <div className="space-y-4">
                <SectionTitle
                  title="Contact & Social Links"
                  subtitle="Editable social URLs with simple fields."
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={content.contact.title}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.contact.title = event.target.value;
                      })
                    }
                    className={`${fieldClass} md:col-span-2`}
                    placeholder="Contact title"
                  />
                  <textarea
                    value={content.contact.description}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.contact.description = event.target.value;
                      })
                    }
                    rows={3}
                    className={`${fieldClass} md:col-span-2`}
                    placeholder="Description"
                  />
                  <input
                    value={content.contact.email}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.contact.email = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Email"
                  />
                  <input
                    value={content.contact.phone}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.contact.phone = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Phone"
                  />
                  <input
                    value={content.contact.location}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.contact.location = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Location"
                  />
                  <input
                    value={content.contact.projectCtaLabel}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.contact.projectCtaLabel = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="CTA label"
                  />
                  <input
                    value={content.contact.projectCtaHref}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.contact.projectCtaHref = event.target.value;
                      })
                    }
                    className={`${fieldClass} md:col-span-2`}
                    placeholder="CTA URL"
                  />
                  <input
                    value={content.contact.instagramUrl}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.contact.instagramUrl = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Instagram URL"
                  />
                  <input
                    value={content.contact.linkedinUrl}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.contact.linkedinUrl = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="LinkedIn URL"
                  />
                  <input
                    value={content.contact.whatsappUrl}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.contact.whatsappUrl = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="WhatsApp URL"
                  />
                </div>
              </div>
            ) : null}

            {activeSection === "footer" ? (
              <div className="space-y-4">
                <SectionTitle title="Footer" />
                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    value={content.footer.lineOne}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.footer.lineOne = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Line one"
                  />
                  <input
                    value={content.footer.lineTwo}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.footer.lineTwo = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Line two"
                  />
                  <input
                    value={content.footer.credit}
                    onChange={(event) =>
                      editContent((draft) => {
                        draft.footer.credit = event.target.value;
                      })
                    }
                    className={fieldClass}
                    placeholder="Credit"
                  />
                </div>
              </div>
            ) : null}

            {activeSection === "settings" ? (
              <div className="space-y-4">
                <SectionTitle
                  title="Admin Settings"
                  subtitle="Email is locked after first login. Use OTP verification to change it."
                />
                <div className={cardClass}>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#A1A1AA]">
                    Current Admin Email
                  </p>
                  <p className="text-sm text-[#F8FAFC]">
                    {accountEmail || "Not available"}
                  </p>
                  <p className="text-xs text-[#A1A1AA]">
                    {emailLocked
                      ? "Email is locked for direct editing."
                      : "Email can be edited directly."}
                  </p>
                </div>

                <form onSubmit={resetCredentials} className={`${cardClass} space-y-3`}>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#A1A1AA]">
                    Reset Password
                  </p>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className={fieldClass}
                    placeholder="Current password"
                    required
                  />
                  <input
                    type="password"
                    value={newLoginPassword}
                    onChange={(event) => setNewLoginPassword(event.target.value)}
                    className={fieldClass}
                    placeholder="New password"
                    required
                  />
                  <input
                    type="password"
                    value={confirmNewLoginPassword}
                    onChange={(event) => setConfirmNewLoginPassword(event.target.value)}
                    className={fieldClass}
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-gradient-to-b from-[#2AFADF] to-[#4C83FF] px-4 py-2 text-sm font-semibold text-black"
                  >
                    Update Password
                  </button>
                  <p className="text-sm text-[#2AFADF]">{passwordState}</p>
                </form>

                <form
                  onSubmit={changeEmailWithOtp}
                  className={`${cardClass} space-y-3`}
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-[#A1A1AA]">
                    Change Email (OTP Verification)
                  </p>
                  <input
                    type="password"
                    value={emailChangeCurrentPassword}
                    onChange={(event) =>
                      setEmailChangeCurrentPassword(event.target.value)
                    }
                    className={fieldClass}
                    placeholder="Current password"
                    required
                  />
                  <input
                    type="email"
                    value={pendingNewEmail}
                    onChange={(event) => setPendingNewEmail(event.target.value)}
                    className={fieldClass}
                    placeholder="New admin email"
                    required
                  />
                  <input
                    type="text"
                    value={emailOtpCode}
                    onChange={(event) => setEmailOtpCode(event.target.value)}
                    className={fieldClass}
                    placeholder="OTP code"
                    required
                  />
                  <p className="text-xs text-[#A1A1AA]">
                    {otpConfigured
                      ? "OTP verification is enabled."
                      : "OTP is not configured yet. Set it in env and restart."}
                  </p>
                  <button
                    type="submit"
                    disabled={!otpConfigured}
                    className="rounded-full bg-gradient-to-b from-[#2AFADF] to-[#4C83FF] px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Verify OTP & Change Email
                  </button>
                  <p className="text-sm text-[#2AFADF]">{emailChangeState}</p>
                </form>
              </div>
            ) : null}
          </section>
        </div>

      </div>
    </div>
  );
}
