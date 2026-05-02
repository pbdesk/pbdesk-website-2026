#!/usr/bin/env bun
// scripts/update-disclaimer.ts
// Pushes the long-form Disclaimer & Terms of Use content to Storyblok.
//
// What it does (idempotent — safe to re-run):
//   1. Upserts the `disclaimer_page` component schema, adding `eyebrow` and
//      `lede` fields for the new hero section. Existing fields are preserved.
//   2. Upserts the `/disclaimer` story content with the new hero (title,
//      eyebrow, lede) and full long-form body (18 sections as richtext).
//   3. Publishes the story so the changes are live.
//
// Required env vars (same as scripts/seed-storyblok.ts):
//   - STORYBLOK_MANAGEMENT_TOKEN  (Personal Access Token from My Account)
//   - STORYBLOK_SPACE_ID          (Space ID — found in Settings)
//   - STORYBLOK_REGION            (optional — "eu" default, or "us")
//
// Usage:
//   bun scripts/update-disclaimer.ts
//   # or via package.json:
//   bun run update:disclaimer

import {
  type SbComponent,
  type SbStoryContent,
  StoryblokManagement,
} from "./lib/storyblok-management";

// ============================================================================
// Hero + meta values
// ============================================================================

const STORY_NAME = "Disclaimer";
const STORY_SLUG = "disclaimer";

const TITLE = "Disclaimer & Terms of Use";
const EYEBROW = "Legal";
const LEDE =
  "PBDesk is a personal site. The notes, code samples, opinions, and wellness reflections published here are shared in good faith but offered without any warranty. By using this site you agree to the terms below.";

// Use a fixed ISO date so re-running the script doesn't rewrite the
// "Last updated" line on every run. Bump this when the legal text changes.
const LAST_UPDATED_ISO = "2026-05-02T00:00:00.000Z";

const SEO_TITLE = "Disclaimer & Terms of Use — PBDesk";
const SEO_DESCRIPTION =
  "Disclaimer, terms of use, and limitation of liability for PBDesk. Content on this site is personal opinion, provided as-is, and used at your own risk.";

const CLOSING_NOTE =
  "This page is provided for general information and is not legal advice. If you need legal advice tailored to your situation, please consult a qualified lawyer in your jurisdiction.";

// ============================================================================
// Component schema (additive — adds eyebrow + lede)
// ============================================================================

