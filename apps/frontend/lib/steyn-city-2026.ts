import type {
  DesignElementNode,
  MagazineGlobalDefinition,
  MagazinePageDefinition,
  MagazineSection,
} from "@xpomag/magazine";

type Tone = {
  bg: string;
  ink: string;
  accent: string;
  soft?: string;
};

const sans = "var(--xp-font-sans)";
const serif = "var(--xp-font-editorial)";
const pad = "clamp(1rem, 2.4vw, 2.4rem)";

function text(
  id: string,
  value: string,
  style: DesignElementNode["style"] = {},
  as: "h1" | "h2" | "h3" | "p" | "span" = "p",
): DesignElementNode {
  return { id, type: "text", props: { as, text: value }, style };
}

function stack(
  id: string,
  children: DesignElementNode[],
  style: DesignElementNode["style"] = {},
): DesignElementNode {
  return { id, type: "stack", children, style: { gap: ".65rem", ...style } };
}

function grid(
  id: string,
  children: DesignElementNode[],
  style: DesignElementNode["style"] = {},
): DesignElementNode {
  return { id, type: "grid", children, style: { gap: ".75rem", ...style } };
}

function label(id: string, value: string, color: string): DesignElementNode {
  return text(id, value.toUpperCase(), {
    color,
    fontSize: "clamp(.48rem,.6vw,.62rem)",
    fontWeight: 820,
    lineHeight: 1,
    letterSpacing: ".15em",
  }, "span");
}

function background(id: string, color: string): DesignElementNode {
  return {
    id: `${id}-background`,
    type: "background",
    props: { layers: [{ kind: "solid", color }] },
    style: { position: "absolute", inset: 0 },
  };
}

function section(
  id: string,
  title: string,
  slot: string,
  elements: DesignElementNode[],
  style: MagazineSection["style"] = {},
  engagement = true,
): MagazineSection {
  return {
    id,
    slug: id,
    title,
    kind: "editorial",
    slot,
    resources: { fonts: [], images: [], styles: [] },
    engagement: engagement
      ? { reactions: true, comments: true, share: true, save: true }
      : { reactions: false, comments: false, share: false, save: false },
    style: { padding: pad, overflow: "hidden", ...style },
    elements,
  };
}

function page(
  issueId: string,
  id: string,
  title: string,
  kind: MagazinePageDefinition["kind"],
  layoutId: string,
  tone: Tone,
  sections: MagazineSection[],
): MagazinePageDefinition {
  return {
    id,
    issueId,
    slug: id,
    title,
    kind,
    access: "public",
    layoutId,
    background: background(id, tone.bg),
    resources: { fonts: [], images: [], styles: [] },
    styles: {},
    sections,
  };
}

function heroPage(
  issueId: string,
  pageNo: number,
  id: string,
  kicker: string,
  headline: string,
  deck: string,
  tone: Tone,
  options: { quote?: string; number?: string; numberLabel?: string } = {},
): MagazinePageDefinition {
  return page(issueId, id, headline, "feature", "utility-full", tone, [
    section(`${id}-hero`, headline, "main", [
      stack(`${id}-top`, [
        label(`${id}-meta`, `STEYN CITY · 2026 · ${String(pageNo).padStart(2, "0")}`, tone.accent),
        label(`${id}-kicker`, kicker, tone.accent),
      ], {
        position: "absolute",
        left: "6%",
        top: "6%",
        zIndex: 4,
        gap: ".28rem",
      }),
      text(`${id}-headline`, headline, {
        color: tone.ink,
        fontFamily: serif,
        fontSize: "clamp(3rem,7vw,7.2rem)",
        fontWeight: 400,
        lineHeight: .82,
        letterSpacing: "-.055em",
        whiteSpace: "pre-line",
        maxWidth: "88%",
        position: "absolute",
        left: "6%",
        bottom: options.quote ? "31%" : "20%",
        zIndex: 3,
      }, "h2"),
      text(`${id}-deck`, deck, {
        color: tone.ink,
        fontFamily: sans,
        fontSize: "clamp(.72rem,1.1vw,1rem)",
        lineHeight: 1.45,
        maxWidth: "34rem",
        position: "absolute",
        left: "6%",
        bottom: "8%",
        width: "58%",
        opacity: .82,
        zIndex: 4,
      }),
      ...(options.quote ? [text(`${id}-quote`, options.quote, {
        color: tone.ink,
        fontFamily: serif,
        fontSize: "clamp(1.15rem,2.2vw,2.15rem)",
        lineHeight: .95,
        letterSpacing: "-.035em",
        position: "absolute",
        right: "6%",
        bottom: "8%",
        width: "29%",
        padding: "1rem",
        borderTop: `4px solid ${tone.accent}`,
        background: tone.soft ?? "rgba(255,255,255,.55)",
        zIndex: 4,
      }, "h3")] : []),
      ...(options.number ? [
        text(`${id}-number`, options.number, {
          color: tone.accent,
          fontFamily: sans,
          fontSize: "clamp(5rem,13vw,13rem)",
          fontWeight: 850,
          lineHeight: .72,
          letterSpacing: "-.08em",
          position: "absolute",
          right: "4%",
          top: "8%",
          opacity: .18,
        }, "span"),
        text(`${id}-number-label`, options.numberLabel ?? "", {
          color: tone.ink,
          fontSize: ".58rem",
          fontWeight: 800,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          position: "absolute",
          right: "6%",
          top: "35%",
          maxWidth: "10rem",
          textAlign: "right",
          opacity: .64,
        }, "span"),
      ] : []),
    ], {
      background: `linear-gradient(135deg, ${tone.bg} 0%, ${tone.soft ?? tone.bg} 100%)`,
      color: tone.ink,
      position: "relative",
    }),
  ]);
}

