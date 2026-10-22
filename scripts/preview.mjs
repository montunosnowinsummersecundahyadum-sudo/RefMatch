import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStaticServer } from './server.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const port=Number(process.env.REFMATCH_PORT||4173);
const server=createStaticServer(root);
server.listen(port,'127.0.0.1',()=>console.log(`RefMatch landing page: http://127.0.0.1:${port}/\nBrand identity: http://127.0.0.1:${port}/brand/\nEditable film: http://127.0.0.1:${port}/video/`));
server.on('error',e=>{console.error(e.message);process.exitCode=1;});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close());
