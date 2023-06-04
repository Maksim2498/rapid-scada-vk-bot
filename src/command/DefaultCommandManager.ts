import CommandManager from "./CommandManager"
import Command        from "./Command"

export default class DefaultCommandManager extends CommandManager {
    constructor() {
        super()

        const help = new Command({
            name:        "help",
            description: "Выводит справку",

            action: (ctx) => {
                const lines = ["Список доступных команд:", ""]

                for (const command of this.commands()) {
                    const description = command.description != null ? `/${command.name} - ${command.description}`
                                                                    : `/${command.name}`

                    lines.push(description)
                }

                const message = lines.join("\n")

                ctx.reply(message)
            }
        })

        this.add(help)
    }
}