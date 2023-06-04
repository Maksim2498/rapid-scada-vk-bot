import crypto from "crypto"

export default class Channel {
    static readonly ID_BYTE_LENGTH = 64

    readonly id:        string
    readonly creatorId: number

    constructor(creatorId: number) {
        this.id        = crypto.randomBytes(Channel.ID_BYTE_LENGTH).toString("hex")
        this.creatorId = creatorId
    }
}