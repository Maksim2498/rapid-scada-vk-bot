import Channel             from "./Channel"

import { promises as fsp } from "fs"
import { parse,  resolve } from "path"
import { Logger          } from "winston"
import { ZodError        } from "zod"
import { fromZodError    } from "zod-validation-error"

export default class ChannelManager {
    private  channelMap: Map<string, Channel> = new Map()
    readonly folder:     string
    readonly logger:     Logger | null

    constructor(folder: string, logger?: Logger | null) {
        this.folder = resolve(folder)
        this.logger = logger ?? null

        logger?.debug(`Created channel manager with folder ${folder}`)
    }

    async saveAll() {
        const ids = new Set(await this.readIds())

        for (const id of this.ids())
            ids.add(id)

        for (const id of this.ids())
            await this.save(id)
    }

    async save(id: string) {
        id = id.toLowerCase()

        const path    = resolve(this.folder, `${id}.json`)
        const channel = this.get(id)

        if (channel == null) {
            this.logger?.debug(`Removing channel with id ${id} from ${path}...`)
            await fsp.rm(path, { force: true })
            this.logger?.debug("Removed")
            return
        }

        const json = channel.toJSON()
        const text = JSON.stringify(json)

        this.logger?.debug(`Saving channel with id ${id} at ${path}...`)

        await fsp.writeFile(path, text)

        this.logger?.debug("Saved")
    }

    async readAll(deleteInvalid: boolean = true): Promise<Map<string, Channel>> {
        const ids        = await this.readIds()
        const channelMap = new Map<string, Channel>()

        for (const id of ids) {
            try {
                const channel = await this.read(id)
                channelMap.set(channel.id, channel)
            } catch (error) {
                if (!deleteInvalid)
                    throw error

                this.logger?.warn(`Failed to read channel with id ${id}`)

                if (error instanceof ZodError)
                    this.logger?.warn(fromZodError(error))
                else
                    this.logger?.warn(error)

                this.logger?.warn(`Deleting...`)
                await fsp.rm(resolve(this.folder, `${id}.json`))
                this.logger?.warn("Deleted")
            }
        }

        return channelMap
    }

    async readIds(): Promise<string[]> {
        this.logger?.debug("Getting channel ids...")

        const ids = (await fsp.readdir(this.folder)).map(id => parse(id).name)

        this.logger?.debug(`Got: ${ids.join(", ")}`)

        return ids
    }

    async read(id: string): Promise<Channel> {
        id = id.toLowerCase()

        const path = resolve(this.folder, `${id}.json`)

        this.logger?.debug(`Reading channel with id ${id} from ${path}...`)

        const text = await fsp.readFile(path, "utf8")

        this.logger?.debug("Read")
        this.logger?.debug("Parsing...")

        const json   = JSON.parse(text)
        const channel = Channel.fromJSON(json)

        this.logger?.debug("Parsed")

        this.channelMap.set(id, channel)
        this.logger?.debug(`Updated`)

        return channel
    }

    add(...channels: Channel[]): this {
        for (const channel of channels)
            this.channelMap.set(channel.id, channel)

        return this
    }

    delete(id: string): boolean {
        return this.channelMap.delete(id)
    }

    has(id: string): boolean {
        id = id.toLowerCase()
        return this.channelMap.has(id)
    }

    get(id: string): Channel | undefined {
        id = id.toLowerCase()
        return this.channelMap.get(id)
    }

    entries(): IterableIterator<[string, Channel]> {
        return this.channelMap.entries()
    }

    ids(): IterableIterator<string> {
        return this.channelMap.keys()
    }

    channels(): IterableIterator<Channel> {
        return this.channelMap.values()
    }

    async initialize() {
        this.logger?.debug("Initializing chunnel manager...")

        const created = await this.createFolder()

        if (!created)
            await this.readAll()

        this.logger?.debug("Chunnel manager is successfully initialized")
    }

    async createFolder(): Promise<boolean> {
        try {
            this.logger?.debug(`Creating folder ${this.folder}...`)
            await fsp.mkdir(this.folder)
            this.logger?.debug("Created")

            return true
        } catch (error) {
            if ((error as any).code !== "EEXIST")
                throw error

            this.logger?.debug("Already exist")

            return false
        }
    }
}