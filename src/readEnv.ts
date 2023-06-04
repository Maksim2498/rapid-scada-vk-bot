import { Logger } from "winston"

export const DEFAULT_PORT               = 8000
export const DEFAULT_VK_PREFIX          = "/bot/api/vk"
export const DEFAULT_RAPID_SCADA_PREFIX = "/bot/api/rapid-scada"

export interface ReadEnvResult {
    port:             number
    vkPrefix:         string
    rapidScadaPrefix: string
    token:            string
    groupId?:         number
    secret?:          string
    confirmation?:    string
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

    const vkPrefix         = process.env.VK_PREFIX          ?? DEFAULT_VK_PREFIX
    const rapidScadaPrefix = process.env.RAPID_SCADA_PREFIX ?? DEFAULT_RAPID_SCADA_PREFIX
    const token            = process.env.TOKEN

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
        vkPrefix,
        rapidScadaPrefix,
        token,
        groupId,
        secret,
        confirmation,
    }
}