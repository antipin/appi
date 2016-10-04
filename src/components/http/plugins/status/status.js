export function makeHapiStatus(logger) {

    const hapiStatus = (server, options, next) => {

        const log = logger.getLogger('hapi-plugin')

        server.route({
            method: 'GET',
            path: '/status',
            config: {
                auth: false,
            },
            handler: async (request, reply) => reply({ status: 'OK' }),
        })

        log.info('Hapi status plugin registered')

        next()

    }

    hapiStatus.attributes = {
        name: 'hapi-status',
        version: '0.0.1',
    }

    return hapiStatus

}
