import { Logger } from "winston"

const DEFAULT_PORT   = 8000
const DEFAULT_PREFIX = "/api"

export interface ReadEnvResult {
    port:          number
    prefix:        string
    token:         string
    groupId?:      number
    secret?:       string
    confirmation?: string
}

export default function readEnv(logger?: Logger): ReadEnvResult {
    logger?.debug("Reading environment variables...")

    const port = process.env.PORT != null ? Number(process.env.PORT) : DEFAULT_PORT

    if (Number.isNaN(port))
        throw new Error("PORT environment variable is not a number")

    if (!Number.isInteger(port))
        throw new Error("PORT environment variable is not an integer")

    if (port < 0 || port > 65535)
        throw new Error("PORT environment variable is out of bounds [0, 65535]")

    const prefix = process.env.PREFIX ?? DEFAULT_PREFIX
    const token  = process.env.TOKEN

    if (token == null)
        throw new Error("TOKEN environment variable is missing")

    const groupId = process.env.GROUP_ID != null ? Number(process.env.GROUP_ID) : undefined

    if (Number.isNaN(groupId))
        throw new Error("GROUP_ID environment variable is not a number")

    const secret       = process.env.SECRET
    const confirmation = process.env.CONFIRMATION

    logger?.debug("Read")

    return {
        port,
        prefix,
        token,
        groupId,
        secret,
        confirmation,
    }
}