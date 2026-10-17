import {randomBytes} from "node:crypto";
import {existsSync,readFileSync,writeFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
const file=".vercel/demo-access.txt";
const password=existsSync(file)?readFileSync(file,"utf8").trim():`SG-${randomBytes(15).toString("base64url")}`;
writeFileSync(file,password+"\n",{mode:0o600});
for(const [name,value] of [["APP_PASSWORD",password],["SOCIALGLASS_MODE","mock"]]){
 const r=spawnSync("vercel",["env","add",name,"production,preview,development","--yes","--force","--scope","mjamrsts-projects"],{input:value,encoding:"utf8"});
 if(r.status!==0){console.error(`Unable to set ${name}: ${r.stderr}`);process.exit(1);}console.log(`${name} configured for production, preview, and development.`);
}
console.log("Workspace password saved privately in .vercel/demo-access.txt (ignored by Git).");
