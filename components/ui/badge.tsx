import {cn} from "@/lib/utils";
export function Badge({children,className}:{children:React.ReactNode;className?:string}){return <span className={cn("inline-flex items-center gap-1.5 rounded-md bg-[#eef2e8] px-2.5 py-1 text-[10px] font-medium text-primary",className)}>{children}</span>}
