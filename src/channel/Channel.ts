import crypto from "crypto"
import z      from "zod"
import VkBot  from "node-vk-bot-api"

export interface ChannelOptions {
    readonly bot:            VkBot
    readonly id?:            string
    readonly creatorId:      number
    readonly subscriberIds?: Iterable<number>
}

export type ChannelJSON = z.infer<typeof Channel.JSON_SCHEMA>

export default class Channel {
    static readonly ID_BYTE_LENGTH = 64

    static readonly JSON_SCHEMA = z.object({
        id:            z.ostring(),
        creatorId:     z.number(),
        subscriberIds: z.number().array().optional(),
    })

    static fromJSON(bot: VkBot, json: unknown): Channel {
        return new Channel({
            ...Channel.JSON_SCHEMA.parse(json),
            bot,
        })
    }

    readonly bot:            VkBot
    readonly id:            string
    readonly creatorId:     number
             subscriberIds: Set<number>

    constructor(options: ChannelOptions) {
        this.bot           = options.bot
        this.id            = options.id?.toLowerCase() ?? crypto.randomBytes(Channel.ID_BYTE_LENGTH).toString("hex")
        this.creatorId     = options.creatorId
        this.subscriberIds = new Set(options.subscriberIds ?? [this.creatorId])
    }

    toJSON(): ChannelJSON {
        return {
            id:            this.id,
            creatorId:     this.creatorId,
            subscriberIds: [...this.subscriberIds]
        }
    }

    async publish(message: string) {
        for (const id of this.subscriberIds)
            this.bot.sendMessage(id, message)
    }
}