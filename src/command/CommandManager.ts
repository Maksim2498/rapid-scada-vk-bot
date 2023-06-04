import Command    from "./Command"

import { Logger } from "winston"

export default class CommandManager {
    private readonly commandMap: Map<string, Command> = new Map()

            readonly bot:        VkBot
            readonly logger:     Logger | null

    constructor(bot: VkBot, logger?: Logger | null) {
        this.bot    = bot
        this.logger = logger ?? null

        logger?.debug("Created command manager")
    }

    register(...commands: Command[]): this {
        for (const command of commands) {
            this.commandMap.set(command.name, command)
            command.register(this.bot)
            this.logger?.debug(`Registered command /${command.name}`)
        }

        return this
    }

    get(name: string): Command | undefined {
        return this.commandMap.get(name)
    }

    entries(): IterableIterator<[string, Command]> {
        return this.commandMap.entries()
    }

    names(): IterableIterator<string> {
        return this.commandMap.keys()
    }

    commands(): IterableIterator<Command> {
        return this.commandMap.values()
    }
}