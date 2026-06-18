import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { list, put } from "@vercel/blob";
import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "bbsh_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;
const IS_SECURE_COOKIE =
  process.env.ADMIN_COOKIE_SECURE === "true" ||
  process.env.NODE_ENV === "production";

const ADMIN_AUTH_BLOB_PATH = "portfolio/content/admin-auth.json";
const LOCAL_ADMIN_AUTH_PATH = path.join(
  process.cwd(),
  "data",
  "admin-auth.json",
);

const PASSWORD_HASH_ITERATIONS = 210_000;
const PASSWORD_HASH_KEY_LENGTH = 64;
const MIN_PASSWORD_LENGTH = 8;

interface StoredAdminCredentials {
  email: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  firstLoginAt: string | null;
}

interface SessionPayload {
  email: string;
  expiresAt: number;
}

export interface CredentialValidationResult {
  ok: true;
}

export interface CredentialValidationError {
  ok: false;
  message: string;
}

export type CredentialMutationResult =
  | {
      ok: true;
      email?: string;
    }
  | CredentialValidationError;

type CredentialValidationResponse =
  | CredentialValidationResult
  | CredentialValidationError;

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "change-me-in-production";
}

function getEmailChangeOtpSecret() {
  return (process.env.ADMIN_EMAIL_CHANGE_OTP ?? "").trim();
}

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateCredentialInput(
  email: string,
  password: string,
): CredentialValidationResponse {
  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, message: "Enter a valid email address." };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }

  return { ok: true };
}

function parseStoredCredentials(input: unknown): StoredAdminCredentials | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const value = input as Partial<StoredAdminCredentials>;
  if (
    typeof value.email !== "string" ||
    typeof value.passwordSalt !== "string" ||
    typeof value.passwordHash !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    return null;
  }

  const firstLoginAtRaw = value.firstLoginAt;
  const firstLoginAt =
    firstLoginAtRaw === null ||
    typeof firstLoginAtRaw === "string"
      ? firstLoginAtRaw
      : firstLoginAtRaw === undefined
        ? value.createdAt
      : null;

  return {
    email: normalizeEmail(value.email),
    passwordSalt: value.passwordSalt,
    passwordHash: value.passwordHash,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    firstLoginAt,
  };
}

