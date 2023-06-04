export interface CommandOptions {
    readonly name:         string
    readonly action:       CommandAction
    readonly minArgCount?: number
    readonly maxArgCount?: number
    readonly description?: string | null
}

export type CommandAction = (ctx: VkBotContext, args: string[]) => void

export default class Command {
    readonly name:        string
    readonly action:      CommandAction
    readonly minArgCount: number
    readonly maxArgCount: number
    readonly description: string | null

    constructor(options: CommandOptions) {
        const name        = options.name
        const action      = options.action
        const minArgCount = options.minArgCount ?? 0
        const maxArgCount = options.maxArgCount ?? minArgCount
        const description = options.description ?? null

        if (minArgCount > maxArgCount)
            throw new Error("minArgCount is bigger than maxArgCount")

        this.name        = name
        this.action      = action
        this.minArgCount = minArgCount
        this.maxArgCount = maxArgCount
        this.description = description
    }

    register(bot: VkBot) {
        bot.command(`/${this.name}`, (ctx, next) => {
            const { text } = ctx.message

            if (text == null) {
                next?.()
                return
            }

            const args = text.trim()
                             .split(/\s+/)
                             .slice(1)

            if (args.length < this.minArgCount || args.length > this.maxArgCount) {
                next?.()
                return
            }

            this.action(ctx, args)
        })
    }
}