import {EditorialQueue} from "../../components/editorial-queue";
export const dynamic="force-dynamic";
function origin(){return process.env.API_ORIGIN??process.env.NEXT_PUBLIC_API_ORIGIN??"http://localhost:4000"}
export default async function EditorialPage(){let submissions=[];try{const r=await fetch(new URL("/v1/admin/submissions",origin()),{cache:"no-store"});if(r.ok)submissions=(await r.json()).submissions??[]}catch{}return <EditorialQueue initial={submissions}/>}
