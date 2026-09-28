import type {
  DesignElementNode,
  MagazineGlobalDefinition,
  MagazinePageDefinition,
  MagazineSection,
  MagazineSpreadDefinition,
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
  bodyTitle = "THE STORY",
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
        lineHeight: 1.44,
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
          label(`${id}-label-a`, "THE STORY", tone.accent),
          text(`${id}-copy-a-text`, deck, {
            color: tone.ink,
            fontSize: "clamp(.67rem,.86vw,.82rem)",
            lineHeight: 1.52,
          }),
        ]),
        stack(`${id}-copy-b`, [
          label(`${id}-label-b`, "EXPLORE", tone.accent),
          text(`${id}-copy-b-text`, "A composed visual field for photography, motion, maps, galleries and interactive details — designed to feel native to the story rather than added on.", {
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
  const aerial = "https://www.steyncity.co.za/wp-content/uploads/2021/08/SC_15112023-0503-Pano-Edit.webp";
  const steynTextLogo = "/resources/studio/steyn/steyn-city-text-logo.svg";
  const steynMark = "/resources/studio/steyn/steyn-city-logo-mark.svg";
  const golfSaLogo = "/resources/studio/steyn/golf-sa-logo-new.svg";
  const corner = "/resources/studio/steyn/corner-shape.svg";

  const image = (
    id: string,
    src: string,
    alt: string,
    style: DesignElementNode["style"],
  ): DesignElementNode => ({
    id,
    type: "image",
    props: { src, alt },
    style,
  });

  const coverline = (
    id: string,
    title: string,
    deck: string,
    style: DesignElementNode["style"],
    align: "left" | "right" = "left",
  ): DesignElementNode => stack(`${id}-group`, [
    image(`${id}-corner`, corner, "", {
      width: "clamp(.92rem,1.45vw,1.35rem)",
      height: "clamp(.92rem,1.45vw,1.35rem)",
      objectFit: "contain",
      filter: "invert(1)",
      opacity: .98,
      transform: align === "left"
        ? "translate(-20px, 10px) scaleX(-1)"
        : "translate(20px, 10px)",
      transformOrigin: "center",
      alignSelf: align === "right" ? "flex-end" : "flex-start",
      marginBottom: "clamp(.06rem,.12vw,.12rem)",
    }),
    text(`${id}-title`, title, {
      color: "#fff",
      fontFamily: '"Playfair Display", var(--xp-font-editorial)',
      fontSize: "clamp(.94rem,1.78vw,1.72rem)",
      fontWeight: 800,
      lineHeight: .92,
      letterSpacing: "-.08em",
      whiteSpace: "pre-line",
      textAlign: align,
      textShadow: "0 2px 14px rgba(0,0,0,.38)",
    }, "h2"),
    text(`${id}-deck`, deck, {
      color: "rgba(255,255,255,.98)",
      fontFamily: "var(--xp-font-editorial)",
      fontSize: "clamp(.42rem,.60vw,.60rem)",
      fontStyle: "italic",
      lineHeight: 1.06,
      whiteSpace: "pre-line",
      textAlign: align,
      textShadow: "0 2px 8px rgba(0,0,0,.50)",
      marginTop: ".08rem",
    }),
  ], { position: "absolute", zIndex: 6, gap: 0, ...style });

  return page(issueId, "cover", "Steyn City 2026 · Extraordinary Living", "cover", "utility-full", tone, [
    section("cover-main", "Steyn City 2026 cover", "main", [
      image("cover-aerial", aerial, "Aerial view of Steyn City parkland and lagoon precinct", {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "52% center",
        zIndex: 0,
        transform: "scale(1.05)",
      }),
      {
        id: "cover-image-grade",
        type: "frame",
        style: {
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: [
            "linear-gradient(180deg,rgba(7,22,14,.10) 0%,rgba(5,20,13,.28) 45%,rgba(2,12,8,.62) 100%)",
            "linear-gradient(90deg,rgba(0,0,0,.20),transparent 30%,transparent 72%,rgba(0,0,0,.12))",
          ].join(","),
          mixBlendMode: "multiply",
          pointerEvents: "none",
        },
      },
      {
        id: "cover-top-vignette",
        type: "frame",
        style: {
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: "28%",
          zIndex: 2,
          background: "linear-gradient(180deg,rgba(0,0,0,.40),transparent)",
          pointerEvents: "none",
        },
      },

      image("cover-steyn-wordmark", steynTextLogo, "Steyn City", {
        position: "absolute",
        zIndex: 8,
        top: "5.3%",
        left: "7%",
        width: "86%",
        height: "auto",
        filter: "invert(1) brightness(4)",
        opacity: .98,
      }),

      text("cover-extraordinary", "EXTRAORDINARY LIVING", {
        position: "absolute",
        zIndex: 8,
        top: "13.7%",
        left: "1.5%",
        right: "1.5%",
        color: "#fff",
        fontFamily: "var(--xp-font-editorial)",
        fontSize: "clamp(1.22rem,2.72vw,2.52rem)",
        fontWeight: 500,
        lineHeight: .95,
        textAlign: "center",
        letterSpacing: ".005em",
        whiteSpace: "nowrap",
        textShadow: "0 2px 18px rgba(0,0,0,.55)",
      }, "h1"),

      stack("cover-script-lockup", [
        text("cover-script-liv", "LIV", {
          color: "#fff",
          fontFamily: '"Caveat", cursive',
          fontSize: "clamp(1.06rem,1.75vw,1.72rem)",
          fontWeight: 700,
          lineHeight: .8,
          letterSpacing: "-.04em",
          textShadow: "0 2px 12px rgba(0,0,0,.42)",
        }, "span"),
        text("cover-script-rest", "your best life", {
          color: "#fff",
          fontFamily: '"Nothing You Could Do", cursive',
          fontSize: "clamp(.74rem,1.15vw,1.12rem)",
          fontWeight: 400,
          lineHeight: .9,
          letterSpacing: "-.03em",
          textShadow: "0 2px 12px rgba(0,0,0,.42)",
        }, "span"),
      ], {
        position: "absolute",
        zIndex: 8,
        top: "20.4%",
        right: "8.1%",
        display: "flex",
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "flex-end",
        gap: "clamp(.22rem,.38vw,.36rem)",
        whiteSpace: "nowrap",
        transform: "translateY(-5px) rotate(-3deg)",
      }),

      coverline(
        "cover-senior",
        "SENIOR\nLIVING",
        "a new take on\nthe golden years",
        { left: "8.0%", top: "35.4%", width: "28.2%" },
      ),

      coverline(
        "cover-liv",
        "HOME OF LIV GOLF\nSOUTH AFRICA\n2026",
        "making history",
        { right: "7.7%", top: "35.4%", width: "43%" },
        "right",
      ),

      coverline(
        "cover-easy",
        "LIVING THE\nEASY LIFE",
        "convenient world-class\nfacilities and services",
        { left: "7.2%", top: "60.0%", width: "36%" },
      ),

      coverline(
        "cover-nature",
        "BIRDS\n& BEES",
        "where nature\nthrives",
        { right: "7.7%", top: "60.0%", width: "21%" },
        "right",
      ),

      stack("cover-bottom-lockup", [
        image("cover-steyn-mark", steynMark, "Steyn City logo mark", {
          width: "clamp(2.7rem,4.7vw,4.45rem)",
          height: "clamp(2.9rem,5vw,4.75rem)",
          objectFit: "contain",
          objectPosition: "center",
          filter: "invert(1) brightness(4)",
        }),
        {
          id: "cover-golf-sa-logo-frame",
          type: "frame",
          style: {
            width: "clamp(2.7rem,4.7vw,4.45rem)",
            height: "clamp(2.9rem,5vw,4.75rem)",
            flex: "0 0 auto",
            position: "relative",
            overflow: "visible",
            display: "grid",
            placeItems: "center",
            isolation: "isolate",
            boxSizing: "border-box",
          },
          children: [
            image("cover-golf-sa-logo", golfSaLogo, "LIV Golf South Africa — Steyn City", {
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "100%",
              height: "100%",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              objectPosition: "center",
              display: "block",
              zIndex: 2,
              transform: "translate(-50%, -50%)",
              transformOrigin: "center",
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,.32))",
            }),
          ],
        },
      ], {
        position: "absolute",
        zIndex: 9,
        left: "50%",
        bottom: "4.4%",
        transform: "translateX(-50%)",
        flexDirection: "row",
        alignItems: "center",
        gap: "clamp(.8rem,1.35vw,1.2rem)",
        overflow: "visible",
      }),

      text("cover-edition", "STEYN CITY MAGAZINE · 2026 EDITION", {
        position: "absolute",
        zIndex: 7,
        left: "50%",
        bottom: "1.35%",
        transform: "translateX(-50%)",
        color: "rgba(255,255,255,.72)",
        fontFamily: "var(--xp-font-grotesk)",
        fontSize: "clamp(.35rem,.62vw,.58rem)",
        fontWeight: 650,
        letterSpacing: ".15em",
        whiteSpace: "nowrap",
      }, "span"),
    ], {
      position: "relative",
      padding: 0,
      overflow: "hidden",
      background: "#0c2017",
      isolation: "isolate",
    }, true),
  ]);
}


function steynPhoto(
  id: string,
  src: string,
  alt: string,
  style: DesignElementNode["style"] = {},
): DesignElementNode {
  return {
    id,
    type: "image",
    props: { src, alt },
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
      ...style,
    },
  };
}

function insideFrontGalleryPage(issueId: string): MagazinePageDefinition {
  const root = "/resources/studio/steyn/city-living";

  return page(
    issueId,
    "inside-front-gallery",
    "City Living · Steyn City",
    "advert",
    "utility-full",
    { bg: "#ffffff", ink: "#141414", accent: "#171717" },
    [
      section(
        "inside-front-gallery-main",
        "City Living Gallery",
        "main",
        [
          grid(
            "inside-front-gallery-grid",
            [
              steynPhoto(
                "inside-front-aerial",
                `${root}/aerial.svg`,
                "Aerial view across Steyn City and its lagoon",
                {
                  gridColumn: "1 / -1",
                  gridRow: "1 / span 6",
                  objectPosition: "center 47%",
                },
              ),
              steynPhoto(
                "inside-front-terrace",
                `${root}/terrace-blue.svg`,
                "Terrace lounge overlooking Steyn City",
                {
                  gridColumn: "1 / span 7",
                  gridRow: "7 / span 6",
                  objectPosition: "center 55%",
                },
              ),
              steynPhoto(
                "inside-front-sunset",
                `${root}/sunset-balcony.svg`,
                "Steyn City apartment balcony at sunset",
                {
                  gridColumn: "8 / -1",
                  gridRow: "7 / span 3",
                  objectPosition: "center 53%",
                },
              ),
              steynPhoto(
                "inside-front-kitchen",
                `${root}/kitchen.svg`,
                "Contemporary Steyn City kitchen and dining interior",
                {
                  gridColumn: "8 / -1",
                  gridRow: "10 / span 3",
                  objectPosition: "center 52%",
                },
              ),
            ],
            {
              position: "absolute",
              inset: 0,
              display: "grid",
              gridTemplateColumns: "repeat(12,minmax(0,1fr))",
              gridTemplateRows: "repeat(12,minmax(0,1fr))",
              gap: "clamp(3px,.42vw,7px)",
              background: "#fff",
              padding: 0,
            },
          ),
        ],
        {
          position: "relative",
          padding: 0,
          overflow: "hidden",
          background: "#fff",
        },
        true,
      ),
    ],
  );
}

function insideFrontPropertyPage(issueId: string): MagazinePageDefinition {
  const steynMark = "/resources/studio/steyn/steyn-city-logo-mark.svg";
  const steynWordmark = "/resources/studio/steyn/steyn-city-text-logo.svg";
  const pamGolding = "/resources/studio/steyn/pam-golding-properties-logo.webp";

  return page(
    issueId,
    "inside-front-property",
    "City Living Reimagined",
    "advert",
    "utility-full",
    { bg: "#fbfaf8", ink: "#2a2927", accent: "#292725" },
    [
      section(
        "inside-front-property-main",
        "City Living Reimagined",
        "main",
        [
          stack(
            "inside-front-property-lockup",
            [
              steynPhoto(
                "inside-front-steyn-mark",
                steynMark,
                "Steyn City",
                {
                  width: "clamp(4.1rem,8.5vw,7.2rem)",
                  height: "clamp(4.1rem,8.5vw,7.2rem)",
                  objectFit: "contain",
                  filter: "none",
                  flex: "0 0 auto",
                },
              ),
              steynPhoto(
                "inside-front-steyn-wordmark",
                steynWordmark,
                "Steyn City",
                {
                  width: "clamp(8rem,18vw,14rem)",
                  height: "auto",
                  maxHeight: "3.2rem",
                  objectFit: "contain",
                  filter: "none",
                  flex: "0 0 auto",
                },
              ),
              stack(
                "inside-front-heading",
                [
                  stack(
                    "inside-front-heading-line",
                    [
                      text(
                        "inside-front-city",
                        "CITY",
                        {
                          color: "#373432",
                          fontFamily: serif,
                          fontSize: "clamp(1.25rem,2.15vw,2.25rem)",
                          fontWeight: 400,
                          lineHeight: .92,
                          letterSpacing: ".08em",
                        },
                        "span",
                      ),
                      text(
                        "inside-front-living",
                        "LIVING",
                        {
                          color: "#373432",
                          fontFamily: serif,
                          fontSize: "clamp(1.3rem,2.25vw,2.35rem)",
                          fontWeight: 650,
                          fontStyle: "italic",
                          lineHeight: .92,
                          letterSpacing: ".055em",
                        },
                        "span",
                      ),
                    ],
                    {
                      flexDirection: "row",
                      alignItems: "baseline",
                      justifyContent: "center",
                      gap: "clamp(.25rem,.5vw,.5rem)",
                    },
                  ),
                  text(
                    "inside-front-reimagined",
                    "REIMAGINED",
                    {
                      color: "#373432",
                      fontFamily: serif,
                      fontSize: "clamp(1.15rem,1.9vw,2rem)",
                      fontWeight: 400,
                      lineHeight: .9,
                      letterSpacing: ".115em",
                      textAlign: "center",
                    },
                    "h2",
                  ),
                ],
                { gap: ".08rem", alignItems: "center" },
              ),
              text(
                "inside-front-copy",
                "Exquisite apartments. Lush outdoor living.\nCity convenience with retail, dining, wellness\nand leisure. City Centre, where every day\nis extraordinary, and life is beautiful.",
                {
                  color: "#3c3935",
                  fontFamily: serif,
                  fontSize: "clamp(.6rem,.92vw,.84rem)",
                  fontStyle: "italic",
                  lineHeight: 1.5,
                  textAlign: "center",
                  whiteSpace: "pre-line",
                  maxWidth: "24rem",
                },
              ),
              {
                id: "inside-front-qr",
                type: "frame",
                style: {
                  width: "clamp(2.5rem,4.2vw,3.7rem)",
                  height: "clamp(2.5rem,4.2vw,3.7rem)",
                  background:
                    "repeating-conic-gradient(#1d1d1b 0 25%,#fff 0 50%) 50% / 8px 8px",
                  border: "4px solid #fff",
                  boxShadow: "0 0 0 1px rgba(0,0,0,.38)",
                  flex: "0 0 auto",
                },
              },
              text(
                "inside-front-scan",
                "To learn more, scan this QR code.",
                {
                  color: "#494541",
                  fontFamily: serif,
                  fontSize: "clamp(.46rem,.64vw,.58rem)",
                  fontStyle: "italic",
                  textAlign: "center",
                },
                "span",
              ),
              steynPhoto(
                "inside-front-pam",
                pamGolding,
                "Pam Golding Properties",
                {
                  width: "clamp(6rem,12vw,9.5rem)",
                  height: "auto",
                  maxHeight: "4.2rem",
                  objectFit: "contain",
                  flex: "0 0 auto",
                  marginTop: "clamp(1rem,2.8vh,2rem)",
                },
              ),
              text(
                "inside-front-contact",
                "Contact Mark Harrison on 083 539 3999 or\nWillem on 072 454 4583 to book a viewing.\nsteyncity.co.za",
                {
                  color: "#4c4844",
                  fontFamily: serif,
                  fontSize: "clamp(.42rem,.56vw,.52rem)",
                  fontStyle: "italic",
                  lineHeight: 1.45,
                  textAlign: "center",
                  whiteSpace: "pre-line",
                },
                "span",
              ),
            ],
            {
              position: "absolute",
              inset: "7% 8% 6%",
              alignItems: "center",
              justifyContent: "center",
              gap: "clamp(.65rem,1.65vh,1.15rem)",
            },
          ),
        ],
        {
          position: "relative",
          padding: 0,
          overflow: "hidden",
          background: "#fbfaf8",
        },
        true,
      ),
    ],
  );
}


function cityLivingSpread(issueId: string): MagazineSpreadDefinition {
  // All Steyn City spread assets live directly in /public/resources/studio/steyn.
  // Browser URLs intentionally omit /public because Next.js serves public/ at the site root.
  // Every bento tile below uses a different source image.
  const aerial = "/resources/studio/steyn/steyn-city-img-03.webp";
  const sunsetPortrait = "/resources/studio/steyn/steyn-city-img-04.webp";
  const luxuryInteriorVideo = "https://videos.pexels.com/video-files/37674127/15971334_1080_1920_60fps.mp4";
  const terrace = "/resources/studio/steyn/steyn-city-img-05.webp";
  const sunset = "/resources/studio/steyn/city-living-sunset.webp";
  const kitchen = "/resources/studio/steyn/city-living-kitchen.webp";
  const staircase = "/resources/studio/steyn/steyn-city-img-01.webp";
  const wineWall = "/resources/studio/steyn/steyn-city-img-02.webp";
  const restaurant = "/resources/studio/steyn/steyn-city-img-06.webp";
  const pinkLiving = "/resources/studio/steyn/steyn-city-img-07.webp";
  const dramatic = "/resources/studio/steyn/Dramatic-n-Authentic8564.webp";
  const qrCode = "/resources/studio/steyn/qr-code-steyn-city.png";
  const steynMark = "/resources/studio/steyn/steyn-city-logo-mark.svg";
  const steynWordmark = "/resources/studio/steyn/steyn-city-text-logo.svg";
  const pamGolding = "/resources/studio/steyn/pam-golding-properties-logo.webp";

  const image = (
    id: string,
    src: string,
    alt: string,
    style: DesignElementNode["style"],
  ): DesignElementNode => ({
    id,
    type: "image",
    props: { src, alt },
    style: {
      display: "block",
      objectFit: "cover",
      ...style,
    },
  });

  const gutter = "clamp(3px,.34vw,7px) solid #fff";

  return {
    id: "steyn-city-living-spread",
    issueId,
    slug: "city-living-reimagined",
    title: "City Living Reimagined",
    kind: "advert",
    pageIds: ["inside-front-gallery", "inside-front-property"],
    style: { background: "#fff" },
    pieces: [{
      id: "steyn-city-living-piece",
      slug: "city-living-reimagined-piece",
      title: "City Living Reimagined",
      kind: "advert",
      region: "spread",
      gutterBehaviour: "cross",
      engagement: {
        reactions: false,
        comments: false,
        share: false,
        save: false,
      },
      style: {
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#fff",
      },
      elements: [
        image("city-living-sunset", sunset, "Apartment terrace at sunset", {
          position: "absolute",
          left: "36%",
          top: "49%",
          width: "20%",
          height: "25.5%",
          objectPosition: "center 55%",
          borderRight: gutter,
          borderBottom: gutter,
        }),

        image("city-living-kitchen", kitchen, "Contemporary illuminated staircase interior", {
          position: "absolute",
          left: "56%",
          top: "49%",
          width: "19%",
          height: "25.5%",
          objectPosition: "center 48%",
          borderRight: gutter,
          borderBottom: gutter,
        }),

        image("city-living-wine-wall", wineWall, "Wine wall and art in a Steyn City residence", {
          position: "absolute",
          left: "36%",
          top: "74.5%",
          width: "13%",
          height: "25.5%",
          objectPosition: "center center",
          borderRight: gutter,
        }),

        image("city-living-restaurant", restaurant, "Steyn City dining and hospitality interior", {
          position: "absolute",
          left: "49%",
          top: "74.5%",
          width: "13%",
          height: "25.5%",
          objectPosition: "center center",
          borderRight: gutter,
        }),

        image("city-living-pink-lounge", dramatic, "Contemporary Steyn City interior", {
          position: "absolute",
          left: "62%",
          top: "74.5%",
          width: "13%",
          height: "25.5%",
          objectPosition: "center center",
          borderRight: gutter,
        }),

        {
          id: "city-living-copy-panel",
          type: "frame",
          style: {
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "25%",
            background: "#fbfaf8",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "clamp(1.6rem,3.2vw,3.8rem) clamp(1rem,1.9vw,2.3rem) clamp(1rem,1.8vw,2rem)",
            boxSizing: "border-box",
            color: "#211f1d",
          },
          children: [
            image("city-living-steyn-mark", steynMark, "Steyn City emblem", {
              width: "clamp(1.9rem,3.4vw,4rem)",
              height: "clamp(2rem,3.6vw,4.2rem)",
              objectFit: "contain",
              marginBottom: "clamp(.55rem,.9vw,.9rem)",
            }),
            image("city-living-steyn-wordmark", steynWordmark, "Steyn City", {
              width: "clamp(5.5rem,8.6vw,9.8rem)",
              height: "auto",
              objectFit: "contain",
              marginBottom: "clamp(1.15rem,2.2vw,2.5rem)",
            }),

            stack("city-living-headline", [
              stack("city-living-headline-row", [
                text("city-living-city", "CITY", {
                  color: "#2b2826",
                  fontFamily: '"Bodoni Moda", var(--xp-font-editorial)',
                  fontSize: "clamp(1rem,1.72vw,1.85rem)",
                  fontWeight: 400,
                  lineHeight: .92,
                  letterSpacing: ".06em",
                }, "span"),
                text("city-living-liv", "LIV", {
                  color: "#2b2826",
                  fontFamily: '"Bodoni Moda", var(--xp-font-editorial)',
                  fontSize: "clamp(1.15rem,1.95vw,2.05rem)",
                  fontWeight: 600,
                  fontStyle: "italic",
                  lineHeight: .86,
                }, "span"),
                text("city-living-ing", "ING", {
                  color: "#2b2826",
                  fontFamily: '"Bodoni Moda", var(--xp-font-editorial)',
                  fontSize: "clamp(1rem,1.72vw,1.85rem)",
                  fontWeight: 400,
                  lineHeight: .92,
                  letterSpacing: ".06em",
                }, "span"),
              ], {
                flexDirection: "row",
                alignItems: "baseline",
                justifyContent: "center",
                gap: "clamp(.12rem,.25vw,.28rem)",
              }),
              text("city-living-reimagined", "REIMAGINED", {
                color: "#2b2826",
                fontFamily: '"Bodoni Moda", var(--xp-font-editorial)',
                fontSize: "clamp(.95rem,1.55vw,1.7rem)",
                fontWeight: 400,
                lineHeight: .92,
                letterSpacing: ".08em",
                whiteSpace: "nowrap",
              }, "h2"),
            ], {
              alignItems: "center",
              gap: ".05rem",
              marginBottom: "clamp(.9rem,1.5vw,1.4rem)",
            }),

            text("city-living-copy",
              "Exquisite apartments. Lush outdoor living.\nCity convenience with retail, dining, wellness\nand leisure. City Centre, where every day\nis extraordinary, and life is beautiful.",
              {
                color: "#4b4642",
                fontFamily: "var(--xp-font-editorial)",
                fontSize: "clamp(.52rem,.68vw,.72rem)",
                fontStyle: "italic",
                lineHeight: 1.42,
                whiteSpace: "pre-line",
                maxWidth: "18rem",
                marginBottom: "clamp(1rem,1.8vw,1.9rem)",
              }
            ),

            image("city-living-qr", qrCode, "QR code to learn more about Steyn City", {
              width: "clamp(2.25rem,3vw,3.3rem)",
              height: "auto",
              objectFit: "contain",
              marginBottom: ".55rem",
            }),

            text("city-living-qr-note", "To learn more, scan this QR code.", {
              color: "#57514d",
              fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(.46rem,.55vw,.6rem)",
              fontStyle: "italic",
              lineHeight: 1.25,
            }, "span"),

            {
              id: "city-living-panel-spacer",
              type: "frame",
              style: { flex: "1 1 auto", minHeight: ".7rem" },
            },

            image("city-living-pam-golding", pamGolding, "Pam Golding Properties", {
              width: "clamp(6.4rem,8.4vw,9.2rem)",
              height: "auto",
              objectFit: "contain",
              marginBottom: ".28rem",
            }),

            text("city-living-contact",
              "Contact Mark Harrison on 083 539 3999 or\nWillem on 072 454 4583 to book a viewing.",
              {
                color: "#5b5551",
                fontFamily: "var(--xp-font-editorial)",
                fontSize: "clamp(.52rem,.58vw,.64rem)",
                fontStyle: "italic",
                lineHeight: 1.3,
                whiteSpace: "pre-line",
              }
            ),
            text("city-living-url", "steyncity.co.za", {
              color: "#393532",
              fontFamily: "var(--xp-font-grotesk)",
              fontSize: "clamp(.46rem,.52vw,.58rem)",
              fontWeight: 650,
              letterSpacing: ".04em",
              marginTop: ".18rem",
            }, "span"),
          ],
        },
      ],
    },
    {
      id: "steyn-city-living-aerial-piece",
      slug: "city-living-aerial",
      title: "Steyn City lagoon living",
      kind: "feature",
      region: "spread",
      gutterBehaviour: "clip",
      engagement: {
        reactions: true,
        comments: true,
        share: true,
        save: true,
      },
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        width: "56%",
        height: "49%",
        overflow: "hidden",
        background: "#dfe5e7",
        borderRight: gutter,
        borderBottom: gutter,
        zIndex: 7,
      },
      elements: [
        image("city-living-aerial", aerial, "Aerial view of Steyn City and the lagoon", {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectPosition: "center 48%",
        }),
      ],
    },
    {
      id: "steyn-city-living-terrace-piece",
      slug: "city-living-terrace",
      title: "Terrace living at Steyn City",
      kind: "feature",
      region: "spread",
      gutterBehaviour: "clip",
      engagement: {
        reactions: true,
        comments: true,
        share: true,
        save: true,
      },
      style: {
        position: "absolute",
        left: 0,
        top: "49%",
        width: "36%",
        height: "51%",
        overflow: "hidden",
        background: "#dfe5e7",
        borderRight: gutter,
        zIndex: 7,
      },
      elements: [
        image("city-living-terrace", terrace, "Blue and white terrace overlooking Steyn City", {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectPosition: "center 48%",
        }),
      ],
    },
    {
      id: "steyn-city-living-video-piece",
      slug: "city-living-luxury-video",
      title: "Luxury living at Steyn City",
      kind: "feature",
      region: "spread",
      gutterBehaviour: "clip",
      engagement: {
        reactions: true,
        comments: true,
        share: true,
        save: true,
      },
      style: {
        position: "absolute",
        left: "56%",
        top: 0,
        width: "19%",
        height: "49%",
        overflow: "hidden",
        background: "#dfe5e7",
        borderRight: gutter,
        borderBottom: gutter,
        zIndex: 8,
      },
      elements: [
        {
          id: "city-living-luxury-video",
          type: "video",
          props: {
            src: luxuryInteriorVideo,
            poster: sunsetPortrait,
            title: "Luxury apartment interior film",
            autoplay: true,
            managedAutoplay: false,
            autoplayDelayMs: 0,
            muted: true,
            loop: true,
            maxLoops: 999,
            controls: false,
          },
          style: {
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            background: "#dfe5e7",
          },
        },
      ],
    }],
  };
}


