import Command from "./Command"

export default class CommandManager {
    private readonly _commands: Map<string, Command> = new Map()

    add(command: Command): this {
        this._commands.set(command.name, command)
        return this
    }

    get(name: string): Command | undefined {
        return this._commands.get(name)
    }

    delete(name: string): boolean {
        return this._commands.delete(name)
    }

    clear() {
        this._commands.clear()
    }

    entries() {
        return this._commands.entries()
    }

    names() {
        return this._commands.keys()
    }

    commands() {
        return this._commands.values()
    }

    register(bot: VkBot) {
        for (const command of this.commands())
            command.register(bot)
    }
}