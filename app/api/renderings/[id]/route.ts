import {db} from "@/lib/db";
import {imageBytes} from "@/lib/images/provider";
export const runtime="nodejs";
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){try{const{id}=await params;const r=await db.rendering.findUnique({where:{id}});if(!r?.imageUrl)return new Response("Rendering not found",{status:404});const bytes=await imageBytes(r.imageUrl);return new Response(new Uint8Array(bytes),{headers:{"Content-Type":r.imageUrl.endsWith(".png")?"image/png":"image/jpeg","Cache-Control":"private, max-age=3600","X-Content-Type-Options":"nosniff"}});}catch{return new Response("Rendering unavailable",{status:404})}}