function bentleyAdvertSpread(issueId: string): MagazineSpreadDefinition {
  const poster = "/resources/studio/steyn/bentley-img-01.webp";
  const logo = "/resources/studio/steyn/bentley-logo-1.webp";
  const videoSrc = "https://videos.pexels.com/video-files/30787543/13168478_3840_2160_25fps.mp4";

  return {
    id: "steyn-bentley-flying-spur-spread",
    issueId,
    slug: "bentley-flying-spur",
    title: "Bentley Flying Spur",
    kind: "advert",
    pageIds: ["opening-i", "opening-ii"],
    style: { background: "#fff" },
    pieces: [{
      id: "steyn-bentley-flying-spur-piece",
      slug: "bentley-flying-spur-piece",
      title: "Bentley Flying Spur",
      kind: "advert",
      region: "spread",
      gutterBehaviour: "cross",
      engagement: {
        reactions: true,
        comments: true,
        share: true,
        save: true,
      },
      style: {
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#fff",
      },
      elements: [
        {
          id: "bentley-video",
          type: "video",
          props: {
            src: videoSrc,
            poster,
            title: "Bentley Flying Spur driving film",
            autoplay: true,
            managedAutoplay: false,
            autoplayDelayMs: 4000,
            muted: true,
            loop: true,
            maxLoops: 10,
            controls: false,
          },
          style: {
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "84.8%",
            objectFit: "cover",
            objectPosition: "center 52%",
            background: "#dfe8ec",
          },
        },
        {
          id: "bentley-logo",
          type: "image",
          props: {
            src: logo,
            alt: "Bentley",
            loading: "eager",
            fetchPriority: "high",
          },
          style: {
            position: "absolute",
            top: "4.3%",
            left: "68.5%",
            width: "14.5%",
            height: "9%",
            objectFit: "contain",
            objectPosition: "center",
            zIndex: 4,
          },
        },
        {
          id: "bentley-bottom-rail",
          type: "frame",
          style: {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "15.2%",
            background: "rgba(255,255,255,.985)",
            borderTop: "1px solid rgba(0,0,0,.08)",
            display: "grid",
            gridTemplateColumns: "1.15fr .85fr",
            alignItems: "stretch",
            boxSizing: "border-box",
            zIndex: 5,
          },
          children: [
            {
              id: "bentley-copy-left",
              type: "stack",
              style: {
                justifyContent: "center",
                padding: "clamp(.8rem,1.25vw,1.45rem) clamp(1.35rem,2.8vw,3.25rem)",
                gap: "clamp(.18rem,.32vw,.34rem)",
              },
              children: [
                text("bentley-power", "The power of the possible.", {
                  color: "#141414",
                  fontFamily: "var(--xp-font-sans)",
                  fontSize: "clamp(1rem,1.55vw,1.7rem)",
                  fontWeight: 420,
                  lineHeight: 1.05,
                  letterSpacing: "-.025em",
                }, "h2"),
                text("bentley-flying-spur", "Flying Spur Speed.", {
                  color: "#141414",
                  fontFamily: "var(--xp-font-sans)",
                  fontSize: "clamp(.62rem,.76vw,.84rem)",
                  fontWeight: 760,
                  lineHeight: 1.15,
                }, "span"),
                text("bentley-description",
                  "Discover unprecedented power in luxurious comfort with a phenomenal new Ultra-Performance Hybrid V8 Powertrain.",
                  {
                    color: "#303030",
                    fontFamily: "var(--xp-font-sans)",
                    fontSize: "clamp(.44rem,.52vw,.58rem)",
                    lineHeight: 1.35,
                    maxWidth: "48rem",
                  }
                ),
                text("bentley-legal-left",
                  "Visit bentleymotors.com or contact Bentley South Africa on 010 020 4000.",
                  {
                    color: "#555",
                    fontFamily: "var(--xp-font-sans)",
                    fontSize: "clamp(.34rem,.39vw,.44rem)",
                    lineHeight: 1.25,
                  },
                  "span"
                ),
              ],
            },
            {
              id: "bentley-copy-right",
              type: "stack",
              style: {
                alignItems: "flex-end",
                justifyContent: "center",
                textAlign: "right",
                padding: "clamp(.8rem,1.25vw,1.45rem) clamp(1.35rem,2.8vw,3.25rem)",
                gap: "clamp(.22rem,.34vw,.38rem)",
              },
              children: [
                text("bentley-sa", "BENTLEY SOUTH AFRICA", {
                  color: "#151515",
                  fontFamily: "var(--xp-font-sans)",
                  fontSize: "clamp(.62rem,.72vw,.8rem)",
                  fontWeight: 620,
                  letterSpacing: ".05em",
                }, "span"),
                text("bentley-specs",
                  "Power: 575 kW · Torque: 1000 Nm\n0–100 km/h: 3.5 seconds · Maximum speed: 285 km/h",
                  {
                    color: "#3a3a3a",
                    fontFamily: "var(--xp-font-sans)",
                    fontSize: "clamp(.42rem,.48vw,.54rem)",
                    lineHeight: 1.35,
                    whiteSpace: "pre-line",
                  }
                ),
                text("bentley-price",
                  "Model shown: Flying Spur Speed",
                  {
                    color: "#555",
                    fontFamily: "var(--xp-font-sans)",
                    fontSize: "clamp(.34rem,.39vw,.44rem)",
                    lineHeight: 1.2,
                  },
                  "span"
                ),
              ],
            },
          ],
        },
      ],
    }],
  };
}


function contentsGolfSpread(issueId: string): MagazineSpreadDefinition {
  const hero = "/resources/studio/steyn/steyn-city-xpomag-spread-2-01.webp";
  const portrait = "/resources/studio/steyn/steyn-city-xpomag-spread-2-02.webp";
  const qr = "/resources/studio/steyn/QR-code-300x300.png";

  const image = (
    id: string,
    src: string,
    alt: string,
    style: DesignElementNode["style"],
  ): DesignElementNode => ({
    id,
    type: "image",
    props: { src, alt, loading: "eager", fetchPriority: "high" },
    style,
  });

  const contentsLeft = [
    ["GOLF", "A NEW TAKE ON AN ESTABLISHED TRADITION", "8–11"],
    ["GOLF", "WHERE GOLF MEETS EXCELLENCE", "26"],
    ["CYCLING", "STEYN CITY: SUPERB FOR CYCLISTS!", "12"],
    ["SENIOR VILLAGE", "GLOWING THROUGH THE GOLDEN YEARS", "14"],
    ["LIFESTYLE", "LIVING THE EASY LIFE", "16"],
    ["LIFESTYLE", "WHERE EVERY DAY’S A HOLIDAY!", "28"],
    ["LIFESTYLE", "WORK, CONNECT, THRIVE", "32"],
    ["ENVIRONMENT", "BIRDS AND BEES", "18"],
    ["PROPERTY", "DISCOVER THE STEYN CITY RENTAL COLLECTION", "22"],
  ];

  const contentsRight = [
    ["WINE", "CONSECUTIVE GLOBAL ACCLAIM FOR SA CHENIN BLANC", "23"],
    ["FOOD", "ALL THINGS DELICIOUS", "24"],
    ["SCHOOL", "WHERE VALUES SHAPE FUTURES", "30"],
    ["WELLNESS", "HEALTH IS THE NEW WEALTH", "34"],
    ["EQUESTRIAN", "SHOWING OFF WITH SHOWJUMPING", "36"],
    ["COMMUNITY", "YOU SAW IT HERE FIRST!", "38"],
  ];

  const contentsColumn = (id: string, rows: string[][]): DesignElementNode =>
    stack(id, rows.map(([category, title, pageNo], index) =>
      grid(id + "-row-" + index, [
        stack(id + "-copy-" + index, [
          text(id + "-category-" + index, category, {
            color: "#4f4a45",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: "clamp(.32rem,.46vw,.48rem)",
            fontWeight: 850,
            lineHeight: 1,
            letterSpacing: ".09em",
          }, "span"),
          text(id + "-title-" + index, title, {
            color: "#26221f",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: "clamp(.34rem,.49vw,.52rem)",
            fontWeight: 670,
            lineHeight: 1.08,
            letterSpacing: "-.015em",
          }, "span"),
        ], { gap: ".12rem" }),
        text(id + "-page-" + index, pageNo, {
          color: "#26221f",
          fontFamily: "var(--xp-font-grotesk)",
          fontSize: "clamp(.34rem,.47vw,.5rem)",
          fontWeight: 760,
          lineHeight: 1,
          textAlign: "right",
        }, "span"),
      ], {
        gridTemplateColumns: "1fr auto",
        alignItems: "end",
        gap: ".45rem",
      })
    ), { gap: "clamp(.38rem,.62vw,.64rem)" });

  return {
    id: "steyn-contents-golf-spread",
    issueId,
    slug: "contents-golf",
    title: "Home of LIV Golf South Africa 2026",
    kind: "feature",
    pageIds: ["contents", "liv-opener"],
    style: { background: "#f3efea" },
    pieces: [{
      id: "steyn-contents-golf-piece",
      slug: "steyn-contents-golf-piece",
      title: "Home of LIV Golf South Africa 2026",
      kind: "feature",
      region: "spread",
      gutterBehaviour: "cross",
      engagement: { reactions: true, comments: true, share: true, save: true },
      style: {
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#f3efea",
      },
      elements: [
        image("contents-golf-hero", hero, "Steyn City clubhouse and golf venue at dusk", {
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "56.5%",
          objectFit: "cover",
          objectPosition: "center 52%",
          zIndex: 0,
        }),
        {
          id: "contents-golf-hero-grade",
          type: "frame",
          style: {
            position: "absolute",
            inset: "0 0 43.5% 0",
            zIndex: 1,
            background: "linear-gradient(180deg,rgba(244,237,236,.12) 0%,rgba(33,27,22,.04) 60%,rgba(17,15,13,.18) 100%)",
            pointerEvents: "none",
          },
        },
        text("contents-golf-hero-title", "HOME OF LIV GOLF SOUTH AFRICA 2026", {
          position: "absolute",
          left: "8%",
          right: "8%",
          top: "5.4%",
          color: "#ffffff",
          fontFamily: "var(--xp-font-editorial)",
          fontSize: "clamp(1.45rem,3.05vw,3.1rem)",
          fontWeight: 400,
          lineHeight: .95,
          letterSpacing: ".025em",
          textAlign: "center",
          whiteSpace: "nowrap",
          zIndex: 4,
          textShadow: "0 2px 18px rgba(0,0,0,.28)",
        }, "h2"),
        {
          id: "contents-golf-circle",
          type: "frame",
          style: {
            position: "absolute",
            left: "39.2%",
            top: "31.8%",
            width: "14.5%",
            aspectRatio: "1 / 1",
            borderRadius: "50%",
            background: "#f5f2ef",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
            boxShadow: "0 5px 18px rgba(0,0,0,.10)",
          },
          children: [
            stack("contents-golf-circle-copy", [
              text("contents-golf-experience", "EXPERIENCE", {
                color: "#5b554f",
                fontFamily: "var(--xp-font-grotesk)",
                fontSize: "clamp(.28rem,.36vw,.39rem)",
                fontWeight: 760,
                letterSpacing: ".16em",
                textAlign: "center",
              }, "span"),
              text("contents-golf-circle-body",
                "STEYN CITY STAND A\nCHANCE TO WIN A NIGHT FOR\nTWO AT THE STEYN CITY HOTEL\nBY SAXON, ALONG WITH A LUXE\nTREATMENT AT THE SAXON\nSPA & STEYN CITY—ALL WHILE\nDISCOVERING FIRST-HAND THE\nEXTRAORDINARY LIFESTYLE\nON OFFER. SCAN TO\nENTER.",
                {
                  color: "#292522",
                  fontFamily: "var(--xp-font-grotesk)",
                  fontSize: "clamp(.27rem,.34vw,.37rem)",
                  fontWeight: 620,
                  lineHeight: 1.16,
                  letterSpacing: ".02em",
                  textAlign: "center",
                  whiteSpace: "pre-line",
                }
              ),
              image("contents-golf-qr", qr, "QR code for Steyn City experience", {
                width: "clamp(1.6rem,2.1vw,2.15rem)",
                height: "auto",
                objectFit: "contain",
                marginTop: ".1rem",
              }),
            ], {
              width: "82%",
              alignItems: "center",
              justifyContent: "center",
              gap: ".18rem",
            }),
          ],
        },
        {
          id: "contents-golf-lower",
          type: "frame",
          style: {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "43.5%",
            background: "#f4f0eb",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            zIndex: 2,
          },
          children: [
            {
              id: "contents-golf-lower-left",
              type: "frame",
              style: {
                position: "relative",
                padding: "clamp(1rem,2.35vw,2.5rem) clamp(1.2rem,3vw,3.15rem) clamp(.8rem,1.8vw,1.8rem)",
                borderRight: "1px solid rgba(35,29,26,.08)",
                overflow: "hidden",
              },
              children: [
                text("contents-golf-contents-title", "CONTENTS", {
                  color: "#18464a",
                  fontFamily: "var(--xp-font-editorial)",
                  fontSize: "clamp(1.8rem,3.45vw,3.55rem)",
                  fontWeight: 400,
                  lineHeight: .92,
                  letterSpacing: ".025em",
                  marginBottom: "clamp(.7rem,1.2vw,1.2rem)",
                }, "h2"),
                grid("contents-golf-columns", [
                  contentsColumn("contents-golf-col-a", contentsLeft),
                  contentsColumn("contents-golf-col-b", contentsRight),
                ], {
                  gridTemplateColumns: "1fr 1fr",
                  gap: "clamp(1rem,2vw,2.2rem)",
                  alignItems: "start",
                }),
                {
                  id: "contents-golf-left-rule",
                  type: "frame",
                  style: {
                    position: "absolute",
                    left: "8%",
                    right: "8%",
                    bottom: "4.8%",
                    height: "1px",
                    background: "rgba(40,33,28,.45)",
                  },
                },
                text("contents-golf-left-edition", "2026 EDITION", {
                  position: "absolute",
                  left: "50%",
                  bottom: "2.2%",
                  transform: "translateX(-50%)",
                  color: "#635e59",
                  fontFamily: "var(--xp-font-grotesk)",
                  fontSize: "clamp(.28rem,.38vw,.41rem)",
                  fontWeight: 700,
                  letterSpacing: ".14em",
                }, "span"),
              ],
            },
            {
              id: "contents-golf-lower-right",
              type: "frame",
              style: {
                position: "relative",
                padding: "clamp(1.05rem,2.15vw,2.2rem) clamp(1.35rem,3.2vw,3.35rem) clamp(1rem,2vw,2rem)",
                overflow: "visible",
                zIndex: 6,
              },
              children: [
                grid("contents-golf-article-grid", [
                  {
                    id: "contents-golf-article-a",
                    type: "text",
                    props: {
                      as: "p",
                      text: "Hosting LIV Golf South Africa 2026 is not only an enormous honour but also a profound responsibility, both for our estate and for our country; giving us the opportunity to showcase to the world the spirit of our people and the excellence of our offering.\n\nI marvel that an event of this magnitude and distinction will be hosted at Steyn City. I honestly can’t think LIV Golf could have chosen a better golf course and lifestyle estate to be the stage for a global sporting spectacle.",
                      dropCap: true,
                      dropCapLines: 4,
                      dropCapColor: "#18464a",
                    },
                    style: {
                      color: "#3a3531",
                      fontFamily: "var(--xp-font-editorial)",
                      fontSize: "clamp(.43rem,.56vw,.61rem)",
                      lineHeight: 1.44,
                      whiteSpace: "pre-line",
                    },
                  },
                  text("contents-golf-article-b",
                    "We are extremely grateful for this opportunity and grateful, too, for the investment by LIV Golf and the Southern Guards GC. Their contribution to our Steyn City Foundation goes to supporting existing initiatives, while also making it possible to establish the Southern Guards GC Foundation Academy Development Programme in Gauteng.\n\nHowever, you don’t have to love golf to want to live here. Our estate caters to all interests, from mountain-biking and horse riding to swimming, yoga, pilates, aquafit and more. With our hotel, conferencing facilities, and varied workspaces, Steyn City is also an ideal destination for discerning travellers and business guests.",
                    {
                      color: "#3a3531",
                      fontFamily: "var(--xp-font-editorial)",
                      fontSize: "clamp(.43rem,.56vw,.61rem)",
                      lineHeight: 1.44,
                      whiteSpace: "pre-line",
                    }
                  ),
                ], {
                  gridTemplateColumns: "1fr 1fr",
                  gap: "clamp(1rem,1.55vw,1.7rem)",
                  alignItems: "start",
                  paddingRight: "22%",
                }),
                image("contents-golf-portrait", portrait, "Steven Louw, CEO, Steyn City Properties", {
                  position: "absolute",
                  right: "2.8%",
                  top: "-24%",
                  width: "21.5%",
                  aspectRatio: "1 / 1",
                  borderRadius: "50%",
                  objectFit: "cover",
                  objectPosition: "center 18%",
                  border: "clamp(.18rem,.28vw,.3rem) solid #f4f0eb",
                  boxShadow: "0 8px 24px rgba(0,0,0,.14)",
                  zIndex: 20,
                }),
                text("contents-golf-signoff", "Steven Louw (CEO, Steyn City Properties)", {
                  position: "absolute",
                  left: "8%",
                  bottom: "4.7%",
                  color: "#39332f",
                  fontFamily: "var(--xp-font-editorial)",
                  fontSize: "clamp(.34rem,.43vw,.46rem)",
                  fontWeight: 600,
                }, "span"),
              ],
            },
          ],
        },
        text("contents-golf-folio-left", "06", {
          position: "absolute",
          left: "1.1%",
          bottom: "1.1%",
          color: "#312d29",
          fontFamily: "var(--xp-font-grotesk)",
          fontSize: "clamp(.34rem,.46vw,.5rem)",
          fontWeight: 780,
          letterSpacing: ".08em",
          zIndex: 8,
        }, "span"),
        text("contents-golf-folio-right", "07", {
          position: "absolute",
          right: "1.1%",
          bottom: "1.1%",
          color: "#312d29",
          fontFamily: "var(--xp-font-grotesk)",
          fontSize: "clamp(.34rem,.46vw,.5rem)",
          fontWeight: 780,
          letterSpacing: ".08em",
          zIndex: 8,
        }, "span"),
      ],
    }],
  };
}


