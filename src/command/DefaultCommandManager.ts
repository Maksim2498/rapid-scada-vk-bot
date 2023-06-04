import CommandManager from "./CommandManager"
import Command        from "./Command"

export default class DefaultCommandManager extends CommandManager {
    constructor() {
        super()

        const help = new Command({
            name:        "help",
            description: "вывести справку",

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

        const start = new Command({
            name:        "start",
            description: "подписаться на уведомления",

            action(ctx) {

            }
        })

        const stop = new Command({
            name:        "stop",
            description: "отменить рассылку",

            action(ctx) {
                
            }
        })

        this.add(help)
    }
}