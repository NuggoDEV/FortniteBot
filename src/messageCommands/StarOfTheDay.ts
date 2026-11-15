import { Message, TextChannel } from "discord.js";
import { Logger } from "../logger";
import { MessageCommand } from "../messageCommand";
import { RunStarOfTheDay } from "../starOfTheDay";
import { GlobalStar } from "../globalStar";


export default class StarCommand extends MessageCommand {
    public commandName: string = "star";

    public async execute(message: Message<boolean>): Promise<void> {

        if (message.author.id !== "628480432467607552")
            return;

        await (message.channel as TextChannel).send(`Manually selecting new star of the day`);
	GlobalStar(0);	

    }
}