function golfTraditionSpread(issueId: string): MagazineSpreadDefinition {
  const livSign = "/resources/studio/steyn/steyn-city-xpomag-spread-3-01.webp";
  const group = "/resources/studio/steyn/steyn-city-xpomag-spread-3-02.webp";
  const golfers = "/resources/studio/steyn/steyn-city-xpomag-spread-3-03.webp";

  const image = (
    id: string,
    src: string,
    alt: string,
    style: DesignElementNode["style"],
  ): DesignElementNode => ({
    id,
    type: "image",
    props: { src, alt, loading: "eager", fetchPriority: "high" },
    style,
  });

  return {
    id: "steyn-golf-tradition-spread",
    issueId,
    slug: "golf-tradition",
    title: "A New Take on an Established Tradition",
    kind: "feature",
    pageIds: ["golf-tradition-i", "golf-tradition-ii"],
    style: { background: "#f7f5f0" },
    pieces: [{
      id: "steyn-golf-tradition-piece",
      slug: "steyn-golf-tradition-piece",
      title: "A New Take on an Established Tradition",
      kind: "article",
      region: "spread",
      gutterBehaviour: "cross",
      engagement: { reactions: true, comments: true, share: true, save: true },
      style: {
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#f7f5f0",
      },
      elements: [
        text("golf-tradition-kicker-left", "│ LIV GOLF: A NEW ERA", {
          position: "absolute",
          left: "4.8%",
          top: "4.2%",
          color: "#3b3834",
          fontFamily: "var(--xp-font-editorial)",
          fontSize: "clamp(.42rem,.62vw,.66rem)",
          letterSpacing: ".09em",
          lineHeight: 1,
        }, "span"),
        text("golf-tradition-kicker-right", "LIV GOLF: A NEW ERA │", {
          position: "absolute",
          right: "4.8%",
          top: "4.2%",
          color: "#3b3834",
          fontFamily: "var(--xp-font-editorial)",
          fontSize: "clamp(.42rem,.62vw,.66rem)",
          letterSpacing: ".09em",
          lineHeight: 1,
          textAlign: "right",
        }, "span"),

        text("golf-tradition-title", "A NEW TAKE ON\nAN ESTABLISHED\nTRADITION", {
          position: "absolute",
          left: "4.2%",
          top: "11.7%",
          width: "29.2%",
          maxWidth: "29.2%",
          boxSizing: "border-box",
          color: "#173f3e",
          fontFamily: "var(--xp-font-editorial)",
          fontSize: "clamp(.95rem, min(2.25vw, 4.1vh), 2.45rem)",
          fontWeight: 400,
          lineHeight: .94,
          letterSpacing: ".012em",
          whiteSpace: "pre-line",
          textAlign: "center",
          overflow: "visible",
          overflowWrap: "normal",
          wordBreak: "normal",
          textWrap: "balance",
        }, "h2"),

        text("golf-tradition-section-label", "THE START OF IT ALL", {
          position: "absolute",
          left: "33.6%",
          top: "12.8%",
          width: "12.8%",
          color: "#59534d",
          fontFamily: "var(--xp-font-grotesk)",
          fontSize: "clamp(.3rem,.43vw,.46rem)",
          fontWeight: 800,
          letterSpacing: ".17em",
        }, "span"),

        {
          id: "golf-tradition-left-copy",
          type: "text",
          props: {
            as: "p",
            text: "When you think of a golf tournament, you probably envisage striped grass, crowds and lots of quiet applause as the players focus on their shots and the tension builds over a long day out on the course.\n\nThe LIV Golf experience could not be more different: just 54 holes cut a new spin on cricket, so this new format has revolutionised golf with a faster pace and an accent on immersive fan experiences.\n\nThis new approach is all about reimagining how golf is played, presented and experienced, opening up new markets and accelerating the way audiences connect with the game.",
            dropCap: true,
            dropCapLines: 4,
            dropCapColor: "#d5a500",
          },
          style: {
            position: "absolute",
            left: "33.6%",
            top: "15.6%",
            width: "12.8%",
            color: "#38332f",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.36rem,.49vw,.53rem)",
            lineHeight: 1.43,
            whiteSpace: "pre-line",
          },
        },

        {
          id: "golf-tradition-yellow-quote",
          type: "frame",
          style: {
            position: "absolute",
            left: "23.4%",
            top: "29.2%",
            width: "11.5%",
            aspectRatio: "1 / 1",
            borderRadius: "50%",
            background: "#f4b400",
            zIndex: 5,
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            boxShadow: "0 8px 22px rgba(0,0,0,.08)",
          },
          children: [
            text("golf-tradition-yellow-copy",
              "WITH\nALL THE\nENERGY OF A ROCK\nCONCERT AND AN\nIRRESISTIBLE VIBE, LIV\nGOLF HAS TRANSFORMED\nONE OF THE WORLD’S\nFAVOURITE SPORTS INTO\nA HIGH-ENERGY, FAN-\nFOCUSED GLOBAL\nENTERTAINMENT\nEXPERIENCE",
              {
                color: "#44300a",
                fontFamily: "var(--xp-font-grotesk)",
                fontSize: "clamp(.31rem,.41vw,.44rem)",
                fontWeight: 760,
                lineHeight: 1.08,
                textAlign: "center",
                letterSpacing: ".055em",
                whiteSpace: "pre-line",
              },
              "span"
            ),
          ],
        },

        text("golf-tradition-middle-copy",
          "Dynamic in 2026, with the advent of a four-day event and 72-hole competition, thereby aligning with official World Golf Ranking requirements with the top 10 LIV Golf players now eligible for World Ranking Points at each LIV Golf event.\n\nThe atmosphere is very different, too: more akin to a festival than a tournament, with music concerts, good food and a high-energy atmosphere as much a part of the event as the competition itself.\n\nSmall wonder, then, that the league has been well supported since its establishment, with global greats like Bryson DeChambeau, Jon Rahm and Cameron Smith among its stars.",
          {
            position: "absolute",
            left: "54.3%",
            top: "10.5%",
            width: "12.7%",
            color: "#38332f",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.36rem,.49vw,.53rem)",
            lineHeight: 1.43,
            whiteSpace: "pre-line",
          }
        ),

        text("golf-tradition-looking-south", "LOOKING SOUTH", {
          position: "absolute",
          left: "54.3%",
          top: "46%",
          width: "12.7%",
          color: "#6b625a",
          fontFamily: "var(--xp-font-grotesk)",
          fontSize: "clamp(.29rem,.4vw,.42rem)",
          fontWeight: 800,
          letterSpacing: ".18em",
        }, "span"),

        text("golf-tradition-looking-copy",
          "LIV Golf’s debut at Steyn City is the first time the event is being played on African soil, but South Africa’s presence has been visible from inception. The league has grown its fan base across the continent and, in bringing LIV Golf to South Africa, extends that relationship in a way that feels both global and distinctly local.\n\nWith this in mind, the team hosts a mixture of sport, arts and culture, giving fans a rich experience well beyond the fairways.",
          {
            position: "absolute",
            left: "54.3%",
            top: "49%",
            width: "12.7%",
            color: "#38332f",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.35rem,.47vw,.51rem)",
            lineHeight: 1.42,
            whiteSpace: "pre-line",
          }
        ),

        text("golf-tradition-right-copy",
          "With this in mind, Louis and his team hosted Minister of Sport, Arts and Culture, Gayton McKenzie, and a broad group of partners and guests as LIV Golf South Africa prepares to make its mark.\n\nMinister McKenzie was quick to spot the opportunities and advantages that would arise out of an African event, and the journey to bringing LIV Golf to South Africa began. Creating a venue that is secure, beautiful and geared to a global audience was central to that ambition.",
          {
            position: "absolute",
            right: "17.4%",
            top: "68.2%",
            width: "14.2%",
            color: "#38332f",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.35rem,.47vw,.51rem)",
            lineHeight: 1.42,
            whiteSpace: "pre-line",
          }
        ),

        {
          id: "golf-tradition-fast-fact",
          type: "frame",
          style: {
            position: "absolute",
            right: "4.8%",
            bottom: "8.5%",
            width: "10.5%",
            minHeight: "24%",
            background: "#f4b400",
            padding: "clamp(.75rem,1.25vw,1.35rem)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          },
          children: [
            text("golf-tradition-fast-fact-label", "FAST FACT", {
              color: "#5b4104",
              fontFamily: "var(--xp-font-grotesk)",
              fontSize: "clamp(.3rem,.42vw,.45rem)",
              fontWeight: 850,
              letterSpacing: ".16em",
              marginBottom: ".5rem",
            }, "span"),
            text("golf-tradition-fast-fact-copy",
              "The launch of LIV Golf represents a new chapter for African golf audiences. For many, the Southern Guards GC members have provided a platform to help make the tournament feel unmistakably local while remaining part of a global sporting spectacle.",
              {
                color: "#493607",
                fontFamily: "var(--xp-font-editorial)",
                fontSize: "clamp(.33rem,.44vw,.47rem)",
                lineHeight: 1.35,
              }
            ),
          ],
        },

        text("golf-tradition-folio-left", "8", {
          position: "absolute",
          left: "1.5%",
          bottom: "2.2%",
          color: "#3e3934",
          fontFamily: "var(--xp-font-editorial)",
          fontSize: "clamp(.35rem,.48vw,.52rem)",
        }, "span"),
        text("golf-tradition-brand-left", "STEYN CITY", {
          position: "absolute",
          left: "4.3%",
          bottom: "2.2%",
          color: "#3e3934",
          fontFamily: "var(--xp-font-editorial)",
          fontSize: "clamp(.35rem,.48vw,.52rem)",
          letterSpacing: ".04em",
        }, "span"),
        text("golf-tradition-brand-right", "STEYN CITY", {
          position: "absolute",
          right: "6.7%",
          bottom: "2.2%",
          color: "#3e3934",
          fontFamily: "var(--xp-font-editorial)",
          fontSize: "clamp(.35rem,.48vw,.52rem)",
          letterSpacing: ".04em",
        }, "span"),
        text("golf-tradition-folio-right", "9", {
          position: "absolute",
          right: "1.5%",
          bottom: "2.2%",
          color: "#3e3934",
          fontFamily: "var(--xp-font-editorial)",
          fontSize: "clamp(.35rem,.48vw,.52rem)",
        }, "span"),
      ],
    },
    {
      id: "steyn-golf-tradition-liv-sign-piece",
      slug: "liv-golf-sign",
      title: "LIV Golf at Steyn City",
      kind: "feature",
      region: "spread",
      gutterBehaviour: "clip",
      engagement: { reactions: true, comments: true, share: true, save: true },
      style: {
        position: "absolute",
        left: "5.0%",
        top: "31.5%",
        width: "27.1%",
        height: "27%",
        overflow: "hidden",
        zIndex: 4,
      },
      elements: [
        image("golf-tradition-liv-sign", livSign, "LIV Golf sign at Steyn City", {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 55%",
        }),
      ],
    },
    {
      id: "steyn-golf-tradition-highlight-piece",
      slug: "liv-golf-highlight",
      title: "LIV Golf editorial highlight",
      kind: "feature",
      region: "spread",
      gutterBehaviour: "clip",
      style: {
        position: "absolute",
        left: "23.4%",
        top: "29.2%",
        width: "11.5%",
        aspectRatio: "1 / 1",
        borderRadius: "50%",
        background: "#f4b400",
        zIndex: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        boxShadow: "0 8px 22px rgba(0,0,0,.08)",
        pointerEvents: "none",
      },
      elements: [
        text("golf-tradition-highlight-copy",
          "WITH\nALL THE\nENERGY OF A ROCK\nCONCERT AND AN\nIRRESISTIBLE VIBE, LIV\nGOLF HAS TRANSFORMED\nONE OF THE WORLD’S\nFAVOURITE SPORTS INTO\nA HIGH-ENERGY, FAN-\nFOCUSED GLOBAL\nENTERTAINMENT\nEXPERIENCE",
          {
            color: "#44300a",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: "clamp(.31rem,.41vw,.44rem)",
            fontWeight: 760,
            lineHeight: 1.08,
            textAlign: "center",
            letterSpacing: ".055em",
            whiteSpace: "pre-line",
          },
          "span"
        ),
      ],
    },
    {
      id: "steyn-golf-tradition-group-piece",
      slug: "liv-golf-launch-group",
      title: "LIV Golf South Africa launch group",
      kind: "feature",
      region: "spread",
      gutterBehaviour: "clip",
      engagement: { reactions: true, comments: true, share: true, save: true },
      style: {
        position: "absolute",
        left: "5.0%",
        bottom: "8.2%",
        width: "41.5%",
        height: "27.5%",
        overflow: "hidden",
        zIndex: 6,
      },
      elements: [
        image("golf-tradition-group", group, "LIV Golf South Africa launch group at Steyn City", {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 42%",
        }),
        text("golf-tradition-group-caption",
          "Announced from left: leadership and partners at the LIV Golf South Africa launch at Steyn City.",
          {
            position: "absolute",
            left: "2.5%",
            right: "2.5%",
            bottom: "3.5%",
            color: "#ffffff",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: "clamp(.28rem,.36vw,.39rem)",
            fontWeight: 650,
            lineHeight: 1.25,
            textShadow: "0 2px 8px rgba(0,0,0,.75)",
            zIndex: 3,
          },
          "span"
        ),
      ],
    },
    {
      id: "steyn-golf-tradition-golfers-piece",
      slug: "liv-golfers-course",
      title: "Golfers on the Steyn City course",
      kind: "feature",
      region: "spread",
      gutterBehaviour: "clip",
      engagement: { reactions: true, comments: true, share: true, save: true },
      style: {
        position: "absolute",
        right: 0,
        top: "9.5%",
        width: "32.2%",
        height: "55%",
        overflow: "hidden",
        zIndex: 6,
      },
      elements: [
        image("golf-tradition-golfers", golfers, "Golfers walking the Steyn City course", {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 42%",
        }),
        text("golf-tradition-photo-caption",
          "Southern Guards GC – Dean Burmester and Charl Schwartzel walk the course at Steyn City during range day.",
          {
            position: "absolute",
            left: "4%",
            right: "4%",
            bottom: "3.5%",
            color: "#ffffff",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: "clamp(.28rem,.36vw,.39rem)",
            fontWeight: 650,
            lineHeight: 1.22,
            textShadow: "0 2px 8px rgba(0,0,0,.8)",
            zIndex: 3,
          },
          "span"
        ),
      ],
    }],
  };
}


function golfTraditionContinuationSpread(issueId: string): MagazineSpreadDefinition {
  const academy = "/resources/studio/steyn/steyn-city-xpomag-spread-4-01.webp";
  const inspection = "/resources/studio/steyn/steyn-city-xpomag-spread-4-02.webp";
  const cheque = "/resources/studio/steyn/steyn-city-xpomag-spread-4-03.webp";
  const hospitality = "/resources/studio/steyn/steyn-city-xpomag-spread-4-04.webp";

  const photoPiece = (
    id: string,
    slug: string,
    title: string,
    src: string,
    alt: string,
    style: DesignElementNode["style"],
    objectPosition = "center center",
  ): MagazineSpreadDefinition["pieces"][number] => ({
    id,
    slug,
    title,
    kind: "feature",
    region: "spread",
    gutterBehaviour: "clip",
    engagement: { reactions: true, comments: true, share: true, save: true },
    style: {
      ...style,
      overflow: "hidden",
      background: "#ece9e2",
      zIndex: 6,
    },
    elements: [{
      id: `${id}-image`,
      type: "image",
      props: { src, alt, loading: "eager", fetchPriority: "high" },
      style: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition,
      },
    }],
  });

  return {
    id: "steyn-golf-tradition-continuation-spread",
    issueId,
    slug: "golf-tradition-continued",
    title: "LIV Golf: A New Era — continued",
    kind: "feature",
    pageIds: ["golf-tradition-iii", "golf-tradition-iv"],
    style: { background: "#f7f5f0" },
    pieces: [
      {
        id: "steyn-golf-tradition-continuation-article",
        slug: "liv-golf-new-era-continued",
        title: "LIV Golf: A New Era — continued",
        kind: "article",
        region: "spread",
        gutterBehaviour: "cross",
        engagement: { reactions: true, comments: true, share: true, save: true },
        style: {
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          background: "#f7f5f0",
          zIndex: 1,
        },
        elements: [
          text("golf-cont-kicker-left", "│ LIV GOLF: A NEW ERA", {
            position: "absolute", left: "4.8%", top: "4.1%",
            color: "#3b3834", fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.44rem,.62vw,.68rem)", letterSpacing: ".09em",
          }, "span"),
          text("golf-cont-kicker-right", "LIV GOLF: A NEW ERA │", {
            position: "absolute", right: "4.8%", top: "4.1%",
            color: "#3b3834", fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.44rem,.62vw,.68rem)", letterSpacing: ".09em",
            textAlign: "right",
          }, "span"),

          {
            id: "golf-cont-left-copy-a",
            type: "text",
            props: {
              as: "p",
              text: "A number of LIV Golf executives were involved in the selection, including LIV Golf EVP, Head of Events Ross Hallett and LIV Golf South Africa regional managing director, Chris Bentley. They settled on The Club at Steyn City, which boasts the estate’s excellent infrastructure, easy access and proximity to airports while still feeling completely removed from the city rush.",
              dropCap: true,
              dropCapLines: 4,
              dropCapColor: "#b38a19",
            },
            style: {
              position: "absolute", left: "5.1%", top: "67.2%", width: "13.4%",
              color: "#37322e", fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(.39rem,.52vw,.57rem)", lineHeight: 1.42,
            },
          },
          text("golf-cont-left-copy-b",
            "The announcement that the league would be played in Africa for the first time was finally made in July 2025 at LIV Golf Rocester, UK. Minister McKenzie attended the occasion alongside Southern Guards GC captain Louis Oosthuizen and partners from across the event.",
            {
              position: "absolute", left: "19.1%", top: "67.2%", width: "12.3%",
              color: "#37322e", fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(.39rem,.52vw,.57rem)", lineHeight: 1.42,
            }
          ),

          text("golf-cont-building-label", "BUILDING A LEGACY", {
            position: "absolute", left: "33.5%", top: "30.8%", width: "12.2%",
            color: "#655d55", fontFamily: "var(--xp-font-grotesk)",
            fontSize: "clamp(.31rem,.42vw,.45rem)", fontWeight: 800,
            letterSpacing: ".17em",
          }, "span"),
          text("golf-cont-building-copy",
            "A level of sport is something that unites all South Africans. Whether it is Bafana Bafana or vuvuzelas, South Africans support their teams in a way that defines them. This spirit is shared by the Southern Guards GC and is one of the reasons Louis has been eager to play for South African spectators at home. As Minister McKenzie commented, when visiting them in South Korea, “There is something special about these four players. They all have the South African flag on their kit, and you can’t walk more than a few steps without them talking about a happy memory of a person who impacted their career.”",
            {
              position: "absolute", left: "33.5%", top: "34.2%", width: "12.2%",
              color: "#37322e", fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(.39rem,.52vw,.57rem)", lineHeight: 1.42,
            }
          ),
          text("golf-cont-legacy-copy",
            "Now, the Southern Guards GC have the chance to bring a similar impact to youngsters who dream of playing. Through the Southern Guards GC Foundation and its academy, opportunities are being created for children from communities around Steyn City to learn, train and imagine a future in the game.",
            {
              position: "absolute", left: "33.5%", top: "68.5%", width: "12.2%",
              color: "#37322e", fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(.39rem,.52vw,.57rem)", lineHeight: 1.42,
            }
          ),

          text("golf-cont-right-copy-a",
            "But making a difference to Diepsloot’s young people, especially those who have limited access to the game, is central to the work. The foundation is our way of giving back to South Africa and giving back to our community. We want to help young people get an easier start and provide the kind of opportunity that can change a life.",
            {
              position: "absolute", left: "54.2%", top: "18.8%", width: "12.2%",
              color: "#37322e", fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(.39rem,.52vw,.57rem)", lineHeight: 1.42,
            }
          ),
          text("golf-cont-sustainability-label", "STEPS TOWARDS SUSTAINABILITY", {
            position: "absolute", left: "54.2%", top: "70.8%", width: "12.2%",
            color: "#655d55", fontFamily: "var(--xp-font-grotesk)",
            fontSize: "clamp(.3rem,.41vw,.44rem)", fontWeight: 800,
            letterSpacing: ".14em",
          }, "span"),
          text("golf-cont-sustainability-copy",
            "Added to this, LIV Golf South Africa has reaffirmed its commitment to creating meaningful impact beyond the fairways. Through partnerships with the Steyn City Foundation and community programmes, the event is designed to leave a positive legacy long after the final putt.",
            {
              position: "absolute", left: "54.2%", top: "74.2%", width: "12.2%",
              color: "#37322e", fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(.38rem,.5vw,.55rem)", lineHeight: 1.4,
            }
          ),

          text("golf-cont-right-bottom-a",
            "In Diepsloot, feeding over 3,300 children per day, as it works to become more sustainable, remains a key focus. What matters is building systems that can continue to support families and children consistently.",
            {
              position: "absolute", left: "69.1%", top: "68.2%", width: "12.3%",
              color: "#37322e", fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(.39rem,.52vw,.57rem)", lineHeight: 1.42,
            }
          ),
          text("golf-cont-say-label", "WHAT THEY HAVE TO SAY", {
            position: "absolute", left: "69.1%", top: "84.1%", width: "12.3%",
            color: "#655d55", fontFamily: "var(--xp-font-grotesk)",
            fontSize: "clamp(.3rem,.41vw,.44rem)", fontWeight: 800,
            letterSpacing: ".15em",
          }, "span"),
          text("golf-cont-right-bottom-b",
            "“Seeing golf in Diepsloot and bringing a major event here makes the sport feel closer, more possible and more connected to our own community.”",
            {
              position: "absolute", right: "5.1%", top: "78.9%", width: "12.4%",
              color: "#37322e", fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(.39rem,.52vw,.57rem)", lineHeight: 1.42,
            }
          ),

          text("golf-cont-folio-left", "10", {
            position: "absolute", left: "1.7%", bottom: "2.1%",
            color: "#3e3934", fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.36rem,.49vw,.53rem)",
          }, "span"),
          text("golf-cont-brand-left", "STEYN CITY", {
            position: "absolute", left: "4.7%", bottom: "2.1%",
            color: "#3e3934", fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.36rem,.49vw,.53rem)", letterSpacing: ".04em",
          }, "span"),
          text("golf-cont-brand-right", "STEYN CITY", {
            position: "absolute", right: "7.2%", bottom: "2.1%",
            color: "#3e3934", fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.36rem,.49vw,.53rem)", letterSpacing: ".04em",
          }, "span"),
          text("golf-cont-folio-right", "11", {
            position: "absolute", right: "1.7%", bottom: "2.1%",
            color: "#3e3934", fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.36rem,.49vw,.53rem)",
          }, "span"),
        ],
      },

      photoPiece(
        "steyn-golf-cont-academy-piece",
        "liv-golf-foundation-academy",
        "Southern Guards GC Foundation Academy",
        academy,
        "Southern Guards GC Foundation Academy group at Steyn City",
        { position: "absolute", left: 0, top: "11.2%", width: "31.8%", height: "32.4%" },
        "center 45%",
      ),
      photoPiece(
        "steyn-golf-cont-inspection-piece",
        "liv-golf-course-inspection",
        "Course inspection at Steyn City",
        inspection,
        "LIV Golf course inspection at Steyn City",
        { position: "absolute", left: 0, top: "45.2%", width: "31.8%", height: "20.6%" },
        "center 45%",
      ),
      photoPiece(
        "steyn-golf-cont-cheque-piece",
        "liv-golf-foundation-support",
        "Steyn City Foundation support",
        cheque,
        "LIV Golf and Steyn City Foundation cheque presentation",
        { position: "absolute", right: 0, top: "11.2%", width: "31.9%", height: "31.7%" },
        "center 43%",
      ),
      photoPiece(
        "steyn-golf-cont-hospitality-piece",
        "liv-golf-hospitality-inspection",
        "Hospitality structures inspection",
        hospitality,
        "LIV Golf hospitality structures inspection at Steyn City",
        { position: "absolute", right: 0, top: "45.2%", width: "31.9%", height: "21.2%" },
        "center 45%",
      ),

      /* Mobile-specific reflow. These are hidden on desktop and become two
         stacked portrait pages in single-page reader mode. */
      photoPiece(
        "steyn-golf-cont-mobile-academy-piece",
        "liv-golf-foundation-academy-mobile",
        "Southern Guards GC Foundation Academy",
        academy,
        "Southern Guards GC Foundation Academy group at Steyn City",
        { position: "absolute", left: "2.8%", top: "9%", width: "44.4%", height: "24%", display: "none" },
        "center 45%",
      ),
      photoPiece(
        "steyn-golf-cont-mobile-inspection-piece",
        "liv-golf-course-inspection-mobile",
        "Course inspection at Steyn City",
        inspection,
        "LIV Golf course inspection at Steyn City",
        { position: "absolute", left: "2.8%", top: "35%", width: "44.4%", height: "22%", display: "none" },
        "center 45%",
      ),
      {
        id: "steyn-golf-cont-mobile-left-article",
        slug: "liv-golf-legacy-mobile",
        title: "Building a Legacy",
        kind: "article",
        region: "left",
        gutterBehaviour: "clip",
        engagement: { reactions: true, comments: true, share: true, save: true },
        style: {
          position: "absolute",
          left: "2.8%",
          top: "59%",
          width: "44.4%",
          height: "35%",
          padding: "clamp(.8rem,3vw,1.25rem)",
          display: "none",
          background: "#f7f5f0",
          zIndex: 70,
          overflow: "hidden",
        },
        elements: [
          text("golf-cont-mobile-left-label", "BUILDING A LEGACY", {
            color: "#655d55",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: ".72rem",
            fontWeight: 800,
            letterSpacing: ".14em",
            marginBottom: ".6rem",
          }, "span"),
          {
            id: "golf-cont-mobile-left-copy",
            type: "text",
            props: {
              as: "p",
              text: "LIV Golf’s arrival at Steyn City is about more than a tournament. Through the Southern Guards GC Foundation, the event is creating access to golf, coaching and opportunity for young people from nearby communities. The goal is a legacy that remains long after the final putt — one built around confidence, exposure and a belief that the game can belong to a new generation.",
              dropCap: true,
              dropCapLines: 4,
              dropCapColor: "#b38a19",
            },
            style: {
              color: "#37322e",
              fontFamily: "var(--xp-font-editorial)",
              fontSize: ".78rem",
              lineHeight: 1.48,
            },
          },
        ],
      },

      photoPiece(
        "steyn-golf-cont-mobile-cheque-piece",
        "liv-golf-foundation-support-mobile",
        "Steyn City Foundation support",
        cheque,
        "LIV Golf and Steyn City Foundation cheque presentation",
        { position: "absolute", left: "52.8%", top: "9%", width: "44.4%", height: "24%", display: "none" },
        "center 43%",
      ),
      photoPiece(
        "steyn-golf-cont-mobile-hospitality-piece",
        "liv-golf-hospitality-inspection-mobile",
        "Hospitality structures inspection",
        hospitality,
        "LIV Golf hospitality structures inspection at Steyn City",
        { position: "absolute", left: "52.8%", top: "35%", width: "44.4%", height: "22%", display: "none" },
        "center 45%",
      ),
      {
        id: "steyn-golf-cont-mobile-right-article",
        slug: "liv-golf-impact-mobile",
        title: "Impact Beyond the Fairways",
        kind: "article",
        region: "right",
        gutterBehaviour: "clip",
        engagement: { reactions: true, comments: true, share: true, save: true },
        style: {
          position: "absolute",
          left: "52.8%",
          top: "59%",
          width: "44.4%",
          height: "35%",
          padding: "clamp(.8rem,3vw,1.25rem)",
          display: "none",
          background: "#f7f5f0",
          zIndex: 70,
          overflow: "hidden",
        },
        elements: [
          text("golf-cont-mobile-right-label", "IMPACT BEYOND THE FAIRWAYS", {
            color: "#655d55",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: ".72rem",
            fontWeight: 800,
            letterSpacing: ".12em",
            marginBottom: ".6rem",
          }, "span"),
          {
            id: "golf-cont-mobile-right-copy",
            type: "text",
            props: {
              as: "p",
              text: "The South African chapter also carries a wider community commitment. Partnerships with the Steyn City Foundation support programmes in Diepsloot and surrounding areas, connecting a global sporting event to practical local outcomes. It is this combination — elite sport, hospitality and measurable community impact — that gives the Steyn City edition a distinctly local character.",
              dropCap: true,
              dropCapLines: 4,
              dropCapColor: "#b38a19",
            },
            style: {
              color: "#37322e",
              fontFamily: "var(--xp-font-editorial)",
              fontSize: ".78rem",
              lineHeight: 1.48,
            },
          },
        ],
      },
    ],
  };
}



