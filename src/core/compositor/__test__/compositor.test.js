import test from 'ava'
import sinon from 'sinon'
import { compose } from '../'
import {
    Wheels, Engine, Lights, Car, UnstopablePart, UnstartablePart, UnmakablePart,
    engineService, wheelsService } from './test-components'

/* eslint-disable require-jsdoc */

test('Should throw if declaration.component is not specified', async t => {

    try {

        await compose([ { deps: [] } ])

        t.fail()

    } catch (err) {

        t.is(err.name, 'ValidationError')
        t.true(err.message.includes('[child "component" fails because ["component" is required]]'))

    }

})

test('Should throw if any of the component`s deps is not a component itself', async t => {

    class Component {

        make() {}

    }

    try {

        await compose([
            {
                component: Component,
                deps: [ { someWrongProperty: 'ololo' } ],
            }
        ])

        t.fail()

    } catch (err) {

        t.is(err.name, 'ValidationError')
        t.true(err.message.includes('["deps" at position 0 fails because ["0" must be a Function]]'))

    }

})

test('Should throw if deps is omitted', async t => {

    class Component {

        make() {}

    }

    try {

        await compose([ { component: Component } ])

        t.fail()

    } catch (err) {

        t.true(err.message.includes('[child "deps" fails because ["deps" is required]]'))

    }

})

test('Should not throw if component declaration is correct', async t => {

    class Component {

        make() {}

        start() {}

        stop() {}

    }

    try {

        await compose([
            {
                component: Component,
                deps: []
            }
        ])

        t.pass()

    } catch (err) {

        t.fail(err)

    }

})

test('compose function should compose an app', async t => {

    sinon.spy(Car.prototype, 'make')
    sinon.spy(Engine.prototype, 'make')
    sinon.spy(Wheels.prototype, 'make')

    try {

        await compose([
            {
                component: Wheels,
                deps: [],
            },
            {
                component: Engine,
                deps: [ Wheels ],
            },
            {
                component: Car,
                deps: [ Wheels, Engine ],
            },
        ])

        t.true(Car.prototype.make.calledWithExactly({ Engine: engineService, Wheels: wheelsService }))
        t.true(Engine.prototype.make.calledWithExactly({ Wheels: wheelsService }))
        t.true(Wheels.prototype.make.calledWithExactly({}))

    } catch (err) {

        t.fail(err)

    }

})

test('App should start all components in the right order', async t => {

    sinon.spy(Car.prototype, 'start')
    sinon.spy(Engine.prototype, 'start')
    sinon.spy(Wheels.prototype, 'start')

    try {

        const app = await compose([
            {
                component: Wheels,
                deps: [],
            },
            {
                component: Engine,
                deps: [ Wheels ],
            },
            {
                component: Car,
                deps: [ Wheels, Engine ],
            },
        ])

        await app.start()

        sinon.assert.callOrder(
            Wheels.prototype.start,
            Engine.prototype.start,
            Car.prototype.start,
        )

    } catch (err) {

        t.fail(err)

    }

})

test('App should stop all components in the right (backwards) order', async t => {

    sinon.spy(Car.prototype, 'stop')
    sinon.spy(Engine.prototype, 'stop')
    sinon.spy(Wheels.prototype, 'stop')

    try {

        const app = await compose([
            {
                component: Wheels,
                deps: [],
            },
            {
                component: Engine,
                deps: [ Wheels ],
            },
            {
                component: Car,
                deps: [ Wheels, Engine ],
            },
        ])

        await app.start()
        await app.stop()

        sinon.assert.callOrder(
            Car.prototype.stop,
            Engine.prototype.stop,
            Wheels.prototype.stop,
        )

    } catch (err) {

        t.fail(err)

    }

})

test('App should not throw when it starts/stops if some of components has no start/stop method', async t => {

    try {

        const app = await compose([
            {
                component: Wheels,
                deps: [],
            },
            {
                component: Engine,
                deps: [ Wheels, Lights ],
            },
            {
                component: Lights,
                deps: [ Wheels ],
            },
            {
                component: Car,
                deps: [ Wheels, Engine ],
            },
        ])

        await app.start()
        await app.stop()

        t.pass()

    } catch (err) {

        t.fail(err)

    }

})

test('App should throw if any of the component throws when make', async t => {

    try {

        await compose([
            {
                component: Wheels,
                deps: [],
            },
            {
                component: UnmakablePart,
                deps: [ Wheels ],
            },
            {
                component: Engine,
                deps: [ Wheels, Lights ],
            },
            {
                component: Lights,
                deps: [ Wheels, UnmakablePart ],
            },
            {
                component: Car,
                deps: [ Wheels, Engine ],
            },
        ])

        t.fail()

    } catch (err) {

        t.is(err.message, 'Component "UnmakablePart" failed while initializing')
        t.is(err.code, 'COMPONENT_INITIALIZATION_FAILED')

    }

})

test('App should throw if any of the component throws when start', async t => {

    try {

        const app = await compose([
            {
                component: Wheels,
                deps: [],
            },
            {
                component: UnstartablePart,
                deps: [ Wheels ],
            },
            {
                component: Engine,
                deps: [ Wheels, Lights ],
            },
            {
                component: Lights,
                deps: [ Wheels, UnstartablePart ],
            },
            {
                component: Car,
                deps: [ Wheels, Engine ],
            },
        ])

        await app.start()

        t.fail()

    } catch (err) {

        t.is(err.message, 'Component "UnstartablePart" failed while start attempt')
        t.is(err.code, 'COMPONENT_START_FAILED')

    }

})

test('App should throw if any of the component throws when stop', async t => {

    try {

        const app = await compose([
            {
                component: Wheels,
                deps: [],
            },
            {
                component: UnstopablePart,
                deps: [ Wheels ],
            },
            {
                component: Engine,
                deps: [ Wheels, Lights ],
            },
            {
                component: Lights,
                deps: [ Wheels, UnstopablePart ],
            },
            {
                component: Car,
                deps: [ Wheels, Engine ],
            },
        ])

        await app.start()
        await app.stop()

        t.fail()

    } catch (err) {

        t.is(err.message, 'Component "UnstopablePart" failed while stop attempt')
        t.is(err.code, 'COMPONENT_STOP_FAILED')

    }

})

test.failing('App should throw when trying to stop it without start', async t => {

    try {

        const app = await compose([
            {
                component: Wheels,
                deps: [],
            },
            {
                component: Engine,
                deps: [ Wheels, Lights ],
            },
            {
                component: Lights,
                deps: [ Wheels ],
            },
            {
                component: Car,
                deps: [ Wheels, Engine ],
            },
        ])

        await app.stop()

        t.fail()

    } catch (err) {

        t.is(err.message, 'Can not stop an app that was not started.')
        t.is(err.code, 'COMPONENT_STOP_FAILED')

    }

})

/* eslint-enable */
