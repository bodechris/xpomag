import type { DesignElementNode, MagazineGlobalDefinition, MagazinePageDefinition, MagazineSection } from "@xpomag/magazine";
import { ArrowLeft, BookOpen } from "lucide-react";
import { SectionEngagementBar } from "./section-engagement";

type ArticleBlock =
  | { type: "text"; id: string; text: string; as: string }
  | { type: "image"; id: string; src: string; alt: string }
  | { type: "video"; id: string; src: string; title: string; poster?: string };

function collectBlocks(node: DesignElementNode): ArticleBlock[] {
  const own: ArticleBlock[] = [];
  if (node.type === "text" && typeof node.props?.text === "string") {
    const value = node.props.text.replace(/\s+/g, " ").trim();
    if (value) own.push({
      type: "text",
      id: node.id,
      text: value,
      as: typeof node.props?.as === "string" ? node.props.as : "p",
    });
  }
  if (node.type === "image" && typeof node.props?.src === "string") {
    own.push({
      type: "image",
      id: node.id,
      src: node.props.src,
      alt: typeof node.props?.alt === "string" ? node.props.alt : "",
    });
  }
  if (node.type === "video" && typeof node.props?.src === "string") {
    own.push({
      type: "video",
      id: node.id,
      src: node.props.src,
      title: typeof node.props?.title === "string" ? node.props.title : "Magazine video",
      poster: typeof node.props?.poster === "string" ? node.props.poster : undefined,
    });
  }
  return [...own, ...(node.children ?? []).flatMap(collectBlocks)];
}

function sectionBlocks(section: MagazineSection, pageTitle: string) {
  const seen = new Set<string>();
  return section.elements
    .flatMap(collectBlocks)
    .filter((block) => {
      if (block.type !== "text") return true;
      const key = block.text.toLowerCase();
      if (key === pageTitle.toLowerCase() || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function ArticlePost({
  issue,
  page,
  viewerAuthenticated = false,
}: {
  issue: MagazineGlobalDefinition;
  page: MagazinePageDefinition;
  viewerAuthenticated?: boolean;
}) {
  const nativeSpread = issue.spreads?.find((spread) => spread.pageIds?.includes(page.id));
  const nativeSpreadMedia = (() => {
    if (!nativeSpread) return [] as ArticleBlock[];
    const seen = new Set<string>();
    return nativeSpread.pieces
      .filter((piece) => !piece.id.includes("-mobile-"))
      .flatMap((piece) => piece.elements.flatMap(collectBlocks))
      .filter((block) => {
        if (block.type === "text") return false;
        const key = block.src;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  })();

  return (
    <article className="xp-article-post">
      <header className="xp-article-post__hero">
        <div className="xp-article-post__nav">
          <a href={`/magazine/${encodeURIComponent(issue.slug)}/${encodeURIComponent(page.slug)}`}>
            <ArrowLeft size={16} />
            <span>Back to magazine</span>
          </a>
          <span><BookOpen size={14} /> Single article mode</span>
        </div>
        <p className="xp-article-post__eyebrow">{issue.city} · {issue.issueLabel} · {page.kind}</p>
        <h1>{page.title}</h1>
        <p className="xp-article-post__dek">
          Read this story as a responsive article. Your place in the magazine is always one tap away.
        </p>
      </header>

      <div className="xp-article-post__body">
        {page.sections.map((section) => {
          const blocks = sectionBlocks(section, page.title);
          return (
            <section className="xp-article-post__section" id={section.slug} key={section.id}>
              {section.title && section.title.toLowerCase() !== page.title.toLowerCase() ? <h2>{section.title}</h2> : null}
              <div className="xp-article-post__content">
                {blocks.map((block) => {
                  if (block.type === "image") {
                    return (
                      <figure key={block.id}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={block.src} alt={block.alt} loading="lazy" />
                        {block.alt ? <figcaption>{block.alt}</figcaption> : null}
                      </figure>
                    );
                  }
                  if (block.type === "video") {
                    const isYouTube = /youtube\.com|youtu\.be/.test(block.src);
                    return (
                      <figure key={block.id}>
                        {isYouTube ? (
                          <iframe
                            src={block.src}
                            title={block.title}
                            loading="lazy"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={block.src}
                            poster={block.poster}
                            title={block.title}
                            muted
                            loop
                            playsInline
                            controls
                            preload="metadata"
                          />
                        )}
                        <figcaption>{block.title}</figcaption>
                      </figure>
                    );
                  }
                  if (block.as === "h1" || block.as === "h2" || block.as === "h3") {
                    return <h3 key={block.id}>{block.text}</h3>;
                  }
                  if (block.as === "span" && block.text.length < 90) {
                    return <p className="xp-article-post__label" key={block.id}>{block.text}</p>;
                  }
                  return <p key={block.id}>{block.text}</p>;
                })}
              </div>
              <div className="xp-article-post__engagement">
                <SectionEngagementBar
                  issueSlug={issue.slug}
                  pageSlug={page.slug}
                  sectionId={section.id}
                  sectionSlug={section.slug}
                  authenticated={viewerAuthenticated}
                  config={section.engagement}
                  appearance="dark"
                  variant="inline"
                />
              </div>
            </section>
          );
        })}
      </div>

      {nativeSpreadMedia.length ? (
        <section className="xp-article-post__section xp-article-post__spread-media">
          <h2>Media from this spread</h2>
          <div className="xp-article-post__media-grid">
            {nativeSpreadMedia.map((block) => {
              if (block.type === "image") {
                return (
                  <figure key={block.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={block.src} alt={block.alt} loading="lazy" />
                    {block.alt ? <figcaption>{block.alt}</figcaption> : null}
                  </figure>
                );
              }
              if (block.type === "video") {
                const isYouTube = /youtube\.com|youtu\.be/.test(block.src);
                return (
                  <figure key={block.id}>
                    {isYouTube ? (
                      <iframe
                        src={block.src}
                        title={block.title}
                        loading="lazy"
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={block.src}
                        poster={block.poster}
                        title={block.title}
                        muted
                        loop
                        playsInline
                        controls
                        preload="metadata"
                      />
                    )}
                    <figcaption>{block.title}</figcaption>
                  </figure>
                );
              }
              return null;
            })}
          </div>
        </section>
      ) : null}

      <footer className="xp-article-post__footer">
        <a href={`/magazine/${encodeURIComponent(issue.slug)}/${encodeURIComponent(page.slug)}`}>
          Return to magazine view
        </a>
      </footer>
    </article>
  );
}
