import test from 'ava'
import { compose } from '../../../../src'
import { logger } from '../'

test('Should compose an app from logger and its deps', async () => {

    const env = { LOG_LEVEL: 'DEBUG' }

    await compose([
        {
            component: env,
            name: 'env',
            deps: [],
        },
        {
            component: logger,
            deps: [ env ],
        },
    ])

})