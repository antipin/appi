import joi from 'joi'
import { extractToken } from './utils/extract-token'

/**
 * @typedef {Object} AppiRoute
 * @property {string} method
 * @property {string} path
 * @property {Function} handler
 * @property {Object} config
 */

const routeSchema = joi.object({
    method: joi.string()
        .only([ 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', '*' ])
        .required(),
    path: joi.string()
        .required(),
    handler: joi.func()
        .required(),
    config: joi.object(),
})

export class AppiHapi {

    /**
     * @param {Object} hapiServer
     */
    constructor(hapiServer) {

        this.hapiServer = hapiServer

    }

    /**
     * Registers a new route
     * @param {AppiRoute} route
     * @returns {void}
     */
    addRoute(route) {

        const routeValidation = joi.validate(route, routeSchema)

        if (routeValidation.error) {

            throw routeValidation.error

        }

        this.hapiServer.route({
            method: route.method,
            path: route.path,
            config: route.config,
            handler: async (request, reply) => {

                const token = extractToken(request.headers)

                try {

                    const params = Object.assign({}, request.params, request.query)
                    const output = await route.handler(token, request.payload, params, request.headers)
                    const response = reply(output.result)

                    if (output.headers) {

                        for (const [ header, value ] of output.headers) {

                            response.header(header, value)

                        }

                    }

                    if (output.code) {

                        response.code(output.code)

                    }

                } catch (err) {

                    reply(err)

                }

            },
        })

    }

    /**
     * Returns server info
     * @returns {Object}
     */
    get info() {

        return this.hapiServer.info

    }

    /**
     * Starts HTTP server
     * @returns {void}
     */
    async start() {

        await this.hapiServer.start()

    }

    /**
     * Stops HTTP server
     * @returns {void}
     */
    async stop() {

        await this.hapiServer.stop()

    }

    /**
     * Invokes HTTP handler
     * @param {Object} params
     * @returns {Object}
     */
    async invoke(params) {

        const { statusCode, result, headers } = await this.hapiServer.inject(params)

        return { statusCode, result, headers }

    }

}