import * as fs from "fs/promises";
import * as path from "path";
import { Logger } from "./logger";

const globalStarPath = path.resolve(process.cwd(), "data", "GlobalStar.json");

export async function loadGlobalStarData(): Promise<GlobalStarData> {
    Logger.Info(`Loading Global Star data from ${globalStarPath}`);
    const data = await fs.readFile(globalStarPath, "utf-8");
    const parsedData: GlobalStarData = JSON.parse(data);
    
    return parsedData;
}

export async function saveGlobalStarData(globalStarData: GlobalStarData) : Promise<void> {
    Logger.Info(`Saving Global Star data to ${globalStarPath}`);

    await fs.writeFile(globalStarPath, JSON.stringify(globalStarData, null, 4));
}

export type GlobalStarData = {
    servers: ServerData[];
}

export type ServerData = {
    id: string,
    announceChannelId: string,
    roleId: string,
    eligibleRoleId: string,
    messageFormat: string,
    admin: string,
    previousStars: string[],
    cronInfo: CronJobData
}

export type CronJobData = {
    time: string,
    timezone: string,
    enabled: boolean
}