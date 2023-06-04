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
                    let description = `/${command.hint ?? command.name}`

                    if (command.description != null)
                        description += ` - ${command.description}`

                    lines.push(description)
                }

                const message = lines.join("\n")

                ctx.reply(message)
            }
        })

        const create = new Command({
            name:        "create",
            hint:         "create <password>",
            description: "создать канал уведомлений",

            action(ctx) {

            }
        })

        const del = new Command({
            name:        "delete",
            minArgCount: 1,
            description: "удалить канал уведомлений",

            action(ctx) {

            }
        })

        const sub = new Command({
            name:        "sub",
            minArgCount: 1,
            description: "подписаться на канал уведомлений",

            action(ctx) {

            }
        })

        const unsub = new Command({
            name:        "unsub",
            minArgCount: 1,
            description: "отписаться от канала уведомлений",

            action(ctx) {

            }
        })

        this.add(
            help,
            create,
            del,
            sub,
            unsub,
        )
    }
}