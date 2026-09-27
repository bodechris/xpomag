import { loadApiEnv } from "./lib/load-env.js";
// Workspace runtime packages are built by the API prebuild step before deployment.

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
import { getPublication, listPublications, setPublicationFollow, upsertPublication } from "./modules/publications/repository.js";
import { createSubmission, listSubmissions, updateSubmission } from "./modules/submissions/repository.js";
import { createStoryFromSubmission, listStories, updateStory } from "./modules/stories/repository.js";


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



const publicationInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  type: z.enum(["CITY","INTEREST","COMMUNITY"]).default("CITY"),
  city: z.string().trim().max(120).nullable().optional(),
  country: z.string().trim().max(120).nullable().optional(),
  countryCode: z.string().trim().max(3).nullable().optional(),
  description: z.string().trim().max(600).nullable().optional(),
  tagline: z.string().trim().max(180).nullable().optional(),
  coverImage: z.string().trim().max(1000).nullable().optional(),
  logo: z.string().trim().max(1000).nullable().optional(),
  status: z.enum(["DRAFT","COMING_SOON","ACTIVE","ARCHIVED"]).default("DRAFT"),
  launchDate: z.string().date().nullable().optional(),
  featured: z.boolean().default(false),
});

app.get("/v1/publications", async (req,res,next) => {
  try { res.json({ ok:true, publications: await listPublications(viewerId(req), req.query.admin === "1") }); }
  catch (error) { next(error); }
});
app.get("/v1/publications/:slug", async (req,res,next) => {
  try {
    const publication = await getPublication(req.params.slug, viewerId(req));
    if (!publication) return res.status(404).json({ ok:false,error:"Publication not found" });
    res.json({ ok:true, publication });
  } catch (error) { next(error); }
});
app.put("/v1/publications/:slug/follow", async (req,res,next) => {
  try {
    const userId=requireViewer(req,res); if(!userId) return;
    const { following }=z.object({ following:z.boolean() }).parse(req.body);
    res.json({ ok:true, publication: await setPublicationFollow(req.params.slug,userId,following) });
  } catch(error){ next(error); }
});
app.post("/v1/admin/publications", async (req,res,next) => {
  try { res.status(201).json({ ok:true, publication: await upsertPublication(publicationInputSchema.parse(req.body)) }); }
  catch(error){ next(error); }
});

const submissionSchema=z.object({city:z.string().trim().min(2).max(120),submissionType:z.enum(["STORY","PERSON","BUSINESS","PLACE","EVENT","NEWS","PHOTO_STORY","VIDEO","PRODUCT_LAUNCH","COMMUNITY_STORY","OTHER"]),contributorType:z.enum(["INDIVIDUAL","BUSINESS","BRAND","CREATOR","JOURNALIST","PR_AGENCY","MEDIA_ORGANISATION","NONPROFIT","GOVERNMENT_INSTITUTION","OTHER"]),title:z.string().trim().min(4).max(180),summary:z.string().trim().min(20).max(1600),story:z.string().trim().max(12000).nullable().optional(),links:z.string().trim().max(3000).nullable().optional(),contactName:z.string().trim().min(2).max(120),contactEmail:z.string().email().max(200),socialProfiles:z.string().trim().max(1500).nullable().optional(),desiredIssue:z.string().trim().max(120).nullable().optional(),assets:z.array(z.any()).max(20).optional()});
app.post("/v1/submissions",async(req,res,next)=>{try{const submission=await createSubmission(submissionSchema.parse(req.body),viewerId(req));res.status(201).json({ok:true,submission})}catch(error){next(error)}});
app.get("/v1/admin/submissions",async(req,res,next)=>{try{res.json({ok:true,submissions:await listSubmissions({status:typeof req.query.status==="string"?req.query.status:undefined,city:typeof req.query.city==="string"?req.query.city:undefined})})}catch(error){next(error)}});
app.patch("/v1/admin/submissions/:id",async(req,res,next)=>{try{const input=z.object({status:z.enum(["INCOMING","REVIEWING","SHORTLISTED","RESEARCH","APPROVED","DESIGNING","SCHEDULED","PUBLISHED","REJECTED","ARCHIVED"]).optional(),editorNotes:z.string().max(4000).nullable().optional(),assignedIssue:z.string().max(120).nullable().optional(),neighbourhood:z.string().max(120).nullable().optional(),category:z.string().max(120).nullable().optional(),aiSummary:z.string().max(2000).nullable().optional(),aiMissingInfo:z.array(z.string().max(240)).max(12).optional()}).parse(req.body);const submission=await updateSubmission(req.params.id,input);if(!submission)return res.status(404).json({ok:false,error:"Submission not found"});res.json({ok:true,submission})}catch(error){next(error)}});

app.post("/v1/admin/submissions/:id/story",async(req,res,next)=>{try{const input=z.object({publicationSlug:z.string().trim().min(1).max(120),issueLabel:z.string().trim().min(1).max(120),kind:z.enum(["EDITORIAL","SPONSORED"]).default("EDITORIAL")}).parse(req.body);res.status(201).json({ok:true,story:await createStoryFromSubmission(req.params.id,input)})}catch(error){next(error)}});
app.get("/v1/admin/stories",async(req,res,next)=>{try{res.json({ok:true,stories:await listStories({status:typeof req.query.status==="string"?req.query.status:undefined,publicationSlug:typeof req.query.publicationSlug==="string"?req.query.publicationSlug:undefined})})}catch(error){next(error)}});
app.patch("/v1/admin/stories/:id",async(req,res,next)=>{try{const input=z.object({title:z.string().trim().min(1).max(180).optional(),dek:z.string().max(1600).nullable().optional(),body:z.string().max(20000).nullable().optional(),category:z.string().max(120).nullable().optional(),neighbourhood:z.string().max(120).nullable().optional(),authorName:z.string().max(120).nullable().optional(),kind:z.enum(["EDITORIAL","SPONSORED"]).optional(),sponsorshipLabel:z.string().max(120).nullable().optional(),status:z.enum(["DRAFT","READY_FOR_DESIGN","SCHEDULED","PUBLISHED","ARCHIVED"]).optional(),scheduledAt:z.string().datetime().nullable().optional()}).parse(req.body);const story=await updateStory(req.params.id,input);if(!story)return res.status(404).json({ok:false,error:"Story not found"});res.json({ok:true,story})}catch(error){next(error)}});

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
