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
            description: "создать канал уведомлений",

            action(ctx) {

            }
        })

        const del = new Command({
            name:        "delete",
            hint:        "delete <ID канала>",
            minArgCount: 1,
            description: "удалить канал уведомлений",

            action(ctx) {

            }
        })

        const sub = new Command({
            name:        "sub",
            hint:        "sub <ID канала>",
            minArgCount: 1,
            description: "подписаться на канал уведомлений",

            action(ctx) {

            }
        })

        const unsub = new Command({
            name:        "unsub",
            hint:        "unsub <ID канала>",
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