import bell from 'bell'
import * as oauth from './providers'

export function makeHapiOauth(config, logger) {

    const hapiOauth = (server, options, next) => {

        const log = logger.getLogger('hapi-plugin')

        server.register(bell, (err) => {

            if (err) return next(err)

            const facebookProvider = oauth.makeFacebookProvider(config)
            server.auth.strategy('facebook', 'bell', facebookProvider.strategyOptions)

            log.info('Hapi oauth plugin registered')

            return next()

        })

    }

    hapiOauth.attributes = {
        name: 'hapi-oauth',
        version: '0.0.1',
    }

    return hapiOauth

}
