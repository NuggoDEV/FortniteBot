import { Message } from "discord.js";

export abstract class MessageCommand {
    public abstract commandName: string;
    public abstract execute(message: Message<boolean>): Promise<void> | void;
}