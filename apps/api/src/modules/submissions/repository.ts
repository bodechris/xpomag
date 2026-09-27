import { createDb } from "@xpomag/db";
import { loadApiEnv } from "../../lib/load-env.js";
loadApiEnv();

export type SubmissionStatus="INCOMING"|"REVIEWING"|"SHORTLISTED"|"RESEARCH"|"APPROVED"|"DESIGNING"|"SCHEDULED"|"PUBLISHED"|"REJECTED"|"ARCHIVED";
const connectionString=process.env.DATABASE_URL??"postgres://xpomag:xpomag@localhost:5434/xpomag";
const {pool}=createDb(connectionString);let ready:Promise<void>|null=null;
function ensureSchema(){if(!ready)ready=pool.query(`
 CREATE EXTENSION IF NOT EXISTS pgcrypto;
 CREATE TABLE IF NOT EXISTS editorial_submissions(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id text,city text NOT NULL,submission_type text NOT NULL,contributor_type text NOT NULL,
 title text NOT NULL,summary text NOT NULL,story text,links text,contact_name text NOT NULL,contact_email text NOT NULL,social_profiles text,
 desired_issue text,assets jsonb NOT NULL DEFAULT '[]'::jsonb,status text NOT NULL DEFAULT 'INCOMING',
 editor_notes text,assigned_issue text,neighbourhood text,category text,ai_summary text,ai_missing_info text[],created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
 CREATE INDEX IF NOT EXISTS editorial_submissions_status_idx ON editorial_submissions(status,created_at DESC);
 CREATE INDEX IF NOT EXISTS editorial_submissions_city_idx ON editorial_submissions(city,created_at DESC);
 ALTER TABLE editorial_submissions ADD COLUMN IF NOT EXISTS assigned_issue text;
 ALTER TABLE editorial_submissions ADD COLUMN IF NOT EXISTS neighbourhood text;
 ALTER TABLE editorial_submissions ADD COLUMN IF NOT EXISTS category text;
 ALTER TABLE editorial_submissions ADD COLUMN IF NOT EXISTS ai_summary text;
 ALTER TABLE editorial_submissions ADD COLUMN IF NOT EXISTS ai_missing_info text[];
`).then(()=>undefined);return ready}
function map(r:any){return{id:r.id,userId:r.user_id??null,city:r.city,submissionType:r.submission_type,contributorType:r.contributor_type,title:r.title,summary:r.summary,story:r.story??null,links:r.links??null,contactName:r.contact_name,contactEmail:r.contact_email,socialProfiles:r.social_profiles??null,desiredIssue:r.desired_issue??null,assets:r.assets??[],status:r.status,editorNotes:r.editor_notes??null,assignedIssue:r.assigned_issue??null,neighbourhood:r.neighbourhood??null,category:r.category??null,aiSummary:r.ai_summary??null,aiMissingInfo:r.ai_missing_info??[],createdAt:new Date(r.created_at).toISOString(),updatedAt:new Date(r.updated_at).toISOString()}}
export type SubmissionInput={city:string;submissionType:string;contributorType:string;title:string;summary:string;story?:string|null;links?:string|null;contactName:string;contactEmail:string;socialProfiles?:string|null;desiredIssue?:string|null;assets?:unknown[]};
export async function createSubmission(input:SubmissionInput,userId?:string|null){await ensureSchema();const r=await pool.query(`INSERT INTO editorial_submissions(user_id,city,submission_type,contributor_type,title,summary,story,links,contact_name,contact_email,social_profiles,desired_issue,assets) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb) RETURNING *`,[userId??null,input.city,input.submissionType,input.contributorType,input.title,input.summary,input.story??null,input.links??null,input.contactName,input.contactEmail,input.socialProfiles??null,input.desiredIssue??null,JSON.stringify(input.assets??[])]);return map(r.rows[0])}
export async function listSubmissions(filters:{status?:string;city?:string}={}){await ensureSchema();const vals:any[]=[];const where:string[]=[];if(filters.status){vals.push(filters.status);where.push(`status=$${vals.length}`)}if(filters.city){vals.push(filters.city);where.push(`city=$${vals.length}`)}const r=await pool.query(`SELECT * FROM editorial_submissions ${where.length?"WHERE "+where.join(" AND "):""} ORDER BY created_at DESC LIMIT 250`,vals);return r.rows.map(map)}
export async function updateSubmission(id:string,input:{status?:SubmissionStatus;editorNotes?:string|null;assignedIssue?:string|null;neighbourhood?:string|null;category?:string|null;aiSummary?:string|null;aiMissingInfo?:string[]}){await ensureSchema();const r=await pool.query(`UPDATE editorial_submissions SET status=COALESCE($2,status),editor_notes=COALESCE($3,editor_notes),assigned_issue=COALESCE($4,assigned_issue),neighbourhood=COALESCE($5,neighbourhood),category=COALESCE($6,category),ai_summary=COALESCE($7,ai_summary),ai_missing_info=COALESCE($8,ai_missing_info),updated_at=now() WHERE id=$1 RETURNING *`,[id,input.status??null,input.editorNotes??null,input.assignedIssue??null,input.neighbourhood??null,input.category??null,input.aiSummary??null,input.aiMissingInfo??null]);return r.rows[0]?map(r.rows[0]):null}
export async function updateSubmissionStatus(id:string,status:SubmissionStatus,editorNotes?:string|null){return updateSubmission(id,{status,editorNotes})}