function cyclingSpread(issueId: string): MagazineSpreadDefinition {
  const mtb = "/resources/studio/steyn/steyn-city-xpomag-spread-5-02.webp";
  const kids = "/resources/studio/steyn/steyn-city-xpomag-spread-5-03.webp";
  const road = "/resources/studio/steyn/steyn-city-xpomag-spread-5-04.webp";
  const aerial = "/resources/studio/steyn/steyn-city-xpomag-spread-5-05.webp";
  const riderCutout = "/resources/studio/steyn/steyn-city-xpomag-spread-5-06.webp";

  const image = (
    id: string,
    src: string,
    alt: string,
    style: DesignElementNode["style"],
  ): DesignElementNode => ({
    id,
    type: "image",
    props: { src, alt, loading: "eager", fetchPriority: "high" },
    style: { display: "block", objectFit: "cover", ...style },
  });

  const engagement = { reactions: true, comments: true, share: true, save: true };

  const photoPiece = (
    id: string,
    slug: string,
    title: string,
    src: string,
    alt: string,
    style: Record<string, unknown>,
    objectPosition = "center center",
  ): any => ({
    id,
    slug,
    title,
    kind: "feature",
    region: "spread",
    gutterBehaviour: "clip",
    engagement,
    style: { ...style, overflow: "hidden", background: "#d8e4ec" },
    elements: [
      image(`${id}-image`, src, alt, {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition,
      }),
    ],
  });

  return {
    id: "steyn-cycling-spread",
    issueId,
    slug: "cycling-feature",
    title: "Steyn City: Superb for Cyclists!",
    kind: "feature",
    pageIds: ["cycling", "cycling-visual"],
    style: { background: "#f7f6f2" },
    pieces: [
      {
        id: "steyn-cycling-editorial-piece",
        slug: "cycling-editorial",
        title: "Steyn City: Superb for Cyclists!",
        kind: "article",
        region: "spread",
        gutterBehaviour: "cross",
        engagement,
        style: {
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          background: "#f7f6f2",
        },
        elements: [
          {
            id: "cycling-left-blue-field",
            type: "frame",
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              width: "50%",
              height: "100%",
              background: "linear-gradient(180deg,#5689db 0%,#6e99dc 58%,#829fce 100%)",
            },
          },
          text("cycling-kicker-left", "│ CYCLING", {
            position: "absolute",
            left: "4.8%",
            top: "6.2%",
            color: "#18304f",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.45rem,.63vw,.68rem)",
            letterSpacing: ".09em",
          }, "span"),
          text("cycling-kicker-right", "CYCLING │", {
            position: "absolute",
            right: "4.5%",
            top: "6.2%",
            color: "#423e3a",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.45rem,.63vw,.68rem)",
            letterSpacing: ".09em",
          }, "span"),
          text("cycling-title", "STEYN CITY: SUPERB\nFOR CYCLISTS!", {
            position: "absolute",
            left: "6.7%",
            top: "10.8%",
            width: "36.6%",
            color: "#162b48",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1.08rem,2.02vw,2.22rem)",
            fontWeight: 400,
            lineHeight: .96,
            letterSpacing: ".055em",
            textAlign: "center",
            whiteSpace: "pre-line",
          }, "h2"),
          text("cycling-byline", "Former South African mountain-bike\nchampion, Fritz Pienaar", {
            position: "absolute",
            left: "12.2%",
            top: "19.9%",
            width: "25.6%",
            color: "#17324f",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.34rem,.49vw,.53rem)",
            fontStyle: "italic",
            textAlign: "center",
            whiteSpace: "pre-line",
          }),
          {
            id: "cycling-copy-left",
            type: "text",
            props: {
              as: "p",
              text: "The world is your track. The exhilaration of a challenge in the great outdoors and that ‘no pain, no gain’ thrill is part of everyday life when an exceptional cycling route starts almost at your front door.\n\nSteyn City’s purpose-built mountain-bike trails combine flowing sections, climbs and technical features in a protected landscape, giving residents an energising ride without leaving the estate.\n\nFROM THE SADDLE TO BEHIND THE SCENES\nThe route has evolved with the riders who use it: more rhythm, more variety and more reasons to head out again.",
              dropCap: true,
              dropCapLines: 4,
              dropCapColor: "#18304f",
            },
            style: {
              position: "absolute",
              left: "4.8%",
              top: "25.2%",
              width: "14.4%",
              color: "#18304f",
              fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(.38rem,.50vw,.54rem)",
              lineHeight: 1.44,
              whiteSpace: "pre-line",
            },
          },
          text("cycling-copy-right",
            "The 947 Ride Joburg MTB has become a favourite way to experience the estate at speed, with routes designed to reward both confident riders and those building experience.\n\nSTEYN CITY: LOVE AT FIRST SIGHT\nA great cycling environment is not only about distance. It is about flow, visibility, safety and a landscape that makes every kilometre memorable.\n\nSADDLE SPECTACULAR\nFrom family rides to competitive events, Steyn City has become a natural stage for cycling in Johannesburg.",
            {
              position: "absolute",
              left: "40.2%",
              top: "25.2%",
              width: "7.6%",
              color: "#18304f",
              fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(.37rem,.49vw,.53rem)",
              lineHeight: 1.43,
              whiteSpace: "pre-line",
            }
          ),

          text("cycling-track-heading", "STEYN CITY’S MTB TRACK:\nTHE HIGHLIGHTS, ACCORDING\nTO FRITZ PIENAAR", {
            position: "absolute",
            right: "2.8%",
            top: "12.2%",
            width: "11.2%",
            color: "#4b4742",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: "clamp(.38rem,.55vw,.59rem)",
            fontWeight: 760,
            letterSpacing: ".11em",
            lineHeight: 1.22,
            whiteSpace: "pre-line",
          }, "h3"),
          text("cycling-track-copy",
            "A compact route guide:\n• Big open spaces\n• Excellent infrastructure\n• Great trails\n• Clear route options and markings\n• Pump track and skills areas\n• Secure parking and easy access",
            {
              position: "absolute",
              right: "2.8%",
              top: "22.4%",
              width: "11.2%",
              color: "#4b4742",
              fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(.32rem,.44vw,.48rem)",
              lineHeight: 1.42,
              whiteSpace: "pre-line",
            }
          ),
          {
            id: "cycling-fritz-bubble",
            type: "frame",
            style: {
              position: "absolute",
              right: "5.1%",
              top: "39.8%",
              width: "10.6%",
              aspectRatio: "1 / 1",
              borderRadius: "50%",
              background: "#4f84df",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: ".8rem",
              zIndex: 12,
            },
            children: [
              text("cycling-fritz-bubble-copy", "CATCHING\nUP WITH FRITZ\nFavourite place to cycle:\nSteyn City\nBest post-ride reward:\ncoffee + a long view", {
                color: "#fff",
                fontFamily: "var(--xp-font-grotesk)",
                fontSize: "clamp(.31rem,.44vw,.47rem)",
                fontWeight: 720,
                lineHeight: 1.18,
                textAlign: "center",
                whiteSpace: "pre-line",
              }, "span"),
            ],
          },
          text("cycling-folio-left", "12", {
            position: "absolute", left: "4.3%", bottom: "2.6%", color: "#fff",
            fontFamily: "var(--xp-font-grotesk)", fontSize: ".45rem", fontWeight: 800,
          }, "span"),
          text("cycling-brand-left", "STEYN CITY", {
            position: "absolute", left: "7.4%", bottom: "2.6%", color: "#fff",
            fontFamily: "var(--xp-font-grotesk)", fontSize: ".42rem", fontWeight: 700, letterSpacing: ".08em",
          }, "span"),
          text("cycling-brand-right", "STEYN CITY", {
            position: "absolute", right: "5.5%", bottom: "2.6%", color: "#fff",
            fontFamily: "var(--xp-font-grotesk)", fontSize: ".42rem", fontWeight: 700, letterSpacing: ".08em",
            textShadow: "0 1px 8px rgba(0,0,0,.35)",
          }, "span"),
          text("cycling-folio-right", "13", {
            position: "absolute", right: "2.9%", bottom: "2.6%", color: "#fff",
            fontFamily: "var(--xp-font-grotesk)", fontSize: ".45rem", fontWeight: 800,
            textShadow: "0 1px 8px rgba(0,0,0,.35)",
          }, "span"),
        ],
      },

      {
        id: "steyn-cycling-main-rider-piece",
        slug: "cycling-main-rider",
        title: "Mountain biking at Steyn City",
        kind: "feature",
        region: "left",
        gutterBehaviour: "cross",
        engagement: { reactions: false, comments: false, share: false, save: false },
        style: {
          position: "absolute",
          left: "15.4%",
          top: "20.5%",
          width: "31.2%",
          height: "76%",
          zIndex: 9,
          overflow: "visible",
          background: "transparent",
        },
        elements: [
          image("steyn-cycling-main-rider-cutout", riderCutout, "Mountain biker airborne over a trail jump", {
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center bottom",
            zIndex: 2,
          }),
        ],
      },
      photoPiece(
        "steyn-cycling-top-photo-piece",
        "cycling-top-photo",
        "947 Ride Joburg MTB",
        mtb,
        "Mountain biker riding through a wooded trail",
        { position: "absolute", left: "50%", top: 0, width: "32.4%", height: "35.5%", zIndex: 6 },
        "center 48%",
      ),
      photoPiece(
        "steyn-cycling-kids-photo-piece",
        "cycling-kids-photo",
        "947 Ride Joburg Kids",
        kids,
        "Children taking part in a cycling event",
        { position: "absolute", left: "50%", top: "37.2%", width: "16.7%", height: "20.5%", zIndex: 6 },
        "center center",
      ),
      photoPiece(
        "steyn-cycling-road-photo-piece",
        "cycling-road-photo",
        "Cycling race action",
        road,
        "Road cyclists racing in formation",
        { position: "absolute", left: "68.3%", top: "37.2%", width: "14.1%", height: "20.5%", zIndex: 6 },
        "center center",
      ),
      photoPiece(
        "steyn-cycling-aerial-piece",
        "cycling-aerial-photo",
        "Steyn City cycling landscape",
        aerial,
        "Aerial view of a cycling event across Steyn City parkland",
        { position: "absolute", left: "50%", bottom: 0, width: "50%", height: "40.7%", zIndex: 5 },
        "center 58%",
      ),

      {
        id: "steyn-cycling-mobile-left-piece",
        slug: "cycling-mobile-left",
        title: "Steyn City: Superb for Cyclists!",
        kind: "article",
        region: "left",
        gutterBehaviour: "clip",
        engagement,
        style: {
          position: "absolute",
          left: "2.8%",
          top: "4%",
          width: "44.4%",
          height: "91%",
          display: "none",
          background: "#5e8ed8",
          zIndex: 70,
          padding: "clamp(.9rem,3.6vw,1.35rem)",
          overflow: "hidden",
        },
        elements: [
          text("cycling-mobile-left-kicker", "CYCLING", {
            color: "#17324f", fontFamily: "var(--xp-font-grotesk)", fontSize: ".72rem",
            fontWeight: 800, letterSpacing: ".14em", marginBottom: ".55rem",
          }, "span"),
          text("cycling-mobile-left-title", "STEYN CITY:\nSUPERB FOR CYCLISTS!", {
            color: "#17324f", fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1.45rem,6.8vw,2rem)", lineHeight: .94, letterSpacing: ".015em",
            whiteSpace: "pre-line", marginBottom: ".8rem",
          }, "h2"),
          image("cycling-mobile-left-image", mtb, "Mountain bikers riding a trail", {
            width: "100%", height: "42%", objectFit: "cover", objectPosition: "center 43%",
            marginBottom: ".8rem",
          }),
          text("cycling-mobile-left-copy", "Steyn City’s purpose-built MTB trails put movement right on the doorstep. Flowing sections, technical moments and secure access make the estate a natural home for everyday riders and major cycling events alike.", {
            color: "#17324f", fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1rem,3.8vw,1.16rem)", lineHeight: 1.52,
          }),
        ],
      },
      {
        id: "steyn-cycling-mobile-right-piece",
        slug: "cycling-mobile-right",
        title: "Cycling at Steyn City",
        kind: "article",
        region: "right",
        gutterBehaviour: "clip",
        engagement,
        style: {
          position: "absolute",
          left: "52.8%",
          top: "4%",
          width: "44.4%",
          height: "91%",
          display: "none",
          background: "#fbfaf8",
          zIndex: 70,
          padding: "clamp(.85rem,3.2vw,1.25rem)",
          overflow: "hidden",
        },
        elements: [
          text("cycling-mobile-right-kicker", "CYCLING", {
            color: "#514c46", fontFamily: "var(--xp-font-grotesk)", fontSize: ".7rem",
            fontWeight: 800, letterSpacing: ".14em", marginBottom: ".6rem",
          }, "span"),
          image("cycling-mobile-right-hero", mtb, "Mountain bike racing action", {
            width: "100%", height: "31%", objectFit: "cover", objectPosition: "center 42%",
            marginBottom: ".85rem",
          }),
          {
            id: "cycling-mobile-photo-row",
            type: "grid",
            style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".55rem", marginBottom: "1rem" },
            children: [
              image("cycling-mobile-kids", kids, "Children cycling", { width: "100%", height: "7.8rem", objectFit: "cover" }),
              image("cycling-mobile-road", road, "Road cyclists", { width: "100%", height: "7.8rem", objectFit: "cover" }),
            ],
          },
          text("cycling-mobile-right-heading", "THE TRACK, THE EVENTS, THE LIFESTYLE", {
            color: "#4b4742", fontFamily: "var(--xp-font-grotesk)",
            fontSize: ".82rem", fontWeight: 800, letterSpacing: ".1em", marginBottom: ".65rem",
          }, "h3"),
          text("cycling-mobile-right-copy", "The route is built for repeat riding: well-marked lines, varied terrain and enough challenge to keep the experience fresh. On event weekends, the same landscape becomes a vivid stage for families, young riders and competitive cyclists.", {
            color: "#4b4742", fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1rem,3.8vw,1.16rem)", lineHeight: 1.52,
          }),
        ],
      },
    ],
  };
}


