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
    spreads: [cityLivingSpread(issueId), bentleyAdvertSpread(issueId), contentsGolfSpread(issueId), golfTraditionSpread(issueId), golfTraditionContinuationSpread(issueId)],
    pages,
  };
}
