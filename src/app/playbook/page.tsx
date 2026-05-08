import Link from "next/link";
import { redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { auth } from "@/auth";
import { loadPlaybookContent } from "@/lib/playbookContent";

const CALLOUT_LABELS = {
  "do-this": "Do this",
  "why-it-works": "Why this works",
  "how-to": "How to",
} as const;

export default async function PlaybookPage() {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/login?callbackUrl=/playbook");
  }

  const content = await loadPlaybookContent();

  return (
    <section className="page-container tooling-page">
      <div className="page-header tooling-header">
        <div>
          <h1>{content.title}</h1>
          <p>
            Practical guidance by pillar to turn assessment recommendations into concrete
            engineering habits.
          </p>
        </div>
        <Link href="/dashboard" className="button ghost tooling-header-link">
          Back to dashboard
        </Link>
      </div>

      {content.introMarkdown && (
        <article className="card tooling-intro-card">
          <div className="tooling-markdown">
            <ReactMarkdown>{content.introMarkdown}</ReactMarkdown>
          </div>
        </article>
      )}

      {content.sections.length > 0 ? (
        <div className="tooling-grid">
          {content.sections.map((section) => (
            <article key={section.slug} id={section.slug} className="card tooling-card">
              <div className="tooling-card-header">
                <p className="eyebrow">Playbook</p>
                <h2>{section.title}</h2>
              </div>

              {section.introMarkdown && (
                <div className="tooling-markdown">
                  <ReactMarkdown>{section.introMarkdown}</ReactMarkdown>
                </div>
              )}

              <div className="tooling-play-list">
                {section.plays.map((play) => (
                  <section key={play.slug} className="tooling-play">
                    <div className="tooling-play-titlebar">
                      <h3>{play.title}</h3>
                    </div>

                    {play.introMarkdown && (
                      <div className="tooling-play-intro tooling-markdown">
                        <ReactMarkdown>{play.introMarkdown}</ReactMarkdown>
                      </div>
                    )}

                    <div className="tooling-callout-list">
                      {play.callouts.map((callout) => (
                        <section
                          key={`${play.slug}-${callout.kind}`}
                          className={`tooling-callout tooling-callout--${callout.kind}`}
                        >
                          <h4>{CALLOUT_LABELS[callout.kind]}</h4>
                          <div className="tooling-markdown">
                            <ReactMarkdown>{callout.markdown}</ReactMarkdown>
                          </div>
                        </section>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <article className="card tooling-empty-state">
          <h2>No playbook sections yet</h2>
          <p>Add `## Pillar ...` sections to `content/playbook.md` to populate this page.</p>
        </article>
      )}
    </section>
  );
}