function editorialPage(
  issueId: string,
  pageNo: number,
  id: string,
  kicker: string,
  headline: string,
  deck: string,
  tone: Tone,
  bodyTitle = "EDITORIAL BODY TO REFINE",
): MagazinePageDefinition {
  return page(issueId, id, headline, "editorial", "article-classic", tone, [
    section(`${id}-title`, headline, "headline", [
      label(`${id}-meta`, `STEYN CITY · 2026 · ${String(pageNo).padStart(2, "0")} · ${kicker}`, tone.accent),
      text(`${id}-headline`, headline, {
        color: tone.ink,
        fontFamily: serif,
        fontSize: "clamp(2.5rem,5.8vw,5.7rem)",
        fontWeight: 400,
        lineHeight: .84,
        letterSpacing: "-.055em",
        marginTop: "auto",
        whiteSpace: "pre-line",
      }, "h2"),
      text(`${id}-deck`, deck, {
        color: tone.ink,
        fontSize: "clamp(.72rem,1vw,.95rem)",
        lineHeight: 1.48,
        maxWidth: "38rem",
        opacity: .76,
      }),
    ], {
      background: tone.bg,
      color: tone.ink,
      display: "flex",
      flexDirection: "column",
    }),
    section(`${id}-body`, bodyTitle, "body", [
      grid(`${id}-columns`, [
        stack(`${id}-copy-a`, [
          label(`${id}-label-a`, "PAGE STRUCTURE", tone.accent),
          text(`${id}-copy-a-text`, "Primary article copy, pull quotes and captions from the original 2026 Steyn City magazine will be placed here during the page-by-page refinement pass.", {
            color: tone.ink,
            fontSize: "clamp(.67rem,.86vw,.82rem)",
            lineHeight: 1.52,
          }),
        ]),
        stack(`${id}-copy-b`, [
          label(`${id}-label-b`, "VISUAL ZONE", tone.accent),
          text(`${id}-copy-b-text`, "This zone is reserved for the original photography, video, interactive callouts, maps, galleries or social modules relevant to the story.", {
            color: tone.ink,
            fontSize: "clamp(.67rem,.86vw,.82rem)",
            lineHeight: 1.52,
          }),
        ], {
          padding: "1rem",
          background: tone.soft ?? "rgba(255,255,255,.45)",
          borderTop: `4px solid ${tone.accent}`,
        }),
      ], {
        gridTemplateColumns: "1.15fr .85fr",
        alignItems: "stretch",
      }),
    ], {
      background: tone.soft ?? "rgba(255,255,255,.52)",
      color: tone.ink,
    }),
  ]);
}

