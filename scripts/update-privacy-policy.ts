#!/usr/bin/env bun
// scripts/update-privacy-policy.ts
// Pushes the Privacy Policy & Cookie Notice content to Storyblok.
//
// What it does (idempotent — safe to re-run):
//   1. Upserts the `privacy_policy_page` component schema (same shape as
//      disclaimer_page: title, eyebrow, lede, body, last_updated, SEO).
//   2. Upserts the `/privacy-policy` story content with hero (title, eyebrow,
//      lede) and full long-form body (Privacy Policy + Cookie Notice).
//   3. Publishes the story so the changes are live.
//
// Required env vars (same as scripts/seed-storyblok.ts):
//   - STORYBLOK_MANAGEMENT_TOKEN
//   - STORYBLOK_SPACE_ID
//   - STORYBLOK_REGION (optional — "eu" default, or "us")
//
// Usage:
//   bun scripts/update-privacy-policy.ts
//   # or via package.json:
//   bun run update:privacy-policy

import {
  type SbComponent,
  type SbStoryContent,
  StoryblokManagement,
} from "./lib/storyblok-management";

// ============================================================================
// Hero + meta values
// ============================================================================

const STORY_NAME = "Privacy Policy";
const STORY_SLUG = "privacy-policy";

const TITLE = "Privacy Policy & Cookie Notice";
const EYEBROW = "Privacy";
const LEDE =
  "Your privacy matters. This Privacy Policy explains what information PBDesk collects when you visit, how it is used, what cookies and similar technologies are in play, and the choices you have. The Cookie Notice section sets out the specific cookies and storage keys this site uses.";

// Bump this when the policy text changes; otherwise re-runs leave it stable.
const LAST_UPDATED_ISO = "2026-05-02T00:00:00.000Z";

const SEO_TITLE = "Privacy Policy & Cookie Notice — PBDesk";
const SEO_DESCRIPTION =
  "How PBDesk collects, uses, and protects information; what cookies and similar technologies are used; and the privacy choices available to readers.";

const CLOSING_NOTE =
  "This page is provided for general information and is not legal advice. If you need legal advice tailored to your situation, please consult a qualified lawyer in your jurisdiction.";

// ============================================================================
// Component schema
// ============================================================================

const PRIVACY_POLICY_COMPONENT: SbComponent = {
  name: "privacy_policy_page",
  display_name: "Privacy Policy Page",
  is_root: true,
  is_nestable: false,
  icon: "block-doc",
  preview_field: "title",
  schema: {
    title: { type: "text", required: true, pos: 0 },
    eyebrow: {
      type: "text",
      pos: 1,
      description: 'Small uppercase label shown above the H1 (e.g. "Privacy").',
    },
    lede: {
      type: "textarea",
      pos: 2,
      description: "Intro paragraph rendered under the H1 in the hero.",
    },
    body: { type: "richtext", pos: 3 },
    last_updated: { type: "datetime", pos: 4 },
    seo_title: { type: "text", pos: 5 },
    seo_description: { type: "textarea", pos: 6 },
  },
};

// ============================================================================
// Richtext primitives — Storyblok ProseMirror JSON
// ============================================================================

interface RtMark {
  attrs?: Record<string, unknown>;
  type: string;
}
interface RtNode {
  attrs?: Record<string, unknown>;
  content?: RtNode[];
  marks?: RtMark[];
  text?: string;
  type: string;
}
interface RtDoc {
  content: RtNode[];
  type: "doc";
}

type Inline = RtNode | string;

function asText(value: string): RtNode {
  return { type: "text", text: value };
}

function bold(value: string): RtNode {
  return { type: "text", text: value, marks: [{ type: "bold" }] };
}

function italic(value: string): RtNode {
  return { type: "text", text: value, marks: [{ type: "italic" }] };
}

function code(value: string): RtNode {
  return { type: "text", text: value, marks: [{ type: "code" }] };
}

