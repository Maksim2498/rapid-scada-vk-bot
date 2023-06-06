import z                        from "zod"
import express                  from "express"
import VkBot                    from "node-vk-bot-api"
import ChannelManager           from "channel/ChannelManager"
import Channel                  from "channel/Channel"
import CommandManager           from "command/CommandManager"
import Command                  from "command/Command"

import { Server as HttpServer } from "http"
import { Application          } from "express"
import { Logger               } from "winston"
import { ReadonlyEnv          } from "util/readEnv"

export default class Server {
    private static readonly PUBLISH_JSON_SCHEMA = z.object({
        channelId: z.string(),
        message:   z.string(),
    })

    private  httpServer:     HttpServer | null = null

    readonly app:            Application
    readonly bot:            VkBot
    readonly env:            ReadonlyEnv
    readonly logger:         Logger     | null
    readonly channelManager: ChannelManager
    readonly commandManager: CommandManager

    constructor(env: ReadonlyEnv, logger?: Logger | null) {
        this.bot            = createBot()
        this.app            = createApp.call(this)
        this.env            = env
        this.logger         = logger ?? null
        this.commandManager = new CommandManager(this.bot, logger)
        this.channelManager = new ChannelManager({
            bot:    this.bot,
            folder: env.workingDirectory,
            logger,
        })

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

        function createApp(this: Server): Application {
            logger?.debug("Creating express app...")

            const app = express()

            app.use(express.json())

            app.post(env.vkPrefix,         (req, res, next) => this.bot.webhookCallback(req, res, next as () => {}))
            app.post(env.rapidScadaPrefix, async (req, res      ) => {
                const parseResult = Server.PUBLISH_JSON_SCHEMA.safeParse(req.body)

                if (!parseResult.success) {
                    res.sendStatus(400)
                    return
                }

                const { channelId, message } = parseResult.data

                try {
                    const channel = this.channelManager.get(channelId)

                    if (channel != null)
                        await channel.publish(message)
                } catch (error) {
                    this.logger?.error(error)
                    res.sendStatus(500)
                    return
                }

                res.sendStatus(200)
            })

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

                action: ctx => {
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

                action: async ctx => {
                    const channel = await this.channelManager.create({
                        creatorId: ctx.message.from_id,
                        save:      true,
                    })

                    ctx.reply(`Канал создан.\n\nID канала: ${channel.id}`)
                }
            })

            const del = new Command({
                name:        "delete",
                hint:        "delete <ID канала>",
                minArgCount: 1,
                description: "удалить канал уведомлений",

                action: async (ctx, args) => {
                    const channel = this.channelManager.get(args[0]!)

                    if (channel == null) {
                        ctx.reply(`Канала таким ID не сущестует`)
                        return
                    }

                    if (channel.creatorId !== ctx.message.from_id) {
                        ctx.reply(`Только создатель канала может его удалить`)
                        return
                    }

                    this.channelManager.delete(channel.id)
                    await this.channelManager.save(channel.id)

                    ctx.reply("Канал удалён")
                }
            })

            const sub = new Command({
                name:        "sub",
                hint:        "sub <ID канала>",
                minArgCount: 1,
                description: "подписаться на канал уведомлений",

                action: async (ctx, args) => {
                    const channel = this.channelManager.get(args[0]!)

                    if (channel == null) {
                        ctx.reply("Канала таким ID не сущестует")
                        return
                    }

                    if (channel.subscriberIds.has(ctx.message.from_id)) {
                        ctx.reply("Подписка уже оформлена")
                        return
                    }

                    channel.subscriberIds.add(ctx.message.from_id)
                    await this.channelManager.save(channel.id)

                    ctx.reply("Подписка оформлена")
                }
            })

            const unsub = new Command({
                name:        "unsub",
                hint:        "unsub <ID канала>",
                minArgCount: 1,
                description: "отписаться от канала уведомлений",

                action: async (ctx, args) => {
                    const channel = this.channelManager.get(args[0]!)

                    if (channel == null) {
                        ctx.reply("Канала таким ID не сущестует")
                        return
                    }

                    const deleted = channel.subscriberIds.delete(ctx.message.from_id)

                    if (deleted) {
                        await this.channelManager.save(channel.id)
                        ctx.reply("Подписка отменена")
                        return
                    }

                    ctx.reply("Вы не подписаны на данный канал")
                }
            })

            const listsub = new Command({
                name:        "listsub",
                description: "вывести список каналов, на которые оформлена подписка",

                action: async ctx => {
                    const channels = new Array<Channel>()

                    for (const channel of this.channelManager.channels())
                        if (channel.subscriberIds.has(ctx.message.from_id))
                            channels.push(channel)

                    const message = channels.length === 0 ? "Вы не подписаны ни на один канал"
                                                          : "Ваши подписки:\n\n"
                                                          + channels.map(channel => channel.id).join("\n\n")

                    ctx.reply(message)
                }
            })

            this.commandManager.register(
                help,
                create,
                del,
                sub,
                unsub,
                listsub,
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