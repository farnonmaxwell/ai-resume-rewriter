/**
 * Mailchimp stub. Logs in dev; will sync when real credentials are added.
 */
export type MailchimpResult = {
  ok: boolean;
  stub: boolean;
  message: string;
};

export async function syncSubscriber(email: string, source: string): Promise<MailchimpResult> {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  if (!apiKey || !listId) {
    console.log(`[Mailchimp:STUB] would subscribe ${email} (source=${source})`);
    return { ok: true, stub: true, message: "Stubbed: Mailchimp credentials not yet set" };
  }
  // Real Mailchimp call (only fires once credentials are set in env)
  try {
    const dc = apiKey.split("-")[1];
    const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`;
    const r = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
        merge_fields: { SOURCE: source },
      }),
    });
    if (!r.ok && r.status !== 400) {
      const t = await r.text().catch(() => "");
      console.error(`[Mailchimp] error ${r.status}: ${t}`);
      return { ok: false, stub: false, message: "Mailchimp sync failed" };
    }
    return { ok: true, stub: false, message: "Subscribed" };
  } catch (e) {
    console.error("[Mailchimp] exception", e);
    return { ok: false, stub: false, message: "Mailchimp exception" };
  }
}
