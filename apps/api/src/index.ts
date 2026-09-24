import { loadApiEnv } from "./lib/load-env.js";

loadApiEnv();

import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { edgeLocationSignal } from "./modules/location/request-location.js";
import { z } from "zod";
import { mountBetterAuth } from "./auth-bootstrap.js";
import { accountRouter } from "./routes/account.js";
import { getComposition, getRevisions, publishDraft, saveDraft } from "./modules/composer/repository.js";
import { addComment, createCollection, deleteComment, getEngagementSummary, getSaveCollectionsForTarget, listCollections, listComments, listSavedItems, recordShare, setReaction, setSaved, setSavedCollections } from "./modules/engagement/repository.js";


const reactionSchema = z.enum(["like", "love", "insightful", "celebrate"]);

function parseCookie(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (rawKey === name) return decodeURIComponent(rawValue.join("="));
  }
  return null;
}

function viewerId(req: Request) {
  // Legacy cookie support while old local sessions age out. New auth is Better Auth
  // and is resolved by the Next.js same-origin engagement bridge.
  const cookieUserId = parseCookie(req.headers.cookie, "xpomag_user_id");
  if (cookieUserId) return cookieUserId;

  const headerUserId = req.header("x-xpomag-user-id");
  if (!headerUserId) return null;

  const configuredSecret = process.env.ENGAGEMENT_INTERNAL_SECRET;
  if (configuredSecret) {
    return req.header("x-xpomag-internal-key") === configuredSecret ? headerUserId : null;
  }

  // Local development only. In production set ENGAGEMENT_INTERNAL_SECRET in both
  // frontend and API environments so arbitrary callers cannot impersonate users.
  if (process.env.NODE_ENV !== "production" || process.env.ALLOW_DEV_AUTH_HEADER === "true") {
    return headerUserId;
  }

  return null;
}

function requireViewer(req: Request, res: Response) {
  const userId = viewerId(req);
  if (!userId) {
    res.status(401).json({ ok: false, error: "Authentication required" });
    return null;
  }
  return userId;
}

const engagementParamsSchema = z.object({
  issueSlug: z.string().min(1).max(120),
  pageSlug: z.string().min(1).max(120),
  sectionId: z.string().min(1).max(160),
});

function engagementTarget(req: Request) {
  return engagementParamsSchema.parse(req.params);
}

const app = express();

const port = Number(process.env.PORT ?? 4000);

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: process.env.WEB_ORIGIN?.split(",") ?? true, credentials: true }));
app.use(pinoHttp());

// Better Auth needs the raw request stream, so mount it before express.json().
mountBetterAuth(app);

app.use(express.json({ limit: "1mb" }));
app.use("/api/account", accountRouter);

app.get("/health", (_req, res) => res.json({ ok: true, service: "xpomag-api" }));
app.get("/v1/location", (req, res) => res.json(edgeLocationSignal(req)));
const composerDocumentSchema = z.object({
  id: z.string().min(1),
  issueId: z.string().min(1),
  pageId: z.string().min(1),
  pageSlug: z.string().min(1),
  title: z.string().min(1),
  canvas: z.object({ width: z.number().positive(), height: z.number().positive() }),
  background: z.array(z.any()),
  nodes: z.array(z.any()),
  updatedAt: z.string().min(1),
}).passthrough();

app.get("/v1/composer/:issueSlug/:pageSlug", async (req, res, next) => {
  try {
    const state = await getComposition(req.params.issueSlug, req.params.pageSlug);
    res.json({ ok: true, state });
  } catch (error) { next(error); }
});

app.put("/v1/composer/:issueSlug/:pageSlug/draft", async (req, res, next) => {
  try {
    const document = composerDocumentSchema.parse(req.body?.document);
    const state = await saveDraft(req.params.issueSlug, req.params.pageSlug, document as any, req.body?.createRevision !== false);
    res.json({ ok: true, state });
  } catch (error) { next(error); }
});

app.post("/v1/composer/:issueSlug/:pageSlug/publish", async (req, res, next) => {
  try {
    const document = req.body?.document ? composerDocumentSchema.parse(req.body.document) : undefined;
    const state = await publishDraft(req.params.issueSlug, req.params.pageSlug, document as any);
    res.json({ ok: true, state });
  } catch (error) { next(error); }
});

app.get("/v1/composer/:issueSlug/:pageSlug/revisions", async (req, res, next) => {
  try {
    const revisions = await getRevisions(req.params.issueSlug, req.params.pageSlug);
    res.json({ ok: true, revisions });
  } catch (error) { next(error); }
});



