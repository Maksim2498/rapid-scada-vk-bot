import Command from "./Command"

export default class CommandManager {
    private readonly commandMap: Map<string, Command> = new Map()

    add(...commands: Command[]): this {
        for (const command of commands)
            this.commandMap.set(command.name, command)

        return this
    }

    get(name: string): Command | undefined {
        return this.commandMap.get(name)
    }

    delete(name: string): boolean {
        return this.commandMap.delete(name)
    }

    clear() {
        this.commandMap.clear()
    }

    entries() {
        return this.commandMap.entries()
    }

    names() {
        return this.commandMap.keys()
    }

    commands() {
        return this.commandMap.values()
    }

    register(bot: VkBot) {
        for (const command of this.commands())
            command.register(bot)

        bot.command([], ctx => ctx.reply("Я вас не понял.\nЧтобы узнать, что я умею введите /help"))
    }
}