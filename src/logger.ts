import * as fs from "fs";
import * as path from "path";

export class Logger {
    private static mInstance: Logger | undefined;
    private streams: LoggerStreamType[];

    private readonly logPath = path.join(process.cwd(), "logs");

    private static get instance(): Logger {
        return this.mInstance ??= new Logger();
    }

    constructor() {
        if (!fs.existsSync(this.logPath))
            fs.mkdirSync(this.logPath);

        // Create streams for each LogLevel type
        this.streams = [
            createLoggerStream(undefined, path.join(this.logPath, "combined.log")),
            createLoggerStream(LogLevel.Info, path.join(this.logPath, "info.log")),
            createLoggerStream(LogLevel.Debug, path.join(this.logPath, "debug.log")),
            createLoggerStream(LogLevel.Error, path.join(this.logPath, "error.log")),
        ]
    }


    public static Log(level: LogLevel, debug: boolean = false, ...message: any[]) {
        const dateTime = new Date().toLocaleString("en-AU", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

        const fmtMessage = `[${LogLevel[level]} @ ${dateTime}] ${message}`;

        // Should always return "undefined" (combined log) and the level's logger
        const streams = this.instance.streams.filter(x => x.level == level || x.level == undefined);

        // Display & write the message
        
        // If debug is true and the log level is debug
        if ((debug && level === LogLevel.Debug) || (!debug && level !== LogLevel.Debug)) {
            console.log(fmtMessage);
        }
        
        streams.forEach(x => {
            x.stream.write(fmtMessage + "\n");
        });
    }

    public static Info(...message: any[]) {
        this.Log(LogLevel.Info, false, message);
    }

    public static Debug(...message: any[]) {
        console.log
        this.Log(LogLevel.Debug, parseBoolean(process.env.DEBUG as string), message);
    }

    public static Error(...message: any[]) {
        this.Log(LogLevel.Error, false, message);
    }
}

export enum LogLevel {
    Info,
    Debug,
    Error
}

type LoggerStreamType = { level: LogLevel | undefined, stream: fs.WriteStream };

function createLoggerStream(level: LogLevel | undefined, filePath: string): LoggerStreamType {
    return {
        level,
        stream: fs.createWriteStream(
            filePath,
            {
                flags: "a",
                encoding: "utf-8"
            }
        )
    };
}

function parseBoolean(string: string) : boolean {
    if (string === "true" || string === "1")
        return true;
    else
        return false;
}