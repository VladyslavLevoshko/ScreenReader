import express, { type Express, type Request, type Response } from 'express';
import path from 'path';
import { app } from 'electron';

export class BlinkIdResourceServer {
    private server:Express;
    private resourcePath;

    constructor(){
        this.server = express();
        this.resourcePath = app.isPackaged ? path.join(process.resourcesPath, "blinkid" ) : path.join( process.cwd(), "extraResources", "BlinkIDresources" );
    }

    start():Promise<void>{
        this.server.use((_req:Request, res:Response, next) => { 
            res.setHeader( "Access-Control-Allow-Origin", "http://localhost:5173");
            next();
        });

        this.server.use(express.static(this.resourcePath));

        return new Promise((resolve)=> {
            this.server.listen(3000, () => {
                console.log('start server');
                resolve()
            });
        });     
    }
}