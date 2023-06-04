import createLogger from "util/createLogger"
import readEnv      from "util/readEnv"
import Server       from "Server"

import dontent from "dotenv"

const logger = createLogger()

main().catch(error => {
    logger.error(error)
    process.exit(1)
})

async function main() {
    const env    = readEnv(logger)
    const server = new Server(env, logger)

    await server.initialize()
    await server.listen()

    setupSigInt()

    function setupSigInt() {
        let stopping = false

        process.on("SIGINT", async () => {
            if (stopping)
                return

            stopping = true

            console.log()
            await server.close()
            process.exit()
        })
    }
}