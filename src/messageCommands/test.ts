import { Message } from "discord.js";
import { Logger } from "../logger";
import { MessageCommand } from "../messageCommand";
import { RunStarOfTheDay } from "../starOfTheDay";
import { GlobalStar } from "../globalStar";


export default class TestCommand extends MessageCommand {
    public commandName: string = "test";

    public async execute(message: Message<boolean>): Promise<void> {

        if (message.author.id !== "628480432467607552")
            return;

        GlobalStar(0);
        Logger.Info("Test command executed!");
        await message.reply("I hate Niggers!");
    }
}