function contentsPage(issueId: string, tone: Tone): MagazinePageDefinition {
  const items = [
    ["08–11", "GOLF", "A NEW TAKE ON AN ESTABLISHED TRADITION"],
    ["12", "CYCLING", "STEYN CITY: SUPERB FOR CYCLISTS!"],
    ["14", "SENIOR VILLAGE", "GLOWING THROUGH THE GOLDEN YEARS"],
    ["16", "LIFESTYLE", "LIVING THE EASY LIFE"],
    ["18", "ENVIRONMENT", "BIRDS AND BEES"],
    ["22", "PROPERTY", "DISCOVER THE STEYN CITY RENTAL COLLECTION"],
    ["23", "WINE", "CONSECUTIVE GLOBAL ACCLAIM FOR SA CHENIN BLANC"],
    ["24", "FOOD", "ALL THINGS DELICIOUS"],
    ["26", "GOLF", "WHERE GOLF MEETS EXCELLENCE"],
    ["28", "LIFESTYLE", "WHERE EVERY DAY’S A HOLIDAY!"],
    ["30", "SCHOOL", "WHERE VALUES SHAPE FUTURES"],
    ["32", "LIFESTYLE", "WORK, CONNECT, THRIVE"],
    ["34", "WELLNESS", "HEALTH IS THE NEW WEALTH"],
    ["36", "EQUESTRIAN", "SHOWING OFF WITH SHOWJUMPING"],
    ["38", "COMMUNITY", "YOU SAW IT HERE FIRST!"],
  ];

  return page(issueId, "contents", "Contents", "contents", "contents-index", tone, [
    section("contents-title", "Contents", "title", [
      label("contents-meta", "STEYN CITY · 2026 EDITION", tone.accent),
      text("contents-head", "CONTENTS", {
        color: tone.ink,
        fontFamily: serif,
        fontSize: "clamp(4rem,9vw,9rem)",
        lineHeight: .78,
        letterSpacing: "-.07em",
        marginTop: "auto",
      }, "h1"),
    ], {
      background: tone.bg,
      display: "flex",
      flexDirection: "column",
    }, false),
    section("contents-list", "Contents list", "list", [
      stack("contents-rows", items.map(([no, category, title], index) =>
        grid(`contents-row-${index}`, [
          text(`contents-no-${index}`, no, {
            color: tone.accent,
            fontSize: ".7rem",
            fontWeight: 850,
            letterSpacing: ".08em",
          }, "span"),
          label(`contents-cat-${index}`, category, tone.accent),
          text(`contents-title-${index}`, title, {
            color: tone.ink,
            fontSize: "clamp(.72rem,1vw,.94rem)",
            fontWeight: 720,
            lineHeight: 1.08,
            letterSpacing: "-.02em",
          }, "span"),
        ], {
          gridTemplateColumns: "3.6rem 6.2rem 1fr",
          alignItems: "start",
          padding: ".5rem 0",
          borderBottom: "1px solid rgba(0,0,0,.12)",
        })
      ), { gap: 0 }),
    ], {
      background: tone.soft ?? "#f3efe6",
    }, false),
  ]);
}

function coverPage(issueId: string, tone: Tone): MagazinePageDefinition {
  return page(issueId, "cover", "Steyn City 2026 · Home of LIV Golf", "cover", "utility-full", tone, [
    section("cover-main", "Cover", "main", [
      text("cover-brand", "STEYN CITY", {
        color: tone.ink,
        fontFamily: sans,
        fontSize: "clamp(1rem,2.1vw,1.9rem)",
        fontWeight: 720,
        letterSpacing: ".16em",
        position: "absolute",
        left: "6%",
        top: "6%",
      }, "span"),
      text("cover-year", "2026", {
        color: tone.ink,
        fontFamily: sans,
        fontSize: "clamp(.8rem,1.2vw,1.05rem)",
        fontWeight: 650,
        letterSpacing: ".18em",
        position: "absolute",
        right: "6%",
        top: "6.5%",
      }, "span"),
      text("cover-head", "HOME OF\nLIV GOLF", {
        color: tone.ink,
        fontFamily: serif,
        fontSize: "clamp(4.2rem,10vw,10.5rem)",
        fontWeight: 400,
        lineHeight: .76,
        letterSpacing: "-.07em",
        whiteSpace: "pre-line",
        position: "absolute",
        left: "6%",
        bottom: "11%",
        width: "82%",
      }, "h1"),
      label("cover-kicker", "THE EXTRAORDINARY LIFESTYLE ISSUE", tone.accent),
      text("cover-ring", "●", {
        color: tone.accent,
        position: "absolute",
        right: "7%",
        bottom: "8%",
        fontSize: "clamp(7rem,16vw,16rem)",
        lineHeight: .6,
        opacity: .5,
      }, "span"),
    ], {
      position: "relative",
      background: `radial-gradient(circle at 76% 32%, ${tone.accent} 0 11%, transparent 11.5%), linear-gradient(155deg, ${tone.bg}, ${tone.soft ?? tone.bg})`,
    }, false),
  ]);
}

