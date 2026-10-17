import OpenAI from "openai";
import {put,get} from "@vercel/blob";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,join} from "node:path";
import {randomUUID} from "node:crypto";
import sharp from "sharp";
export interface ImageResult { imageUrl:string;provider:string;prompt:string }
export interface ImageProvider { generate(prompt:string):Promise<ImageResult|null> }
export class OpenAIImageProvider implements ImageProvider {
 async generate(prompt:string):Promise<ImageResult|null>{
  if(!process.env.OPENAI_API_KEY)return null;
  if(process.env.VERCEL&&!process.env.BLOB_READ_WRITE_TOKEN)throw Error("Add BLOB_READ_WRITE_TOKEN before generating production renderings. Existing images are safe.");
  try{
   const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY,timeout:240000,maxRetries:0});
   const response=await client.images.generate({model:process.env.IMAGE_MODEL||"gpt-image-1",prompt:prompt+" Compose the important architecture within the central 16:9 landscape frame.",n:1,size:"1536x1024",quality:"medium",output_format:"png"});
   const base64=response.data?.[0]?.b64_json;if(!base64)throw Error("Image provider did not return image data");
   const bytes=await sharp(Buffer.from(base64,"base64")).resize(1536,864,{fit:"cover",position:"centre"}).jpeg({quality:86}).toBuffer();
   const name=`renderings/${randomUUID()}.jpg`;let imageUrl:string;
   if(process.env.VERCEL){const blob=await put(name,bytes,{access:"private",contentType:"image/jpeg",addRandomSuffix:true,token:process.env.BLOB_READ_WRITE_TOKEN});imageUrl=blob.url;}
   else{await mkdir(join(process.cwd(),"public/generated"),{recursive:true});const filename=name.split("/")[1];await writeFile(join(process.cwd(),"public/generated",filename),bytes);imageUrl=`/generated/${filename}`;}
   return{imageUrl,provider:process.env.IMAGE_MODEL||"gpt-image-1",prompt};
  }catch(err){if(err instanceof Error&&err.message.startsWith("Add BLOB"))throw err;console.error("Image generation failed",err instanceof Error?err.name:"unknown");throw Error("The image provider could not complete this rendering. Check the image key, model access, storage token, and quota, then retry. Existing renderings were preserved.");}
 }
}
export function getImageProvider():ImageProvider{return new OpenAIImageProvider()}
export async function imageBytes(imageUrl:string):Promise<Buffer>{
 if(/^\/(seed|generated)\/[a-zA-Z0-9._-]+\.(png|jpe?g|webp)$/.test(imageUrl))return readFile(resolve(process.cwd(),"public",imageUrl.slice(1)));
 if(!/^https:\/\/[a-z0-9-]+\.private\.blob\.vercel-storage\.com\//i.test(imageUrl))throw Error("Unsupported rendering location");
 const result=await get(imageUrl,{access:"private",token:process.env.BLOB_READ_WRITE_TOKEN});if(!result||result.statusCode!==200)throw Error("Rendering unavailable");return Buffer.from(await new Response(result.stream).arrayBuffer());
}
