import Good from 'good'

export function makeHapiLogger(logger) {

    const squeezeArgs = {}
    const logLevel = logger._level

    if (logLevel <= logger.ERROR) {

        squeezeArgs.error = '*'

    }

    if (logLevel <= logger.INFO) {

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
