import { ImageResponse } from "next/og";
import { getDemoMagazineBySlug } from "../../../../../lib/demo-magazine";
import { pageDescription, pageHeroImage } from "../../../../../lib/seo";

export const alt = "XpoMag editorial story";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function Image({ params }: { params: Promise<{ issue: string; page: string }> }) {
  const { issue: issueSlug, page: pageSlug } = await params;
  const issue = getDemoMagazineBySlug(issueSlug);
  const page = issue.pages.find((item) => item.slug === pageSlug) ?? issue.pages[0];
  const image = page ? pageHeroImage(page) : undefined;
  const description = page ? pageDescription(issue, page) : issue.title;

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#f1efe9", color: "#090909", overflow: "hidden", fontFamily: "Arial, sans-serif" }}>
      {image ? <img src={image} alt="" width="1200" height="630" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /> : null}
      {image ? <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,.82) 0%, rgba(0,0,0,.58) 48%, rgba(0,0,0,.10) 100%)" }} /> : null}
      <div style={{ display: "flex", flexDirection: "column", width: "68%", height: "100%", padding: "58px 64px", color: image ? "#fff" : "#090909" }}>
        <div style={{ display: "flex", fontSize: 28, fontWeight: 800, letterSpacing: "-1px" }}>XpoMag</div>
        <div style={{ display: "flex", marginTop: 12, fontSize: 18, opacity: .75, textTransform: "uppercase", letterSpacing: "3px" }}>{issue.city} · {issue.monthLabel}</div>
        <div style={{ display: "flex", marginTop: "auto", fontSize: page?.kind === "cover" ? 62 : 54, lineHeight: 1.02, fontWeight: 800, letterSpacing: "-2.5px" }}>{page?.title ?? issue.title}</div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 21, lineHeight: 1.35, opacity: .82 }}>{description}</div>
      </div>
    </div>,
    size,
  );
}
