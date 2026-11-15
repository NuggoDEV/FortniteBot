import { ClientEvents, Events, Message } from "discord.js";
import { Event } from "../event"
import * as fs from "fs/promises";
import * as path from "path";
import { MessageCommand } from "../messageCommand";
import { Initializable } from "../initializable";
import { Logger } from "../logger";

export default class MessageCreate extends Event<"messageCreate"> implements Initializable {

    private readonly messageCommandPath = path.resolve(process.cwd(), "dist", "messageCommands");
    private messageCommands: Map<string, any> = new Map<string, MessageCommand>();
    private readonly commandPrefix: string = "!";

    public eventName: keyof ClientEvents = "messageCreate";

    public async execute(message: Message<boolean>) : Promise<void> {
        if (message.author.bot) return;

        const commandName = message.content.split(" ")[0].substring(this.commandPrefix.length);
        
        if (this.messageCommands.has(commandName)) {
            const command = this.messageCommands.get(commandName);
            await command.execute(message);
        }
    }

    public async initialize(): Promise<void> {
        const files = await fs.readdir(this.messageCommandPath, { withFileTypes: true });
        Logger.Debug(`All message commands: ${files.map(f => f.name).join(", ")}`);

        await Promise.all(files.map(async file => {
            if (file.isFile() && file.name.endsWith(".js")) {
                const modulePath = path.resolve(this.messageCommandPath, file.name);
                const commandModule = await import(modulePath);
                const commandInstance = new commandModule.default();

                if (commandInstance.initialize) {
                    await commandInstance.initialize();
                }

                Logger.Info(`Loaded message command: ${commandInstance.commandName}`);
                this.messageCommands.set(commandInstance.commandName, commandInstance);
            }
        }))
    }
}