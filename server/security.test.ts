/**
 * Security Tests - CPF Encryption, Masking, and Rate Limiting
 * Fase 3: LGPD Compliance & Security
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  normalizeCPF,
  isValidCPF,
  formatCPF,
  maskCPF,
  isEncryptedCPF,
  isPlainCPF,
  generateTestCPF,
} from "./server/_core/cpf-crypto";
import { RateLimiter, getRateLimitKey, getClientIP } from "./server/_core/rate-limiter";
import { TRPCError } from "@trpc/server";

// ============================================================================
// CPF Utilities Tests
// ============================================================================

describe("CPF Utilities", () => {
  describe("normalizeCPF", () => {
    it("should remove formatting from CPF", () => {
      expect(normalizeCPF("123.456.789-10")).toBe("12345678910");
      expect(normalizeCPF("123 456 789 10")).toBe("12345678910");
    });

    it("should handle already normalized CPF", () => {
      expect(normalizeCPF("12345678910")).toBe("12345678910");
    });

    it("should remove all non-digits", () => {
      expect(normalizeCPF("123-456-789.10")).toBe("12345678910");
    });
  });

  describe("isValidCPF", () => {
    it("should validate correct CPF format", () => {
      // Using a known valid CPF (11111144477 is valid for testing)
      const validCPF = "11144477735"; // Valid test CPF
      expect(isValidCPF(validCPF)).toBe(true);
    });

    it("should reject CPF with all same digits", () => {
      expect(isValidCPF("11111111111")).toBe(false);
      expect(isValidCPF("00000000000")).toBe(false);
    });

    it("should reject CPF with wrong length", () => {
      expect(isValidCPF("123456789")).toBe(false);
      expect(isValidCPF("123456789101112")).toBe(false);
    });

    it("should reject CPF with invalid checksum", () => {
      expect(isValidCPF("12345678901")).toBe(false);
    });
  });

  describe("formatCPF", () => {
    it("should format CPF to XXX.XXX.XXX-XX", () => {
      expect(formatCPF("12345678910")).toBe("123.456.789-10");
    });

    it("should handle already formatted CPF", () => {
      expect(formatCPF("123.456.789-10")).toBe("123.456.789-10");
    });

    it("should return original if invalid", () => {
      expect(formatCPF("123")).toBe("123");
    });
  });

  describe("maskCPF", () => {
    it("should mask CPF showing only last 2 digits", () => {
      expect(maskCPF("12345678910")).toBe("***.***.***-10");
    });

    it("should handle formatted CPF", () => {
      expect(maskCPF("123.456.789-10")).toBe("***.***.***-10");
    });

    it("should return masked format for invalid CPF", () => {
      expect(maskCPF("123")).toBe("***.***.***-**");
    });
  });

  describe("isEncryptedCPF", () => {
    it("should identify encrypted CPF (base64 format)", () => {
      // Encrypted CPF is base64 encoded and at least 59 bytes
      const encrypted = Buffer.concat([
        Buffer.alloc(16), // salt
        Buffer.alloc(16), // iv
        Buffer.alloc(11), // ciphertext
        Buffer.alloc(16), // authTag
      ]).toString("base64");

      expect(isEncryptedCPF(encrypted)).toBe(true);
    });

    it("should reject plain CPF as encrypted", () => {
      expect(isEncryptedCPF("12345678910")).toBe(false);
    });

    it("should reject short base64 strings", () => {
      expect(isEncryptedCPF("dGVzdA==")).toBe(false); // "test" in base64
    });
  });

  describe("isPlainCPF", () => {
    it("should identify plain CPF (11 digits)", () => {
      expect(isPlainCPF("12345678910")).toBe(true);
    });

    it("should identify formatted CPF as plain", () => {
      expect(isPlainCPF("123.456.789-10")).toBe(true);
    });

    it("should reject non-CPF strings", () => {
      expect(isPlainCPF("123")).toBe(false);
      expect(isPlainCPF("abcdefghijk")).toBe(false);
    });
  });

  describe("generateTestCPF", () => {
    it("should generate valid CPF", () => {
      const cpf = generateTestCPF();
      expect(cpf).toHaveLength(11);
      expect(isValidCPF(cpf)).toBe(true);
    });

    it("should generate different CPFs", () => {
      const cpf1 = generateTestCPF();
      const cpf2 = generateTestCPF();
      // Very unlikely to generate same CPF twice
      expect(cpf1).not.toBe(cpf2);
    });
  });
});

// ============================================================================
// Rate Limiter Tests
// ============================================================================

describe("Rate Limiter", () => {
  let limiter: RateLimiter;

  beforeAll(() => {
    limiter = new RateLimiter({
      windowMs: 1000, // 1 second for testing
      maxRequests: 3,
    });
  });

  afterAll(() => {
    limiter.destroy();
  });

  describe("check", () => {
    it("should allow requests within limit", () => {
      const key = "test-user-1";
      const result1 = limiter.check(key);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(2);

      const result2 = limiter.check(key);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(1);

      const result3 = limiter.check(key);
      expect(result3.allowed).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it("should reject requests exceeding limit", () => {
      const key = "test-user-2";
      limiter.check(key);
      limiter.check(key);
      limiter.check(key);

      const result4 = limiter.check(key);
      expect(result4.allowed).toBe(false);
      expect(result4.remaining).toBe(0);
    });

    it("should reset after window expires", async () => {
      const key = "test-user-3";
      limiter.check(key);
      limiter.check(key);
      limiter.check(key);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const result = limiter.check(key);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it("should track different keys separately", () => {
      const key1 = "user-a";
      const key2 = "user-b";

      limiter.check(key1);
      limiter.check(key1);
      limiter.check(key1);

      const result1 = limiter.check(key1);
      expect(result1.allowed).toBe(false);

      const result2 = limiter.check(key2);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(2);
    });
  });

  describe("checkOrThrow", () => {
    it("should throw error when limit exceeded", () => {
      const limiter2 = new RateLimiter({
        windowMs: 1000,
        maxRequests: 1,
        message: "Custom error message",
      });

      limiter2.checkOrThrow("test-key");

      expect(() => {
        limiter2.checkOrThrow("test-key");
      }).toThrow();

      limiter2.destroy();
    });

    it("should throw TRPCError with correct code", () => {
      const limiter2 = new RateLimiter({
        windowMs: 1000,
        maxRequests: 1,
      });

      limiter2.checkOrThrow("test-key");

      try {
        limiter2.checkOrThrow("test-key");
        expect.fail("Should have thrown");
      } catch (error: any) {
        expect(error).toBeInstanceOf(TRPCError);
        expect(error.code).toBe("TOO_MANY_REQUESTS");
      }

      limiter2.destroy();
    });
  });
});

// ============================================================================
// Helper Functions Tests
// ============================================================================

describe("Rate Limiter Helpers", () => {
  describe("getRateLimitKey", () => {
    it("should return user key when userId provided", () => {
      expect(getRateLimitKey(123)).toBe("user:123");
    });

    it("should return IP key when IP provided", () => {
      expect(getRateLimitKey(undefined, "192.168.1.1")).toBe("ip:192.168.1.1");
    });

    it("should prefer userId over IP", () => {
      expect(getRateLimitKey(123, "192.168.1.1")).toBe("user:123");
    });

    it("should return anonymous when neither provided", () => {
      expect(getRateLimitKey()).toBe("anonymous");
    });
  });

  describe("getClientIP", () => {
    it("should extract IP from x-forwarded-for header", () => {
      const req = {
        headers: {
          "x-forwarded-for": "192.168.1.1, 10.0.0.1",
        },
        socket: {},
      };
      expect(getClientIP(req)).toBe("192.168.1.1");
    });

    it("should extract IP from x-real-ip header", () => {
      const req = {
        headers: {
          "x-real-ip": "10.0.0.1",
        },
        socket: {},
      };
      expect(getClientIP(req)).toBe("10.0.0.1");
    });

    it("should extract IP from socket.remoteAddress", () => {
      const req = {
        headers: {},
        socket: {
          remoteAddress: "127.0.0.1",
        },
      };
      expect(getClientIP(req)).toBe("127.0.0.1");
    });

    it("should return unknown if no IP found", () => {
      const req = {
        headers: {},
        socket: {},
      };
      expect(getClientIP(req)).toBe("unknown");
    });
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe("Security Integration", () => {
  it("should validate and mask CPF in workflow", () => {
    const plainCPF = "11144477735"; // Valid test CPF

    // Validate
    expect(isValidCPF(plainCPF)).toBe(true);

    // Format
    const formatted = formatCPF(plainCPF);
    expect(formatted).toBe("111.444.777-35");

    // Mask
    const masked = maskCPF(plainCPF);
    expect(masked).toBe("***.***.***-35");
  });

  it("should handle rate limiting in sequence", () => {
    const limiter = new RateLimiter({
      windowMs: 1000,
      maxRequests: 2,
    });

    const key = "integration-test";

    // First request
    const r1 = limiter.check(key);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(1);

    // Second request
    const r2 = limiter.check(key);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(0);

    // Third request (exceeded)
    const r3 = limiter.check(key);
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);

    limiter.destroy();
  });
});
