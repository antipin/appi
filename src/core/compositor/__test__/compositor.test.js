import test from 'ava'
import sinon from 'sinon'
import { compose } from '../'
import {
    Wheels, Engine, Lights, Car, engineService, wheelsService,
    UnstopablePart, UnstartablePart, UnmakablePart,
    functionComponent, simpleObjectComponent } from './test-components'

/* eslint-disable require-jsdoc */

const spyOnClasses = [ Car, Engine, Wheels ]
const spyOnMethods = [ 'make', 'start', 'stop' ]

test.beforeEach(() => {

    for (const spiedClass of spyOnClasses) {

        for (const spiedMethod of spyOnMethods) {

            sinon.spy(spiedClass.prototype, spiedMethod)

        }

    }

})

test.afterEach.always(() => {

    for (const spiedClass of spyOnClasses) {

        for (const spiedMethod of spyOnMethods) {

            spiedClass.prototype[spiedMethod].restore()

        }

    }

})

test.serial('Should compose an app if graph component declaration is valid', async t => {

    try {

        await compose([
            {
                component: Wheels,
                deps: []
            },
            {
                component: functionComponent,
                deps: []
            },
            {
                component: simpleObjectComponent,
                name: 'simpleObjectComponent',
                deps: []
            }
        ])

        t.pass()

    } catch (err) {

        t.fail(err)

    }

})

test.serial('Should throw if any of names is not unique', async t => {

    try {

        await compose([
            {
                component: Wheels,
                deps: []
            },
            {
                component: functionComponent,
                deps: []
            },
            {
                component: simpleObjectComponent,
                name: 'Wheels',
                deps: []
            }
        ])

        t.fail()

    } catch (err) {

        t.is(err.message, 'Dependency graph item name "Wheels" is not unique')

    }

})

test.serial('Should throw if declaration.component is not specified', async t => {

    try {

        await compose([ { deps: [] } ])

        t.fail()

    } catch (err) {

        t.is(err.name, 'AppError')
        t.true(err.message.includes('[child "component" fails because ["component" is required]]'))

    }

})

test.serial('Should throw if deps is omitted', async t => {

    try {

        await compose([ { component: Wheels } ])

        t.fail()

    } catch (err) {

        t.true(err.message.includes('[child "deps" fails because ["deps" is required]]'))

    }

})

test.serial('Should call components make methods with correspondent dependencies', async t => {

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

test.serial('App should start all components in the right order', async t => {

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

test.serial('App should stop all components in the right (backwards) order', async t => {

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

test.serial('App should not throw when it starts/stops if some of components has no start/stop method', async t => {

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

test.serial('App should throw if any of the component throws when make', async t => {

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

test.serial('App should throw if any of the component throws when start', async t => {

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

test.serial('App should throw if any of the component throws when stop', async t => {

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

/* eslint-enable */
