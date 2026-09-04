import { describe, expect, it } from "vitest";
import { fallbackAnswer } from "./routers";

describe("PolarOps fallback guidance", () => {
  it("covers fuel optimization and polar battery constraints", () => {
    const response = fallbackAnswer("How can I reduce fuel burn with two diesel gensets?");

    expect(response).toContain("Fuel optimization starting point");
    expect(response).toContain("spinning-reserve");
    expect(response).toContain("low temperatures");
    expect(response).toContain("station energy lead");
  });

  it("covers renewable dispatch and icing risk", () => {
    const response = fallbackAnswer("How should I dispatch wind and solar during winter?");

    expect(response).toContain("Renewable dispatch pattern");
    expect(response).toContain("icing");
    expect(response).toContain("battery headroom");
  });

  it("defaults to a useful load-forecast frame", () => {
    const response = fallbackAnswer("What should I include in tomorrow's load forecast?");

    expect(response).toContain("24-hour forecast");
    expect(response).toContain("Outdoor temperature");
    expect(response).toContain("uncertainty band");
  });
});
