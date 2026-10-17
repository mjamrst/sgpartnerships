import {NextResponse,type NextRequest} from "next/server";
import {validSession} from "./lib/auth";
export async function proxy(req:NextRequest){
 const path=req.nextUrl.pathname;if(path==="/login"||path==="/api/login"||path.startsWith("/_next/static/")||path==="/favicon.ico")return NextResponse.next();
 const password=process.env.APP_PASSWORD;
 if(!password){if(process.env.VERCEL)return new NextResponse("Workspace locked. Configure APP_PASSWORD in Vercel to enable access.",{status:503});return NextResponse.next();}
 if(await validSession(req.cookies.get("sg_session")?.value,password))return NextResponse.next();
 if(path.startsWith("/api/"))return NextResponse.json({error:"Session expired. Sign in to continue."},{status:401});
 const url=new URL("/login",req.url);url.searchParams.set("next",path+req.nextUrl.search);return NextResponse.redirect(url);
}
export const config={matcher:["/((?!_next/static).*)"]};
