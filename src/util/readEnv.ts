import { Logger } from "winston"

export const DEFAULT_PORT               = 8000
export const DEFAULT_WORKING_DIRECTORY  = "work"
export const DEFAULT_VK_PREFIX          = "/bot/api/vk"
export const DEFAULT_RAPID_SCADA_PREFIX = "/bot/api/rapid-scada"

export interface Env {
    port:             number
    workingDirectory: string

    rapidScadaPrefix: string

    vkPrefix:         string
    vkToken:          string
    vkGroupId?:       number
    vkSecret?:        string
    vkConfirmation?:  string
}

export type ReadonlyEnv = Readonly<Env>

export default function readEnv(logger?: Logger): Env {
    logger?.debug("Reading environment variables...")

    const port = process.env.PORT != null ? Number(process.env.PORT) : DEFAULT_PORT

    if (Number.isNaN(port))
        throw new Error("PORT environment variable is not a number")

    if (!Number.isInteger(port))
        throw new Error("PORT environment variable is not an integer")

    if (port < 0 || port > 65535)
        throw new Error("PORT environment variable is out of bounds [0, 65535]")

    const workingDirectory = process.env.WORKING_DIRECTORY  ?? DEFAULT_WORKING_DIRECTORY
    const rapidScadaPrefix = process.env.RAPID_SCADA_PREFIX ?? DEFAULT_RAPID_SCADA_PREFIX
    const vkPrefix         = process.env.VK_PREFIX          ?? DEFAULT_VK_PREFIX
    const vkToken          = process.env.VK_TOKEN

    if (vkToken == null)
        throw new Error("VK_TOKEN environment variable is missing")

    const vkGroupId = process.env.VK_GROUP_ID != null ? Number(process.env.VK_GROUP_ID) : undefined

    if (Number.isNaN(vkGroupId))
        throw new Error("VK_GROUP_ID environment variable is not a number")

    const vkSecret       = process.env.VK_SECRET
    const vkConfirmation = process.env.VK_CONFIRMATION

    logger?.debug("Read")

    return {
        port,
        workingDirectory,

        rapidScadaPrefix,

        vkPrefix,
        vkToken,
        vkGroupId,
        vkSecret,
        vkConfirmation,
    }
}