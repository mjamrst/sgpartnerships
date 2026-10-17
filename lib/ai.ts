import Anthropic from "@anthropic-ai/sdk";
import {z} from "zod";
import discovery from "./prompts/discovery-synthesis";
import audiences from "./prompts/audience-recommendation";
import scoring from "./prompts/trend-scoring";
import athlete from "./prompts/ideation-athlete-creator";
import experiential from "./prompts/ideation-experiential";
import social from "./prompts/ideation-social";
import rendering from "./prompts/rendering-prompt";
import deck from "./prompts/deck-narrative";
export const prompts={discovery,audiences,scoring,athlete_creator:athlete,experiential,social,rendering,deck};
export const hasAI=()=>!!process.env.ANTHROPIC_API_KEY;
export async function structured<T>(prompt:keyof typeof prompts,context:unknown,schema:z.ZodType<T>):Promise<T>{
 if(!hasAI())throw Error("Add ANTHROPIC_API_KEY for fresh Claude generation.");
 const client=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY,timeout:240000,maxRetries:1});
 try {const response=await client.messages.create({model:process.env.ANTHROPIC_MODEL||"claude-sonnet-5-5",max_tokens:12000,system:prompts[prompt],messages:[{role:"user",content:JSON.stringify(context)}],tools:[{name:"submit_result",description:"Return the fully structured result.",input_schema:z.toJSONSchema(schema) as Anthropic.Tool.InputSchema}],tool_choice:{type:"tool",name:"submit_result"}});const result=response.content.find(b=>b.type==="tool_use"&&b.name==="submit_result");if(!result||result.type!=="tool_use")throw Error("No structured result returned");return schema.parse(result.input);
 } catch(err) {console.error("Claude generation failed",err instanceof Error?err.name:"unknown");throw Error("Claude could not complete this generation. Check the API key, model access, and quota, then try again. Your existing work is unchanged.");}
}
