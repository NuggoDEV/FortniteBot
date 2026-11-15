import { Collection, GuildMember, TextChannel } from "discord.js";
import { DiscordClient } from "./client";
import { GlobalStarData, loadGlobalStarData, saveGlobalStarData, ServerData } from "./data";
import { Logger } from "./logger";

const starRegex = /{NewStarPing}/;
const eligibleRegex = /{EligibleMembersPing}/;

export async function GlobalStar(index: number): Promise<void> {
    const globalStarData = await loadGlobalStarData()
    const server = globalStarData.servers[index];

    Logger.Info("Executing Global Star for server ID:", server.id);

    Logger.Info("Getting guild info, star role info, and eligible role info."); 

    /**
     * Add null checks for all roles and guilds.
     * anything that is null must be error logged, and dm'd to either the designated admin for the guild, or myself if unable to get the admin
     */

    const guild = await DiscordClient.instance.guilds.fetch(server.id);

    if (!guild) { 
        Logger.Error(`Unable to get guild for ${server.id}`);
        await DiscordClient.instance.ownerUser?.send(`Unable to complete the Global Star for the guild ${server.id}. Guild is null!`);

        return;
    }

    const starRole = await guild.roles.fetch(server.roleId);
    const eligibleRole = await guild.roles.fetch(server.eligibleRoleId);
    const adminUser = await guild.members.fetch(server.admin);
    const announcementChannel = await guild.channels.fetch(server.announceChannelId) as TextChannel;

    if (!starRole) {
        Logger.Error(`Star role (${server.roleId}) was unable to be grabbed for guild ${server.id}`);
        await adminUser.send(`The star role ${server.roleId} is null for guild ${guild.name} (${server.id})! Please fix this soon using "!star role update 'id'"`)

        return;
    }

    if (!eligibleRole) {
        Logger.Error(`Eligible role (${server.eligibleRoleId}) was unable to be grabbed for guild ${server.id}`);
        await adminUser.send(`The eligible role ${server.eligibleRoleId} is null for guild ${guild.name} (${server.id})! Please fix this soon using "!star eligible update 'id'"`)
    
        return;
    }

    if (!announcementChannel) {
        Logger.Error(`Announcement channel (${server.announceChannelId}) was unable to be grabbed for guild ${server.id}`);
        await adminUser.send(`The announcement channel ${server.announceChannelId} is null for guild ${guild.name} (${server.id})! Please fix this soon using "!star announcement update 'id'"`);
    }

    Logger.Info("Successfully grabbed all info");

    const oldStar = starRole.members.first();

    if (!oldStar) {
        Logger.Error(`No current star found in guild ${server.id}`);
        await adminUser.send(`No current star found in guild ${guild.name} (${server.id})`);
    } else {
        Logger.Info(`Removed star role from user ${oldStar.id} in guild ${server.id}`);
        await oldStar.roles.remove(starRole);
        server.previousStars.push(oldStar.id);
    }

    const normalizedEligible = eligibleRole.members.map(x => x.id.trim());
    const normalizedPrevious = server.previousStars.map(x => x.trim());

    let possibleStars = normalizedEligible.filter(id => !normalizedPrevious.includes(id) && id !== oldStar?.id);
    Logger.Debug(`All possible stars: ${possibleStars}`);

    if (possibleStars.length === 0) {
        server.previousStars = [];
        possibleStars = normalizedEligible
    }

    if (possibleStars.length === 0) {
        Logger.Error(`Eligible role has no members to pick from in guild d${server.id}`);
        await adminUser.send(`Eligible role has no members to pick from in guild ${guild.name} (${server.id})`);

        return;
    }


    const newUserIndex = Math.floor(Math.random() * possibleStars.length);
    const newStar = eligibleRole.members.filter(x => x.id === possibleStars[newUserIndex]).first();

    Logger.Info(`Added star role to user ${newStar?.id} in guild ${server.id}`);

    await newStar?.roles.add(starRole);

    let message = server.messageFormat;
    message = message.replace(starRegex, `<@${newStar?.id}>`);
    message = message.replace(eligibleRegex, `<@&${eligibleRole.id}>`);

    await announcementChannel.send(message);

    await saveGlobalStarData(globalStarData);

    //const filteredUsers = eligibleRole.members.map(x => { Logger.Debug(x.id); return server.previousStars.findIndex(y => {Logger.Debug(x.id === y); return x.id === y}) });
    //Logger.Debug(filteredUsers);

    /**
     * Grab all users who have the eligible role *
     * Get all users who have previously had the star role from json *
     * filter possible members by comparing both lists *
     * - if filtered list length is 0, reset the previous users to be an empty list *
     * select a random number 0-filtered members length *
     * remove the star role from the current user *
     * add the user to the previous list *
     * add the star role to the new star *
     */
}