function seniorVillageSpread(issueId: string): MagazineSpreadDefinition {
  const hero = "/resources/studio/steyn/steyn-city-xpomag-spread-6-01.webp";
  const portrait = "/resources/studio/steyn/steyn-city-xpomag-spread-6-02.webp";
  const bedroom = "/resources/studio/steyn/steyn-city-xpomag-spread-6-03.webp";
  const frailCare = "/resources/studio/steyn/steyn-city-xpomag-spread-6-04.webp";
  const livingArea = "/resources/studio/steyn/steyn-city-xpomag-spread-6-05.webp";
  const hydro = "/resources/studio/steyn/steyn-city-xpomag-spread-6-06.webp";

  const seniorVillageVideo = "https://www.youtube.com/embed/WmoNsAdM7-I?autoplay=1&mute=1&controls=1&playsinline=1&rel=0";
  const apartmentVideo = "https://www.youtube.com/embed/qKiizstxMXU?autoplay=1&mute=1&controls=1&playsinline=1&rel=0";

  const image = (
    id: string,
    src: string,
    alt: string,
    style: DesignElementNode["style"] = {},
  ): DesignElementNode => ({
    id,
    type: "image",
    props: { src, alt, loading: "eager", fetchPriority: "high" },
    style: { display: "block", objectFit: "cover", ...style },
  });

  const video = (
    id: string,
    src: string,
    title: string,
    style: DesignElementNode["style"] = {},
  ): DesignElementNode => ({
    id,
    type: "video",
    props: {
      src,
      title,
      cover: true,
      interactive: true,
      autoplay: true,
      muted: true,
      loop: true,
      controls: true,
    },
    style: { display: "block", width: "100%", height: "100%", ...style },
  });

  const engagement = { reactions: true, comments: true, share: true, save: true };
  const noEngagement = { reactions: false, comments: false, share: false, save: false };

  const mediaPiece = (
    id: string,
    slug: string,
    title: string,
    node: DesignElementNode,
    style: Record<string, unknown>,
    withEngagement = false,
  ): any => ({
    id,
    slug,
    title,
    kind: "feature",
    region: "spread",
    gutterBehaviour: "clip",
    engagement: withEngagement ? engagement : noEngagement,
    style: { ...style, overflow: "hidden", background: "#e7e1da" },
    elements: [node],
  });

  return {
    id: "steyn-senior-village-spread",
    issueId,
    slug: "senior-village-feature",
    title: "Glowing Through the Golden Years",
    kind: "feature",
    pageIds: ["senior-village", "senior-village-ii"],
    style: { background: "#faf8f4" },
    pieces: [
      {
        id: "steyn-senior-editorial-piece",
        slug: "senior-editorial",
        title: "Glowing Through the Golden Years",
        kind: "article",
        region: "spread",
        gutterBehaviour: "cross",
        engagement,
        style: {
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          background: "#faf8f4",
        },
        elements: [
          image("senior-hero", hero, "Steyn City Senior Village apartment living", {
            position: "absolute",
            left: 0,
            top: 0,
            width: "50%",
            height: "38%",
            objectFit: "cover",
            objectPosition: "center 52%",
            zIndex: 1,
          }),
          {
            id: "senior-hero-shade",
            type: "frame",
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              width: "50%",
              height: "38%",
              zIndex: 2,
              pointerEvents: "none",
              background: "linear-gradient(90deg,rgba(26,20,18,.36),rgba(26,20,18,.06) 72%)",
            },
          },
          text("senior-title", "GLOWING\nTHROUGH\nTHE GOLDEN\nYEARS", {
            position: "absolute",
            left: "4.5%",
            top: "12.8%",
            width: "22%",
            color: "#fff",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1.15rem,2.18vw,2.5rem)",
            fontWeight: 500,
            lineHeight: .94,
            letterSpacing: ".012em",
            whiteSpace: "pre-line",
            textShadow: "0 2px 14px rgba(0,0,0,.28)",
            zIndex: 4,
          }, "h2"),
          {
            id: "senior-quote-bubble",
            type: "frame",
            style: {
              position: "absolute",
              left: "31%",
              top: "23%",
              width: "11.7%",
              aspectRatio: "1 / 1",
              borderRadius: "50%",
              background: "#058db9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: ".95rem",
              zIndex: 8,
              boxShadow: "0 8px 22px rgba(0,0,0,.08)",
            },
            children: [
              text("senior-quote-copy", "IT WASN’T LONG\nAGO THAT “GOING\nINTO A RETIREMENT HOME”\nMEANT CRAMPED COTTAGES\nAND MEALS THAT WEREN’T\nALL THAT DIFFERENT FROM\nBOARDING SCHOOL FARE.\nSTEYN CITY’S MAGNIFICENT\nSENIOR VILLAGE SHOWS\nJUST HOW MUCH TIMES\nHAVE CHANGED", {
                color: "#fff",
                fontFamily: "var(--xp-font-grotesk)",
                fontSize: "clamp(.29rem,.42vw,.47rem)",
                fontWeight: 760,
                lineHeight: 1.18,
                textAlign: "center",
                whiteSpace: "pre-line",
              }, "span"),
            ],
          },
          {
            id: "senior-white-scoop",
            type: "frame",
            style: {
              position: "absolute",
              left: "6.5%",
              top: "34%",
              width: "14%",
              height: "8%",
              background: "#faf8f4",
              borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
              zIndex: 5,
            },
          },
          image("senior-small-portrait", portrait, "Senior Village care manager portrait", {
            position: "absolute",
            left: "27.5%",
            top: "34.2%",
            width: "6.6%",
            aspectRatio: "1 / 1",
            borderRadius: "50%",
            objectFit: "cover",
            objectPosition: "50% 32%",
            outline: "5px solid rgba(255,255,255,.95)",
            boxShadow: "0 7px 18px rgba(0,0,0,.16)",
            zIndex: 9,
          }),
          {
            id: "senior-copy-columns",
            type: "grid",
            style: {
              position: "absolute",
              left: "4.5%",
              top: "45.2%",
              width: "42.1%",
              bottom: "5.2%",
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)",
              gap: "1.3rem",
              alignItems: "start",
              zIndex: 6,
            },
            children: [
              {
                id: "senior-copy-a",
                type: "text",
                props: {
                  as: "p",
                  text: "Chrissie Vermaak, Care Manager at TOTALCARE, the appointed healthcare provider managing the Senior Village, explains that today living at an address that is equivalent to staying at a nice hotel is comparable to saying at your favourite hotel: ‘It’s all about lifestyle’. People want to be active from well into their golden years; they want freedom and independence without the effort of maintaining a household.\n\nLIVING YOUR BEST LIFE\n\nSteyn City’s Senior Village ticks all of those boxes. It brings beautifully considered homes together with social spaces, wellness and care close at hand, so residents can stay independent without giving up convenience or community.",
                  dropCap: true,
                  dropCapLines: 4,
                  dropCapColor: "#2a2421",
                },
                style: {
                  color: "#2f2925",
                  fontFamily: "var(--xp-font-editorial)",
                  fontSize: "clamp(.42rem,.55vw,.58rem)",
                  lineHeight: 1.5,
                  whiteSpace: "pre-line",
                  minWidth: 0,
                  overflowWrap: "break-word",
                },
              },
              text("senior-copy-b", "The idea is to allow people to live independently, while offering services that increase quality of life as they age. Home-based support, healthcare and access to the on-site care centre make it possible to add help gradually as needs change.\n\nThe wider Senior Village is designed around easy movement, comfortable shared spaces and a daily rhythm that still feels like home. Residents remain connected to Steyn City’s parkland, dining, retail and wellness facilities.", {
                color: "#2f2925",
                fontFamily: "var(--xp-font-editorial)",
                fontSize: "clamp(.42rem,.55vw,.58rem)",
                lineHeight: 1.5,
                whiteSpace: "pre-line",
                minWidth: 0,
                overflowWrap: "break-word",
              }),
              text("senior-copy-c", "A GOLDEN THREAD\n\nThe accent on community ties the Senior Village experience together. There is dignity in the way care sits quietly in the background while everyday life stays social, active and personal.\n\nSTAGGERED CARE TO MEET YOUR NEEDS\n\nSupport can increase as needs change, from everyday wellness and home-based assistance through to professional nursing and access to the dedicated care facility.", {
                color: "#2f2925",
                fontFamily: "var(--xp-font-editorial)",
                fontSize: "clamp(.42rem,.55vw,.58rem)",
                lineHeight: 1.5,
                whiteSpace: "pre-line",
                minWidth: 0,
                overflowWrap: "break-word",
              }),
            ],
          },

          text("senior-right-kicker", "SENIOR VILLAGE │", {
            position: "absolute",
            right: "2.6%",
            top: "6.6%",
            width: "11.5%",
            color: "#5a524c",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.48rem,.66vw,.72rem)",
            letterSpacing: ".05em",
          }, "span"),
          text("senior-right-heading", "WHAT MAKES\nSTEYN CITY’S SENIOR\nVILLAGE SO SPECIAL?", {
            position: "absolute",
            right: "2.6%",
            top: "13.5%",
            width: "11.4%",
            color: "#39322d",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: "clamp(.33rem,.47vw,.53rem)",
            fontWeight: 820,
            lineHeight: 1.18,
            letterSpacing: ".1em",
            whiteSpace: "pre-line",
          }, "h3"),
          text("senior-right-list", "• 100 apartment homes with integrated kitchens\n\n• Sky Bar & Lounge, recreation spaces and restaurant\n\n• Frail care and assisted care, with support available on site\n\n• Hydro Centre with heated pool, spa bath, sauna and steam room\n\n• Fitness centre and movement studio\n\n• Gardens, promenades and wider estate facilities\n\n• 24-hour care available through the dedicated care facility", {
            position: "absolute",
            right: "2.6%",
            top: "20.2%",
            width: "11.4%",
            color: "#463f3a",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.30rem,.43vw,.47rem)",
            lineHeight: 1.44,
            whiteSpace: "pre-line",
          }),
          {
            id: "senior-price-tag",
            type: "frame",
            style: {
              position: "absolute",
              right: "5.4%",
              bottom: "24%",
              width: "7.1%",
              minHeight: "5.3%",
              padding: ".55rem .4rem",
              background: "#078fb7",
              clipPath: "polygon(0 0,100% 0,100% 78%,50% 100%,0 78%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 7,
            },
            children: [
              text("senior-price-copy", "Apartment\nhomes from\nR1.9m", {
                color: "#fff",
                fontFamily: "var(--xp-font-editorial)",
                fontSize: "clamp(.33rem,.48vw,.52rem)",
                fontStyle: "italic",
                fontWeight: 700,
                lineHeight: 1.05,
                textAlign: "center",
                whiteSpace: "pre-line",
              }, "span"),
            ],
          },
          text("senior-folio-left", "14", {
            position: "absolute", left: "4.9%", bottom: "2.2%", color: "#2e2925",
            fontFamily: "var(--xp-font-grotesk)", fontSize: ".45rem", fontWeight: 800,
          }, "span"),
          text("senior-brand-left", "STEYN CITY", {
            position: "absolute", left: "8.0%", bottom: "2.2%", color: "#2e2925",
            fontFamily: "var(--xp-font-grotesk)", fontSize: ".42rem", fontWeight: 720, letterSpacing: ".08em",
          }, "span"),
          text("senior-brand-right", "STEYN CITY", {
            position: "absolute", right: "6.0%", bottom: "2.2%", color: "#fff",
            fontFamily: "var(--xp-font-grotesk)", fontSize: ".42rem", fontWeight: 720, letterSpacing: ".08em",
            textShadow: "0 1px 8px rgba(0,0,0,.35)",
          }, "span"),
          text("senior-folio-right", "15", {
            position: "absolute", right: "3.0%", bottom: "2.2%", color: "#fff",
            fontFamily: "var(--xp-font-grotesk)", fontSize: ".45rem", fontWeight: 800,
            textShadow: "0 1px 8px rgba(0,0,0,.35)",
          }, "span"),
        ],
      },

      {
        id: "steyn-senior-bedroom-media-piece",
        slug: "senior-bedroom-media",
        title: "En-suite master bedroom",
        kind: "feature",
        region: "spread",
        gutterBehaviour: "clip",
        engagement,
        style: {
          position: "absolute",
          left: "50%",
          top: 0,
          width: "34.6%",
          height: "34.2%",
          zIndex: 6,
          overflow: "hidden",
          background: "#e7e1da",
        },
        elements: [
          image("senior-bedroom-image", bedroom, "En-suite master bedroom", {
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
          }),
          {
            id: "senior-bedroom-video-inset",
            type: "frame",
            style: {
              position: "absolute",
              right: "2.5%",
              bottom: "4%",
              width: "34%",
              aspectRatio: "16 / 9",
              border: "2px solid rgba(255,255,255,.92)",
              boxShadow: "0 8px 24px rgba(0,0,0,.24)",
              overflow: "hidden",
              zIndex: 4,
              background: "#000",
            },
            children: [
              video("senior-top-video", seniorVillageVideo, "Inside Steyn City Senior Village", {
                position: "absolute",
                inset: 0,
              }),
            ],
          },
          text("senior-bedroom-caption", "En-suite master bedroom", {
            position: "absolute",
            right: "2.6%",
            bottom: "1.3%",
            color: "#fff",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.28rem,.39vw,.42rem)",
            fontStyle: "italic",
            textShadow: "0 1px 6px rgba(0,0,0,.55)",
            zIndex: 5,
          }, "span"),
        ],
      },

      mediaPiece(
        "steyn-senior-frail-care-image-piece",
        "senior-frail-care",
        "Frail care facility",
        image("senior-frail-care-image", frailCare, "Frail care facility", {
          position: "absolute", inset: 0, width: "100%", height: "100%", objectPosition: "center 52%",
        }),
        { position: "absolute", left: "50%", top: "36.1%", width: "16.3%", height: "21.4%", zIndex: 6 },
        false,
      ),

      mediaPiece(
        "steyn-senior-living-image-piece",
        "senior-living-area",
        "Open plan living area",
        image("senior-living-image", livingArea, "Open plan living area", {
          position: "absolute", inset: 0, width: "100%", height: "100%", objectPosition: "center center",
        }),
        { position: "absolute", left: "67.6%", top: "36.1%", width: "16.9%", height: "21.4%", zIndex: 6 },
        true,
      ),

      {
        id: "steyn-senior-hydro-media-piece",
        slug: "senior-hydro-media",
        title: "Hydro Centre",
        kind: "feature",
        region: "spread",
        gutterBehaviour: "clip",
        engagement: noEngagement,
        style: {
          position: "absolute",
          left: "50%",
          bottom: 0,
          width: "50%",
          height: "40.4%",
          zIndex: 5,
          overflow: "hidden",
          background: "#e7e1da",
        },
        elements: [
          image("senior-hydro-image", hydro, "Hydro Centre pool", {
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 52%",
          }),
          {
            id: "senior-hydro-video-inset",
            type: "frame",
            style: {
              position: "absolute",
              left: "2.2%",
              top: "4%",
              width: "27%",
              aspectRatio: "16 / 9",
              border: "2px solid rgba(255,255,255,.92)",
              boxShadow: "0 8px 24px rgba(0,0,0,.24)",
              overflow: "hidden",
              zIndex: 4,
              background: "#000",
            },
            children: [
              video("senior-bottom-video", apartmentVideo, "Steyn City apartment lifestyle", {
                position: "absolute",
                inset: 0,
              }),
            ],
          },
          text("senior-hydro-caption", "Hydro Centre", {
            position: "absolute",
            left: "47%",
            top: "3%",
            color: "#fff",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.28rem,.39vw,.42rem)",
            fontStyle: "italic",
            textShadow: "0 1px 6px rgba(0,0,0,.55)",
            zIndex: 5,
          }, "span"),
        ],
      },

      {
        id: "steyn-senior-mobile-left-piece",
        slug: "senior-mobile-left",
        title: "Glowing Through the Golden Years",
        kind: "article",
        region: "left",
        gutterBehaviour: "clip",
        engagement,
        style: {
          position: "absolute",
          left: "2.8%",
          top: "3.5%",
          width: "44.4%",
          height: "93%",
          display: "none",
          background: "#faf8f4",
          zIndex: 70,
          padding: "clamp(.95rem,3.8vw,1.4rem)",
          overflow: "auto",
        },
        elements: [
          text("senior-mobile-title", "GLOWING THROUGH\nTHE GOLDEN YEARS", {
            color: "#2d2722",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1.55rem,6.8vw,2.05rem)",
            lineHeight: .94,
            whiteSpace: "pre-line",
            marginBottom: ".8rem",
          }, "h2"),
          image("senior-mobile-hero", hero, "Steyn City Senior Village", {
            width: "100%", height: "12rem", objectFit: "cover", objectPosition: "center 52%",
            marginBottom: ".85rem",
          }),
          image("senior-mobile-portrait", portrait, "Senior Village care manager portrait", {
            width: "5.2rem", height: "5.2rem", objectFit: "cover", objectPosition: "50% 30%",
            borderRadius: "50%", marginBottom: ".8rem",
          }),
          text("senior-mobile-standfirst", "Independent living, beautifully designed homes and care close by when you need it.", {
            color: "#078fb7",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: "clamp(1rem,3.9vw,1.16rem)",
            fontWeight: 760,
            lineHeight: 1.3,
            marginBottom: ".8rem",
          }),
          {
            id: "senior-mobile-copy",
            type: "text",
            props: {
              as: "p",
              text: "Steyn City’s Senior Village brings beautifully considered homes together with social spaces, wellness and professional care close at hand. Residents can keep their independence and daily rhythm while knowing support can increase gradually as their needs change.\n\nThe wider community remains part of the experience: parkland, dining, retail and wellness are all close by, keeping later life connected, active and personal.",
              dropCap: true,
              dropCapLines: 4,
              dropCapColor: "#2d2722",
            },
            style: {
              color: "#2f2925",
              fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(1rem,3.8vw,1.14rem)",
              lineHeight: 1.56,
              whiteSpace: "pre-line",
            },
          },
        ],
      },

      {
        id: "steyn-senior-mobile-right-piece",
        slug: "senior-mobile-right",
        title: "Senior Village highlights",
        kind: "feature",
        region: "right",
        gutterBehaviour: "clip",
        engagement: noEngagement,
        style: {
          position: "absolute",
          left: "52.8%",
          top: "3.5%",
          width: "44.4%",
          height: "93%",
          display: "none",
          background: "#fbfaf8",
          zIndex: 70,
          padding: "clamp(.9rem,3.6vw,1.35rem)",
          overflow: "auto",
        },
        elements: [
          text("senior-mobile-kicker", "SENIOR VILLAGE", {
            color: "#5a524c",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: ".78rem",
            fontWeight: 800,
            letterSpacing: ".13em",
            marginBottom: ".65rem",
          }, "span"),
          image("senior-mobile-bedroom", bedroom, "En-suite master bedroom", {
            width: "100%", height: "11.5rem", objectFit: "cover", marginBottom: ".7rem",
          }),
          video("senior-mobile-video-a", seniorVillageVideo, "Inside Steyn City Senior Village", {
            width: "100%", height: "9.5rem", marginBottom: ".9rem",
          }),
          {
            id: "senior-mobile-image-row",
            type: "grid",
            style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".55rem", marginBottom: ".9rem" },
            children: [
              image("senior-mobile-img-a", frailCare, "Frail care facility", { width: "100%", height: "7.6rem", objectFit: "cover" }),
              image("senior-mobile-img-b", livingArea, "Open plan living area", { width: "100%", height: "7.6rem", objectFit: "cover" }),
            ],
          },
          text("senior-mobile-heading", "WHAT MAKES THE SENIOR VILLAGE SPECIAL?", {
            color: "#39322d",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: ".82rem",
            fontWeight: 820,
            letterSpacing: ".08em",
            lineHeight: 1.25,
            marginBottom: ".55rem",
          }, "h3"),
          text("senior-mobile-list", "100 apartment homes, social and dining spaces, Hydro Centre and fitness facilities, home-based support, and access to the dedicated care centre — all within the wider Steyn City lifestyle.", {
            color: "#463f3a",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1rem,3.8vw,1.14rem)",
            lineHeight: 1.52,
            marginBottom: ".9rem",
          }),
          image("senior-mobile-hydro", hydro, "Hydro Centre pool", {
            width: "100%", height: "10rem", objectFit: "cover", objectPosition: "center 52%", marginBottom: ".7rem",
          }),
          video("senior-mobile-video-b", apartmentVideo, "Steyn City apartment lifestyle", {
            width: "100%", height: "9.5rem",
          }),
        ],
      },
    ],
  };
}


function easyLifeSpread(issueId: string): MagazineSpreadDefinition {
  const iceCream = "/resources/studio/steyn/steyn-city-xpomag-spread-7-01.webp";
  const leCreuset = "/resources/studio/steyn/steyn-city-xpomag-spread-7-02.webp";
  const cafe = "/resources/studio/steyn/steyn-city-xpomag-spread-7-03.webp";
  const gymWide = "/resources/studio/steyn/steyn-city-xpomag-spread-7-04.webp";
  const gymPortrait = "/resources/studio/steyn/steyn-city-xpomag-spread-7-05.webp";
  const pharmacy = "/resources/studio/steyn/steyn-city-xpomag-spread-7-06.webp";
  const cardio = "/resources/studio/steyn/steyn-city-xpomag-spread-7-07.webp";
  const sorbet = "/resources/studio/steyn/steyn-city-xpomag-spread-7-08.webp";
  const lounge = "/resources/studio/steyn/steyn-city-xpomag-spread-7-09.webp";
  const greenery = "/resources/studio/steyn/steyn-city-xpomag-spread-7-10.webp";

  const cityCentreVideo = "https://www.youtube.com/embed/yEg0UNrj9Ws?autoplay=1&mute=1&controls=1&playsinline=1&rel=0";
  const cityCentreVideoTwo = "https://www.youtube.com/embed/R4SqauTEXZA?autoplay=1&mute=1&controls=1&playsinline=1&rel=0";

  const image = (
    id: string,
    src: string,
    alt: string,
    style: DesignElementNode["style"] = {},
  ): DesignElementNode => ({
    id,
    type: "image",
    props: { src, alt, loading: "eager", fetchPriority: "high" },
    style: { display: "block", objectFit: "cover", ...style },
  });

  const video = (
    id: string,
    src: string,
    title: string,
    style: DesignElementNode["style"] = {},
  ): DesignElementNode => ({
    id,
    type: "video",
    props: {
      src,
      title,
      cover: true,
      interactive: true,
      autoplay: true,
      muted: true,
      controls: true,
    },
    style: { display: "block", width: "100%", height: "100%", ...style },
  });

  const engagement = { reactions: true, comments: true, share: true, save: true };
  const noEngagement = { reactions: false, comments: false, share: false, save: false };

  const photoPiece = (
    id: string,
    slug: string,
    title: string,
    src: string,
    alt: string,
    style: Record<string, unknown>,
    objectPosition = "center center",
    withEngagement = false,
  ): any => ({
    id,
    slug,
    title,
    kind: "feature",
    region: "spread",
    gutterBehaviour: "clip",
    engagement: withEngagement ? engagement : noEngagement,
    style: { ...style, overflow: "hidden", background: "#ece8e2" },
    elements: [
      image(id + "-image", src, alt, {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition,
      }),
    ],
  });

  return {
    id: "steyn-easy-life-spread",
    issueId,
    slug: "living-the-easy-life",
    title: "Living the Easy Life",
    kind: "feature",
    pageIds: ["easy-life", "easy-life-visual"],
    style: { background: "#fbfaf7" },
    pieces: [
      {
        id: "steyn-easy-life-editorial-piece",
        slug: "easy-life-editorial",
        title: "Living the Easy Life",
        kind: "article",
        region: "spread",
        gutterBehaviour: "cross",
        engagement,
        style: {
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          background: "#fbfaf7",
        },
        elements: [
          text("easy-life-title", "LIVING THE\nEASY LIFE", {
            position: "absolute",
            left: "4.7%",
            top: "35.8%",
            width: "22.8%",
            color: "#302924",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1.22rem,2.02vw,2.35rem)",
            fontWeight: 450,
            lineHeight: .92,
            letterSpacing: ".02em",
            whiteSpace: "pre-line",
          }, "h2"),
          {
            id: "easy-life-copy-left",
            type: "text",
            props: {
              as: "p",
              text: "When Steyn City first opened its doors, it made a simple yet compelling promise to all residents: it would provide the very best facilities and services, comparable (if not superior) to any estate around the world.\n\nThe estate has more than lived up to that promise. But because today’s lifestyle is constantly evolving, the offering keeps evolving, too. That’s why a number of new retailers and service providers have made their home at the estate during the past year, making life easier and more convenient.\n\nTHE ROUTE TO WELLNESS\n\nWellness has always been the cornerstone of the extraordinary lifestyle on offer. From an estate thoughtfully designed to encourage people to get moving, to on-site amenities that make exercise part of everyday life, convenience is built into the routine.",
              dropCap: true,
              dropCapLines: 4,
              dropCapColor: "#302924",
            },
            style: {
              position: "absolute",
              left: "4.7%",
              top: "47.6%",
              width: "20.4%",
              bottom: "6.5%",
              color: "#302924",
              fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(.43rem,.58vw,.61rem)",
              lineHeight: 1.47,
              whiteSpace: "pre-line",
            },
          },
          text("easy-life-center-heading", "GETTING THINGS DONE", {
            position: "absolute",
            left: "55.3%",
            top: "36.9%",
            width: "12.8%",
            color: "#625b55",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: "clamp(.34rem,.47vw,.5rem)",
            fontWeight: 820,
            letterSpacing: ".16em",
          }, "h3"),
          text("easy-life-center-copy", "City Centre’s service offering takes care of all the chores and tasks that take up time and energy. With an array of services that make life easier, residents can reclaim a little more of every day.\n\nRETAIL THERAPY\n\nLooking for the perfect piece to complete your home? Make a little colour into your kitchen with Le Creuset’s signature cookware, or explore the broader City Centre retail mix. From groceries and pharmacy essentials to beauty, flowers and everyday conveniences, it is all right on your doorstep.\n\nTHE GOOD LIFE\n\nCity Centre’s food and leisure offering makes it easy to meet a friend for coffee, grab something delicious, fit in a workout or take a moment to reset.", {
            position: "absolute",
            left: "55.3%",
            top: "39.8%",
            width: "12.9%",
            bottom: "11%",
            color: "#514a45",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.37rem,.50vw,.54rem)",
            lineHeight: 1.45,
            whiteSpace: "pre-line",
          }),
          {
            id: "easy-life-red-list",
            type: "frame",
            style: {
              position: "absolute",
              left: "69.2%",
              top: "31.5%",
              width: "11.7%",
              aspectRatio: "1 / 1",
              borderRadius: "50%",
              background: "#ed1717",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: ".9rem",
              zIndex: 10,
            },
            children: [
              text("easy-life-red-list-copy", "1. Paul’s Homemade Ice Cream\n2. Le Creuset\n3. Seattle Coffee Co.\n4. Coco Reformer Pilates Studio\n5. Pack Life Studio\n6. Clicks\n7. The Gym at Steyn City\n8. Sorbet Salon\n9. City Centre lifestyle interiors\n10. The Greenery", {
                color: "#fff",
                fontFamily: "var(--xp-font-grotesk)",
                fontSize: "clamp(.27rem,.39vw,.43rem)",
                fontWeight: 750,
                lineHeight: 1.34,
                textAlign: "center",
                whiteSpace: "pre-line",
              }, "span"),
            ],
          },
          text("easy-life-kicker-right", "LIFESTYLE │", {
            position: "absolute",
            right: "4.1%",
            top: "6.8%",
            color: "#534c46",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.48rem,.66vw,.72rem)",
            letterSpacing: ".06em",
          }, "span"),
          text("easy-life-folio-left", "16", {
            position: "absolute", left: "5.0%", bottom: "2.2%", color: "#302924",
            fontFamily: "var(--xp-font-grotesk)", fontSize: ".45rem", fontWeight: 800,
          }, "span"),
          text("easy-life-brand-left", "STEYN CITY", {
            position: "absolute", left: "8.1%", bottom: "2.2%", color: "#302924",
            fontFamily: "var(--xp-font-grotesk)", fontSize: ".42rem", fontWeight: 720, letterSpacing: ".08em",
          }, "span"),
          text("easy-life-brand-right", "STEYN CITY", {
            position: "absolute", right: "6.0%", bottom: "2.2%", color: "#fff",
            fontFamily: "var(--xp-font-grotesk)", fontSize: ".42rem", fontWeight: 720, letterSpacing: ".08em",
            textShadow: "0 1px 8px rgba(0,0,0,.38)",
          }, "span"),
          text("easy-life-folio-right", "17", {
            position: "absolute", right: "3.0%", bottom: "2.2%", color: "#fff",
            fontFamily: "var(--xp-font-grotesk)", fontSize: ".45rem", fontWeight: 800,
            textShadow: "0 1px 8px rgba(0,0,0,.38)",
          }, "span"),
        ],
      },
      photoPiece(
        "steyn-easy-icecream-piece",
        "easy-icecream",
        "Paul’s Homemade Ice Cream",
        iceCream,
        "Paul’s Homemade Ice Cream at Steyn City",
        { position: "absolute", left: 0, top: 0, width: "24.2%", height: "32.2%", zIndex: 6 },
        "center center",
        false,
      ),
      {
        id: "steyn-easy-lecreuset-video-piece",
        slug: "easy-lecreuset-video",
        title: "City Centre retail",
        kind: "feature",
        region: "spread",
        gutterBehaviour: "clip",
        engagement,
        style: {
          position: "absolute",
          left: "25.8%",
          top: 0,
          width: "39.6%",
          height: "32.2%",
          zIndex: 7,
          overflow: "hidden",
          background: "#eee",
        },
        elements: [
          image("easy-lecreuset-image", leCreuset, "Le Creuset at Steyn City City Centre", {
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center center",
          }),
          {
            id: "easy-lecreuset-video-frame",
            type: "frame",
            style: {
              position: "absolute",
              right: "2.3%",
              bottom: "3.5%",
              width: "30%",
              aspectRatio: "16 / 9",
              overflow: "hidden",
              border: "2px solid rgba(255,255,255,.92)",
              boxShadow: "0 8px 24px rgba(0,0,0,.25)",
              zIndex: 4,
              background: "#000",
            },
            children: [
              video("easy-city-centre-video", cityCentreVideo, "Steyn City City Centre", {
                position: "absolute", inset: 0,
              }),
            ],
          },
        ],
      },
      photoPiece(
        "steyn-easy-cafe-piece",
        "easy-cafe",
        "Seattle Coffee Co.",
        cafe,
        "Coffee shop at Steyn City City Centre",
        { position: "absolute", left: "25.8%", top: "34.0%", width: "24.4%", height: "19.4%", zIndex: 6 },
        "center center",
        false,
      ),
      photoPiece(
        "steyn-easy-gym-wide-piece",
        "easy-gym-wide",
        "Coco Reformer Pilates Studio",
        gymWide,
        "Wellness and gym studio at Steyn City",
        { position: "absolute", left: "25.8%", top: "55.4%", width: "24.4%", height: "20.5%", zIndex: 6 },
        "center 52%",
        false,
      ),
      {
        id: "steyn-easy-gym-portrait-piece",
        slug: "easy-gym-portrait",
        title: "Pack Life Studio",
        kind: "feature",
        region: "spread",
        gutterBehaviour: "clip",
        engagement: noEngagement,
        style: {
          position: "absolute",
          left: "22.4%",
          top: "64.1%",
          width: "9.7%",
          aspectRatio: "1 / 1",
          borderRadius: "50%",
          overflow: "hidden",
          zIndex: 10,
          outline: "4px solid rgba(255,255,255,.95)",
          background: "#ddd",
        },
        elements: [
          image("easy-gym-portrait-image", gymPortrait, "Strength training at Steyn City", {
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 48%",
          }),
        ],
      },
      photoPiece(
        "steyn-easy-pharmacy-piece",
        "easy-pharmacy",
        "Clicks",
        pharmacy,
        "Pharmacy and health retail at Steyn City",
        { position: "absolute", left: "25.8%", bottom: 0, width: "24.4%", height: "22.4%", zIndex: 5 },
        "center center",
        false,
      ),
      {
        id: "steyn-easy-cardio-video-piece",
        slug: "easy-cardio-video",
        title: "The Gym at Steyn City",
        kind: "feature",
        region: "spread",
        gutterBehaviour: "clip",
        engagement: noEngagement,
        style: {
          position: "absolute",
          left: "81.9%",
          top: 0,
          width: "18.1%",
          height: "32.2%",
          zIndex: 7,
          overflow: "hidden",
          background: "#ddd",
        },
        elements: [
          image("easy-cardio-image", cardio, "The Gym at Steyn City", {
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 48%",
          }),
          {
            id: "easy-cardio-video-frame",
            type: "frame",
            style: {
              position: "absolute",
              left: "5%",
              bottom: "4%",
              width: "44%",
              aspectRatio: "16 / 9",
              overflow: "hidden",
              border: "2px solid rgba(255,255,255,.92)",
              boxShadow: "0 8px 22px rgba(0,0,0,.22)",
              zIndex: 4,
              background: "#000",
            },
            children: [
              video("easy-city-centre-video-two", cityCentreVideoTwo, "Steyn City City Centre lifestyle", {
                position: "absolute", inset: 0,
              }),
            ],
          },
        ],
      },
      photoPiece(
        "steyn-easy-sorbet-piece",
        "easy-sorbet",
        "Sorbet Salon",
        sorbet,
        "Sorbet Salon at Steyn City",
        { position: "absolute", left: "81.9%", top: "34.0%", width: "18.1%", height: "20.1%", zIndex: 6 },
        "center center",
        true,
      ),
      photoPiece(
        "steyn-easy-lounge-piece",
        "easy-lounge",
        "City Centre interiors",
        lounge,
        "Premium lounge interior at Steyn City",
        { position: "absolute", left: "81.9%", top: "56.2%", width: "18.1%", height: "19.3%", zIndex: 6 },
        "center center",
        false,
      ),
      photoPiece(
        "steyn-easy-greenery-piece",
        "easy-greenery",
        "The Greenery",
        greenery,
        "The Greenery florist at Steyn City",
        { position: "absolute", left: "81.9%", bottom: 0, width: "18.1%", height: "22.2%", zIndex: 6 },
        "center 52%",
        false,
      ),
      {
        id: "steyn-easy-mobile-left-piece",
        slug: "easy-mobile-left",
        title: "Living the Easy Life",
        kind: "article",
        region: "left",
        gutterBehaviour: "clip",
        engagement,
        style: {
          position: "absolute",
          left: "2.8%",
          top: "3.5%",
          width: "44.4%",
          height: "93%",
          display: "none",
          background: "#fbfaf7",
          zIndex: 70,
          padding: "clamp(.95rem,3.8vw,1.4rem)",
          overflow: "auto",
        },
        elements: [
          text("easy-mobile-title", "LIVING THE\nEASY LIFE", {
            color: "#302924",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1.6rem,6.8vw,2.1rem)",
            lineHeight: .95,
            whiteSpace: "pre-line",
            marginBottom: ".8rem",
          }, "h2"),
          image("easy-mobile-icecream", iceCream, "Paul’s Homemade Ice Cream", {
            width: "100%", height: "11.5rem", objectFit: "cover", marginBottom: ".8rem",
          }),
          {
            id: "easy-mobile-copy",
            type: "text",
            props: {
              as: "p",
              text: "Steyn City’s promise has always been simple: make everyday life easier, richer and more convenient. City Centre brings that idea together through food, retail, wellness and services that residents can reach without leaving the estate.\n\nFrom coffee and cookware to fitness, pharmacy and personal care, the practical parts of the day sit alongside the pleasures. That means less time travelling for errands and more time enjoying the lifestyle around you.",
              dropCap: true,
              dropCapLines: 4,
              dropCapColor: "#302924",
            },
            style: {
              color: "#302924",
              fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(1rem,3.8vw,1.14rem)",
              lineHeight: 1.55,
              whiteSpace: "pre-line",
              marginBottom: ".9rem",
            },
          },
          image("easy-mobile-cafe", cafe, "Coffee shop at City Centre", {
            width: "100%", height: "10rem", objectFit: "cover",
          }),
        ],
      },
      {
        id: "steyn-easy-mobile-right-piece",
        slug: "easy-mobile-right",
        title: "City Centre lifestyle",
        kind: "feature",
        region: "right",
        gutterBehaviour: "clip",
        engagement: noEngagement,
        style: {
          position: "absolute",
          left: "52.8%",
          top: "3.5%",
          width: "44.4%",
          height: "93%",
          display: "none",
          background: "#fbfaf7",
          zIndex: 70,
          padding: "clamp(.9rem,3.6vw,1.35rem)",
          overflow: "auto",
        },
        elements: [
          text("easy-mobile-kicker", "LIFESTYLE", {
            color: "#5b534c",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: ".78rem",
            fontWeight: 820,
            letterSpacing: ".13em",
            marginBottom: ".65rem",
          }, "span"),
          image("easy-mobile-lecreuset", leCreuset, "Le Creuset at City Centre", {
            width: "100%", height: "10.5rem", objectFit: "cover", marginBottom: ".65rem",
          }),
          video("easy-mobile-video-one", cityCentreVideo, "Steyn City City Centre", {
            width: "100%", height: "9.5rem", marginBottom: ".9rem",
          }),
          {
            id: "easy-mobile-grid",
            type: "grid",
            style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".55rem", marginBottom: ".9rem" },
            children: [
              image("easy-mobile-cardio", cardio, "The Gym at Steyn City", { width: "100%", height: "7.5rem", objectFit: "cover" }),
              image("easy-mobile-sorbet", sorbet, "Sorbet Salon", { width: "100%", height: "7.5rem", objectFit: "cover" }),
            ],
          },
          text("easy-mobile-copy-right", "Retail, dining, wellness and everyday services come together in one walkable hub. The result is a City Centre designed around small conveniences that add up to a much easier day.", {
            color: "#4d4640",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1rem,3.8vw,1.14rem)",
            lineHeight: 1.52,
            marginBottom: ".9rem",
          }),
          image("easy-mobile-greenery", greenery, "The Greenery", {
            width: "100%", height: "9rem", objectFit: "cover", marginBottom: ".65rem",
          }),
          video("easy-mobile-video-two", cityCentreVideoTwo, "Steyn City City Centre lifestyle", {
            width: "100%", height: "9.5rem",
          }),
        ],
      },
    ],
  };
}


