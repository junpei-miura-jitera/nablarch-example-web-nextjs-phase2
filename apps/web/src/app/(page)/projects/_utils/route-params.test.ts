import { describe, it, expect } from "vitest";
import { parseProjectIdFromRouteSegment } from "./route-params";

describe("parseProjectIdFromRouteSegment", () => {
  it.each([
    ["1", 1],
    ["42", 42],
    ["999999999", 999999999],
  ])("accepts %s → %s", (id, expected) => {
    expect(parseProjectIdFromRouteSegment(id)).toBe(expected);
  });

  it.each([
    "",
    "0",
    "-1",
    "abc",
    "01",
    "1.5",
    "1e2",
    "Infinity",
    "NaN",
  ])("rejects %s", (id) => {
    expect(parseProjectIdFromRouteSegment(id)).toBeNull();
  });
});
