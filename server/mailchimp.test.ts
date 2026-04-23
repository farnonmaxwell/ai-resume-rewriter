import { describe, it, expect, beforeEach } from "vitest";
import { syncSubscriber } from "./mailchimp";

describe("syncSubscriber", () => {
  beforeEach(() => {
    delete process.env.MAILCHIMP_API_KEY;
    delete process.env.MAILCHIMP_LIST_ID;
  });

  it("returns stub mode when credentials are missing", async () => {
    const r = await syncSubscriber("hello@eo50.test", "landing-footer");
    expect(r.ok).toBe(true);
    expect(r.stub).toBe(true);
    expect(r.message).toMatch(/Stubbed/);
  });
});
