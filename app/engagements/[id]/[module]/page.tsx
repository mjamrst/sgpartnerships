import {notFound} from "next/navigation";
import {getEngagement} from "@/lib/data";
import {DiscoveryModule} from "@/components/discovery-module";
import {AudiencesModule} from "@/components/audiences-module";
export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{id:string;module:string}>}){const {id,module}=await params;const e=await getEngagement(id);if(!e)notFound();if(module==="discovery")return <DiscoveryModule initial={e}/>;if(module==="audiences")return <AudiencesModule initial={e}/>;notFound();}