function createPasswordHash(password: string, passwordSalt: string) {
  return pbkdf2Sync(
    password,
    passwordSalt,
    PASSWORD_HASH_ITERATIONS,
    PASSWORD_HASH_KEY_LENGTH,
    "sha512",
  ).toString("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function createStoredCredentials(email: string, password: string): StoredAdminCredentials {
  const now = new Date().toISOString();
  const passwordSalt = randomBytes(16).toString("hex");
  const passwordHash = createPasswordHash(password, passwordSalt);

  return {
    email: normalizeEmail(email),
    passwordSalt,
    passwordHash,
    createdAt: now,
    updatedAt: now,
    firstLoginAt: null,
  };
}

async function ensureLocalAuthDirectory() {
  await mkdir(path.dirname(LOCAL_ADMIN_AUTH_PATH), { recursive: true });
}

async function readLocalCredentials() {
  try {
    const raw = await readFile(LOCAL_ADMIN_AUTH_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return parseStoredCredentials(parsed);
  } catch {
    return null;
  }
}

async function writeLocalCredentials(credentials: StoredAdminCredentials) {
  await ensureLocalAuthDirectory();
  await writeFile(
    LOCAL_ADMIN_AUTH_PATH,
    JSON.stringify(credentials, null, 2),
    "utf-8",
  );
}

async function readBlobCredentials() {
  try {
    const { blobs } = await list({ prefix: ADMIN_AUTH_BLOB_PATH, limit: 100 });
    if (!blobs.length) {
      return null;
    }

    const latest = blobs.sort(
      (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime(),
    )[0];

    const response = await fetch(latest.url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as unknown;
    return parseStoredCredentials(json);
  } catch {
    return null;
  }
}

async function writeBlobCredentials(credentials: StoredAdminCredentials) {
  await put(ADMIN_AUTH_BLOB_PATH, JSON.stringify(credentials, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function getStoredAdminCredentials() {
  if (hasBlobToken()) {
    const blobCredentials = await readBlobCredentials();
    if (blobCredentials) {
      return blobCredentials;
    }
  }

  return readLocalCredentials();
}

async function saveStoredAdminCredentials(credentials: StoredAdminCredentials) {
  if (hasBlobToken()) {
    await writeBlobCredentials(credentials);
  }

  await writeLocalCredentials(credentials);
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function encodeSessionPayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeSessionPayload(payload: string) {
  try {
    const decoded = Buffer.from(payload, "base64url").toString("utf-8");
    const parsed = JSON.parse(decoded) as unknown;

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const value = parsed as Partial<SessionPayload>;
    if (typeof value.email !== "string" || typeof value.expiresAt !== "number") {
      return null;
    }

    return {
      email: normalizeEmail(value.email),
      expiresAt: value.expiresAt,
    };
  } catch {
    return null;
  }
}

export function createSessionToken(email: string) {
  const payload = encodeSessionPayload({
    email: normalizeEmail(email),
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  });
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function validateSessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = sign(payload);
  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  const sessionPayload = decodeSessionPayload(payload);
  if (!sessionPayload || Date.now() > sessionPayload.expiresAt) {
    return null;
  }

  return sessionPayload;
}

export async function hasAdminCredentials() {
  const credentials = await getStoredAdminCredentials();
  return Boolean(credentials);
}

export async function getRegisteredAdminEmail() {
  const credentials = await getStoredAdminCredentials();
  return credentials?.email ?? null;
}

export async function registerAdminCredentials(
  email: string,
  password: string,
): Promise<CredentialValidationResponse> {
  const currentCredentials = await getStoredAdminCredentials();
  if (currentCredentials) {
    return { ok: false, message: "Admin account is already registered." };
  }

  const validation = validateCredentialInput(email, password);
  if (!validation.ok) {
    return validation;
  }

  await saveStoredAdminCredentials(createStoredCredentials(email, password));
  return { ok: true };
}

export async function verifyAdminCredentials(email: string, password: string) {
  const credentials = await getStoredAdminCredentials();
  if (!credentials) {
    return false;
  }

  if (normalizeEmail(email) !== credentials.email) {
    return false;
  }

  const passwordHash = createPasswordHash(password, credentials.passwordSalt);
  return safeEqual(passwordHash, credentials.passwordHash);
}

export async function markAdminLoginSuccess(email: string) {
  const credentials = await getStoredAdminCredentials();
  if (!credentials || credentials.email !== normalizeEmail(email)) {
    return;
  }

  if (credentials.firstLoginAt) {
    return;
  }

  credentials.firstLoginAt = new Date().toISOString();
  credentials.updatedAt = credentials.firstLoginAt;
  await saveStoredAdminCredentials(credentials);
}

export async function resetAdminCredentials(
  currentPassword: string,
  nextPassword: string,
): Promise<CredentialMutationResult> {
  const credentials = await getStoredAdminCredentials();
  if (!credentials) {
    return { ok: false, message: "Admin account is not registered yet." };
  }

  const nextValidation = validateCredentialInput(credentials.email, nextPassword);
  if (!nextValidation.ok) {
    return nextValidation;
  }

  const currentHash = createPasswordHash(
    currentPassword,
    credentials.passwordSalt,
  );
  if (!safeEqual(currentHash, credentials.passwordHash)) {
    return { ok: false, message: "Current password is incorrect." };
  }

  const nextCredentials = createStoredCredentials(credentials.email, nextPassword);
  nextCredentials.createdAt = credentials.createdAt;
  nextCredentials.updatedAt = new Date().toISOString();
  nextCredentials.firstLoginAt = credentials.firstLoginAt;

  await saveStoredAdminCredentials(nextCredentials);
  return { ok: true, email: nextCredentials.email };
}

export async function isEmailChangeOtpConfigured() {
  return Boolean(getEmailChangeOtpSecret());
}

export async function changeAdminEmailWithOtp(
  currentPassword: string,
  nextEmail: string,
  otpCode: string,
): Promise<CredentialMutationResult> {
  const credentials = await getStoredAdminCredentials();
  if (!credentials) {
    return { ok: false, message: "Admin account is not registered yet." };
  }

  if (!credentials.firstLoginAt) {
    return { ok: false, message: "Email can be changed only after first login." };
  }

  const normalizedNextEmail = normalizeEmail(nextEmail);
  if (!isValidEmail(normalizedNextEmail)) {
    return { ok: false, message: "Enter a valid email address." };
  }

  if (normalizedNextEmail === credentials.email) {
    return { ok: false, message: "New email must be different from current email." };
  }

  const currentHash = createPasswordHash(
    currentPassword,
    credentials.passwordSalt,
  );
  if (!safeEqual(currentHash, credentials.passwordHash)) {
    return { ok: false, message: "Current password is incorrect." };
  }

  const configuredOtp = getEmailChangeOtpSecret();
  if (!configuredOtp) {
    return {
      ok: false,
      message: "Email change OTP is not configured yet.",
    };
  }

  if (!safeEqual(otpCode.trim(), configuredOtp)) {
    return {
      ok: false,
      message: "Invalid OTP code.",
    };
  }

  const nextCredentials: StoredAdminCredentials = {
    ...credentials,
    email: normalizedNextEmail,
    updatedAt: new Date().toISOString(),
  };

  await saveStoredAdminCredentials(nextCredentials);
  return { ok: true, email: normalizedNextEmail };
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const session = validateSessionToken(token);
  if (!session) {
    return false;
  }

  const currentEmail = await getRegisteredAdminEmail();
  if (!currentEmail) {
    return false;
  }

  return currentEmail === session.email;
}

export async function setAdminSessionCookie(email: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: createSessionToken(email),
    httpOnly: true,
    secure: IS_SECURE_COOKIE,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: IS_SECURE_COOKIE,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
