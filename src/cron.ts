import { CronJob, validateCronExpression } from "cron";
import { Initializable } from "./initializable";
import { loadGlobalStarData } from "./data";
import { GlobalStar } from "./globalStar";
import { Logger } from "./logger";

export class Cron implements Initializable {
    private mGlobalStarJobs: Map<string, CronJob> = new Map();

    private static mInstance: Cron;

    public static get instance(): Cron {
        return this.mInstance ??= new Cron();
    }

    public async initialize(): Promise<void> {
        Logger.Info(`Initializing Cron`);
        const globalStarData = await loadGlobalStarData();

        Logger.Info(`Loading Global Star Data jobs...`);
        globalStarData.servers.forEach(async (server, index) => {

            Logger.Info(`Verifying cron expression for ${server.id}`);

            const validatedExpression = validateCronExpression(server.cronInfo.time);

            if (!validatedExpression.valid) {
                Logger.Error(`Cron expression for ${server.id} is not the right format! ${server.cronInfo.time}`);
                return;
            }

            Logger.Debug(`Creating new Cron job for ${server.id}`);
            
            const cronJob = new CronJob(
                server.cronInfo.time,
                async () => {
                    await GlobalStar(index);
                },
                null,
                server.cronInfo.enabled,
                server.cronInfo.timezone
            );

            this.mGlobalStarJobs.set(server.id, cronJob);
            Logger.Debug(`Successfully created cron job for ${server.id}`);
        })
    }
}