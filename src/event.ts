import { ClientEvents, Events } from "discord.js"

export abstract class Event<T extends keyof ClientEvents> {
    public abstract eventName: keyof ClientEvents;

    public abstract execute(...args: [...ClientEvents[T]]): Promise<void> | void;
}