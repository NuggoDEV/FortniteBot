import * as fs from "fs";
import * as path from "path";
import { DiscordClient } from "./client";
import { Logger } from "./logger";
import { Guild, TextChannel } from "discord.js";
import { json } from "stream/consumers";

const guildId = "1200430250786570352";
const channelId = "1443552945223237692";
const roleId = "1443552139354964019";
const eligibleRoleId = "1444004851317997771";

const filePath = path.join(process.cwd(), "data", "STD.json");

export async function starOfTheDay() {
    Logger.Info("-------- Selecting new star of the day! --------");

    // Get the star of the day data
    const filePath = path.join(process.cwd(), "data", "STD.json");
    //const file = fs.readFileSync(filePath, { encoding: "utf-8" });

    // Parse the data
    //const json = JSON.parse(file);
    
    // Get the guild
    const guild = DiscordClient.instance.guilds.cache.get(guildId);

    // Debug current STD
    //let currentSTD = guild?.members.cache.get(json.current);
    //Logger.Debug(`Old STD: ${currentSTD?.displayName} (${currentSTD?.id})`);
    Logger.Info("Nigga");
    Logger.Debug("Nigga");
    Logger.Error("Nigga");

    // Remove the role from the current user
    //currentSTD?.roles.remove(roleId); // put back
    

    // If the previous users list already contains the user (it shouldn't) then it won't add the user again
    //if (!json.previously.includes(json.current)) {
    //    json.previously.push(json.current);
    //}

    // New star of the day
    //let randomIndex = Math.floor(Math.random() * json.users.length);

    //while (json.previously.includes(json.users[randomIndex]) ) {
    //    if (json.users.length === json.previously.length) {
    //        json.previously = [];
    //    }
    //    Logger.Debug(randomIndex);
    //    randomIndex = Math.floor(Math.random() * json.users.length);

    //}

    //json.current = json.users[randomIndex];
    
    // Debug new STD
    //currentSTD = guild?.members.cache.get(json.current);
    //Logger.Debug(`New STD: ${currentSTD?.displayName} (${currentSTD?.id})`);

    //currentSTD?.roles.add(roleId); // put back


    // Write the new data back to the json file
    //fs.writeFileSync(filePath, JSON.stringify(json, null, 4));
}

export async function RunStarOfTheDay() {
    Logger.Info("------------ Selecting new star of the day! ------------");

    // Reads data/STD.json and returns a JsonDataType
    const jsonData = ReadJson();

    if (!jsonData) {
        Logger.Error("Unable to continue with Star of the Day!");

        // Notify me if Star of the Day was unable to be completed.
        await DiscordClient.instance.users.cache.get("628480432467607552")?.send("Unable to complete Star of the Day! The JSON is invalid.");

        return;
    }

    const oldSTD = jsonData.currentSTD;
    Logger.Info(`Old STD: ${oldSTD}`);

    // Get guild, should never be null so "!" is appended at the end
    const guild = DiscordClient.instance.guilds.cache.get(guildId)!;

    let newSTDIndex = Math.floor(Math.random() * jsonData.users.length);

    if (jsonData.previousSTDs.length === jsonData.users.length) {
        jsonData.previousSTDs = [];
    }

    // Select new STD
    while (jsonData.previousSTDs.includes(jsonData.users[newSTDIndex])) {
        newSTDIndex = Math.floor(Math.random() * jsonData.users.length);
        Logger.Debug(`New STD index selected: ${newSTDIndex}`);
    }

    jsonData.currentSTD = jsonData.users[newSTDIndex];

    Logger.Debug(`New STD: ${jsonData.currentSTD} | ${jsonData.users[newSTDIndex]}`);

    UpdateRoles(oldSTD, jsonData.currentSTD, guild);

    // Channel should never be null
    const stdChannel = guild.channels.cache.get(channelId) as TextChannel;
    await stdChannel.send({
        content: `## ⭐ New Star of the Day Selected! ⭐ \n<@${jsonData.currentSTD}> has been selected for Star of the Day!\n\n||<@&${eligibleRoleId}>||`
    });

    WriteJson(jsonData);
}


type JsonDataType = {
    currentSTD: string,
    users: string[],
    previousSTDs: string[]
}

function ReadJson(): JsonDataType | undefined {
    const fileData = fs.readFileSync(filePath, { encoding: "utf-8" });
    const fileJson: JsonDataType = JSON.parse(fileData);

    if (fileJson)
        return fileJson;
    Logger.Error("Failed to read STD json.");
    return undefined;
}

function WriteJson(data: JsonDataType) {
    const fileData = JSON.stringify(data, null, 4);
    fs.writeFileSync(filePath, fileData);
}

async function UpdateRoles(oldUserId: string, newUserId: string, guild: Guild) : Promise<void> {
    const oldUser = guild.members.cache.get(oldUserId);
    const newUser = guild.members.cache.get(newUserId);

    guild.roles.cache.get("")?.members

    Logger.Debug(oldUserId);
    Logger.Debug(newUserId);

    if (!oldUser) {
        Logger.Error(`Unable to find old user for id ${oldUserId}`);
    }

    if (!newUser) {
        Logger.Error(`Unable to find new user for id ${newUserId}`);
    }

    await oldUser?.roles.remove(roleId);
    await newUser?.roles.add(roleId);
}