function link(href: string, value: string): RtNode {
  const isExternal = href.startsWith("http");
  return {
    type: "text",
    text: value,
    marks: [
      {
        type: "link",
        attrs: {
          href,
          target: isExternal ? "_blank" : "_self",
          uuid: null,
          anchor: null,
          custom: {},
          linktype: isExternal ? "url" : "story",
        },
      },
    ],
  };
}

function inlines(parts: Inline[]): RtNode[] {
  return parts.map((p) => (typeof p === "string" ? asText(p) : p));
}

function p(...parts: Inline[]): RtNode {
  return { type: "paragraph", content: inlines(parts) };
}

function h2(value: string): RtNode {
  return {
    type: "heading",
    attrs: { level: 2 },
    content: [asText(value)],
  };
}

function h3(value: string): RtNode {
  return {
    type: "heading",
    attrs: { level: 3 },
    content: [asText(value)],
  };
}

function li(...parts: Inline[]): RtNode {
  return {
    type: "list_item",
    content: [{ type: "paragraph", content: inlines(parts) }],
  };
}

function ul(...items: RtNode[]): RtNode {
  return { type: "bullet_list", content: items };
}

// ============================================================================
// Body — Privacy Policy + Cookie Notice
// ============================================================================

function buildBody(): RtDoc {
  const blocks: RtNode[] = [];

  // ---- Section 1 ----
  blocks.push(h2("1. Introduction and scope"));
  blocks.push(
    p(
      'This Privacy Policy describes how PBDesk ("the Site", "we", "us", or "our") collects, uses, and discloses information when you visit ',
      link("https://pbdesk.com", "pbdesk.com"),
      " or any subdomain operated under the same brand. It also explains the cookies and similar technologies the Site uses (the ",
      bold("Cookie Notice"),
      " in Section 6 below)."
    )
  );
  blocks.push(
    p(
      "By using the Site you confirm that you have read this Policy and the ",
      link("/disclaimer", "Disclaimer & Terms of Use"),
      ". If you do not agree with any part of this Policy, please discontinue use of the Site."
    )
  );

  // ---- Section 2 ----
  blocks.push(h2("2. Who runs this site"));
  blocks.push(
    p(
      "PBDesk is a personal site operated by ",
      bold("Pinal Bhatt"),
      " (the ",
      italic("data controller"),
      " for the purposes of applicable privacy law, including the EU/UK GDPR and the California Consumer Privacy Act). The author is based in the United States; the Site is published from the United States and read by a global audience."
    )
  );

  // ---- Section 3 ----
  blocks.push(h2("3. Information we collect"));
  blocks.push(
    p(
      "PBDesk is intentionally minimal in its data collection. The Site does not require you to create an account, log in, or provide payment information. The categories of information we may collect are:"
    )
  );

  blocks.push(h3("3.1 Information automatically collected"));
  blocks.push(
    p(
      "When you visit any page, our hosting provider (see Section 7) automatically receives standard request metadata, which may include:"
    )
  );
  blocks.push(
    ul(
      li(
        "your IP address (often truncated or anonymised by the hosting layer);"
      ),
      li(
        "your user-agent string (browser, browser version, operating system);"
      ),
      li("the referring page or search term that brought you to the Site;"),
      li("the page or asset URL you requested and the HTTP response status;"),
      li("the date, time, and approximate duration of the request; and"),
      li(
        "diagnostic information needed for security, abuse prevention, and uptime monitoring."
      )
    )
  );
  blocks.push(
    p(
      "This information is collected as part of the normal operation of any website on the public internet and is processed by our hosting provider on our behalf."
    )
  );

  blocks.push(h3("3.2 Information you choose to provide"));
  blocks.push(
    p(
      "If the Site enables comments, contact forms, mailing-list sign-ups, or other interactive features in the future, we will only receive the information you choose to submit through those features. As of the date listed at the top of this page, the Site does not collect form submissions."
    )
  );

  blocks.push(h3("3.3 Cookies, local storage, and similar technologies"));
  blocks.push(
    p(
      "The Site uses a small number of cookies and browser-storage keys, listed in detail in Section 6 below."
    )
  );

  blocks.push(h3("3.4 Sensitive personal information"));
  blocks.push(
    p(
      bold("We do not knowingly collect"),
      " government identifiers, financial account information, biometric data, precise geolocation, health data, or other categories of sensitive personal information. Please do not submit such information through any feature of the Site."
    )
  );

  // ---- Section 4 ----
  blocks.push(h2("4. How we use the information"));
  blocks.push(p("We use the information described in Section 3 to:"));
  blocks.push(
    ul(
      li("operate, maintain, and serve the Site to your browser;"),
      li(
        "secure the Site against abuse, scraping, brute-force attacks, and other unauthorised use;"
      ),
      li(
        "diagnose technical problems and improve performance, layout, and accessibility;"
      ),
      li(
        "understand, in aggregate, how readers find and navigate the Site so we can improve content;"
      ),
      li("comply with applicable legal obligations; and"),
      li(
        "enforce our terms, including the ",
        link("/disclaimer", "Disclaimer & Terms of Use"),
        "."
      )
    )
  );
  blocks.push(
    p(
      "We do ",
      bold("not"),
      " sell personal information, share it with advertising networks, or use it to build advertising profiles."
    )
  );

  // ---- Section 5 ----
  blocks.push(h2("5. Legal bases for processing"));
  blocks.push(
    p(
      "Where the EU/UK GDPR applies, we rely on the following legal bases for processing personal information:"
    )
  );
  blocks.push(
    ul(
      li(
        bold("Legitimate interests"),
        " — to operate, secure, and improve the Site, and to understand, in aggregate, how readers use it. We balance these interests against your privacy rights and only process the minimum information necessary."
      ),
      li(
        bold("Consent"),
        " — where applicable, for non-essential cookies or for any feature that requires opt-in (for example, a future newsletter sign-up). You can withdraw consent at any time through your browser controls."
      ),
      li(
        bold("Legal obligation"),
        " — to comply with applicable laws, lawful requests from public authorities, and our records-retention requirements."
      ),
      li(
        bold("Contract"),
        " — to provide a feature you have specifically requested (for example, responding to a message you send through a form)."
      )
    )
  );

  // ---- Section 6 ----
  blocks.push(h2("6. Cookies, local storage, and similar technologies"));
  blocks.push(
    p(
      "This section is the Site's ",
      bold("Cookie Notice"),
      ". A ",
      italic("cookie"),
      " is a small text file that a website asks your browser to store; ",
      italic("local storage"),
      " is a similar mechanism for storing values inside your browser. Both are sent to or read by the Site as you browse. We use them sparingly and only for the purposes described below."
    )
  );

  blocks.push(h3("6.1 Categories of cookies and storage we use"));

  blocks.push(p(bold("Strictly necessary"), " (no consent required):"));
  blocks.push(
    ul(
      li(
        code("sb-preview"),
        " — set only when you open the Site through the Storyblok visual editor preview. It signals our edge proxy to serve uncached, draft-mode content. It is not set during normal browsing."
      ),
      li(
        "Hosting-layer cookies that may be set by our hosting provider (Vercel) for protection against abuse, load balancing, and basic uptime — see Section 7."
      )
    )
  );

  blocks.push(p(bold("Preferences"), " (functional, no third-party sharing):"));
  blocks.push(
    ul(
      li(
        code("theme"),
        " (a value such as ",
        code("light"),
        ", ",
        code("dark"),
        ", or ",
        code("system"),
        ") — stored via your browser's localStorage by the ",
        code("next-themes"),
        " library so the Site can remember your colour-scheme preference between visits. This value never leaves your device."
      )
    )
  );

  blocks.push(
    p(bold("Analytics"), " (consent-based, only if and when enabled):")
  );
  blocks.push(
    ul(
      li(
        "As of the date at the top of this page, PBDesk does ",
        bold("not"),
        " run third-party analytics, advertising, fingerprinting, or behavioural-tracking scripts. If we add a privacy-respecting analytics tool in the future, this section will be updated to disclose the provider, the data collected, the retention period, and how to opt out — and, where required, we will request your consent before any non-essential cookies are set."
      )
    )
  );

  blocks.push(h3("6.2 Third-party cookies"));
  blocks.push(
    p(
      "Pages on the Site may embed media or links from third parties (for example, YouTube embeds, X/Twitter cards, GitHub gists). Those third parties may set their own cookies when you interact with their content. We do not control those cookies, and they are governed by the respective third party's privacy policy. See Section 11."
    )
  );

  blocks.push(h3("6.3 How to control cookies and storage"));
  blocks.push(
    p(
      "You can review, manage, and delete cookies and local-storage entries in your browser's settings. The exact steps differ by browser; the help pages below are good starting points:"
    )
  );
  blocks.push(
    ul(
      li(
        link("https://support.google.com/chrome/answer/95647", "Google Chrome")
      ),
      li(
        link(
          "https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer",
          "Mozilla Firefox"
        )
      ),
      li(
        link(
          "https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac",
          "Apple Safari"
        )
      ),
      li(link("https://support.microsoft.com/microsoft-edge", "Microsoft Edge"))
    )
  );
  blocks.push(
    p(
      "Blocking strictly-necessary cookies may break parts of the Site; for example, the Storyblok visual-editor preview will not work without ",
      code("sb-preview"),
      ". Blocking the ",
      code("theme"),
      " preference simply means your colour-scheme choice will not be remembered between visits."
    )
  );

  blocks.push(h3("6.4 Do Not Track and Global Privacy Control"));
  blocks.push(
    p(
      "Because the Site does not run third-party tracking, ",
      italic("Do Not Track (DNT)"),
      " browser signals and ",
      italic("Global Privacy Control (GPC)"),
      " signals do not change how we operate. If we add analytics or other non-essential processing in future, we will respect GPC signals as a valid opt-out where applicable law requires it."
    )
  );

  // ---- Section 7 ----
  blocks.push(h2("7. Service providers and sub-processors"));
  blocks.push(
    p(
      "We use a small number of trusted service providers (also called ",
      italic("sub-processors"),
      ") to operate the Site. They process information only on our instructions and only as necessary to deliver their service:"
    )
  );
  blocks.push(
    ul(
      li(
        bold("Vercel Inc."),
        " — hosting, edge network, and request routing. Receives standard request metadata (IP, user-agent, request URL) for the purposes of serving the Site and protecting it from abuse. See ",
        link(
          "https://vercel.com/legal/privacy-policy",
          "Vercel's Privacy Policy"
        ),
        "."
      ),
      li(
        bold("Storyblok GmbH"),
        " — headless content management system. Stores the editorial content shown on the Site (articles, page metadata, images) and serves it via API. Storyblok cookies (such as ",
        code("sb-preview"),
        ") only operate when you are logged into the Storyblok visual editor. See ",
        link("https://www.storyblok.com/privacy", "Storyblok's Privacy Policy"),
        "."
      ),
      li(
        bold("Domain registrar / DNS provider"),
        " — operates the DNS for ",
        code("pbdesk.com"),
        " and processes only the lookups needed to direct your browser to the hosting provider."
      ),
      li(
        bold("GitHub, Inc."),
        " — source-code hosting. May serve embedded gist or repository previews if such embeds are present on a page. See ",
        link(
          "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement",
          "GitHub's Privacy Statement"
        ),
        "."
      )
    )
  );
  blocks.push(
    p(
      "We do not transfer personal information to additional sub-processors without updating this Policy. We do not sell or rent personal information."
    )
  );

  // ---- Section 8 ----
  blocks.push(h2("8. International data transfers"));
  blocks.push(
    p(
      "PBDesk is operated from the United States, and our service providers may store and process information in the United States, the European Union, the United Kingdom, and other regions in which their global infrastructure is located. Where personal information is transferred from the EU/UK/Switzerland, we rely on appropriate safeguards (such as the European Commission's Standard Contractual Clauses) put in place by our service providers."
    )
  );

  // ---- Section 9 ----
  blocks.push(h2("9. Data retention"));
  blocks.push(
    p(
      "We retain personal information only for as long as necessary to fulfil the purposes described in this Policy, comply with our legal obligations, resolve disputes, and enforce our agreements. Specifically:"
    )
  );
  blocks.push(
    ul(
      li(
        bold("Server request logs"),
        " — typically retained by our hosting provider for short rolling windows (commonly 7–30 days) for security and operational diagnostics."
      ),
      li(
        bold("Editorial content"),
        " — retained indefinitely so the Site can serve archived posts, with version history retained by Storyblok."
      ),
      li(
        bold("Browser-side preferences"),
        " (e.g. ",
        code("theme"),
        ") — retained on your device until you clear your browser storage."
      ),
      li(
        bold("Anything you submit"),
        " through a future form or comment feature will be retained for the period disclosed at the time of submission, or until you ask us to delete it (subject to Section 11)."
      )
    )
  );

  // ---- Section 10 ----
  blocks.push(h2("10. Sharing and disclosure"));
  blocks.push(p("We may disclose information:"));
  blocks.push(
    ul(
      li(
        "to the service providers listed in Section 7, only as needed to operate the Site;"
      ),
      li(
        "to comply with applicable law, lawful subpoenas, court orders, or other legal process;"
      ),
      li(
        "to investigate, prevent, or respond to fraud, abuse, security incidents, or violations of our terms;"
      ),
      li(
        "to protect the rights, property, or safety of the author, the Site, our service providers, or the public;"
      ),
      li(
        "in connection with a corporate transaction (for example, a merger, financing, acquisition, or sale of assets), in which case any successor will be bound by this Policy or one no less protective; and"
      ),
      li("with your consent or at your direction.")
    )
  );

  // ---- Section 11 ----
  blocks.push(h2("11. Your privacy rights"));
  blocks.push(
    p(
      "Depending on where you live, you may have one or more of the following rights with respect to personal information about you:"
    )
  );
  blocks.push(
    ul(
      li(
        bold("Right of access"),
        " — confirm whether we process information about you and obtain a copy."
      ),
      li(
        bold("Right to rectification"),
        " — correct inaccurate or incomplete information."
      ),
      li(
        bold("Right to erasure"),
        " (",
        italic("right to be forgotten"),
        ") — ask us to delete information, subject to limited legal exceptions."
      ),
      li(
        bold("Right to restrict or object to processing"),
        " — including the right to object to processing based on legitimate interests."
      ),
      li(
        bold("Right to data portability"),
        " — receive your information in a structured, machine-readable format where the processing is based on consent or contract and is carried out by automated means."
      ),
      li(
        bold("Right to withdraw consent"),
        " — at any time, where processing is based on consent."
      ),
      li(
        bold("Right to lodge a complaint"),
        " with your local data-protection authority, including the ",
        link(
          "https://www.edpb.europa.eu/about-edpb/about-edpb/members_en",
          "EU member-state regulators"
        ),
        ", the ",
        link("https://ico.org.uk/", "UK ICO"),
        ", or the equivalent body in your country."
      )
    )
  );
  blocks.push(
    p(
      bold("California residents (CCPA / CPRA)"),
      " also have the rights to know what categories of personal information are collected and disclosed, to delete personal information, to correct inaccurate personal information, to limit the use of sensitive personal information, and to opt out of the sale or sharing of personal information. PBDesk does not sell or share personal information as those terms are defined under the CCPA."
    )
  );
  blocks.push(
    p(
      "Because the Site does not require accounts and does not collect direct identifiers from anonymous readers, we may be unable to fulfil a rights request without additional information from you that allows us to locate the relevant data. Where we can verify your identity, we will respond within the period required by applicable law (typically 30–45 days)."
    )
  );

  // ---- Section 12 ----
  blocks.push(h2("12. Children's privacy"));
  blocks.push(
    p(
      "The Site is not directed to children under the age of 13 (or under 16 in the European Economic Area / United Kingdom, where applicable). We do not knowingly collect personal information from children. If you are a parent or guardian and believe a child has provided personal information to the Site, please contact us so we can delete it."
    )
  );

  // ---- Section 13 ----
  blocks.push(h2("13. Security"));
  blocks.push(
    p(
      "We rely on industry-standard practices provided by our hosting and CMS providers to protect information against unauthorised access, alteration, disclosure, or destruction. The Site is served over HTTPS, and access to administrative interfaces is restricted by strong authentication. ",
      bold("No method of transmission or storage is completely secure"),
      ", however, and we cannot guarantee absolute security."
    )
  );

  // ---- Section 14 ----
  blocks.push(h2("14. Third-party links and embedded content"));
  blocks.push(
    p(
      "The Site contains links to, and may embed content from, third-party websites and services. Those third parties have their own privacy practices that we do not control and are not responsible for. We encourage you to read the privacy policies of any third party whose content or service you interact with from the Site."
    )
  );

  // ---- Section 15 ----
  blocks.push(h2("15. Changes to this Policy"));
  blocks.push(
    p(
      "We may update this Policy from time to time. When we do, the ",
      italic("Last updated"),
      " date at the top of this page will change. Material changes will be highlighted on the home page or via the RSS feed for a reasonable period. Your continued use of the Site after a change becomes effective constitutes acceptance of the updated Policy."
    )
  );

  // ---- Section 16 ----
  blocks.push(h2("16. Governing law"));
  blocks.push(
    p(
      "This Policy is governed by the same law and venue as set out in the ",
      link("/disclaimer", "Disclaimer & Terms of Use"),
      ", subject to any non-waivable rights you may have under the mandatory law of your country of habitual residence."
    )
  );

  // ---- Closing italic note ----
  blocks.push(p(italic(CLOSING_NOTE)));

  return { type: "doc", content: blocks };
}

