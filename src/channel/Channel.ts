import crypto from "crypto"
import z      from "zod"

export interface ChannelOptions {
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

    static fromJSON(json: unknown): Channel {
        return new Channel(Channel.JSON_SCHEMA.parse(json))
    }

    readonly id:            string
    readonly creatorId:     number
             subscriberIds: number[]

    constructor(options: ChannelOptions) {
        this.id            = options.id?.toLowerCase() ?? crypto.randomBytes(Channel.ID_BYTE_LENGTH).toString("hex")
        this.creatorId     = options.creatorId
        this.subscriberIds = [...options.subscriberIds ?? []]
    }

    toJSON(): ChannelJSON {
        return {
            id:            this.id,
            creatorId:     this.creatorId,
            subscriberIds: [...this.subscriberIds]
        }
    }
}