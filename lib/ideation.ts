import {z} from "zod";
import {hasAI,structured} from "./ai";
import {makeIdeas} from "./seed-data";
import {ideaSchema} from "./validation";
import type {Engagement,Idea,Lane,Scope,Trend,Budget} from "./types";
export function validateGrounding(ideas:z.infer<typeof ideaSchema>[],properties:Engagement["brand"]["properties"],trends:Trend[],lane:Lane){
 for(const idea of ideas){const property=properties.find(p=>p.id===idea.propertyId);if(!property)throw Error("A generated idea referenced an unavailable property. Retry generation.");if(!idea.trendIds.every(id=>trends.some(t=>t.id===id)))throw Error("A generated idea referenced a trend outside your selection. Retry generation.");if(!idea.brief.rights.length||!idea.brief.rights.every(r=>property.assets.includes(r)))throw Error("A generated idea used rights outside the selected contract. Retry with a clearer rights inventory.");
  const required=lane==="athlete_creator"?["talent","ask","deliverables","storyline","coBranding"]:lane==="experiential"?["location","footprint","ritual","capture","renderingPrompt","alternateLocations"]:["platform","format","openingHook","posts","publisher","cadence"];
  if(required.some(key=>!idea.brief[key as keyof typeof idea.brief]))throw Error("A generated idea was missing lane-specific detail. Retry generation.");
  if(lane==="social"&&idea.brief.posts?.length!==3)throw Error("A social idea must include three post examples.");
  if(lane==="athlete_creator"&&idea.brief.storyline?.length!==3)throw Error("An athlete idea must include a three-beat storyline.");
  if(lane==="experiential"&&((idea.brief.alternateLocations?.length??0)<2||(idea.brief.alternateLocations?.length??0)>3))throw Error("An experience must include two or three alternate locations.");
 }
}
export async function generateIdeas(e:Engagement,scope:Scope,propertyId:string|null,trends:Trend[],lane?:Lane,original?:Idea,budget?:Budget){
 const properties=scope==="brand"&&!original?e.brand.properties:e.brand.properties.filter(p=>p.id===(original?.propertyId??propertyId));
 if(!properties.length||properties.some(p=>!p.assets.length))throw Error("Add the contracted rights for each selected property in Brand Discovery before generating ideas.");
 if(!e.discoveryBrief)throw Error("Create a discovery brief before generating ideas.");
 if(!trends.length)throw Error("Select at least one shortlisted trend.");
 const lanes:Lane[]=lane?[lane]:["athlete_creator","experiential","social"];
 const variant=original?1+e.outputs.filter(o=>o.title.startsWith(original.title.split(" · ")[0])).length:0;
 const fallback=makeIdeas(e.brand,properties,trends,scope,variant);
 const results=await Promise.all(lanes.map(async lane=>{
  const ideas=hasAI()?(await structured(lane,{brand:e.brand,discoveryBrief:e.discoveryBrief,scope,properties,selectedTrends:trends,budgetBands:e.answers.find(a=>a.questionKey==="budget")?.answer??"S $15–40k; M $40–100k; L $100–250k",count:original?1:4,original,budgetInstruction:budget?`Re-scope to ${budget}. Change execution, staffing, footprint/deliverables; retain rights limits and explicitly set budget=${budget}.`:undefined},z.object({ideas:z.array(ideaSchema).min(original?1:4).max(original?1:6)}))).ideas:fallback.filter(i=>i.lane===lane).slice(0,original?1:4).map(i=>({...i,propertyId:i.propertyId!}));
  if(original&&!hasAI()){
   const template=ideas[0];Object.assign(template,{...original,title:budget?original.title:`${original.title.split(" · ")[0]} · Alternate route`,hook:budget?original.hook:`A new way in: ${original.hook}`,brief:{...original.brief},score:{...original.score}});
   if(budget){template.brief.budget=budget;const scale=budget==="S"?"a compact one-day pilot, a small local crew, and one capture station":budget==="M"?"a two-date activation with a dedicated host and a reusable capture kit":"a multi-date rollout with a larger production crew and accessible modular staging";template.concept=`${original.concept.split("\n\nScale note:")[0]}\n\nScale note: Plan ${scale}. Keep the same contracted rights and player-appearance cap; expansion funds production quality and reach, not additional uncontracted access.`;if(lane==="experiential")template.brief.footprint=budget==="S"?"3 × 3 m; one host; accessible pilot footprint":budget==="M"?"6 × 4 m; two hosts; modular installation":"8 × 6 m; four hosts; expanded accessible modular installation";if(lane==="social")template.brief.cadence=budget==="S"?"One pilot post and one response edit":budget==="M"?"3 posts over 10 days":"6 posts across two creator partners over 3 weeks";if(lane==="athlete_creator")template.brief.deliverables=budget==="S"?["One contracted appearance","One approved original recap"]:budget==="M"?["One contracted appearance","One recap and three original cutdowns"]:["One contracted appearance","One premium recap, six cutdowns, and paid amplification subject to releases"];
   }else template.concept=`Open with the community’s version of “${trends[0].title},” then let the host respond. ${original.concept}`;
  }
  validateGrounding(ideas,properties,trends,lane);
  if(budget&&ideas.some(i=>i.brief.budget!==budget))throw Error("The new scope did not match the requested budget. Please retry.");
  return ideas.map(i=>({lane,trendIds:i.trendIds,title:i.title,hook:i.hook,concept:i.concept,brief:i.brief,score:i.score,status:"draft",scope,propertyId:i.propertyId}));
 }));return results.flat();
}
