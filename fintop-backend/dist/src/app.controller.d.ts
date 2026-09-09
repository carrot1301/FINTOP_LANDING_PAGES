import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    private readonly logger;
    constructor(appService: AppService);
    getHello(): string;
    getSitemap(res: any): any;
    getRobots(res: any): any;
    getGoogleVerification(res: any): void;
    triggerAutoDeploy(): {
        status: string;
        message: string;
        timestamp: string;
    };
}