// ============================================================================
// Story content
// ============================================================================

export function buildStoryContent(): SbStoryContent {
  return {
    component: "privacy_policy_page",
    title: TITLE,
    eyebrow: EYEBROW,
    lede: LEDE,
    body: buildBody(),
    last_updated: LAST_UPDATED_ISO,
    seo_title: SEO_TITLE,
    seo_description: SEO_DESCRIPTION,
  };
}

export { PRIVACY_POLICY_COMPONENT, STORY_NAME, STORY_SLUG };

// ============================================================================
// Runner
// ============================================================================

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is required. Add it to .env.local or export it before running.`
    );
  }
  return value;
}

function logStep(label: string): void {
  process.stdout.write(`${label}\n`);
}

function logRow(line: string): void {
  process.stdout.write(`  ${line}\n`);
}

async function main(): Promise<void> {
  const token = requireEnv("STORYBLOK_MANAGEMENT_TOKEN");
  const spaceId = requireEnv("STORYBLOK_SPACE_ID");
  const region = process.env.STORYBLOK_REGION ?? "eu";

  const sb = new StoryblokManagement({ token, spaceId, region });

  logStep("\n[1/3] Updating privacy_policy_page component schema...");
  const compResult = await sb.upsertComponent(PRIVACY_POLICY_COMPONENT);
  logRow(
    `${compResult.created ? "+" : "·"} privacy_policy_page (#${compResult.record.id}) — ${compResult.created ? "created" : "updated"}`
  );

  logStep("\n[2/3] Upserting /privacy-policy story content...");
  const storyResult = await sb.upsertStory({
    name: STORY_NAME,
    slug: STORY_SLUG,
    content: buildStoryContent(),
  });
  logRow(
    `${storyResult.created ? "+" : "·"} ${storyResult.record.full_slug} (#${storyResult.record.id}) — ${storyResult.created ? "created" : "updated"}`
  );

  logStep("\n[3/3] Publishing /privacy-policy ...");
  await sb.publishStory(storyResult.record.id);
  logRow("✓ published");

  process.stdout.write(
    "\nDone. Visit /privacy-policy to see the new content.\n"
  );
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`\nUpdate failed: ${message}\n`);
    process.exit(1);
  });
}
