import {db} from "./db";
import type {Engagement} from "./types";
export async function getEngagement(id:string):Promise<Engagement|null>{
 const row=await db.engagement.findUnique({where:{id},include:{
  brand:{include:{properties:true}},property:true,answers:true,
  audiences:{orderBy:{id:"asc"}},
  snapshots:{orderBy:{capturedAt:"desc"},include:{trends:{orderBy:{relevanceScore:"desc"}}}},
  outputs:{orderBy:{createdAt:"asc"},include:{renderings:{orderBy:{createdAt:"desc"}}}}
 }});
 return row?JSON.parse(JSON.stringify(row)):null;
}
export async function getEngagements(){return db.engagement.findMany({orderBy:{createdAt:"desc"},include:{brand:true,property:true,_count:{select:{audiences:true,outputs:true}}}})}