function placeholderPage(
  issueId: string,
  pageNo: number,
  id: string,
  labelText: string,
  tone: Tone,
): MagazinePageDefinition {
  return page(issueId, id, labelText, "editorial", "utility-full", tone, [
    section(`${id}-main`, labelText, "main", [
      label(`${id}-meta`, `STEYN CITY · 2026 · ${String(pageNo).padStart(2, "0")}`, tone.accent),
      text(`${id}-title`, labelText, {
        color: tone.ink,
        fontFamily: serif,
        fontSize: "clamp(3rem,7vw,7rem)",
        lineHeight: .82,
        letterSpacing: "-.055em",
        marginTop: "auto",
        whiteSpace: "pre-line",
      }, "h2"),
      text(`${id}-note`, "STRUCTURAL PLACEHOLDER · ORIGINAL CONTENT + ART DIRECTION TO BE REBUILT IN THE REFINEMENT PASS", {
        color: tone.ink,
        fontSize: ".58rem",
        fontWeight: 780,
        letterSpacing: ".12em",
        lineHeight: 1.4,
        opacity: .55,
        maxWidth: "28rem",
      }, "span"),
    ], {
      display: "flex",
      flexDirection: "column",
      background: tone.bg,
    }, false),
  ]);
}

export function getSteynCity2026Magazine(): MagazineGlobalDefinition {
  const issueId = "steyn-city-2026";

  const forest: Tone = { bg: "#13271f", ink: "#f4f0e8", accent: "#c6a66a", soft: "#203a2f" };
  const paper: Tone = { bg: "#eee9df", ink: "#171712", accent: "#77664b", soft: "#f8f5ee" };
  const gold: Tone = { bg: "#b79b5d", ink: "#16130d", accent: "#fff5d8", soft: "#d0bc88" };
  const lagoon: Tone = { bg: "#c9e2df", ink: "#10201e", accent: "#317c79", soft: "#e8f3f1" };
  const clay: Tone = { bg: "#d6c6b4", ink: "#231a14", accent: "#8c5536", soft: "#eee5db" };
  const night: Tone = { bg: "#111a20", ink: "#f4f2ec", accent: "#9ab8bd", soft: "#22313a" };
  const school: Tone = { bg: "#d7e5e3", ink: "#102220", accent: "#1a766f", soft: "#eef5f3" };

  const pages: MagazinePageDefinition[] = [
    coverPage(issueId, forest),
    placeholderPage(issueId, 2, "inside-front-cover", "WELCOME TO\nSTEYN CITY 2026", paper),
    heroPage(issueId, 3, "opening-i", "2026 EDITION", "AN EXTRAORDINARY\nCITY WITHIN A CITY", "A new XpoMag treatment of Steyn City’s 2026 magazine — rebuilt as a living, interactive editorial experience.", forest, { number: "26", numberLabel: "THE 2026 EDITION" }),
    editorialPage(issueId, 4, "opening-ii", "INTRODUCTION", "THE YEAR\nIN VIEW", "A calm editorial opener for the estate, its people, its landscape and the year’s defining stories.", paper),
    placeholderPage(issueId, 5, "opening-visual", "THE EXTRAORDINARY\nLIFESTYLE", lagoon),
    contentsPage(issueId, paper),
    heroPage(issueId, 7, "liv-opener", "GOLF", "LIV YOUR\nBEST LIFE", "A cinematic opener into the event, the course, the crowd and Steyn City’s place on the global golf stage.", night, { quote: "HOME OF LIV GOLF", number: "54", numberLabel: "A graphic nod to LIV" }),
    heroPage(issueId, 8, "golf-tradition-i", "GOLF · 08–11", "A NEW TAKE ON AN\nESTABLISHED TRADITION", "The main golf feature begins with scale, spectacle and the atmosphere surrounding LIV Golf at Steyn City.", forest, { quote: "A TRADITION REFRAMED FOR A NEW GENERATION." }),
    editorialPage(issueId, 9, "golf-tradition-ii", "GOLF", "THE COURSE\nAS A STAGE", "Long-form editorial spread with strong photography, pull quotes and scorecard-style details.", paper),
    editorialPage(issueId, 10, "golf-tradition-iii", "GOLF", "THE PEOPLE\nAROUND THE GAME", "A people-led page for players, fans, hospitality and the atmosphere beyond the fairway.", gold),
    heroPage(issueId, 11, "golf-tradition-iv", "GOLF", "A GLOBAL EVENT.\nA LOCAL MOMENT.", "Closing page for the opening golf chapter, designed for embedded video and social engagement.", night),
    heroPage(issueId, 12, "cycling", "CYCLING", "STEYN CITY:\nSUPERB FOR CYCLISTS!", "A movement-led page with route energy, distance markers and image strips that can later become interactive.", lagoon, { number: "50", numberLabel: "KM-CLASS VISUAL LANGUAGE" }),
    placeholderPage(issueId, 13, "cycling-visual", "RIDE / MOVE /\nDISCOVER", forest),
    heroPage(issueId, 14, "senior-village", "SENIOR VILLAGE", "GLOWING THROUGH\nTHE GOLDEN YEARS", "A warm, optimistic feature about multigenerational living, independence and the Senior Village experience.", clay, { quote: "LIFE DOESN’T GET SMALLER. IT GETS MORE INTENTIONAL." }),
    editorialPage(issueId, 15, "senior-village-ii", "SENIOR VILLAGE", "DESIGNED FOR\nLIFE TO CONTINUE", "A second page for facilities, routines, community and personal stories.", paper),
    heroPage(issueId, 16, "easy-life", "LIFESTYLE", "LIVING THE\nEASY LIFE", "A premium lifestyle spread built around convenience, landscape and everyday rhythm.", lagoon),
    placeholderPage(issueId, 17, "easy-life-visual", "EVERYTHING\nWITHIN REACH", paper),
    heroPage(issueId, 18, "birds-bees-i", "ENVIRONMENT · 18", "BIRDS\nAND BEES", "A nature-led opener for Steyn City’s grasslands, wetlands, birdlife, bees and wider conservation story.", forest, { quote: "THE LANDSCAPE IS NOT A BACKDROP. IT IS PART OF THE LIFESTYLE." }),
    editorialPage(issueId, 19, "birds-bees-ii", "ENVIRONMENT", "WHAT’S\nTHE BUZZ?", "Beekeeper Bryce McCall, hives, pollination and the living systems inside the estate.", paper),
    editorialPage(issueId, 20, "birds-bees-iii", "ENVIRONMENT", "MAKING A\nDIFFERENCE", "Recycling, cleaner energy and practical sustainability initiatives.", lagoon),
    editorialPage(issueId, 21, "birds-bees-iv", "ENVIRONMENT", "GROW, GROW,\nGROW", "The Growzone, food security and the Steyn City Foundation’s community impact.", gold),
    heroPage(issueId, 22, "rental-collection", "PROPERTY", "DISCOVER THE\nSTEYN CITY RENTAL\nCOLLECTION", "A property-led page built for large interior photography, rental options and direct enquiry interactions.", clay),
    editorialPage(issueId, 23, "chenin", "WINE", "CONSECUTIVE GLOBAL\nACCLAIM FOR SA\nCHENIN BLANC", "A refined food-and-wine editorial page with tasting notes and an elegant vertical rhythm.", paper),
    heroPage(issueId, 24, "food-i", "FOOD", "ALL THINGS\nDELICIOUS", "A visual food opener for Steyn City’s dining culture and culinary experiences.", gold),
    editorialPage(issueId, 25, "food-ii", "FOOD", "TABLES WORTH\nLINGERING AT", "A modular dining page that can later carry restaurant cards, menus, chefs, video and booking links.", paper),
    heroPage(issueId, 26, "golf-excellence", "GOLF", "WHERE GOLF\nMEETS EXCELLENCE", "A focused golf page for the club, course design, practice and the experience of playing at Steyn City.", forest),
    placeholderPage(issueId, 27, "golf-excellence-visual", "PLAY / PRACTISE /\nPERFORM", paper),
    heroPage(issueId, 28, "holiday-i", "LIFESTYLE", "WHERE EVERY DAY’S\nA HOLIDAY!", "Lagoon, parkland, movement, dining and leisure presented as one connected lifestyle.", lagoon, { number: "300m", numberLabel: "LAGOON" }),
    editorialPage(issueId, 29, "holiday-ii", "LIFESTYLE", "STAY CLOSE\nTO THE GOOD STUFF", "A second page for the everyday holiday idea, with facilities, routes and experiential callouts.", paper),
    heroPage(issueId, 30, "school-i", "SCHOOL", "WHERE VALUES\nSHAPE FUTURES", "Steyn City School’s growth, leadership and emphasis on character, belonging and academic excellence.", school, { quote: "NINE YEARS OF GROWTH, GROUNDED IN VALUES." }),
    editorialPage(issueId, 31, "school-ii", "SCHOOL", "REACH\nBEYOND", "A continuation page for leadership, culture, sport, academics and the School’s next chapter.", paper),
    heroPage(issueId, 32, "work-i", "LIFESTYLE", "WORK, CONNECT,\nTHRIVE", "A business-and-lifestyle page for the City Centre, workspaces, convenience and the modern workday.", night),
    editorialPage(issueId, 33, "work-ii", "LIFESTYLE", "THE COMMUTE\nREIMAGINED", "A page for Capital Park, nearby amenities and the value of an integrated live-work environment.", paper),
    heroPage(issueId, 34, "wellness-i", "WELLNESS", "HEALTH IS THE\nNEW WEALTH", "A wellness opener combining movement, spa, fitness and the idea that wellbeing is designed into daily life.", lagoon),
    editorialPage(issueId, 35, "wellness-ii", "WELLNESS", "MOVE WELL.\nLIVE WELL.", "A second wellness page for facilities, routines, recovery and active living.", paper),
    heroPage(issueId, 36, "equestrian-i", "EQUESTRIAN", "SHOWING OFF WITH\nSHOWJUMPING", "A dramatic equestrian opener designed for full-height photography and event-driven storytelling.", clay),
    editorialPage(issueId, 37, "equestrian-ii", "EQUESTRIAN", "THE SPORT,\nTHE HORSE,\nTHE MOMENT", "A follow-on page for riders, horses, training and competition.", paper),
    heroPage(issueId, 38, "community-i", "COMMUNITY", "YOU SAW IT\nHERE FIRST!", "A lively community roundup for people, events, launches and moments from across Steyn City.", gold),
    editorialPage(issueId, 39, "community-ii", "COMMUNITY", "THE CITY IN\nMOMENTS", "A gallery-led closing editorial page that can become a saveable, shareable community scrapbook.", paper),
    placeholderPage(issueId, 40, "back-cover", "COME HOME TO\nEVERYDAY EXTRAORDINARY", forest),
  ];

  return {
    id: issueId,
    slug: issueId,
    city: "Steyn City",
    title: "Steyn City — 2026 Edition",
    issueLabel: "2026 Edition",
    monthLabel: "2026",
    metadata: {
      edition: "Steyn City",
      issueNumber: 2026,
      publicationFrequency: "annual",
      demo: true,
      coverArtDirection: "luxury-estate-editorial",
      theme: "Home of LIV Golf",
      pageCount: pages.length,
      reportingWindow: "General layout scaffold based on the published Steyn City 2026 magazine. Page-by-page content and imagery refinement follows.",
    },
    resources: {
      fonts: [
        { id: "ui-sans", family: "Geist", weight: "100 900", preload: true },
        { id: "editorial-serif", family: "Georgia", preload: false },
      ],
      images: [],
      styles: [],
    },
    colors: {
      ink: "#171712",
      paper: "#eee9df",
      forest: "#13271f",
      gold: "#b79b5d",
      lagoon: "#c9e2df",
      clay: "#d6c6b4",
      night: "#111a20",
    },
    fonts: { sans, editorial: serif },
    styles: {
      pagePadding: pad,
      hairline: "rgba(0,0,0,.16)",
      coverRailWidth: "20%",
    },
    designElements: {
      masthead: {
        id: "steyn-city-masthead",
        type: "brandMark",
        props: { label: "STEYN CITY" },
      },
    },
    pages,
  };
}
