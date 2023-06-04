export interface CommandOptions {
    readonly name:         string
    readonly action:       CommandAction
    readonly description?: string | null
}

export type CommandAction = (ctx: VkBotContext) => void

export default class Command {
    readonly name:        string
    readonly action:      CommandAction
    readonly description: string | null

    constructor(options: CommandOptions) {
        this.name        = options.name
        this.action      = options.action
        this.description = options.description ?? null
    }

    register(bot: VkBot) {
        bot.command(`/${this.name}`, ctx => this.action(ctx))
    }
}