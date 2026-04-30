/**
 * CPF Encryption & Masking Utilities - LGPD Compliance
 * 
 * Handles:
 * 1. CPF Encryption (AES-256-GCM) for storage
 * 2. CPF Masking (XXX.XXX.XXX-XX) for display
 * 3. CPF Validation & Formatting
 * 4. Key rotation support
 */

import crypto from "crypto";
import { ENV } from "./env";

// ============================================================================
// Constants
// ============================================================================

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 16; // 128 bits

// ============================================================================
// Key Management
// ============================================================================

/**
 * Derive encryption key from master key using PBKDF2
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(masterKey, salt, 100000, ENCRYPTION_KEY_LENGTH, "sha256");
}

/**
 * Get encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const keyEnv = ENV.cpfEncryptionKey || process.env.CPF_ENCRYPTION_KEY;
  if (!keyEnv) {
    throw new Error("CPF_ENCRYPTION_KEY environment variable not set");
  }
  // Assume key is base64 encoded
  return Buffer.from(keyEnv, "base64");
}

// ============================================================================
// CPF Formatting & Validation
// ============================================================================

/**
 * Remove formatting from CPF (11 digits only)
 */
export function normalizeCPF(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

/**
 * Validate CPF format and checksum
 */
export function isValidCPF(cpf: string): boolean {
  const normalized = normalizeCPF(cpf);

  // Must be exactly 11 digits
  if (normalized.length !== 11) {
    return false;
  }

  // Cannot be all same digits
  if (/^(\d)\1{10}$/.test(normalized)) {
    return false;
  }

  // Validate checksum (simplified - full validation would check both digits)
  const digits = normalized.split("").map(Number);
  let sum = 0;
  let remainder;

  // First digit
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== digits[9]) return false;

  // Second digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== digits[10]) return false;

  return true;
}

/**
 * Format CPF to XXX.XXX.XXX-XX format
 */
export function formatCPF(cpf: string): string {
  const normalized = normalizeCPF(cpf);
  if (normalized.length !== 11) {
    return cpf; // Return original if invalid
  }
  return `${normalized.substring(0, 3)}.${normalized.substring(3, 6)}.${normalized.substring(6, 9)}-${normalized.substring(9)}`;
}

/**
 * Mask CPF for display: XXX.XXX.XXX-XX
 */
export function maskCPF(cpf: string): string {
  const normalized = normalizeCPF(cpf);
  if (normalized.length !== 11) {
    return "***.***.***-**"; // Return masked if invalid
  }
  return `***.***.***-${normalized.substring(9)}`;
}

// ============================================================================
// Encryption & Decryption
// ============================================================================

/**
 * Encrypt CPF using AES-256-GCM
 * Returns: base64(salt + iv + ciphertext + authTag)
 */
export function encryptCPF(cpf: string): string {
  try {
    const normalized = normalizeCPF(cpf);

    if (!isValidCPF(normalized)) {
      throw new Error(`Invalid CPF format: ${cpf}`);
    }

    const masterKey = getEncryptionKey();
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = deriveKey(masterKey.toString("base64"), salt);
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
    let encrypted = cipher.update(normalized, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    // Combine: salt + iv + ciphertext + authTag
    const combined = Buffer.concat([salt, iv, Buffer.from(encrypted, "hex"), authTag]);
    return combined.toString("base64");
  } catch (error) {
    console.error("[CPF Crypto] Encryption error:", error);
    throw error;
  }
}

/**
 * Decrypt CPF using AES-256-GCM
 * Input: base64(salt + iv + ciphertext + authTag)
 */
export function decryptCPF(encrypted: string): string {
  try {
    const masterKey = getEncryptionKey();
    const combined = Buffer.from(encrypted, "base64");

    // Extract components
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = combined.slice(combined.length - AUTH_TAG_LENGTH);
    const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH, combined.length - AUTH_TAG_LENGTH);

    const key = deriveKey(masterKey.toString("base64"), salt);

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext.toString("hex"), "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("[CPF Crypto] Decryption error:", error);
    throw error;
  }
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Encrypt multiple CPFs (for migration)
 */
export function encryptMultipleCPFs(cpfs: string[]): { original: string; encrypted: string }[] {
  return cpfs.map((cpf) => ({
    original: cpf,
    encrypted: encryptCPF(cpf),
  }));
}

/**
 * Decrypt multiple CPFs (for verification)
 */
export function decryptMultipleCPFs(encryptedCPFs: string[]): { encrypted: string; decrypted: string }[] {
  return encryptedCPFs.map((encrypted) => ({
    encrypted,
    decrypted: decryptCPF(encrypted),
  }));
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Check if string is encrypted CPF (base64 format)
 */
export function isEncryptedCPF(value: string): boolean {
  try {
    const buffer = Buffer.from(value, "base64");
    // Encrypted CPF should be at least: salt(16) + iv(16) + ciphertext(11) + authTag(16) = 59 bytes
    return buffer.length >= 59;
  } catch {
    return false;
  }
}

/**
 * Check if string is plain CPF (11 digits)
 */
export function isPlainCPF(value: string): boolean {
  return normalizeCPF(value).length === 11;
}

// ============================================================================
// Migration Helpers
// ============================================================================

/**
 * Migrate CPF field from plain to encrypted
 * Used in database migrations
 */
export async function migrateCPFField(
  plainCPF: string | null
): Promise<{ encrypted: string | null; masked: string | null }> {
  if (!plainCPF) {
    return { encrypted: null, masked: null };
  }

  try {
    const normalized = normalizeCPF(plainCPF);
    if (!isValidCPF(normalized)) {
      console.warn(`[CPF Migration] Invalid CPF skipped: ${plainCPF}`);
      return { encrypted: null, masked: maskCPF(plainCPF) };
    }

    return {
      encrypted: encryptCPF(normalized),
      masked: maskCPF(normalized),
    };
  } catch (error) {
    console.error(`[CPF Migration] Error migrating CPF:`, error);
    return { encrypted: null, masked: maskCPF(plainCPF) };
  }
}

// ============================================================================
// Testing Helpers (Development Only)
// ============================================================================

/**
 * Generate test CPF (valid format, passes checksum)
 * Development only - DO NOT USE IN PRODUCTION
 */
export function generateTestCPF(): string {
  // Generate random 9 digits
  let digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));

  // Calculate first check digit
  let sum = digits.reduce((acc, digit, i) => acc + digit * (10 - i), 0);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  digits.push(remainder);

  // Calculate second check digit
  sum = digits.reduce((acc, digit, i) => acc + digit * (11 - i), 0);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  digits.push(remainder);

  return digits.join("");
}
