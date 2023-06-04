import { Logger } from "winston"

export default class ChannelManager {
    readonly folder: string
    readonly logger: Logger | null

    constructor(folder: string, logger?: Logger | null) {
        this.folder = folder
        this.logger = logger ?? null

        logger?.debug(`Created channel manager with folder ${folder}`)
    }
}