function birdsBeesSpread(issueId: string): MagazineSpreadDefinition {
  const bee = "/resources/studio/steyn/steyn-city-xpomag-spread-8-01.webp";
  const birdGuide = "/resources/studio/steyn/steyn-city-xpomag-spread-8-02.webp";
  const birdPrize = "/resources/studio/steyn/steyn-city-xpomag-spread-8-03.webp";
  const birdWalk = "/resources/studio/steyn/steyn-city-xpomag-spread-8-04.webp";
  const birdExpert = "/resources/studio/steyn/steyn-city-xpomag-spread-8-05.webp";
  const hives = "/resources/studio/steyn/steyn-city-xpomag-spread-8-06.webp";
  const beekeeper = "/resources/studio/steyn/steyn-city-xpomag-spread-8-07.webp";
  const growzone = "/resources/studio/steyn/steyn-city-xpomag-spread-8-08.webp";

  const beeVideo = "https://www.youtube.com/embed/p3FoFJFKAjc?autoplay=1&mute=1&controls=1&playsinline=1&rel=0";
  const birdsVideo = "https://www.youtube.com/embed/G5sVvkrqaJU?autoplay=1&mute=1&controls=1&playsinline=1&rel=0";

  const image = (
    id: string,
    src: string,
    alt: string,
    style: DesignElementNode["style"] = {},
  ): DesignElementNode => ({
    id,
    type: "image",
    props: { src, alt, loading: "eager", fetchPriority: "high" },
    style: { display: "block", objectFit: "cover", ...style },
  });

  const video = (
    id: string,
    src: string,
    title: string,
    style: DesignElementNode["style"] = {},
  ): DesignElementNode => ({
    id,
    type: "video",
    props: {
      src,
      title,
      cover: true,
      interactive: true,
      autoplay: true,
      muted: true,
      controls: true,
    },
    style: { display: "block", width: "100%", height: "100%", ...style },
  });

  const engagement = { reactions: true, comments: true, share: true, save: true };
  const noEngagement = { reactions: false, comments: false, share: false, save: false };

  const photoPiece = (
    id: string,
    slug: string,
    title: string,
    src: string,
    alt: string,
    style: Record<string, unknown>,
    objectPosition = "center center",
    withEngagement = false,
  ): any => ({
    id,
    slug,
    title,
    kind: "feature",
    region: "spread",
    gutterBehaviour: "clip",
    engagement: withEngagement ? engagement : noEngagement,
    style: { ...style, overflow: "hidden", background: "#e9ece5" },
    elements: [
      image(id + "-image", src, alt, {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition,
      }),
    ],
  });

  return {
    id: "steyn-birds-bees-spread",
    issueId,
    slug: "birds-and-bees",
    title: "Birds and Bees",
    kind: "feature",
    pageIds: ["birds-bees-i", "birds-bees-ii"],
    style: { background: "#fbfaf7" },
    pieces: [
      {
        id: "steyn-birds-bees-editorial-piece",
        slug: "birds-bees-editorial",
        title: "Birds and Bees",
        kind: "article",
        region: "spread",
        gutterBehaviour: "cross",
        engagement,
        style: {
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          background: "#fbfaf7",
        },
        elements: [
          {
            id: "birds-bees-hero-shade",
            type: "frame",
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              width: "50%",
              height: "34.2%",
              zIndex: 3,
              background: "linear-gradient(90deg,rgba(18,40,29,.36),rgba(18,40,29,.02) 72%)",
              pointerEvents: "none",
            },
          },
          text("birds-bees-kicker", "│ ENVIRONMENT", {
            position: "absolute",
            left: "4.4%",
            top: "6.6%",
            color: "#f2f0e8",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.46rem,.64vw,.7rem)",
            letterSpacing: ".07em",
            zIndex: 5,
          }, "span"),
          text("birds-bees-title", "BIRDS AND\nBEES", {
            position: "absolute",
            left: "6.2%",
            top: "13.8%",
            width: "20%",
            color: "#f4f0e8",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1.3rem,2.36vw,2.7rem)",
            fontWeight: 500,
            lineHeight: .92,
            letterSpacing: ".05em",
            whiteSpace: "pre-line",
            textAlign: "center",
            zIndex: 5,
            textShadow: "0 2px 12px rgba(0,0,0,.16)",
          }, "h2"),
          text("birds-bees-standfirst", "WHERE ELSE IN JOHANNESBURG ARE THERE 2 000\nACRES OF INDIGENOUS PARKLAND TO ROAM,\nEXPLORE AND ENJOY WITH PEACE OF MIND?", {
            position: "absolute",
            left: "4.4%",
            top: "26.1%",
            width: "22.2%",
            color: "#f4f0e8",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: "clamp(.3rem,.43vw,.47rem)",
            fontWeight: 760,
            lineHeight: 1.25,
            letterSpacing: ".04em",
            whiteSpace: "pre-line",
            textAlign: "center",
            zIndex: 5,
          }),

          text("birds-bees-flights-heading", "FLIGHTS OF FANCY", {
            position: "absolute",
            left: "32.3%",
            top: "37.0%",
            width: "14.5%",
            color: "#69635e",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: "clamp(.32rem,.45vw,.49rem)",
            fontWeight: 820,
            letterSpacing: ".15em",
          }, "h3"),
          {
            id: "birds-bees-flights-copy",
            type: "text",
            props: {
              as: "p",
              text: "It was Steyn City resident Amy Shangase who first had the idea to start a regular bird walk, and this year it grew into a community experience for residents and visitors alike.\n\nThe first gathering brought together keen birders and complete newcomers, all united by curiosity. The walk was guided through established paths, mature planting and open grassland where participants could slow down and notice the remarkable birdlife that has settled into the estate.\n\nRight now, moves are afoot to have the area recognised as a birding hotspot. Best of all, the experience is accessible without having to travel across the city.",
              dropCap: true,
              dropCapLines: 4,
              dropCapColor: "#4f4944",
            },
            style: {
              position: "absolute",
              left: "32.3%",
              top: "40.2%",
              width: "14.4%",
              bottom: "7.5%",
              color: "#4f4944",
              fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(.36rem,.49vw,.53rem)",
              lineHeight: 1.44,
              whiteSpace: "pre-line",
            },
          },

          text("birds-bees-right-col-a", "Africa’s most threatened ecosystems are often relatively small, fragmented and vulnerable. That makes every pocket of green space valuable, especially within a city.\n\nWHAT’S THE BUZZ?\n\nImagine receiving no fewer than 40 bee stings and still holding a soft spot for the little black and yellow creatures. That’s how passionate beekeeper Bryce McCall is about his hives. The result is a living system that supports pollination while providing a direct connection to the wider ecosystem.", {
            position: "absolute",
            left: "55.0%",
            top: "37.6%",
            width: "12.0%",
            bottom: "8%",
            color: "#4c4642",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.35rem,.48vw,.52rem)",
            lineHeight: 1.44,
            whiteSpace: "pre-line",
          }),
          text("birds-bees-right-col-b", "The honey yields are certain to increase in the years to come.\n\nMAKING A DIFFERENCE\n\nWhen the natural environment is an integral part of your lifestyle, it is not enough simply to admire it. Steyn City has continued to invest in practical initiatives that protect the parkland and reduce environmental impact.\n\nWET WASTE FOR A CIRCULAR FUTURE\n\nThe estate is committed to processing wet waste from its leading F&B operators, helping divert organic material from landfill while generating compost that can be used within the landscape.", {
            position: "absolute",
            left: "68.4%",
            top: "37.6%",
            width: "12.0%",
            bottom: "8%",
            color: "#4c4642",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.35rem,.48vw,.52rem)",
            lineHeight: 1.44,
            whiteSpace: "pre-line",
          }),
          text("birds-bees-right-col-c", "and residents on the estate to join the programme.\n\nGROW, GROW, GROW\n\nSteyn City’s Growzone supports food security and skills development through a working garden that contributes fresh produce to community initiatives. The programme has become a practical example of how land, training and social impact can reinforce each other.\n\nThe result is a wider environmental story: biodiversity, food security, recycling, cleaner energy and community impact all connecting back to the same landscape.", {
            position: "absolute",
            right: "3.2%",
            top: "37.6%",
            width: "12.0%",
            bottom: "8%",
            color: "#4c4642",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.35rem,.48vw,.52rem)",
            lineHeight: 1.44,
            whiteSpace: "pre-line",
          }),

          text("birds-bees-brand-right", "STEYN CITY", {
            position: "absolute", right: "6.1%", bottom: "2.2%", color: "#342f2b",
            fontFamily: "var(--xp-font-grotesk)", fontSize: ".42rem", fontWeight: 720, letterSpacing: ".08em",
          }, "span"),
          text("birds-bees-folio-right", "19", {
            position: "absolute", right: "3.0%", bottom: "2.2%", color: "#342f2b",
            fontFamily: "var(--xp-font-grotesk)", fontSize: ".45rem", fontWeight: 800,
          }, "span"),
        ],
      },

      {
        id: "steyn-birds-bees-hero-piece",
        slug: "birds-bees-hero",
        title: "Birds and bees",
        kind: "feature",
        region: "spread",
        gutterBehaviour: "clip",
        engagement: noEngagement,
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: "50%",
          height: "34.2%",
          zIndex: 6,
          overflow: "hidden",
          background: "#173425",
        },
        elements: [
          image("steyn-birds-bees-hero-image", bee, "Honey bee on a flower", {
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 52%",
          }),
          {
            id: "birds-bees-hero-piece-shade",
            type: "frame",
            style: {
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg,rgba(18,40,29,.42),rgba(18,40,29,.03) 72%)",
              zIndex: 2,
              pointerEvents: "none",
            },
          },
          text("birds-bees-hero-piece-kicker", "│ ENVIRONMENT", {
            position: "absolute",
            left: "8.8%",
            top: "19.3%",
            color: "#f2f0e8",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.46rem,.64vw,.7rem)",
            letterSpacing: ".07em",
            zIndex: 4,
          }, "span"),
          text("birds-bees-hero-piece-title", "BIRDS AND\nBEES", {
            position: "absolute",
            left: "7.2%",
            top: "39.5%",
            width: "48%",
            color: "#f4f0e8",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1.18rem,2.02vw,2.35rem)",
            fontWeight: 500,
            lineHeight: .92,
            letterSpacing: ".045em",
            whiteSpace: "pre",
            overflowWrap: "normal",
            wordBreak: "normal",
            textAlign: "center",
            zIndex: 4,
            textShadow: "0 2px 12px rgba(0,0,0,.16)",
          }, "h2"),
          text("birds-bees-hero-piece-standfirst", "WHERE ELSE IN JOHANNESBURG ARE THERE 2 000\nACRES OF INDIGENOUS PARKLAND TO ROAM,\nEXPLORE AND ENJOY WITH PEACE OF MIND?", {
            position: "absolute",
            left: "8.8%",
            top: "73.2%",
            width: "44.4%",
            color: "#f4f0e8",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: "clamp(.28rem,.39vw,.43rem)",
            fontWeight: 760,
            lineHeight: 1.28,
            letterSpacing: ".035em",
            whiteSpace: "pre",
            overflowWrap: "normal",
            wordBreak: "normal",
            textAlign: "center",
            zIndex: 4,
          }),
        ],
      },

      {
        id: "steyn-birds-bees-walk-video-piece",
        slug: "birds-bees-walk-video",
        title: "Birdlife at Steyn City",
        kind: "feature",
        region: "spread",
        gutterBehaviour: "clip",
        engagement,
        style: {
          position: "absolute",
          left: 0,
          top: "34.2%",
          width: "29.3%",
          height: "49.4%",
          zIndex: 7,
          overflow: "hidden",
          background: "#e8ece6",
        },
        elements: [
          image("birds-bees-walk-image", birdWalk, "Guided bird walk through Steyn City parkland", {
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 48%",
          }),
          {
            id: "birds-bees-walk-video-inset",
            type: "frame",
            style: {
              position: "absolute",
              right: "3%",
              bottom: "3%",
              width: "40%",
              aspectRatio: "16 / 9",
              overflow: "hidden",
              border: "2px solid rgba(255,255,255,.92)",
              boxShadow: "0 8px 24px rgba(0,0,0,.25)",
              zIndex: 5,
              background: "#000",
            },
            children: [
              video("birds-bees-birds-video", birdsVideo, "South African birdlife", {
                position: "absolute", inset: 0,
              }),
            ],
          },
        ],
      },

      photoPiece(
        "steyn-birds-bees-guide-piece",
        "birds-bees-guide",
        "Birdlife guide",
        birdGuide,
        "Birding expert portrait",
        { position: "absolute", left: "3.2%", top: "29.8%", width: "8.4%", aspectRatio: "1 / 1", borderRadius: "50%", zIndex: 10, outline: "4px solid #fff" },
        "center 36%",
        false,
      ),
      photoPiece(
        "steyn-birds-bees-expert-piece",
        "birds-bees-expert",
        "Birdlife South Africa",
        birdExpert,
        "Birdlife South Africa expert portrait",
        { position: "absolute", left: "17.2%", top: "29.8%", width: "8.4%", aspectRatio: "1 / 1", borderRadius: "50%", zIndex: 10, outline: "4px solid #fff" },
        "center 34%",
        false,
      ),

      photoPiece(
        "steyn-birds-bees-prize-piece",
        "birds-bees-prize",
        "Birding prize",
        birdPrize,
        "Hoopoe and binoculars",
        { position: "absolute", left: 0, bottom: 0, width: "29.3%", height: "16.7%", zIndex: 8 },
        "center center",
        true,
      ),

      {
        id: "steyn-birds-bees-hives-video-piece",
        slug: "birds-bees-hives-video",
        title: "Bees and pollination",
        kind: "feature",
        region: "spread",
        gutterBehaviour: "clip",
        engagement: noEngagement,
        style: {
          position: "absolute",
          left: "50%",
          top: 0,
          width: "31.2%",
          height: "34.2%",
          zIndex: 7,
          overflow: "hidden",
          background: "#e8ece6",
        },
        elements: [
          image("birds-bees-hives-image", hives, "Bee hives in Steyn City grassland", {
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 52%",
          }),
          {
            id: "birds-bees-hives-video-inset",
            type: "frame",
            style: {
              position: "absolute",
              left: "3%",
              bottom: "4%",
              width: "35%",
              aspectRatio: "16 / 9",
              overflow: "hidden",
              border: "2px solid rgba(255,255,255,.92)",
              boxShadow: "0 8px 24px rgba(0,0,0,.25)",
              zIndex: 5,
              background: "#000",
            },
            children: [
              video("birds-bees-bee-video", beeVideo, "Bees and pollination", {
                position: "absolute", inset: 0,
              }),
            ],
          },
        ],
      },

      photoPiece(
        "steyn-birds-bees-beekeeper-piece",
        "birds-bees-beekeeper",
        "Beekeeper Bryce McCall",
        beekeeper,
        "Beekeeper holding honeycomb and honey",
        { position: "absolute", left: "81.1%", top: 0, width: "18.9%", height: "34.2%", zIndex: 7 },
        "center 36%",
        false,
      ),

      photoPiece(
        "steyn-birds-bees-growzone-piece",
        "birds-bees-growzone",
        "Growzone",
        growzone,
        "Growzone team member with honeycomb",
        { position: "absolute", left: "73.4%", top: "17.4%", width: "13.2%", aspectRatio: "1 / 1", borderRadius: "50%", zIndex: 11, outline: "5px solid #fff" },
        "center 34%",
        false,
      ),

      {
        id: "steyn-birds-bees-mobile-left-piece",
        slug: "birds-bees-mobile-left",
        title: "Birds and Bees",
        kind: "article",
        region: "left",
        gutterBehaviour: "clip",
        engagement,
        style: {
          position: "absolute",
          left: "2.8%",
          top: "3.5%",
          width: "44.4%",
          height: "93%",
          display: "none",
          background: "#fbfaf7",
          zIndex: 70,
          padding: "clamp(.95rem,3.8vw,1.4rem)",
          overflow: "auto",
        },
        elements: [
          image("birds-bees-mobile-hero", bee, "Honey bee on a flower", {
            width: "100%", height: "12rem", objectFit: "cover", objectPosition: "center 52%", marginBottom: ".8rem",
          }),
          text("birds-bees-mobile-title", "BIRDS AND BEES", {
            color: "#24392d",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1.55rem,6.7vw,2.05rem)",
            lineHeight: .94,
            marginBottom: ".7rem",
          }, "h2"),
          {
            id: "birds-bees-mobile-copy",
            type: "text",
            props: {
              as: "p",
              text: "Steyn City’s indigenous parkland supports a thriving web of birdlife, pollinators and other wildlife. Residents can move through the landscape on foot, join guided bird walks and experience nature as part of everyday life.\n\nThe estate’s mature planting, hives and community environmental initiatives all contribute to a richer urban ecosystem where biodiversity is visible, accessible and worth protecting.",
              dropCap: true,
              dropCapLines: 4,
              dropCapColor: "#24392d",
            },
            style: {
              color: "#3f4942",
              fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(1rem,3.8vw,1.14rem)",
              lineHeight: 1.55,
              whiteSpace: "pre-line",
              marginBottom: ".9rem",
            },
          },
          image("birds-bees-mobile-walk", birdWalk, "Guided bird walk", {
            width: "100%", height: "11rem", objectFit: "cover",
          }),
        ],
      },

      {
        id: "steyn-birds-bees-mobile-right-piece",
        slug: "birds-bees-mobile-right",
        title: "Nature at Steyn City",
        kind: "feature",
        region: "right",
        gutterBehaviour: "clip",
        engagement: noEngagement,
        style: {
          position: "absolute",
          left: "52.8%",
          top: "3.5%",
          width: "44.4%",
          height: "93%",
          display: "none",
          background: "#fbfaf7",
          zIndex: 70,
          padding: "clamp(.9rem,3.6vw,1.35rem)",
          overflow: "auto",
        },
        elements: [
          text("birds-bees-mobile-kicker", "ENVIRONMENT", {
            color: "#556058",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: ".78rem",
            fontWeight: 820,
            letterSpacing: ".13em",
            marginBottom: ".65rem",
          }, "span"),
          image("birds-bees-mobile-hives", hives, "Bee hives in the parkland", {
            width: "100%", height: "10.5rem", objectFit: "cover", marginBottom: ".65rem",
          }),
          video("birds-bees-mobile-bees-video", beeVideo, "Bees and pollination", {
            width: "100%", height: "9.5rem", marginBottom: ".9rem",
          }),
          {
            id: "birds-bees-mobile-grid",
            type: "grid",
            style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".55rem", marginBottom: ".9rem" },
            children: [
              image("birds-bees-mobile-beekeeper", beekeeper, "Beekeeper with honeycomb", { width: "100%", height: "7.5rem", objectFit: "cover", objectPosition: "center 34%" }),
              image("birds-bees-mobile-growzone", growzone, "Growzone team member", { width: "100%", height: "7.5rem", objectFit: "cover", objectPosition: "center 34%" }),
            ],
          },
          text("birds-bees-mobile-copy-right", "The environmental story continues beyond wildlife: recycling, wet-waste recovery, cleaner energy and food-security initiatives all reinforce the idea that the landscape is part of the lifestyle, not simply a backdrop.", {
            color: "#4d514d",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1rem,3.8vw,1.14rem)",
            lineHeight: 1.52,
            marginBottom: ".9rem",
          }),
          video("birds-bees-mobile-birds-video", birdsVideo, "South African birdlife", {
            width: "100%", height: "9.5rem",
          }),
        ],
      },
    ],
  };
}