const DISCLAIMER_COMPONENT: SbComponent = {
  name: "disclaimer_page",
  display_name: "Disclaimer Page",
  is_root: true,
  is_nestable: false,
  icon: "block-doc",
  preview_field: "title",
  schema: {
    title: { type: "text", required: true, pos: 0 },
    eyebrow: {
      type: "text",
      pos: 1,
      description: 'Small uppercase label shown above the H1 (e.g. "Legal").',
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

function li(...parts: Inline[]): RtNode {
  return {
    type: "list_item",
    content: [{ type: "paragraph", content: inlines(parts) }],
  };
}

function ul(...items: RtNode[]): RtNode {
  return { type: "bullet_list", content: items };
}

function ol(...items: RtNode[]): RtNode {
  return {
    type: "ordered_list",
    attrs: { order: 1 },
    content: items,
  };
}

// ============================================================================
// Body content — 18 sections of long-form T&C
// ============================================================================

function buildBody(): RtDoc {
  const blocks: RtNode[] = [];

  // ---- Section 1 ----
  blocks.push(h2("1. Acceptance of these terms"));
  blocks.push(
    p(
      'By accessing, browsing, or otherwise using PBDesk (the "Site"), you ("you" or "the reader") confirm that you have read, understood, and agreed to be bound by this Disclaimer and Terms of Use ("Terms"). If you do not agree with any part of these Terms, please discontinue use of the Site.'
    )
  );
  blocks.push(
    p(
      "These Terms apply to every page and feature of PBDesk, including the blog, code samples, downloadable assets, embedded media, comment threads, RSS feed, and any other content reachable from pbdesk.com."
    )
  );

  // ---- Section 2 ----
  blocks.push(h2("2. Personal views, not employer views"));
  blocks.push(
    p(
      "The views, opinions, and statements expressed on PBDesk are ",
      bold("personal"),
      " and belong solely to the author, Pinal Bhatt. They do ",
      bold("not"),
      " represent — and should not be interpreted as representing — the views, positions, strategies, opinions, or official statements of any current or former employer, client, partner, customer, vendor, professional body, or affiliated organisation."
    )
  );
  blocks.push(
    p(
      "Nothing on this Site is published in any official capacity. References to companies, products, frameworks, or services are made as a private individual writing about personal experiments and learning."
    )
  );

  // ---- Section 3 ----
  blocks.push(h2("3. Informational purpose only — no professional advice"));
  blocks.push(
    p(
      "All content on PBDesk is provided ",
      bold("for general informational and educational purposes only"),
      ". It is ",
      bold("not"),
      " intended to be, and must not be relied upon as, a substitute for:"
    )
  );
  blocks.push(
    ul(
      li("professional engineering, architectural, or security advice;"),
      li("legal, tax, financial, or accounting advice;"),
      li("medical, psychological, nutritional, dietary, or fitness advice; or"),
      li("any other form of regulated professional consultation.")
    )
  );
  blocks.push(
    p(
      "You should always consult a qualified, licensed professional before making any decision based on material you find on this Site. Reliance on any information appearing on PBDesk is strictly at your own risk."
    )
  );

  // ---- Section 4 ----
  blocks.push(
    h2(
      "4. Technical content, code samples, and solutions — use at your own risk"
    )
  );
  blocks.push(
    p(
      'PBDesk publishes code snippets, configuration examples, command-line invocations, scripts, architectural diagrams, AI prompts, and other technical recommendations ("Technical Content"). The author makes the following clear:'
    )
  );
  blocks.push(
    ol(
      li(
        bold("No accuracy guarantee."),
        " The author does ",
        bold("not"),
        " warrant or claim that any Technical Content is correct, complete, current, free of bugs, free of security vulnerabilities, fit for any particular purpose, or compatible with your environment, version, dependency tree, regulatory regime, or business requirements."
      ),
      li(
        bold("Use at your own risk."),
        " You are ",
        bold("solely responsible"),
        " for evaluating, testing, reviewing, securing, and validating any Technical Content before using, adapting, deploying, or otherwise relying on it. You assume the entire risk of any consequences — including data loss, downtime, security breach, financial loss, regulatory non-compliance, contract violation, or reputational harm — that may arise from using or attempting to use any Technical Content."
      ),
      li(
        bold("No production endorsement."),
        " Examples are illustrative. They are written for clarity, not for production hardening. You must independently verify suitability, error-handling, performance characteristics, observability, accessibility, compliance, and security posture before any production use."
      ),
      li(
        bold("Versions and ecosystems change."),
        " Software libraries, language runtimes, cloud APIs, browser behaviour, and AI models evolve rapidly. A solution that was correct on the date of writing may be incorrect, deprecated, insecure, or harmful by the date you read it. Always cross-check against current official documentation."
      ),
      li(
        bold("No support obligation."),
        " The author is under no obligation to maintain, update, correct, support, or respond to questions about any Technical Content."
      )
    )
  );
  blocks.push(
    p(
      "If you choose to copy, adapt, run, deploy, or build upon any Technical Content from PBDesk, you do so ",
      bold("entirely at your own risk and on your own responsibility"),
      "."
    )
  );

  // ---- Section 5 ----
  blocks.push(h2("5. Wellness, fitness, mindfulness, and lifestyle content"));
  blocks.push(
    p(
      'PBDesk includes personal reflections on physical fitness, mental wellness, mindfulness, sleep, nutrition, and daily habits ("Wellness Content"). This content reflects the author\'s individual experience and personal practice. It is ',
      bold(
        "not medical, psychological, psychiatric, dietary, nutritional, or therapeutic advice"
      ),
      ", and it is not provided by a licensed healthcare professional."
    )
  );
  blocks.push(
    p(
      "Before adopting any practice, exercise routine, dietary change, supplement, breathing technique, fasting protocol, or other wellness intervention referenced on the Site, you must consult a qualified healthcare professional who can evaluate your individual circumstances, history, and risk factors. The author disclaims all responsibility for any injury, harm, illness, or adverse outcome resulting from your reliance on Wellness Content."
    )
  );

  // ---- Section 6 ----
  blocks.push(h2("6. Accuracy, completeness, and currency"));
  blocks.push(
    p(
      "The author makes reasonable efforts to publish honest, considered material but does ",
      bold("not"),
      " warrant that any content on the Site is accurate, complete, reliable, current, or free from errors or omissions. Articles capture a point-in-time view; facts, links, code, references, statistics, and screenshots may become outdated, broken, or superseded."
    )
  );
  blocks.push(
    p(
      "The author may add, modify, correct, retract, or remove content at any time without notice. The author is under no obligation to issue corrections, errata, or change-logs."
    )
  );

  // ---- Section 7 ----
  blocks.push(h2('7. "AS-IS" — no warranties of any kind'));
  blocks.push(
    p(
      "The Site and all content available through it are provided on an ",
      bold('"AS IS"'),
      " and ",
      bold('"AS AVAILABLE"'),
      " basis, without representations, warranties, or conditions of any kind, whether express, implied, statutory, or otherwise. To the fullest extent permitted by applicable law, the author ",
      bold("expressly disclaims"),
      " all warranties, including but not limited to:"
    )
  );
  blocks.push(
    ul(
      li(
        "implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement;"
      ),
      li(
        "warranties arising from course of dealing, performance, or trade usage;"
      ),
      li(
        "warranties that the Site will be uninterrupted, secure, error-free, virus-free, or available at any particular time or location;"
      ),
      li("warranties that defects will be corrected;"),
      li(
        "warranties about the accuracy, reliability, or quality of any information, content, or materials obtained through the Site."
      )
    )
  );
  blocks.push(
    p(
      "No advice or information, whether oral or written, obtained from the Site or its author shall create any warranty not expressly stated in these Terms."
    )
  );

  // ---- Section 8 ----
  blocks.push(h2("8. Limitation of liability"));
  blocks.push(
    p(
      "To the maximum extent permitted by applicable law, in no event shall the author, his heirs, successors, or assigns be liable to you or to any third party for any:"
    )
  );
  blocks.push(
    ul(
      li(
        "direct, indirect, incidental, special, consequential, exemplary, or punitive damages;"
      ),
      li(
        "loss of profits, revenue, business opportunity, goodwill, savings, or anticipated savings;"
      ),
      li("loss, corruption, or unauthorized access to data;"),
      li(
        "service interruption, computer failure, system damage, or cost of substitute services;"
      ),
      li("personal injury, illness, or emotional distress; or"),
      li("any other damages, losses, or claims of any kind whatsoever,")
    )
  );
  blocks.push(
    p(
      "arising out of or in any way related to your access to or use of (or inability to access or use) the Site, your reliance on any content (including Technical Content and Wellness Content), any errors or omissions, any unauthorized access to your transmissions or data, any third-party conduct, or any other matter relating to the Site — whether based on warranty, contract, tort (including negligence), strict liability, statute, or any other legal theory, and whether or not the author has been advised of the possibility of such damages."
    )
  );
  blocks.push(
    p(
      "Where applicable law does not permit the exclusion of certain warranties or the limitation of certain damages, the author's liability shall be limited to the ",
      bold("smallest amount permitted by such law"),
      ", and in no event shall the author's aggregate liability to you for all claims arising from or related to the Site exceed ",
      bold("ten US Dollars (USD 10.00)"),
      " or the equivalent in your local currency, whichever is less."
    )
  );

  // ---- Section 9 ----
  blocks.push(h2("9. Indemnification"));
  blocks.push(
    p(
      "You agree to indemnify, defend, and hold harmless the author from and against any and all claims, demands, actions, proceedings, liabilities, losses, damages, judgments, settlements, costs, and expenses (including reasonable legal fees) arising out of or in connection with: (a) your use or misuse of the Site or any content on it; (b) your violation of these Terms; (c) your violation of any law or the rights of any third party; or (d) your reliance on any Technical Content or Wellness Content."
    )
  );

  // ---- Section 10 ----
  blocks.push(h2("10. Third-party links and external resources"));
  blocks.push(
    p(
      'PBDesk contains links to third-party websites, services, articles, repositories, social media profiles, videos, and other resources ("Third-Party Resources"). External links are typically opened in a new browser tab.'
    )
  );
  blocks.push(
    p(
      "These Third-Party Resources are provided ",
      bold("for convenience and reference only"),
      ". The author does not own, operate, control, monitor, endorse, or guarantee any Third-Party Resource. The author is not responsible for the availability, content, accuracy, security, privacy practices, advertising, products, services, or any other aspect of Third-Party Resources, nor for any damage or loss caused or alleged to be caused by your use of, or reliance on, any such resource."
    )
  );
  blocks.push(
    p(
      "Your interactions with Third-Party Resources are governed solely by the terms and privacy policies of those third parties. You should review them carefully."
    )
  );

  // ---- Section 11 ----
  blocks.push(h2("11. Intellectual property"));
  blocks.push(
    p(
      "Unless otherwise stated, the original written content, designs, layouts, illustrations, photographs, and curated selections on PBDesk are the intellectual property of the author and are protected by applicable copyright, design, and database laws."
    )
  );
  blocks.push(p("You may:"));
  blocks.push(
    ul(
      li("read the Site for personal, non-commercial use;"),
      li(
        "quote short excerpts (typically under 100 words) for the purposes of commentary, criticism, news reporting, teaching, scholarship, or research, ",
        bold("provided"),
        " you give clear attribution to ",
        italic("Pinal Bhatt — PBDesk"),
        " with a link back to the source page; and"
      ),
      li(
        "use small Technical Content snippets in your own work, ",
        bold("at your own risk"),
        " and subject to Section 4."
      )
    )
  );
  blocks.push(
    p(
      "You may ",
      bold("not"),
      ", without prior written permission from the author:"
    )
  );
  blocks.push(
    ul(
      li(
        "reproduce, republish, or syndicate articles in whole or in substantial part;"
      ),
      li("create derivative works for commercial distribution;"),
      li(
        "use the content to train, fine-tune, or otherwise develop machine-learning or generative-AI models, except where such use is permitted by mandatory law;"
      ),
      li("scrape, mirror, frame, or systematically extract content; or"),
      li("represent the content as your own.")
    )
  );
  blocks.push(
    p(
      "All third-party trademarks, logos, product names, and brand names referenced on the Site are the property of their respective owners and are used for identification and editorial commentary only. Their appearance does not imply endorsement, sponsorship, or affiliation."
    )
  );

  // ---- Section 12 ----
  blocks.push(h2("12. User contributions, comments, and feedback"));
  blocks.push(
    p(
      'If the Site enables comments, contact forms, or other ways for you to submit content ("Contributions"), you represent and warrant that: (a) you own or have the necessary rights to submit the Contribution; (b) the Contribution does not violate any law or any third party\'s rights; and (c) the Contribution is not unlawful, defamatory, obscene, threatening, harassing, hateful, or otherwise objectionable.'
    )
  );
  blocks.push(
    p(
      "By submitting a Contribution you grant the author a worldwide, perpetual, irrevocable, royalty-free, transferable, sub-licensable licence to use, reproduce, modify, adapt, publish, translate, display, and distribute the Contribution in connection with the Site and the author's other activities."
    )
  );
  blocks.push(
    p(
      "The author reserves the absolute right, without notice and without obligation, to refuse, remove, edit, or moderate any Contribution."
    )
  );

  // ---- Section 13 ----
  blocks.push(h2("13. Acceptable use"));
  blocks.push(p("You agree not to:"));
  blocks.push(
    ul(
      li(
        "use the Site in any way that violates any applicable local, national, or international law or regulation;"
      ),
      li(
        "attempt to gain unauthorized access to the Site, its underlying infrastructure, or any account or system associated with it;"
      ),
      li("introduce viruses, trojans, worms, or other malicious code;"),
      li(
        "engage in any automated use of the Site that places an unreasonable load on the infrastructure (other than well-behaved indexing by reputable search engines);"
      ),
      li("interfere with or disrupt other users' enjoyment of the Site;"),
      li("harvest or collect personal data of any other user; or"),
      li("use the Site to harass, abuse, defame, stalk, or harm any person.")
    )
  );
  blocks.push(
    p(
      "Violation of this section may result in your access being blocked and may give rise to civil or criminal liability."
    )
  );

  // ---- Section 14 ----
  blocks.push(h2("14. Privacy"));
  blocks.push(
    p(
      "Use of the Site is also governed by the ",
      link("/privacy-policy", "Privacy Policy & Cookie Notice"),
      ". Please read it to understand how cookies, analytics, and any submitted information are handled."
    )
  );

  // ---- Section 15 ----
  blocks.push(h2("15. Changes to these Terms"));
  blocks.push(
    p(
      "The author may update or modify these Terms at any time, in his sole discretion, by publishing a revised version on this page. The ",
      italic("Last updated"),
      " date at the top will be revised accordingly. Material changes may also be announced on the home page or via the RSS feed, but no individual notice is required."
    )
  );
  blocks.push(
    p(
      "Your continued use of the Site after any change constitutes your acceptance of the updated Terms. If you do not agree with the updated Terms, you must stop using the Site."
    )
  );

  // ---- Section 16 ----
  blocks.push(h2("16. Severability and waiver"));
  blocks.push(
    p(
      "If any provision of these Terms is held by a court of competent jurisdiction to be invalid, illegal, unenforceable, or void, that provision shall be enforced to the maximum extent permissible, and the remaining provisions shall continue in full force and effect."
    )
  );
  blocks.push(
    p(
      "The author's failure to enforce any right or provision of these Terms shall not be deemed a waiver of such right or provision."
    )
  );

  // ---- Section 17 ----
  blocks.push(h2("17. Entire agreement"));
  blocks.push(
    p(
      "These Terms, together with any policies or notices referenced in them (including the Privacy Policy), constitute the entire agreement between you and the author regarding your use of the Site, and supersede any prior or contemporaneous agreements, communications, or proposals on the subject."
    )
  );

  // ---- Section 18 ----
  blocks.push(h2("18. Governing law, jurisdiction, and international use"));
  blocks.push(
    p(
      "The author is based in the ",
      bold("United States of America"),
      ". PBDesk is published from the United States and is read by a global audience."
    )
  );
  blocks.push(
    p(
      bold("Primary governing law."),
      " These Terms, and any dispute, claim, controversy, or matter arising out of or in connection with them, the Site, or their subject matter or formation (including non-contractual disputes or claims), shall be governed by and construed in accordance with the ",
      bold("laws of the United States of America"),
      " and, to the extent state law applies, the laws of the state in which the author resides at the time the dispute arises, in each case without regard to conflict-of-laws principles. The state and federal courts located in that state shall have ",
      bold("exclusive jurisdiction"),
      " to hear and determine any such dispute, and you irrevocably consent to the personal jurisdiction and venue of such courts."
    )
  );
  blocks.push(
    p(
      bold("Readers in India."),
      " Where mandatory provisions of Indian law apply to a reader located in India (for example, in respect of consumer-protection rights that cannot be contracted out of), the parties agree that those mandatory provisions shall apply, but in all other respects these Terms remain governed by the law specified above."
    )
  );
  blocks.push(
    p(
      bold("Readers elsewhere in the world."),
      " The Site is accessible globally. The author makes no representation that the content is appropriate, lawful, or available for use in any particular country, region, or legal system. If you choose to access the Site from outside the United States, you do so on your own initiative and are ",
      bold("solely responsible"),
      " for compliance with all local laws, including but not limited to laws relating to export controls, taxation, online publishing, professional advice, health and wellness claims, data protection, and consumer rights. Nothing in this Section is intended to override any non-waivable rights you may have under the mandatory law of your country of habitual residence."
    )
  );
  blocks.push(
    p(
      bold("Choice of forum."),
      ' Subject to the paragraph above, you agree that any dispute will be brought exclusively in the courts identified in the "Primary governing law" paragraph, and you waive any objection based on inconvenient forum, improper venue, or lack of personal jurisdiction.'
    )
  );
  blocks.push(
    p(
      bold("Limitation period."),
      " To the extent permitted by applicable law, any claim or cause of action arising out of or related to the Site or these Terms must be filed ",
      bold("within one (1) year"),
      " after such claim or cause of action arose; otherwise, it is permanently barred."
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
    component: "disclaimer_page",
    title: TITLE,
    eyebrow: EYEBROW,
    lede: LEDE,
    body: buildBody(),
    last_updated: LAST_UPDATED_ISO,
    seo_title: SEO_TITLE,
    seo_description: SEO_DESCRIPTION,
  };
}

export { DISCLAIMER_COMPONENT, STORY_NAME, STORY_SLUG };

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

  logStep("\n[1/3] Updating disclaimer_page component schema...");
  const compResult = await sb.upsertComponent(DISCLAIMER_COMPONENT);
  logRow(
    `${compResult.created ? "+" : "·"} disclaimer_page (#${compResult.record.id}) — ${compResult.created ? "created" : "updated"}`
  );

  logStep("\n[2/3] Upserting /disclaimer story content...");
  const storyResult = await sb.upsertStory({
    name: STORY_NAME,
    slug: STORY_SLUG,
    content: buildStoryContent(),
  });
  logRow(
    `${storyResult.created ? "+" : "·"} ${storyResult.record.full_slug} (#${storyResult.record.id}) — ${storyResult.created ? "created" : "updated"}`
  );

  logStep("\n[3/3] Publishing /disclaimer ...");
  await sb.publishStory(storyResult.record.id);
  logRow("✓ published");

  process.stdout.write("\nDone. Visit /disclaimer to see the new content.\n");
}

// Only auto-run when invoked directly (e.g. `bun scripts/update-disclaimer.ts`).
// When imported by another script (e.g. seed-storyblok via storyblok-content),
// callers can use buildStoryContent() / DISCLAIMER_COMPONENT without firing main.
if (import.meta.main) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`\nUpdate failed: ${message}\n`);
    process.exit(1);
  });
}
