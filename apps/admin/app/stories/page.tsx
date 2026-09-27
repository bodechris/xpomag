import {StoryWorkspace} from "../../components/story-workspace";
export const dynamic="force-dynamic";
function origin(){return process.env.API_ORIGIN??process.env.NEXT_PUBLIC_API_ORIGIN??"http://localhost:4000"}
export default async function StoriesPage(){let stories=[];try{const r=await fetch(new URL("/v1/admin/stories",origin()),{cache:"no-store"});if(r.ok)stories=(await r.json()).stories??[]}catch{}return <StoryWorkspace initial={stories}/>}
