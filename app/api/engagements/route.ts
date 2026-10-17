import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {db} from "@/lib/db";
const schema=z.object({name:z.string().trim().min(1).max(100),brandId:z.string().min(1),brandName:z.string().max(100).optional(),scope:z.enum(["brand","property"]),propertyId:z.string().optional(),propertyName:z.string().max(100).optional()});
export async function POST(req:NextRequest){try{
 if(req.headers.get("origin")&&new URL(req.headers.get("origin")!).host!==req.headers.get("host"))return NextResponse.json({error:"Invalid request origin"},{status:403});
 const v=schema.parse(await req.json());const id=await db.$transaction(async tx=>{let brandId=v.brandId;let propertyId:string|null=null;
 if(brandId==="new"){if(!v.brandName?.trim())throw Error("Enter a brand name.");const brand=await tx.brand.create({data:{name:v.brandName.trim(),category:"To be defined",objectives:[],history:[],toneOfVoice:"To be defined",constraints:[],sources:[]}});brandId=brand.id;if(v.scope==="property"){if(!v.propertyName?.trim())throw Error("Enter a property name.");const p=await tx.property.create({data:{name:v.propertyName.trim(),brandId,type:"team",assets:[],dealTerms:{term:"To be defined",relationship:"To be defined",activated:[],unused:[]}}});propertyId=p.id;}}
 else{const brand=await tx.brand.findUnique({where:{id:brandId},include:{properties:true}});if(!brand)throw Error("Brand not found.");if(v.scope==="property"){if(!brand.properties.some(p=>p.id===v.propertyId))throw Error("Choose a property belonging to this brand.");propertyId=v.propertyId!;}}
 const e=await tx.engagement.create({data:{name:v.name,brandId,scope:v.scope,propertyId,recommendations:[]}});return e.id;});return NextResponse.json({id});
 }catch(err){return NextResponse.json({error:err instanceof z.ZodError?"Check the engagement name, brand, and scope.":err instanceof Error?err.message:"Unable to create engagement."},{status:400})}}