function liveYourDreamsSpread(issueId: string): MagazineSpreadDefinition {
  const hero = "/resources/studio/steyn/steyn-city-xpomag-spread-9-01.webp";
  const logo = "/resources/studio/steyn/pam-golding-properties-logo.webp";
  const qr = "/resources/studio/steyn/qr-code-steyn-city.png";
  const videoSrc = "https://www.youtube.com/embed/qKiizstxMXU?autoplay=1&mute=1&controls=1&playsinline=1&rel=0";

  const engagement = { reactions: true, comments: true, share: true, save: true };
  const noEngagement = { reactions: false, comments: false, share: false, save: false };

  const image = (
    id: string,
    src: string,
    alt: string,
    style: DesignElementNode["style"] = {},
  ): DesignElementNode => ({
    id,
    type: "image",
    props: { src, alt, loading: "eager", fetchPriority: "high" },
    style: { display: "block", objectFit: "cover", ...style },
  });

  const video = (
    id: string,
    src: string,
    title: string,
    style: DesignElementNode["style"] = {},
    nativeAutoplay = false,
    poster?: string,
  ): DesignElementNode => ({
    id,
    type: "video",
    props: nativeAutoplay
      ? {
          src,
          title,
          poster,
          autoplay: true,
          autoplayDelayMs: 0,
          muted: true,
          loop: true,
          maxLoops: 999,
          controls: false,
        }
      : {
          src,
          title,
          poster,
          cover: true,
          interactive: true,
          autoplay: false,
          muted: true,
          controls: true,
        },
    style: { display: "block", width: "100%", height: "100%", ...style },
  });

  return {
    id: "steyn-live-your-dreams-spread",
    issueId,
    slug: "live-your-dreams",
    title: "Live Your Dreams",
    kind: "advert",
    pageIds: ["birds-bees-iii", "birds-bees-iv"],
    style: { background: "#fff" },
    pieces: [
      {
        id: "steyn-live-your-dreams-piece",
        slug: "live-your-dreams-piece",
        title: "Live Your Dreams",
        kind: "advert",
        region: "spread",
        gutterBehaviour: "cross",
        engagement,
        style: {
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          background: "#fff",
        },
        elements: [
          image("live-dreams-hero", hero, "Luxury Steyn City home with outdoor living and pool", {
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "84.8%",
            objectFit: "cover",
            objectPosition: "center 52%",
          }),

          {
            id: "live-dreams-video-card",
            type: "frame",
            style: {
              position: "absolute",
              left: "3.3%",
              top: "5.2%",
              width: "17.5%",
              aspectRatio: "16 / 9",
              overflow: "hidden",
              border: "2px solid rgba(255,255,255,.92)",
              boxShadow: "0 10px 28px rgba(0,0,0,.22)",
              background: "#111",
              zIndex: 6,
            },
            children: [
              video("live-dreams-video", videoSrc, "Steyn City property lifestyle", {
                position: "absolute",
                inset: 0,
              }),
            ],
          },

          {
            id: "live-dreams-bottom-rail",
            type: "frame",
            style: {
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "15.2%",
              background: "rgba(255,255,255,.99)",
              borderTop: "1px solid rgba(0,0,0,.08)",
              display: "grid",
              gridTemplateColumns: "1.18fr .82fr",
              alignItems: "stretch",
              boxSizing: "border-box",
              zIndex: 5,
            },
            children: [
              {
                id: "live-dreams-copy-left",
                type: "stack",
                style: {
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "clamp(.8rem,1.25vw,1.4rem) clamp(1.4rem,3vw,3.6rem)",
                  gap: "clamp(.2rem,.36vw,.38rem)",
                },
                children: [
                  text("live-dreams-title", "LIVE YOUR DREAMS", {
                    color: "#2c2a28",
                    fontFamily: "var(--xp-font-editorial)",
                    fontSize: "clamp(1rem,1.45vw,1.7rem)",
                    fontWeight: 500,
                    lineHeight: 1.05,
                    letterSpacing: ".03em",
                  }, "h2"),
                  text(
                    "live-dreams-description",
                    "Imagine the possibilities. Steyn City’s range of stands allows you to design your lifestyle exactly as you envision it. This magnificent home, where a strong emphasis on connecting with the outdoors is complemented by interiors by The Private House Company, stands as a prime example.",
                    {
                      color: "#3f3b37",
                      fontFamily: "var(--xp-font-sans)",
                      fontSize: "clamp(.42rem,.5vw,.56rem)",
                      lineHeight: 1.35,
                      maxWidth: "43rem",
                    },
                  ),
                ],
              },
              {
                id: "live-dreams-contact",
                type: "grid",
                style: {
                  gridTemplateColumns: "auto 1fr auto",
                  gap: "clamp(.7rem,1.1vw,1.2rem)",
                  alignItems: "center",
                  padding: "clamp(.7rem,1.1vw,1.3rem) clamp(1.2rem,2.6vw,3rem)",
                },
                children: [
                  image("live-dreams-qr", qr, "QR code for Steyn City property enquiries", {
                    width: "clamp(2.7rem,4.3vw,4.7rem)",
                    aspectRatio: "1 / 1",
                    objectFit: "contain",
                  }),
                  {
                    id: "live-dreams-contact-copy",
                    type: "stack",
                    style: {
                      justifyContent: "center",
                      gap: ".22rem",
                    },
                    children: [
                      text("live-dreams-contact-label", "FOR STANDS | SALES, CONTACT:", {
                        color: "#4c4742",
                        fontFamily: "var(--xp-font-sans)",
                        fontSize: "clamp(.34rem,.42vw,.47rem)",
                        fontWeight: 760,
                        letterSpacing: ".09em",
                      }, "span"),
                      text("live-dreams-contact-tel", "TEL: 010 597 1040", {
                        color: "#2f2c29",
                        fontFamily: "var(--xp-font-sans)",
                        fontSize: "clamp(.38rem,.46vw,.52rem)",
                        fontWeight: 650,
                      }, "span"),
                      text("live-dreams-contact-email", "EMAIL: SALES@STEYNCITY.CO.ZA", {
                        color: "#2f2c29",
                        fontFamily: "var(--xp-font-sans)",
                        fontSize: "clamp(.38rem,.46vw,.52rem)",
                        fontWeight: 650,
                      }, "span"),
                    ],
                  },
                  image("live-dreams-logo", logo, "Pam Golding Properties", {
                    width: "clamp(7.2rem,10.5vw,12rem)",
                    maxHeight: "4.5rem",
                    objectFit: "contain",
                    objectPosition: "right center",
                  }),
                ],
              },
            ],
          },
        ],
      },

      {
        id: "steyn-live-your-dreams-mobile-piece",
        slug: "live-your-dreams-mobile-piece",
        title: "Live Your Dreams",
        kind: "advert",
        region: "spread",
        gutterBehaviour: "clip",
        engagement: noEngagement,
        style: {
          position: "absolute",
          inset: "3.5% 3%",
          display: "none",
          background: "#fff",
          zIndex: 70,
          overflow: "auto",
          padding: "clamp(.9rem,3.8vw,1.35rem)",
          boxSizing: "border-box",
        },
        elements: [
          image("live-dreams-mobile-hero", hero, "Luxury Steyn City home with outdoor living and pool", {
            width: "100%",
            height: "18rem",
            objectFit: "cover",
            objectPosition: "center 52%",
            marginBottom: ".85rem",
          }),
          text("live-dreams-mobile-title", "LIVE YOUR DREAMS", {
            color: "#2c2a28",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1.55rem,6.8vw,2.1rem)",
            lineHeight: 1,
            letterSpacing: ".02em",
            marginBottom: ".55rem",
            textAlign: "center",
          }, "h2"),
          text(
            "live-dreams-mobile-description",
            "Imagine the possibilities. Steyn City’s range of stands allows you to design your lifestyle exactly as you envision it. This magnificent home connects generous interiors with the outdoors in a way that feels effortless and complete.",
            {
              color: "#3f3b37",
              fontFamily: "var(--xp-font-sans)",
              fontSize: "clamp(1rem,3.8vw,1.14rem)",
              lineHeight: 1.5,
              marginBottom: ".9rem",
              textAlign: "center",
            },
          ),
          video("live-dreams-mobile-video", videoSrc, "Steyn City property lifestyle", {
            width: "100%",
            height: "11rem",
            marginBottom: ".95rem",
          }),
          {
            id: "live-dreams-mobile-contact",
            type: "grid",
            style: {
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: ".8rem",
              alignItems: "center",
              marginBottom: ".8rem",
            },
            children: [
              image("live-dreams-mobile-qr", qr, "QR code for Steyn City property enquiries", {
                width: "4.5rem",
                aspectRatio: "1 / 1",
                objectFit: "contain",
              }),
              {
                id: "live-dreams-mobile-contact-copy",
                type: "stack",
                style: { gap: ".22rem" },
                children: [
                  text("live-dreams-mobile-label", "FOR STANDS | SALES, CONTACT:", {
                    color: "#4c4742",
                    fontFamily: "var(--xp-font-sans)",
                    fontSize: ".78rem",
                    fontWeight: 760,
                    letterSpacing: ".08em",
                  }, "span"),
                  text("live-dreams-mobile-tel", "TEL: 010 597 1040", {
                    color: "#2f2c29",
                    fontFamily: "var(--xp-font-sans)",
                    fontSize: ".86rem",
                    fontWeight: 650,
                  }, "span"),
                  text("live-dreams-mobile-email", "SALES@STEYNCITY.CO.ZA", {
                    color: "#2f2c29",
                    fontFamily: "var(--xp-font-sans)",
                    fontSize: ".86rem",
                    fontWeight: 650,
                  }, "span"),
                ],
              },
            ],
          },
          image("live-dreams-mobile-logo", logo, "Pam Golding Properties", {
            width: "10rem",
            maxWidth: "65%",
            margin: "0 auto",
            objectFit: "contain",
          }),
        ],
      },
    ],
  };
}


function rentalCheninSpread(issueId: string): MagazineSpreadDefinition {
  const rentalHero = "/resources/studio/steyn/steyn-city-xpomag-spread-10-01.webp";
  const rentalInterior = "/resources/studio/steyn/steyn-city-xpomag-spread-10-02.webp";
  const rentalExterior = "/resources/studio/steyn/steyn-city-xpomag-spread-10-03.webp";
  const winemaker = "/resources/studio/steyn/steyn-city-xpomag-spread-10-04.webp";
  const wineTable = "/resources/studio/steyn/steyn-city-xpomag-spread-10-05.webp";
  const wineBottle = "/resources/studio/steyn/wine-bottle-01.webp";
  const rentalQr = "/resources/studio/steyn/07_steyn_city_rentals_qr.webp";
  const wineQr = "/resources/studio/steyn/08_spier_wine_club_qr.webp";
  const rentalVideo = "https://videos.pexels.com/video-files/37674127/15971334_1080_1920_60fps.mp4";
  const wineVideo = "https://videos.pexels.com/video-files/31484645/13424468_2160_3840_30fps.mp4";

  const engagement = { reactions: true, comments: true, share: true, save: true };
  const noEngagement = { reactions: false, comments: false, share: false, save: false };

  const image = (
    id: string,
    src: string,
    alt: string,
    style: DesignElementNode["style"] = {},
  ): DesignElementNode => ({
    id,
    type: "image",
    props: { src, alt, loading: "eager", fetchPriority: "high" },
    style: { display: "block", objectFit: "cover", ...style },
  });

  const video = (
    id: string,
    src: string,
    title: string,
    style: DesignElementNode["style"] = {},
    nativeAutoplay = false,
  ): DesignElementNode => ({
    id,
    type: "video",
    props: nativeAutoplay
      ? {
          src,
          title,
          autoplay: true,
          managedAutoplay: false,
          autoplayDelayMs: 0,
          muted: true,
          loop: true,
          maxLoops: 999,
          controls: false,
        }
      : {
          src,
          title,
          cover: true,
          interactive: true,
          autoplay: false,
          muted: true,
          controls: true,
        },
    style: { display: "block", width: "100%", height: "100%", ...style },
  });

  const mediaPiece = (
    id: string,
    slug: string,
    title: string,
    node: DesignElementNode,
    style: Record<string, unknown>,
    withEngagement = false,
  ): any => ({
    id,
    slug,
    title,
    kind: "feature",
    region: "spread",
    gutterBehaviour: "clip",
    engagement: withEngagement ? engagement : noEngagement,
    style: { ...style, overflow: "hidden", background: "#ece8e2" },
    elements: [node],
  });

  return {
    id: "steyn-rental-chenin-spread",
    issueId,
    slug: "rental-chenin",
    title: "Rental Collection / SA Chenin Blanc",
    kind: "feature",
    pageIds: ["rental-collection", "chenin"],
    style: { background: "#fbfaf7" },
    pieces: [
      {
        id: "steyn-rental-chenin-editorial-piece",
        slug: "rental-chenin-editorial",
        title: "Rental Collection / SA Chenin Blanc",
        kind: "article",
        region: "spread",
        gutterBehaviour: "cross",
        engagement,
        style: {
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          background: "#fbfaf7",
        },
        elements: [
          text("rental-kicker", "│ PROPERTY", {
            position: "absolute",
            left: "4.4%",
            top: "6.7%",
            color: "#625a54",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.48rem,.66vw,.72rem)",
            letterSpacing: ".06em",
          }, "span"),
          text("rental-title", "DISCOVER THE STEYN CITY\nRENTAL COLLECTION", {
            position: "absolute",
            left: "4.8%",
            top: "9.3%",
            width: "40.8%",
            color: "#342d28",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1.05rem,1.72vw,2rem)",
            fontWeight: 500,
            lineHeight: .94,
            letterSpacing: ".014em",
            whiteSpace: "pre",
            overflowWrap: "normal",
            wordBreak: "normal",
            textAlign: "center",
          }, "h2"),

          {
            id: "rental-article-copy",
            type: "text",
            props: {
              as: "p",
              text: "Steyn City’s rental apartment homes make it possible to experience a taste of a lifestyle usually reserved for owners. A world of convenience, beautifully considered spaces and direct access to the estate’s amenities make renting here feel anything but temporary.\n\nThe collection ranges from well-appointed apartments to homes with generous balconies, easy access to retail, restaurants, parkland and wellness, and the convenience of a secure, connected city around you.",
              dropCap: true,
              dropCapLines: 4,
              dropCapColor: "#342d28",
            },
            style: {
              position: "absolute",
              left: "4.5%",
              top: "56.1%",
              width: "17.4%",
              bottom: "20.6%",
              color: "#463f3a",
              fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(.39rem,.52vw,.56rem)",
              lineHeight: 1.48,
              whiteSpace: "pre-line",
            },
          },

          text("rental-list-copy", "Three-bedroom apartments along the landscaped creek, private balconies and lock-up-and-go convenience are all part of the mix.\n\n• City Centre rentals — contemporary apartments with access to restaurants, retail and services\n\n• Heron Heights — two- and three-bedroom apartments overlooking parkland\n\n• 104 on Creek — relaxed creek-side living with a quieter residential feel", {
            position: "absolute",
            left: "33.1%",
            top: "23.3%",
            width: "13.2%",
            bottom: "23%",
            color: "#4a433e",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.31rem,.42vw,.46rem)",
            lineHeight: 1.46,
            whiteSpace: "pre-line",
            overflowWrap: "break-word",
          }),

          {
            id: "rental-qr-group",
            type: "grid",
            style: {
              position: "absolute",
              left: "33.8%",
              top: "66.3%",
              width: "10.3%",
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: ".45rem",
              alignItems: "center",
            },
            children: [
              image("rental-qr", rentalQr, "Steyn City rentals QR code", {
                width: "3.3rem",
                aspectRatio: "1 / 1",
                objectFit: "contain",
              }),
              text("rental-qr-label", "SCAN FOR MORE\nINFORMATION", {
                color: "#5a514b",
                fontFamily: "var(--xp-font-grotesk)",
                fontSize: "clamp(.3rem,.41vw,.45rem)",
                fontWeight: 760,
                letterSpacing: ".08em",
                lineHeight: 1.2,
                whiteSpace: "pre-line",
              }, "span"),
            ],
          },

          text("wine-kicker", "WINE │", {
            position: "absolute",
            right: "4.2%",
            top: "6.8%",
            color: "#5c534c",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.48rem,.66vw,.72rem)",
            letterSpacing: ".06em",
          }, "span"),

          text("wine-title", "CONSECUTIVE\nGLOBAL ACCLAIM\nFOR SA CHENIN BLANC", {
            position: "absolute",
            left: "54.4%",
            top: "38.0%",
            width: "27.6%",
            color: "#332d29",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1.02rem,1.72vw,2rem)",
            fontWeight: 500,
            lineHeight: .95,
            letterSpacing: ".008em",
            whiteSpace: "pre",
            overflowWrap: "normal",
            wordBreak: "normal",
          }, "h2"),

          {
            id: "wine-copy-a",
            type: "text",
            props: {
              as: "p",
              text: "South African winemaking continues to shine on the world stage, with Johan Jordaan, Cellar Master at Spier, recognised for his mastery of Chenin Blanc. The accolade reinforces both Spier’s long-standing commitment to the varietal and the broader global reputation of South African Chenin.",
              dropCap: true,
              dropCapLines: 4,
              dropCapColor: "#342d28",
            },
            style: {
              position: "absolute",
              left: "54.6%",
              top: "54.7%",
              width: "14.6%",
              bottom: "12.5%",
              color: "#463f3a",
              fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(.36rem,.48vw,.52rem)",
              lineHeight: 1.45,
            },
          },

          text("wine-copy-b", "The 21 Gables Chenin Blanc is sourced from certified old vines planted in 1983 and offers a style that balances richness with freshness. Fermented and matured in French oak, it reveals layered notes of pear, quince and citrus with a textured finish.\n\nTogether, these wines speak to a collective effort and a proud moment not only for Spier, but for South African wine as a whole.", {
            position: "absolute",
            left: "70.2%",
            top: "54.7%",
            width: "14.6%",
            bottom: "12.5%",
            color: "#463f3a",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.36rem,.48vw,.52rem)",
            lineHeight: 1.45,
            whiteSpace: "pre-line",
          }),

          {
            id: "wine-qr-group",
            type: "grid",
            style: {
              position: "absolute",
              left: "54.5%",
              bottom: "4.8%",
              width: "28.8%",
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: ".65rem",
              alignItems: "center",
            },
            children: [
              image("wine-qr", wineQr, "Spier Wine Club QR code", {
                width: "3.4rem",
                aspectRatio: "1 / 1",
                objectFit: "contain",
              }),
              text("wine-qr-copy", "JOIN THE SPIER WINE CLUB TO GET ACCESS TO\nEXCLUSIVE EVENTS, WINE OFFERS, AND MORE.", {
                color: "#625a54",
                fontFamily: "var(--xp-font-grotesk)",
                fontSize: "clamp(.31rem,.42vw,.46rem)",
                fontWeight: 700,
                letterSpacing: ".075em",
                lineHeight: 1.28,
                whiteSpace: "pre-line",
              }, "span"),
            ],
          },

          text("wine-brand", "SPIER\n1692", {
            position: "absolute",
            right: "4.2%",
            bottom: "8%",
            width: "11.5%",
            color: "#222",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: "clamp(1rem,1.6vw,1.8rem)",
            fontWeight: 650,
            lineHeight: 1.05,
            letterSpacing: ".14em",
            textAlign: "center",
            whiteSpace: "pre-line",
          }, "span"),

          {
            id: "wine-age-warning",
            type: "frame",
            style: {
              position: "absolute",
              left: "50%",
              right: 0,
              bottom: 0,
              height: "4.2%",
              borderTop: "1px solid rgba(0,0,0,.32)",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 5,
            },
            children: [
              text("wine-age-warning-copy", "Not for Sale to Persons Under the Age of 18.", {
                color: "#2e2925",
                fontFamily: "var(--xp-font-grotesk)",
                fontSize: "clamp(.42rem,.57vw,.62rem)",
                fontWeight: 760,
                letterSpacing: ".01em",
              }, "span"),
            ],
          },
        ],
      },

      mediaPiece(
        "steyn-rental-hero-piece",
        "rental-hero",
        "City Centre rental apartment",
        image("rental-hero-image", rentalHero, "City Centre rental apartment overlooking Steyn City", {
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 52%",
        }),
        { position: "absolute", left: 0, top: "22.2%", width: "31.9%", height: "29.4%", zIndex: 7 },
        true,
      ),

      mediaPiece(
        "steyn-rental-video-piece",
        "rental-video",
        "Steyn City rental lifestyle",
        video("rental-autoplay-video", rentalVideo, "Luxury apartment interior film", {
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center",
        }, true),
        { position: "absolute", left: 0, bottom: 0, width: "24.4%", height: "18.8%", zIndex: 7 },
        false,
      ),

      mediaPiece(
        "steyn-rental-exterior-piece",
        "rental-exterior",
        "104 on Creek",
        image("rental-exterior-image", rentalExterior, "104 on Creek at Steyn City", {
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 52%",
        }),
        { position: "absolute", left: "25.9%", bottom: 0, width: "24.1%", height: "18.8%", zIndex: 7 },
        false,
      ),

      mediaPiece(
        "steyn-wine-hero-piece",
        "wine-hero",
        "Spier Cellar Master Johan Jordaan",
        image("wine-hero-image", winemaker, "Spier Cellar Master Johan Jordaan in the vineyard", {
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 48%",
        }),
        { position: "absolute", left: "50%", top: 0, width: "50%", height: "34.3%", zIndex: 6 },
        false,
      ),

      {
        id: "steyn-wine-video-piece",
        slug: "wine-video",
        title: "Spier Chenin Blanc",
        kind: "feature",
        region: "spread",
        gutterBehaviour: "clip",
        engagement,
        style: {
          position: "absolute",
          left: "84.0%",
          top: "24.0%",
          width: "13.8%",
          aspectRatio: "1 / 1",
          borderRadius: "50%",
          outline: "5px solid #fff",
          overflow: "hidden",
          zIndex: 10,
          background: "#ddd",
        },
        elements: [
          image("wine-table-poster", wineTable, "Spier Chenin Blanc served outdoors", {
            position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center",
          }),
          {
            id: "wine-video-inner",
            type: "frame",
            style: {
              position: "absolute",
              left: "7%",
              bottom: "7%",
              width: "45%",
              aspectRatio: "16 / 9",
              overflow: "hidden",
              border: "2px solid rgba(255,255,255,.94)",
              boxShadow: "0 7px 20px rgba(0,0,0,.23)",
              zIndex: 5,
              background: "#111",
            },
            children: [
              video("wine-video-player", wineVideo, "Wine tasting in a vineyard", {
                position: "absolute", inset: 0, objectFit: "cover",
              }, true),
            ],
          },
        ],
      },

      {
        id: "steyn-wine-bottle-piece",
        slug: "wine-bottle",
        title: "Spier Chenin Blanc bottle",
        kind: "feature",
        region: "spread",
        gutterBehaviour: "clip",
        engagement: noEngagement,
        style: {
          position: "absolute",
          right: "2.5%",
          top: "52.2%",
          width: "12.8%",
          height: "29.2%",
          zIndex: 7,
          overflow: "visible",
          background: "transparent",
        },
        elements: [
          image("wine-bottle-image", wineBottle, "Spier Chenin Blanc bottle", {
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "122%",
            height: "122%",
            transform: "translate(-50%, -50%)",
            objectFit: "contain",
            objectPosition: "center center",
            background: "transparent",
          }),
        ],
      },

      {
        id: "steyn-rental-chenin-mobile-left-piece",
        slug: "rental-chenin-mobile-left",
        title: "Discover the Steyn City Rental Collection",
        kind: "article",
        region: "left",
        gutterBehaviour: "clip",
        engagement,
        style: {
          position: "absolute",
          left: "2.8%",
          top: "3.5%",
          width: "44.4%",
          height: "93%",
          display: "none",
          background: "#fbfaf7",
          zIndex: 70,
          padding: "clamp(.95rem,3.8vw,1.4rem)",
          overflow: "auto",
        },
        elements: [
          text("rental-mobile-kicker", "PROPERTY", {
            color: "#655d56",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: ".78rem",
            fontWeight: 800,
            letterSpacing: ".13em",
            marginBottom: ".5rem",
          }, "span"),
          text("rental-mobile-title", "DISCOVER THE STEYN CITY\nRENTAL COLLECTION", {
            color: "#342d28",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1.45rem,6.4vw,1.95rem)",
            lineHeight: .98,
            whiteSpace: "pre-line",
            marginBottom: ".75rem",
          }, "h2"),
          image("rental-mobile-hero", rentalHero, "City Centre rental apartment", {
            width: "100%", height: "11.5rem", objectFit: "cover", marginBottom: ".75rem",
          }),
          {
            id: "rental-mobile-copy",
            type: "text",
            props: {
              as: "p",
              text: "Steyn City’s rental collection offers beautifully considered homes, everyday convenience and direct access to the estate’s amenities — without the commitment of ownership.",
              dropCap: true,
              dropCapLines: 4,
              dropCapColor: "#342d28",
            },
            style: {
              color: "#463f3a",
              fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(1rem,3.8vw,1.14rem)",
              lineHeight: 1.55,
              marginBottom: ".8rem",
            },
          },
          video("rental-mobile-video", rentalVideo, "Luxury apartment interior film", {
            width: "100%", height: "10rem", objectFit: "cover", marginBottom: ".8rem",
          }, true),
          image("rental-mobile-exterior", rentalExterior, "104 on Creek", {
            width: "100%", height: "9.5rem", objectFit: "cover",
          }),
        ],
      },

      {
        id: "steyn-rental-chenin-mobile-right-piece",
        slug: "rental-chenin-mobile-right",
        title: "Consecutive Global Acclaim for SA Chenin Blanc",
        kind: "article",
        region: "right",
        gutterBehaviour: "clip",
        engagement: noEngagement,
        style: {
          position: "absolute",
          left: "52.8%",
          top: "3.5%",
          width: "44.4%",
          height: "93%",
          display: "none",
          background: "#fbfaf7",
          zIndex: 70,
          padding: "clamp(.9rem,3.6vw,1.35rem)",
          overflow: "auto",
        },
        elements: [
          text("wine-mobile-kicker", "WINE", {
            color: "#655d56",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: ".78rem",
            fontWeight: 800,
            letterSpacing: ".13em",
            marginBottom: ".5rem",
          }, "span"),
          image("wine-mobile-hero", winemaker, "Spier Cellar Master Johan Jordaan", {
            width: "100%", height: "10.5rem", objectFit: "cover", objectPosition: "center 48%", marginBottom: ".75rem",
          }),
          text("wine-mobile-title", "CONSECUTIVE GLOBAL ACCLAIM\nFOR SA CHENIN BLANC", {
            color: "#342d28",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1.4rem,6.2vw,1.9rem)",
            lineHeight: .98,
            whiteSpace: "pre-line",
            marginBottom: ".7rem",
          }, "h2"),
          {
            id: "wine-mobile-copy",
            type: "text",
            props: {
              as: "p",
              text: "South African winemaking continues to shine internationally, with Spier Cellar Master Johan Jordaan recognised for his mastery of Chenin Blanc. The award reflects decades of work in the vineyard and cellar, and the strength of South African Chenin on the world stage.",
              dropCap: true,
              dropCapLines: 4,
              dropCapColor: "#342d28",
            },
            style: {
              color: "#463f3a",
              fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(1rem,3.8vw,1.14rem)",
              lineHeight: 1.55,
              marginBottom: ".8rem",
            },
          },
          video("wine-mobile-video", wineVideo, "Wine tasting in a vineyard", {
            width: "100%", height: "10rem", objectFit: "cover", marginBottom: ".8rem",
          }, true),
          image("wine-mobile-table", wineTable, "Spier Chenin Blanc outdoors", {
            width: "100%", height: "9rem", objectFit: "cover", marginBottom: ".7rem",
          }),
          image("wine-mobile-bottle", wineBottle, "Spier Chenin Blanc bottle", {
            width: "8rem", height: "15rem", objectFit: "contain", margin: "0 auto", background: "transparent",
          }),
        ],
      },
    ],
  };
}


