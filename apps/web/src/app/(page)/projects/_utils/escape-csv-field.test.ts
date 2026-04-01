import { describe, it, expect } from "vitest";
import { escapeCsvField } from "./escape-csv-field";

describe("escapeCsvField", () => {
  it("returns empty string for null", () => {
    expect(escapeCsvField(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(escapeCsvField(undefined)).toBe("");
  });

  it("returns plain string as-is", () => {
    expect(escapeCsvField("hello")).toBe("hello");
  });

  it("wraps comma-containing values in quotes", () => {
    expect(escapeCsvField("a,b")).toBe('"a,b"');
  });

  it("escapes double quotes", () => {
    expect(escapeCsvField('say "hello"')).toBe('"say ""hello"""');
  });

  it("wraps newline-containing values", () => {
    expect(escapeCsvField("line1\nline2")).toBe('"line1\nline2"');
  });

  it("converts numbers to string", () => {
    expect(escapeCsvField(42)).toBe("42");
  });
});
