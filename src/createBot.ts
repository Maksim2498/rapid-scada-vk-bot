import VkBot             from "node-vk-bot-api"

import { Logger        } from "winston"
import { ReadEnvResult } from "readEnv"

export default function createBot(env: ReadEnvResult, logger?: Logger): VkBot {
    logger?.debug("Creating bot...")

    const bot = new VkBot({
        token:        env.token,
        group_id:     env.groupId,
        secret:       env.secret,
        confirmation: env.confirmation,
    })

    logger?.debug("Created")

    bot.command("/test", async ctx => {
        ctx.reply("Hello, World!")
    })

    return bot
}