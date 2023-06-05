import express                  from "express"
import VkBot                    from "node-vk-bot-api"
import ChannelManager           from "channel/ChannelManager"
import CommandManager           from "command/CommandManager"
import Command                  from "command/Command"

import { Server as HttpServer } from "http"
import { Application          } from "express"
import { Logger               } from "winston"
import { ReadonlyEnv          } from "util/readEnv"

export default class Server {
    private  httpServer:     HttpServer | null = null

    readonly app:            Application
    readonly bot:            VkBot
    readonly env:            ReadonlyEnv
    readonly logger:         Logger     | null
    readonly channelManager: ChannelManager
    readonly commandManager: CommandManager

    constructor(env: ReadonlyEnv, logger?: Logger | null) {
        this.bot            = createBot()
        this.app            = createApp(this.bot)
        this.env            = env
        this.logger         = logger ?? null
        this.channelManager = new ChannelManager(env.workingDirectory, logger)
        this.commandManager = new CommandManager(this.bot, logger)

        return

        function createBot(): VkBot {
            logger?.debug("Creating VK bot...")

            const bot = new VkBot({
                token:        env.vkToken,
                group_id:     env.vkGroupId,
                secret:       env.vkSecret,
                confirmation: env.vkConfirmation,
            })

            bot.use(async (_, next) => {
                try {
                    await next?.()
                } catch (error) {
                    logger?.error(error)
                }
            })

            logger?.debug("Created")

            return bot
        }

        function createApp(bot: VkBot): Application {
            logger?.debug("Creating express app...")

            const app = express()

            app.use(express.json())
            app.post(env.vkPrefix, (req, res, next) => bot.webhookCallback(req, res, next as () => {}))

            logger?.debug("Created")

            return app
        }
    }

    async initialize() {
        this.logger?.debug("Initializing server...")

        initializeCommands.call(this)
        await this.channelManager.initialize()

        this.logger?.debug("Server is successfully initialized")

        return

        function initializeCommands(this: Server) {
            this.logger?.debug("Registering commands...")

            const help = new Command({
                name:        "help",
                description: "вывести справку",

                action: (ctx) => {
                    const lines = ["Список доступных команд:", ""]

                    for (const command of this.commandManager.commands()) {
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

            this.commandManager.register(
                help,
                create,
                del,
                sub,
                unsub,
            )

            this.bot.command([], ctx => ctx.reply("Я вас не понял.\nЧтобы узнать, что я умею введите /help"))

            this.logger?.debug("Registered")
        }
    }

    async listen() {
        this.logger?.debug("Starting listening...")

        return new Promise<void>(resolve => {
            this.httpServer = this.app.listen(this.env.port, () => {
                this.logger?.info(`Listening for VK callbacks at http://localhost:${this.env.port}${this.env.vkPrefix}`)
                this.logger?.info(`Listening for Rapid SCADA callbacks at http://localhost:${this.env.port}${this.env.rapidScadaPrefix}`)
                this.logger?.info("Press Ctrl-C to stop")
            })

            resolve()
        })
    }

    async close() {
        if (this.httpServer == null)
            throw new Error("Server isn't listening")

        this.logger?.info("Closing server...")

        return new Promise<void>(resolve => {
            this.httpServer?.close(error => {
                if (error != null)
                    this.logger?.warn(error)

                this.logger?.info("Closed")

                resolve()
            })
        })
    }
}