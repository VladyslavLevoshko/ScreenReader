import { ScannerEngine } from "../Shared";
import express, { type Express, type Request, type Response } from 'express';
import {app} from "electron"
import path from "path";

export class MainScannerEngine extends ScannerEngine{
    async scan(buffer:ArrayBuffer){
        return buffer.byteLength
    }
}

const resourcesPath = path.join(
    process.cwd(),
    "extraResources",
    "BlinkIDresources"
);

console.log(resourcesPath)

const server: Express = express();

server.use((req, res, next) => {
    res.setHeader(
        "Access-Control-Allow-Origin",
        "http://localhost:5173"
    );

    next();
});

server.use(express.static(resourcesPath))


server.get('/', (req: Request, res: Response) => {
  res.send('2323');
});

server.listen(3000);
