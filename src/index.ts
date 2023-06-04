import express      from "express"
import createLogger from "createLogger"
import readEnv      from "readEnv"
import createBot    from "createBot"

import "dotenv/config"

const logger = createLogger()

main().catch(error => {
    logger.error(error)
    process.exit(1)
})

async function main() {
    logger.info("Initializing...")

    const env = readEnv(logger)
    const bot = createBot(env, logger)
    const app = express()

    app.use(express.json())
    app.post(env.prefix, (req, res, next) => bot.webhookCallback(req, res, next as () => {}))

    logger.debug("Starting listening...")

    const server = app.listen(env.port, () => {
        logger.info("Initialized")
        logger.info(`Bot is listening at http://localhost:${env.port}${env.prefix}`)
        logger.info("Press Ctrl-C to quit")

        setupSigInt()
    })

    function setupSigInt() {
        let stopping = false

        process.on("SIGINT", async () => {
            if (stopping)
                return

            stopping = true

            console.log()
            logger.info("Closing server...")

            server.close(() => {
                logger.info("Closed")
                process.exit()
            })
        })
    }
}