import { createDb } from "@xpomag/db";
import { loadApiEnv } from "../../lib/load-env.js";
loadApiEnv();

export type StoryStatus="DRAFT"|"READY_FOR_DESIGN"|"SCHEDULED"|"PUBLISHED"|"ARCHIVED";
export type StoryKind="EDITORIAL"|"SPONSORED";
const connectionString=process.env.DATABASE_URL??"postgres://xpomag:xpomag@localhost:5434/xpomag";
const {pool}=createDb(connectionString);let ready:Promise<void>|null=null;
function ensureSchema(){if(!ready)ready=pool.query(`
 CREATE EXTENSION IF NOT EXISTS pgcrypto;
 CREATE TABLE IF NOT EXISTS editorial_stories(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_submission_id uuid UNIQUE REFERENCES editorial_submissions(id) ON DELETE SET NULL,
  publication_slug text NOT NULL,issue_label text NOT NULL,slug text NOT NULL,
  title text NOT NULL,dek text,body text,category text,neighbourhood text,
  author_name text,source_name text,source_email text,source_links text,
  kind text NOT NULL DEFAULT 'EDITORIAL' CHECK(kind IN ('EDITORIAL','SPONSORED')),
  sponsorship_label text,status text NOT NULL DEFAULT 'DRAFT',
  scheduled_at timestamptz,published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(publication_slug,issue_label,slug)
 );
 CREATE INDEX IF NOT EXISTS editorial_stories_issue_idx ON editorial_stories(publication_slug,issue_label,status);
`).then(()=>undefined);return ready}
function map(r:any){return{id:r.id,sourceSubmissionId:r.source_submission_id??null,publicationSlug:r.publication_slug,issueLabel:r.issue_label,slug:r.slug,title:r.title,dek:r.dek??null,body:r.body??null,category:r.category??null,neighbourhood:r.neighbourhood??null,authorName:r.author_name??null,sourceName:r.source_name??null,sourceEmail:r.source_email??null,sourceLinks:r.source_links??null,kind:r.kind,sponsorshipLabel:r.sponsorship_label??null,status:r.status,scheduledAt:r.scheduled_at?new Date(r.scheduled_at).toISOString():null,publishedAt:r.published_at?new Date(r.published_at).toISOString():null,createdAt:new Date(r.created_at).toISOString(),updatedAt:new Date(r.updated_at).toISOString()}}
function slugify(v:string){return v.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,90)||"story"}
export async function createStoryFromSubmission(id:string,input:{publicationSlug:string;issueLabel:string;kind?:StoryKind}){await ensureSchema();const client=await pool.connect();try{await client.query("BEGIN");const sr=await client.query("SELECT * FROM editorial_submissions WHERE id=$1 FOR UPDATE",[id]);const s=sr.rows[0];if(!s)throw Object.assign(new Error("Submission not found"),{status:404});if(!["APPROVED","DESIGNING","SCHEDULED","PUBLISHED"].includes(s.status))throw Object.assign(new Error("Approve the submission before creating a story"),{status:409});const existing=await client.query("SELECT * FROM editorial_stories WHERE source_submission_id=$1 LIMIT 1",[id]);if(existing.rows[0]){await client.query("COMMIT");return map(existing.rows[0])}let slug=slugify(s.title);const dupe=await client.query("SELECT 1 FROM editorial_stories WHERE publication_slug=$1 AND issue_label=$2 AND slug=$3",[input.publicationSlug,input.issueLabel,slug]);if(dupe.rows[0])slug=`${slug}-${id.slice(0,6)}`;const r=await client.query(`INSERT INTO editorial_stories(source_submission_id,publication_slug,issue_label,slug,title,dek,body,category,neighbourhood,author_name,source_name,source_email,source_links,kind,sponsorship_label,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'DRAFT') RETURNING *`,[id,input.publicationSlug,input.issueLabel,slug,s.title,s.summary,s.story||s.summary,s.category,s.neighbourhood,s.contact_name,s.contact_name,s.contact_email,s.links,input.kind??"EDITORIAL",(input.kind??"EDITORIAL")==="SPONSORED"?"Sponsored":null]);await client.query("UPDATE editorial_submissions SET status='DESIGNING',assigned_issue=$2,updated_at=now() WHERE id=$1",[id,input.issueLabel]);await client.query("COMMIT");return map(r.rows[0])}catch(e){await client.query("ROLLBACK");throw e}finally{client.release()}}
export async function listStories(filters:{status?:string;publicationSlug?:string}={}){await ensureSchema();const vals:any[]=[];const where:string[]=[];if(filters.status){vals.push(filters.status);where.push(`status=$${vals.length}`)}if(filters.publicationSlug){vals.push(filters.publicationSlug);where.push(`publication_slug=$${vals.length}`)}const r=await pool.query(`SELECT * FROM editorial_stories ${where.length?"WHERE "+where.join(" AND "):""} ORDER BY created_at DESC LIMIT 250`,vals);return r.rows.map(map)}
export async function updateStory(id:string,input:{title?:string;dek?:string|null;body?:string|null;category?:string|null;neighbourhood?:string|null;authorName?:string|null;kind?:StoryKind;sponsorshipLabel?:string|null;status?:StoryStatus;scheduledAt?:string|null}){await ensureSchema();const r=await pool.query(`UPDATE editorial_stories SET title=COALESCE($2,title),dek=COALESCE($3,dek),body=COALESCE($4,body),category=COALESCE($5,category),neighbourhood=COALESCE($6,neighbourhood),author_name=COALESCE($7,author_name),kind=COALESCE($8,kind),sponsorship_label=COALESCE($9,sponsorship_label),status=COALESCE($10,status),scheduled_at=COALESCE($11::timestamptz,scheduled_at),published_at=CASE WHEN $10='PUBLISHED' AND published_at IS NULL THEN now() ELSE published_at END,updated_at=now() WHERE id=$1 RETURNING *`,[id,input.title??null,input.dek??null,input.body??null,input.category??null,input.neighbourhood??null,input.authorName??null,input.kind??null,input.sponsorshipLabel??null,input.status??null,input.scheduledAt??null]);return r.rows[0]?map(r.rows[0]):null}
