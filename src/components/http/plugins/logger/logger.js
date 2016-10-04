import Good from 'good'

export function makeHapiLogger(logger, logLevel) {

    const squeezeArgs = {}

    if (logger[logLevel] <= logger.ERROR) {

        squeezeArgs.error = '*'

    }

    if (logger[logLevel] <= logger.INFO) {

        squeezeArgs.log = '*'
        squeezeArgs.request = '*'
        squeezeArgs.response = '*'

    }

    return {
        register: Good,
        options: {
            ops: {
                interval: 1000
            },
            reporters: {
                console: [
                    {
                        module: 'good-squeeze',
                        name: 'Squeeze',
                        args: [ squeezeArgs ]
                    },
                    {
                        module: 'good-console',
                    },
                    'stdout'
                ],
            }
        }
    }

}
