import VkBot                 from "node-vk-bot-api"
import DefaultCommandManager from "command/DefaultCommandManager"

import { Logger            } from "winston"
import { ReadEnvResult     } from "readEnv"

export default function createBot(env: ReadEnvResult, logger?: Logger): VkBot {
    logger?.debug("Creating bot...")

    const bot = new VkBot({
        token:        env.token,
        group_id:     env.groupId,
        secret:       env.secret,
        confirmation: env.confirmation,
    })

    logger?.debug("Created")

    bot.use(async (ctx, next) => {
        try {
            await next?.()
        } catch (error) {
            logger?.error(error)
        }
    })

    logger?.debug("Registering commands...")

    const commandManager = new DefaultCommandManager()
    commandManager.register(bot)

    bot.command([], ctx => ctx.reply("Я вас не понял.\nЧтобы узнать, что я умею введите /help"))

    logger?.debug("Registered")

    return bot
}