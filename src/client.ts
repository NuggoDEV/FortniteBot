import { Client, GatewayIntentBits, Partials, Collection, ActivityType, ClientEvents, GuildMember, User } from "discord.js"
import { Logger } from "./logger";
import * as fs from "fs/promises";
import * as path from "path";
import { Event } from "./event";
import { loadGlobalStarData } from "./data";
import { GlobalStar } from "./globalStar";


export class DiscordClient extends Client {

    private static mInstance: DiscordClient | undefined;
    private mOwnerUser: User | undefined;

    // Temporarily set to <string, string> until type is defined
    private mCommands: Collection<string, string>;
    private mEvents: Collection<string, Event<keyof ClientEvents>>;

    private mCommandsDir = path.resolve(process.cwd(), "dist", "commands");
    private mEventsDir = path.resolve(process.cwd(), "dist", "events");

    public static get instance(): DiscordClient {
        return this.mInstance ??= new DiscordClient();
    }

    /// Can only be called once login has been called
    public get ownerUser() : User | undefined {
        return this.mOwnerUser ??= this.users.cache.get("628480432467607552");
    }

    constructor() {
        super({
            intents: [
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildPresences
            ],
            partials: [
                Partials.GuildMember,
                Partials.Message,
                Partials.Channel,
                Partials.User,
            ]
        });

        // Temporarily add initializer
        this.mCommands = new Collection<string, string>();
        this.mEvents = new Collection<string, Event<keyof ClientEvents>>();
    }

    public async start(token: string): Promise<void> {
        Logger.Info(`Starting Bot, end of token: ${token.substring(token.length - 10, token.length)}`);

        this.on("clientReady", this.onStart);
        await this.loadEvents();

        await this.login(token);
    }

    private async onStart(client: Client<boolean>) {
        Logger.Info(`Logged in as ${client.user?.displayName}!`);

        this.user?.setActivity("Bennelong", {
            type: ActivityType.Playing
        });

        const serverData = await loadGlobalStarData();

        //RunStarOfTheDay();
    }

    private async loadEvents() {
        Logger.Info("Loading events...");
        const files = await fs.readdir(this.mEventsDir, { encoding: "utf-8", recursive: true, withFileTypes: true });

        Logger.Debug(`All event files: ${files.map(f => f.name).join(", ")}`);

        await Promise.all(files.map(async file => {
        
            if (file.isFile() && file.name.endsWith(".js")) {
                const modulePath = path.resolve(this.mEventsDir, file.name);
                const eventModule = await import(modulePath);
                const eventInstance = new eventModule.default();

                if (eventInstance.initialize) {
                    await eventInstance.initialize();
                }

                this.on(eventInstance.eventName, async (...args) => await eventInstance.execute(...args));
                this.mEvents.set(eventInstance.eventName as string, eventInstance);

                Logger.Info(`Loaded event: ${eventInstance.eventName}`);
            }
        }));
    }
}