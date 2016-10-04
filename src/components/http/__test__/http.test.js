import test from 'ava'
import sinon from 'sinon'
import { compose } from '../../../../src'
import { Http } from '../'
import { logger } from '../..'

const config = {
    LOG_LEVEL: 'ERROR',
    APP_HOST: '0.0.0.0',
    APP_PORT: 8000,
    AUTH_SALT: '3dSo4sNms1eEMnZzaFReMuDua2bpl2z2',
    AUTH_SECRET: 'uDua2bpl2z23dSo4sNms1eEMnZzaFReM',
    AUTH_TTL: 60 * 60,
    OAUTH_COOKIE_PASSWORD: 'FReMuDua2bpl2z23dSo4sNms1eEMnZza',
    OAUTH_FACEBOOK_ID: '283063502056890',
    OAUTH_FACEBOOK_SECRET: 'e8972e302556d5cfa9fd5d8658b79142',
    OAUTH_IS_SECURE: 'true',
    HTTP_POST_MAX_BODY_SIZE: 50 * 1024 * 1024
}

test('Should compose an app from http and its deps', async () => {

    const env = Object.assign({}, config, { APP_PORT: 8765 })
    const app = await compose([
        {
            component: env,
            name: 'env',
            deps: [],
        },
        {
            component: logger,
            deps: [ env ],
        },
        {
            component: Http,
            deps: [ env, logger ],
        },
    ])

    await app.start()
    await app.stop()

})

test('Should call route handler with token, payload, params and headers', async t => {

    const env = Object.assign({}, config)
    const app = await compose([
        {
            component: env,
            name: 'env',
            deps: [],
        },
        {
            component: logger,
            deps: [ env ],
        },
        {
            component: Http,
            deps: [ env, logger ],
        },
    ])
    const http = app.getService('Http')
    const handlerStub = sinon.stub().returns(Promise.resolve({
        result: 'some result',
        headers: [
            [ 'x-some-more', 'ololo' ]
        ],
        code: 201
    }))
    const expectedHeaders = {
        authorization: 'Bearer SOMESECRET',
        'x-some-header': 'Im a header',
        'user-agent': 'shot',
        host: '0.0.0.0:8000',
        'content-type': 'application/json',
        'content-length': '13'
    }

    http.addRoute({
        method: 'POST',
        path: '/resource/{resourceId}',
        handler: handlerStub,
    })

    const res = await http.invoke({
        method: 'POST',
        url: '/resource/42?mode=full',
        headers: {
            authorization: expectedHeaders.authorization,
            'x-some-header': expectedHeaders['x-some-header'],
        },
        payload: { foo: 'bar' }
    })

    t.is(res.result, 'some result')
    t.is(res.headers['x-some-more'], 'ololo')
    t.true(handlerStub
        .calledWithExactly('SOMESECRET', { foo: 'bar' }, { resourceId: '42', mode: 'full' }, expectedHeaders))

})