function allThingsDeliciousSpread(issueId: string): MagazineSpreadDefinition {
  const pasta = "/resources/studio/steyn/steyn-city-xpomag-spread-11-01.webp";
  const luciana = "/resources/studio/steyn/steyn-city-xpomag-spread-11-02.webp";
  const breakfast = "/resources/studio/steyn/steyn-city-xpomag-spread-11-03.webp";
  const chefMatthew = "/resources/studio/steyn/steyn-city-xpomag-spread-11-04.webp";
  const sushi = "/resources/studio/steyn/steyn-city-xpomag-spread-11-05.webp";
  const greenDrink = "/resources/studio/steyn/steyn-city-xpomag-spread-11-06.webp";

  const pastaVideo = "https://www.youtube.com/embed/QDeMEbMY2wU?autoplay=1&mute=1&controls=0&playsinline=1&rel=0";
  const sushiVideo = "https://www.youtube.com/embed/NAFbu_UFh6c?autoplay=1&mute=1&controls=0&playsinline=1&rel=0";

  const engagement = { reactions: true, comments: true, share: true, save: true };
  const noEngagement = { reactions: false, comments: false, share: false, save: false };

  const image = (
    id: string,
    src: string,
    alt: string,
    style: DesignElementNode["style"] = {},
  ): DesignElementNode => ({
    id,
    type: "image",
    props: { src, alt, loading: "eager", fetchPriority: "high" },
    style: { display: "block", objectFit: "cover", ...style },
  });

  const video = (
    id: string,
    src: string,
    title: string,
    style: DesignElementNode["style"] = {},
  ): DesignElementNode => ({
    id,
    type: "video",
    props: {
      src,
      title,
      cover: true,
      interactive: true,
      autoplay: true,
      muted: true,
      controls: false,
    },
    style: { display: "block", width: "100%", height: "100%", ...style },
  });

  const mediaPiece = (
    id: string,
    slug: string,
    title: string,
    node: DesignElementNode,
    style: Record<string, unknown>,
    withEngagement = false,
  ): any => ({
    id,
    slug,
    title,
    kind: "feature",
    region: "spread",
    gutterBehaviour: "clip",
    engagement: withEngagement ? engagement : noEngagement,
    style: { ...style, overflow: "hidden", background: "#ece8e2" },
    elements: [node],
  });

  return {
    id: "steyn-all-things-delicious-spread",
    issueId,
    slug: "all-things-delicious",
    title: "All Things Delicious",
    kind: "feature",
    pageIds: ["food-i", "food-ii"],
    style: { background: "#fbfaf7" },
    pieces: [
      {
        id: "steyn-food-editorial-piece",
        slug: "food-editorial",
        title: "All Things Delicious",
        kind: "article",
        region: "spread",
        gutterBehaviour: "cross",
        engagement,
        style: {
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          background: "#fbfaf7",
        },
        elements: [
          text("food-kicker", "│ FOOD", {
            position: "absolute",
            left: "4.4%",
            top: "6.6%",
            color: "#625a54",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.48rem,.66vw,.72rem)",
            letterSpacing: ".06em",
          }, "span"),

          {
            id: "food-intro-copy",
            type: "text",
            props: {
              as: "p",
              text: "From children’s parties to milestone birthdays, from date nights to lunches that last for hours… whatever the occasion, Steyn City has the destination.\n\nWHAT’S ON THE MENU?\n\nChoose from a range of restaurants and eateries:\n\n• Guild Restaurant — inspired cuisine in a refined setting\n\n• Nineteen — the Clubhouse precinct’s contemporary favourite\n\n• Café del Sol — flavour-led Italian dining\n\n• The Farmhouse — relaxed family dining\n\n• Seattle Coffee Co. — coffee, quick bites and easy catch-ups",
              dropCap: true,
              dropCapLines: 4,
              dropCapColor: "#342d28",
            },
            style: {
              position: "absolute",
              left: "4.4%",
              top: "11.2%",
              width: "12.7%",
              bottom: "6.6%",
              color: "#463f3a",
              fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(.32rem,.43vw,.47rem)",
              lineHeight: 1.47,
              whiteSpace: "pre-line",
              overflowWrap: "break-word",
            },
          },

          text("food-title", "ALL THINGS\nDELICIOUS", {
            position: "absolute",
            left: "23.4%",
            top: "47.5%",
            width: "24.3%",
            color: "#332d29",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1.25rem,2.2vw,2.5rem)",
            fontWeight: 500,
            lineHeight: .95,
            whiteSpace: "pre-line",
            textAlign: "center",
          }, "h2"),

          text("food-left-copy-a", "SPOTLIGHT ON: CAFÉ DEL SOL\nSTEYN CITY\n\nWhat is it about Italian cuisine that makes it a perennial global favourite? One visit to Café del Sol Steyn City, located on City Centre’s main plaza, and you’ll find out for yourself.\n\nOf course, it’s not only Café del Sol’s flavours that make it memorable. The restaurant brings warmth, generosity and a strong sense of occasion to every table.", {
            position: "absolute",
            left: "20.9%",
            top: "58.8%",
            width: "12.5%",
            bottom: "6.7%",
            color: "#4b443f",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.34rem,.46vw,.5rem)",
            lineHeight: 1.44,
            whiteSpace: "pre-line",
          }),

          text("food-left-copy-b", "From handmade pasta to beautifully plated classics, the menu balances familiarity with polish.\n\nThe market-to-bowl philosophy means ingredients stay fresh, seasonal and full of flavour. It’s the kind of place that works equally well for a casual lunch or a long dinner with friends.\n\nThe result is dining that feels relaxed, confident and distinctly Steyn City.", {
            position: "absolute",
            left: "34.2%",
            top: "58.8%",
            width: "12.7%",
            bottom: "6.7%",
            color: "#4b443f",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.34rem,.46vw,.5rem)",
            lineHeight: 1.44,
            whiteSpace: "pre-line",
          }),

          text("food-right-copy-a", "SIPPING WITH THE SOUTHERN GUARDS\n\nToast the Southern Guards SC with Nineteen’s signature menu. The combination of a beautiful setting, well-considered dishes and easy hospitality makes the experience feel complete.\n\nWith its broad appeal, Nineteen works just as well for breakfast and coffee as it does for a lingering lunch.", {
            position: "absolute",
            left: "54.4%",
            top: "52.9%",
            width: "13.7%",
            bottom: "8.4%",
            color: "#4b443f",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.34rem,.46vw,.5rem)",
            lineHeight: 1.44,
            whiteSpace: "pre-line",
          }),

          text("food-right-copy-b", "SPOTLIGHT ON: NINETEEN\n\nChef Matthew Foxon has shaped a menu that feels polished without losing its sense of fun. Seasonal produce, approachable flavours and an eye for detail make every plate feel considered.\n\nThe setting carries the same balance — refined, social and welcoming.", {
            position: "absolute",
            left: "69.4%",
            top: "52.9%",
            width: "13.2%",
            bottom: "8.4%",
            color: "#4b443f",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(.34rem,.46vw,.5rem)",
            lineHeight: 1.44,
            whiteSpace: "pre-line",
          }),

          {
            id: "luciana-loves-box",
            type: "frame",
            style: {
              position: "absolute",
              left: "53.9%",
              top: "24.7%",
              width: "11.8%",
              height: "23.5%",
              background: "#3e9d4f",
              padding: ".7rem",
              zIndex: 8,
            },
            children: [
              text("luciana-loves-title", "LUCIANA’S LOVES", {
                color: "#fff",
                fontFamily: "var(--xp-font-grotesk)",
                fontSize: "clamp(.38rem,.5vw,.54rem)",
                fontWeight: 800,
                textAlign: "center",
                marginBottom: ".35rem",
              }, "h3"),
              text("luciana-loves-copy", "Favourite food: Risotto\n\nFavourite cuisine: Italian\n\nFavourite ingredient: Parmesan\n\nFavourite destination: The Alps\n\nFavourite local destination: The Drakensberg", {
                color: "#fff",
                fontFamily: "var(--xp-font-editorial)",
                fontSize: "clamp(.28rem,.38vw,.42rem)",
                lineHeight: 1.35,
                whiteSpace: "pre-line",
              }),
            ],
          },

          {
            id: "chef-matthew-box",
            type: "frame",
            style: {
              position: "absolute",
              right: "4.3%",
              bottom: "7.4%",
              width: "12.1%",
              height: "24%",
              background: "#3e9d4f",
              padding: ".72rem",
              zIndex: 8,
            },
            children: [
              text("chef-matthew-title", "MOMENTS WITH\nCHEF MATTHEW", {
                color: "#fff",
                fontFamily: "var(--xp-font-grotesk)",
                fontSize: "clamp(.37rem,.49vw,.53rem)",
                fontWeight: 800,
                textAlign: "center",
                lineHeight: 1.12,
                whiteSpace: "pre-line",
                marginBottom: ".35rem",
              }, "h3"),
              text("chef-matthew-copy", "Favourite Food: Pizza\n\nFavourite place to visit: The bush\n\nFavourite ingredient: Fresh herbs\n\nBest advice: Keep it simple and let great produce do the work.", {
                color: "#fff",
                fontFamily: "var(--xp-font-editorial)",
                fontSize: "clamp(.28rem,.38vw,.42rem)",
                lineHeight: 1.35,
                whiteSpace: "pre-line",
              }),
            ],
          },

          text("food-brand-left", "STEYN CITY", {
            position: "absolute", left: "7.8%", bottom: "2.1%", color: "#342f2b",
            fontFamily: "var(--xp-font-grotesk)", fontSize: ".42rem", fontWeight: 720, letterSpacing: ".08em",
          }, "span"),
          text("food-folio-left", "24", {
            position: "absolute", left: "4.6%", bottom: "2.1%", color: "#342f2b",
            fontFamily: "var(--xp-font-grotesk)", fontSize: ".45rem", fontWeight: 800,
          }, "span"),
          text("food-brand-right", "STEYN CITY", {
            position: "absolute", right: "6.5%", bottom: "2.1%", color: "#342f2b",
            fontFamily: "var(--xp-font-grotesk)", fontSize: ".42rem", fontWeight: 720, letterSpacing: ".08em",
          }, "span"),
          text("food-folio-right", "25", {
            position: "absolute", right: "3.2%", bottom: "2.1%", color: "#342f2b",
            fontFamily: "var(--xp-font-grotesk)", fontSize: ".45rem", fontWeight: 800,
          }, "span"),
        ],
      },

      mediaPiece(
        "steyn-food-pasta-piece",
        "food-pasta",
        "Café del Sol pasta",
        image("food-pasta-image", pasta, "Fresh pasta at Café del Sol", {
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center",
        }),
        { position: "absolute", left: "18.7%", top: 0, width: "31.8%", height: "46.1%", zIndex: 6 },
        true,
      ),

      {
        id: "steyn-food-green-bubble-piece",
        slug: "food-green-bubble",
        title: "Dining options",
        kind: "feature",
        region: "spread",
        gutterBehaviour: "clip",
        engagement: noEngagement,
        style: {
          position: "absolute",
          left: "15.1%",
          top: "4.6%",
          width: "11.6%",
          aspectRatio: "1 / 1",
          zIndex: 30,
          overflow: "visible",
          background: "transparent",
        },
        elements: [
          {
            id: "food-green-bubble",
            type: "frame",
            style: {
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "#3e9d4f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: ".8rem",
              boxShadow: "0 8px 20px rgba(0,0,0,.08)",
            },
            children: [
              text("food-green-bubble-copy", "FROM\nMEDITERRANEAN\nMOOD TO DECADENT\nTREATS, STEYN CITY’S\nDINING OPTIONS ARE\nHERE TO MEET\nEVERY CRAVING", {
                color: "#fff",
                fontFamily: "var(--xp-font-grotesk)",
                fontSize: "clamp(.27rem,.39vw,.43rem)",
                fontWeight: 760,
                lineHeight: 1.2,
                textAlign: "center",
                whiteSpace: "pre-line",
              }, "span"),
            ],
          },
        ],
      },

      {
        id: "steyn-food-pasta-video-piece",
        slug: "food-pasta-video",
        title: "Pasta in motion",
        kind: "feature",
        region: "spread",
        gutterBehaviour: "clip",
        engagement: noEngagement,
        style: {
          position: "absolute",
          left: "38.5%",
          top: "4.8%",
          width: "9.6%",
          aspectRatio: "9 / 16",
          zIndex: 9,
          overflow: "hidden",
          border: "2px solid rgba(255,255,255,.9)",
          boxShadow: "0 8px 24px rgba(0,0,0,.18)",
          background: "#111",
        },
        elements: [
          video("food-pasta-video", pastaVideo, "Short pasta cooking video", {
            position: "absolute", inset: 0, objectFit: "cover", objectPosition: "center center",
          }),
        ],
      },

      mediaPiece(
        "steyn-food-luciana-piece",
        "food-luciana",
        "Luciana",
        image("food-luciana-image", luciana, "Luciana cooking", {
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 34%",
        }),
        { position: "absolute", left: "53.9%", top: 0, width: "11.8%", height: "24.7%", zIndex: 7 },
        false,
      ),

      mediaPiece(
        "steyn-food-breakfast-piece",
        "food-breakfast",
        "Breakfast at Steyn City",
        image("food-breakfast-image", breakfast, "Breakfast overlooking the golf course", {
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 50%",
        }),
        { position: "absolute", left: "67.0%", top: 0, width: "33%", height: "46.0%", zIndex: 6 },
        false,
      ),

      {
        id: "steyn-food-sushi-video-piece",
        slug: "food-sushi-video",
        title: "Sushi craft",
        kind: "feature",
        region: "spread",
        gutterBehaviour: "clip",
        engagement,
        style: {
          position: "absolute",
          left: "54.1%",
          bottom: 0,
          width: "17.6%",
          height: "24.8%",
          zIndex: 7,
          overflow: "hidden",
          background: "#111",
        },
        elements: [
          image("food-sushi-poster", sushi, "Sushi platter", {
            position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center",
          }),
          {
            id: "food-sushi-video-inner",
            type: "frame",
            style: {
              position: "absolute",
              right: "5%",
              top: "6%",
              width: "42%",
              aspectRatio: "9 / 16",
              overflow: "hidden",
              border: "2px solid rgba(255,255,255,.92)",
              boxShadow: "0 8px 22px rgba(0,0,0,.24)",
              zIndex: 5,
              background: "#000",
            },
            children: [
              video("food-sushi-video", sushiVideo, "Short sushi preparation video", {
                position: "absolute", inset: 0, objectFit: "cover", objectPosition: "center center",
              }),
            ],
          },
        ],
      },

      mediaPiece(
        "steyn-food-drink-piece",
        "food-drink",
        "Signature drink",
        image("food-drink-image", greenDrink, "Signature green drink", {
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center",
        }),
        { position: "absolute", left: "62.2%", top: "65.6%", width: "9.4%", aspectRatio: "1 / 1", borderRadius: "50%", zIndex: 10, outline: "4px solid #fff" },
        false,
      ),

      mediaPiece(
        "steyn-food-chef-piece",
        "food-chef-matthew",
        "Chef Matthew Foxon",
        image("food-chef-image", chefMatthew, "Chef Matthew Foxon", {
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%",
        }),
        { position: "absolute", right: "4.3%", top: "45.1%", width: "12.1%", aspectRatio: "1 / 1", borderRadius: "50%", zIndex: 10, outline: "5px solid #fff" },
        false,
      ),

      {
        id: "steyn-food-mobile-left-piece",
        slug: "food-mobile-left",
        title: "All Things Delicious",
        kind: "article",
        region: "left",
        gutterBehaviour: "clip",
        engagement,
        style: {
          position: "absolute",
          left: "2.8%",
          top: "3.5%",
          width: "44.4%",
          height: "93%",
          display: "none",
          background: "#fbfaf7",
          zIndex: 70,
          padding: "clamp(.95rem,3.8vw,1.4rem)",
          overflow: "auto",
        },
        elements: [
          text("food-mobile-kicker", "FOOD", {
            color: "#655d56",
            fontFamily: "var(--xp-font-grotesk)",
            fontSize: ".78rem",
            fontWeight: 800,
            letterSpacing: ".13em",
            marginBottom: ".55rem",
          }, "span"),
          image("food-mobile-pasta", pasta, "Fresh pasta", {
            width: "100%", height: "11.5rem", objectFit: "cover", marginBottom: ".75rem",
          }),
          text("food-mobile-title", "ALL THINGS\nDELICIOUS", {
            color: "#342d28",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1.5rem,6.5vw,2rem)",
            lineHeight: .98,
            whiteSpace: "pre-line",
            marginBottom: ".65rem",
          }, "h2"),
          {
            id: "food-mobile-copy",
            type: "text",
            props: {
              as: "p",
              text: "From long lunches and family favourites to polished dinners and coffee on the run, Steyn City’s dining culture is built around variety, convenience and generous hospitality.",
              dropCap: true,
              dropCapLines: 4,
              dropCapColor: "#342d28",
            },
            style: {
              color: "#463f3a",
              fontFamily: "var(--xp-font-editorial)",
              fontSize: "clamp(1rem,3.8vw,1.14rem)",
              lineHeight: 1.55,
              marginBottom: ".8rem",
            },
          },
          video("food-mobile-pasta-video", pastaVideo, "Short pasta cooking video", {
            width: "100%", height: "10rem", objectFit: "cover", marginBottom: ".8rem",
          }),
          image("food-mobile-luciana", luciana, "Luciana cooking", {
            width: "100%", height: "10rem", objectFit: "cover", objectPosition: "center 32%",
          }),
        ],
      },

      {
        id: "steyn-food-mobile-right-piece",
        slug: "food-mobile-right",
        title: "Food at Steyn City",
        kind: "article",
        region: "right",
        gutterBehaviour: "clip",
        engagement: noEngagement,
        style: {
          position: "absolute",
          left: "52.8%",
          top: "3.5%",
          width: "44.4%",
          height: "93%",
          display: "none",
          background: "#fbfaf7",
          zIndex: 70,
          padding: "clamp(.9rem,3.6vw,1.35rem)",
          overflow: "auto",
        },
        elements: [
          image("food-mobile-breakfast", breakfast, "Breakfast overlooking the golf course", {
            width: "100%", height: "11rem", objectFit: "cover", marginBottom: ".75rem",
          }),
          text("food-mobile-right-heading", "TABLES WORTH\nLINGERING AT", {
            color: "#342d28",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1.45rem,6.2vw,1.95rem)",
            lineHeight: .98,
            whiteSpace: "pre-line",
            marginBottom: ".7rem",
          }, "h2"),
          text("food-mobile-right-copy", "From Nineteen’s clubhouse setting to beautifully presented sushi and signature drinks, the food offering feels as considered as the landscape around it.", {
            color: "#463f3a",
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1rem,3.8vw,1.14rem)",
            lineHeight: 1.55,
            marginBottom: ".8rem",
          }),
          video("food-mobile-sushi-video", sushiVideo, "Short sushi preparation video", {
            width: "100%", height: "10rem", objectFit: "cover", marginBottom: ".8rem",
          }),
          {
            id: "food-mobile-right-grid",
            type: "grid",
            style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".55rem" },
            children: [
              image("food-mobile-sushi", sushi, "Sushi platter", { width: "100%", height: "8rem", objectFit: "cover" }),
              image("food-mobile-chef", chefMatthew, "Chef Matthew Foxon", { width: "100%", height: "8rem", objectFit: "cover", objectPosition: "center 30%" }),
            ],
          },
        ],
      },
    ],
  };
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
      text(`${id}-ghost`, String(pageNo).padStart(2, "0"), {
        color: tone.accent,
        fontFamily: sans,
        fontSize: "clamp(10rem,25vw,25rem)",
        fontWeight: 850,
        lineHeight: .7,
        letterSpacing: "-.09em",
        position: "absolute",
        right: "-2%",
        top: "3%",
        opacity: .12,
      }, "span"),
      text(`${id}-orb`, "●", {
        color: tone.accent,
        fontSize: "clamp(9rem,20vw,20rem)",
        lineHeight: .6,
        position: "absolute",
        right: "7%",
        bottom: "7%",
        opacity: .2,
      }, "span"),
      label(`${id}-meta`, `STEYN CITY · 2026 · ${String(pageNo).padStart(2, "0")}`, tone.accent),
      text(`${id}-title`, labelText, {
        color: tone.ink,
        fontFamily: serif,
        fontSize: "clamp(3.4rem,8vw,8rem)",
        lineHeight: .78,
        letterSpacing: "-.065em",
        marginTop: "auto",
        whiteSpace: "pre-line",
        maxWidth: "88%",
        position: "relative",
        zIndex: 2,
      }, "h2"),
      text(`${id}-note`, "STEYN CITY · EXTRAORDINARY LIVING · 2026", {
        color: tone.ink,
        fontSize: ".58rem",
        fontWeight: 780,
        letterSpacing: ".14em",
        lineHeight: 1.4,
        opacity: .68,
        maxWidth: "28rem",
        position: "relative",
        zIndex: 2,
      }, "span"),
    ], {
      display: "flex",
      flexDirection: "column",
      position: "relative",
      background: `linear-gradient(145deg, ${tone.bg} 0%, ${tone.soft ?? tone.bg} 100%)`,
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
    insideFrontGalleryPage(issueId),
    insideFrontPropertyPage(issueId),
    heroPage(issueId, 4, "opening-i", "2026 EDITION", "AN EXTRAORDINARY\nCITY WITHIN A CITY", "A new XpoMag treatment of Steyn City’s 2026 magazine — rebuilt as a living, interactive editorial experience.", forest, { number: "26", numberLabel: "THE 2026 EDITION" }),
    editorialPage(issueId, 5, "opening-ii", "INTRODUCTION", "THE YEAR\nIN VIEW", "A calm editorial opener for the estate, its people, its landscape and the year’s defining stories.", paper),
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
    spreads: [cityLivingSpread(issueId), bentleyAdvertSpread(issueId), contentsGolfSpread(issueId), golfTraditionSpread(issueId), golfTraditionContinuationSpread(issueId), cyclingSpread(issueId), seniorVillageSpread(issueId), easyLifeSpread(issueId), birdsBeesSpread(issueId), liveYourDreamsSpread(issueId), rentalCheninSpread(issueId), allThingsDeliciousSpread(issueId)],
    pages,
  };
}
