import * as dotenvx from "@dotenvx/dotenvx";
import { DiscordClient } from "./client";
import { RunStarOfTheDay } from "./starOfTheDay";
import { CronJob as CrustyJobby } from "cron";
import { Logger } from "./logger";
import { loadGlobalStarData } from "./data";
import { GlobalStar } from "./globalStar";
import { Cron } from "./cron";

dotenvx.config();

const crustyJobbies: CrustyJobby[] = [];


(async () => {
    /*const serverData = await loadGlobalStarData();

    serverData.servers.forEach(async (server, index) => {
        //await GlobalStar(server) // Just for testing purposes
        Logger.Info(`Scheduling Global Star announcements for server ID: ${server.id} at ${server.cronInfo.time} (${server.cronInfo.timezone})`);
        const jobby = new CrustyJobby(server.cronInfo.time,
            async () => await GlobalStar(index),
            null,
            false,
            server.cronInfo.timezone
        );

        jobby.start();
        crustyJobbies.push(jobby);
    });

    const crustyJobby = new CrustyJobby("0 0 0 * * *",
        RunStarOfTheDay,
        null,
        false,
        "Australia/Adelaide"
    );

    crustyJobby.start();*/

    await Cron.instance.initialize();

    await DiscordClient.instance.start(String(process.env.TOKEN));
})();