app.get("/v1/engagement/collections", async (req, res, next) => {
  try {
    const userId = requireViewer(req, res);
    if (!userId) return;
    res.json({ ok: true, collections: await listCollections(userId) });
  } catch (error) { next(error); }
});

app.post("/v1/engagement/collections", async (req, res, next) => {
  try {
    const userId = requireViewer(req, res);
    if (!userId) return;
    const { name } = z.object({ name: z.string().trim().min(1).max(80) }).parse(req.body);
    res.status(201).json({ ok: true, collection: await createCollection(userId, name) });
  } catch (error) { next(error); }
});

app.get("/v1/engagement/me/saves", async (req, res, next) => {
  try {
    const userId = requireViewer(req, res);
    if (!userId) return;
    res.json({ ok: true, collections: await listCollections(userId), items: await listSavedItems(userId) });
  } catch (error) { next(error); }
});

app.get("/v1/engagement/:issueSlug/:pageSlug/:sectionId", async (req, res, next) => {
  try {
    const summary = await getEngagementSummary(engagementTarget(req), viewerId(req));
    res.json({ ok: true, summary });
  } catch (error) { next(error); }
});

app.put("/v1/engagement/:issueSlug/:pageSlug/:sectionId/reaction", async (req, res, next) => {
  try {
    const userId = requireViewer(req, res);
    if (!userId) return;
    const reaction = z.union([reactionSchema, z.null()]).parse(req.body?.reaction ?? null);
    const summary = await setReaction(engagementTarget(req), userId, reaction);
    res.json({ ok: true, summary });
  } catch (error) { next(error); }
});

app.get("/v1/engagement/:issueSlug/:pageSlug/:sectionId/comments", async (req, res, next) => {
  try {
    const comments = await listComments(engagementTarget(req));
    res.json({ ok: true, comments });
  } catch (error) { next(error); }
});

app.post("/v1/engagement/:issueSlug/:pageSlug/:sectionId/comments", async (req, res, next) => {
  try {
    const userId = requireViewer(req, res);
    if (!userId) return;
    const input = z.object({ body: z.string().trim().min(1).max(2000), parentId: z.string().uuid().nullable().optional() }).parse(req.body);
    const comment = await addComment(engagementTarget(req), userId, input.body, input.parentId);
    res.status(201).json({ ok: true, comment });
  } catch (error) { next(error); }
});

app.delete("/v1/engagement/:issueSlug/:pageSlug/:sectionId/comments/:commentId", async (req, res, next) => {
  try {
    const userId = requireViewer(req, res);
    if (!userId) return;
    const commentId = z.string().uuid().parse(req.params.commentId);
    const summary = await deleteComment(engagementTarget(req), userId, commentId);
    res.json({ ok: true, summary });
  } catch (error) { next(error); }
});

app.post("/v1/engagement/:issueSlug/:pageSlug/:sectionId/share", async (req, res, next) => {
  try {
    const userId = requireViewer(req, res);
    if (!userId) return;
    const { channel } = z.object({ channel: z.string().trim().min(1).max(40).default("copy") }).parse(req.body ?? {});
    const summary = await recordShare(engagementTarget(req), userId, channel);
    res.json({ ok: true, summary });
  } catch (error) { next(error); }
});

app.get("/v1/engagement/:issueSlug/:pageSlug/:sectionId/save/collections", async (req, res, next) => {
  try {
    const userId = requireViewer(req, res);
    if (!userId) return;
    res.json({ ok: true, ...(await getSaveCollectionsForTarget(engagementTarget(req), userId)) });
  } catch (error) { next(error); }
});

app.put("/v1/engagement/:issueSlug/:pageSlug/:sectionId/save", async (req, res, next) => {
  try {
    const userId = requireViewer(req, res);
    if (!userId) return;
    const input = z.union([
      z.object({ collectionIds: z.array(z.string().uuid()).max(50) }),
      z.object({ saved: z.boolean(), collectionName: z.string().trim().min(1).max(80).optional() }),
    ]).parse(req.body);
    if ("collectionIds" in input) {
      res.json({ ok: true, ...(await setSavedCollections(engagementTarget(req), userId, input.collectionIds)) });
    } else {
      const summary = await setSaved(engagementTarget(req), userId, input.saved, input.collectionName);
      res.json({ ok: true, summary });
    }
  } catch (error) { next(error); }
});

app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = error instanceof z.ZodError ? 400 : Number(error?.status ?? 500);
  res.status(status).json({ ok: false, error: error?.message ?? "Unexpected error" });
});

app.listen(port, () => {
  console.log(`XpoMag API listening on http://localhost:${port}`);
});
