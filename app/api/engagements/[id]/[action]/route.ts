import {NextRequest,NextResponse} from "next/server";
import {Prisma} from "@prisma/client";
import {z} from "zod";
import {db} from "@/lib/db";
import {getEngagement} from "@/lib/data";
import {hasAI,structured} from "@/lib/ai";
import {answerSchema,audienceDefinitionSchema,brandSchema,propertySchema} from "@/lib/validation";
import {discoveryMarkdown,seedAudiences} from "@/lib/seed-data";
import {getSocialGlass} from "@/lib/socialglass/adapter";
export const runtime="nodejs";
export const maxDuration=300;
const json=(value:unknown)=>JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
export async function POST(req:NextRequest,{params}:{params:Promise<{id:string;action:string}>}){
 try{
  if(req.headers.get("origin")&&new URL(req.headers.get("origin")!).host!==req.headers.get("host"))return NextResponse.json({error:"Invalid request origin"},{status:403});
  const{id,action}=await params;const e=await getEngagement(id);if(!e)return NextResponse.json({error:"Engagement not found"},{status:404});
  const body=await req.json();let notice="Saved to your workspace.";
  switch(action){
   case "save-discovery":{
    const{answers}=z.object({answers:z.array(answerSchema).max(200)}).parse(body);
    const keys=answers.map(a=>a.questionKey+"|"+a.source);if(new Set(keys).size!==keys.length)throw Error("Each question can have only one answer per source. Choose a different source or combine the text.");
    await db.$transaction(async tx=>{await tx.discoveryAnswer.deleteMany({where:{engagementId:id}});if(answers.length)await tx.discoveryAnswer.createMany({data:answers.map(a=>({...a,engagementId:id}))});});
    notice="Discovery inputs saved. Synthesize again to refresh the brief.";break;
   }
   case "save-brand":{
    const v=z.object({name:z.string().trim().min(1).max(100),brand:brandSchema,properties:z.array(propertySchema).min(1).max(20)}).parse(body);
    await db.$transaction(async tx=>{await tx.brand.update({where:{id:e.brand.id},data:v.brand});await tx.engagement.update({where:{id},data:{name:v.name}});for(const p of v.properties){const{ id:propertyId,...data}=p;if(propertyId&&!propertyId.startsWith("new-")){if(!e.brand.properties.some(p=>p.id===propertyId))throw Error("Property does not belong to this brand.");await tx.property.update({where:{id:propertyId},data});}else await tx.property.create({data:{...data,brandId:e.brand.id}});}});notice="Brand and portfolio saved. Re-synthesize to update the discovery brief.";break;
   }
   case "save-brief":{const{markdown}=z.object({markdown:z.string().max(100000)}).parse(body);await db.engagement.update({where:{id},data:{discoveryBrief:markdown}});break;}
   case "synthesize":{
    if(!e.answers.some(a=>a.answer.trim()))throw Error("Add some discovery answers before synthesizing.");
    const result=hasAI()?await structured("discovery",e,z.object({markdown:z.string().min(100),audiences:z.array(audienceDefinitionSchema).min(4).max(6)})):{markdown:discoveryMarkdown(e.brand,e.property,e.answers),audiences:seedAudiences};
    await db.engagement.update({where:{id},data:{discoveryBrief:result.markdown,recommendations:json(result.audiences)}});notice=hasAI()?"Fresh discovery synthesis created with Claude.":"Curated demo synthesis refreshed from your inputs. Add an Anthropic key for new strategic analysis.";break;
   }
   case "recommend-audiences":{
    if(!e.discoveryBrief)throw Error("Synthesize discovery before building audiences.");
    const definitions=hasAI()?(await structured("audiences",e,z.object({audiences:z.array(audienceDefinitionSchema).min(4).max(6)}))).audiences:e.recommendations;
    if(!definitions.length)throw Error("No recommendations in this brief. Synthesize again or add an audience.");
    const existing=new Set(e.audiences.map(a=>a.name.toLowerCase()));
    await db.audience.createMany({data:definitions.filter(a=>!existing.has(a.name.toLowerCase())).map(def=>({engagementId:id,name:def.name,definition:json(def),platforms:json(def.platforms),composition:json({platformMix:[],topAffinities:[],overlaps:[]})}))});
    notice=hasAI()?"Fresh audience recommendations added. Existing segments were preserved.":"Recommended demo audiences added. Existing segments were preserved.";break;
   }
   case "save-audience":{
    const{audienceId,definition}=z.object({audienceId:z.string().optional(),definition:audienceDefinitionSchema}).parse(body);
    const data={name:definition.name,definition:json(definition),platforms:json(definition.platforms),status:"draft",size:0,composition:json({platformMix:[],topAffinities:[],overlaps:[]})};
    if(audienceId){if(!e.audiences.some(a=>a.id===audienceId))throw Error("Audience not found in this engagement.");await db.audience.update({where:{id:audienceId},data});}else await db.audience.create({data:{...data,engagementId:id}});
    notice="Audience saved as a draft. Push to SocialGlass to estimate its composition.";break;
   }
   case "push-audience":{
    const{audienceId}=z.object({audienceId:z.string()}).parse(body);const a=e.audiences.find(a=>a.id===audienceId);if(!a)throw Error("Audience not found.");
    const{size,...composition}=await getSocialGlass().createAudience(a.definition);await db.audience.update({where:{id:audienceId},data:{size,composition:json(composition),status:"live"}});notice="Audience connected to mock SocialGlass. Estimate and composition refreshed.";break;
   }
   case "delete-audience":{
    const{audienceId}=z.object({audienceId:z.string()}).parse(body);if(!e.audiences.some(a=>a.id===audienceId))throw Error("Audience not found.");await db.audience.delete({where:{id:audienceId}});notice="Audience removed. Historic snapshots were preserved.";break;
   }
   default:return NextResponse.json({error:"Unknown action"},{status:404});
  }
  return NextResponse.json({engagement:await getEngagement(id),notice});
 }catch(err){console.error("Workspace action failed",err instanceof Error?err.name:"unknown");const message=err instanceof z.ZodError?`Check your inputs: ${err.issues.slice(0,2).map(i=>`${i.path.join(".")}: ${i.message}`).join("; ")}`:err instanceof Prisma.PrismaClientKnownRequestError?"The database could not save this change. Check the connection and try again.":err instanceof Error?err.message:"Unable to complete this action.";return NextResponse.json({error:message},{status:400})}
}
