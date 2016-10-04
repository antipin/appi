import hapi from 'hapi'
import { AppiComponent, validateObject } from '../../'
import { getConfig } from './config'
import { AppiHapi } from './appi-hapi'
import * as plugins from './plugins'

/**
 * Creates hapi server
 * @param {Object} env
 * @param {Logger} logger
 * @returns {Object} Hapi server
 */
async function makeHapiServer(env, logger) {

    const config = validateObject(getConfig(env))
    const hapiServer = new hapi.Server()

    hapiServer.connection(config.server)

    await hapiServer.register([
        plugins.makeHapiLogger(logger, config.logLevel),
        plugins.makeHapiStatus(logger),
        plugins.makeHapiOauth(config, logger),
    ])

    return hapiServer

}

/**
 * Http component
 */
export class Http extends AppiComponent {

    /**
     * Initializes hapiServer service
     *
     * @param {Object} deps
     * @param {Logger} deps.logger
     * @param {Object} deps.config HTTP-server configuration
     * @returns {void}
     */
    async make(deps) {

        try {

            const { logger, env } = deps

            this.log = logger.getLogger('appi-http')

            const hapiServer = await makeHapiServer(env, logger)

            this.log.info('Server initialized')
            this.service = new AppiHapi(hapiServer)

        } catch (err) {

            this.log.error('Http server initialization failed due to: %s', err.message)
            throw err

        }

    }

    /**
     * Starts http component
     * @returns {void}
     */
    async start() {

        try {

            await this.service.start()
            this.log.info(`Http server started on ${this.service.info.uri}`)

        } catch (err) {

            this.log.error('Http server start failed due to: %s', err.message)
            throw err

        }

    }

    /**
     * Stops http component
     * @returns {void}
     */
    async stop() {

        try {

            await this.service.stop()
            this.log.info(`Http server on ${this.service.info.uri} stopped`)

        } catch (err) {

            this.log.error('Http server stop failed due to: %s', err.message)
            throw err

        }

    }

}
