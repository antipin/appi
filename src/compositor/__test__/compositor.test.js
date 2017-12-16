import test from 'ava'
import sinon from 'sinon'
import { compose } from '../'
import {
    Car, Wheels, Engine, Lights, engineService, wheelsService, lightsService,
    unstoppablePart, unstartablePart, unmakablePart, appiFunctionComponentService,
    appiFunctionComponent, functionComponent, simpleObjectComponent, simpleArrayComponent } from './test-components'

/* eslint-disable require-jsdoc */

function createCarGroupComponnets() {

    const car = new Car()
    const wheels = new Wheels()
    const engine = new Engine()
    const lights = new Lights()

    for (const spiedObject of [ car, engine, wheels, lights ]) {

        for (const spiedMethod of [ 'make', 'start', 'stop' ]) {

            if (typeof spiedObject[spiedMethod] === 'function') {

                sinon.spy(spiedObject, spiedMethod)

            }

        }

    }

    return { car, wheels, engine, lights }

}

test('Should compose an app if graph component declaration is valid', async t => {

    const { wheels } = createCarGroupComponnets()

    try {

        await compose([
            {
                component: wheels,
                deps: []
            },
            {
                component: functionComponent,
                name: 'functionComponent',
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

test('Should throw if any of names is not unique', async t => {

    const { wheels } = createCarGroupComponnets()

    try {

        await compose([
            {
                component: wheels,
                deps: []
            },
            {
                component: functionComponent,
                name: 'functionComponent',
                deps: []
            },
            {
                component: simpleObjectComponent,
                name: 'wheels',
                deps: []
            }
        ])

        t.fail()

    } catch (err) {

        t.is(err.message, 'Dependency graph item name "wheels" is not unique')

    }

})

test('Should throw if declaration.component is not specified', async t => {

    try {

        await compose([ { deps: [] } ])

        t.fail()

    } catch (err) {

        t.is(err.name, 'AppError')
        t.true(err.message.includes('[child "component" fails because ["component" is required]]'))

    }

})

test('Should throw if deps is omitted', async t => {

    const { wheels } = createCarGroupComponnets()

    try {

        await compose([ { component: wheels } ])

        t.fail()

    } catch (err) {

        t.true(err.message.includes('[child "deps" fails because ["deps" is required]]'))

    }

})

test('Should call components make methods with correspondent dependencies', async t => {

    const { car, wheels, engine, lights } = createCarGroupComponnets()

    try {

        const spiedAppiFunctionComponent = sinon.spy(appiFunctionComponent)

        await compose([
            {
                component: wheels,
                deps: [],
            },
            {
                component: engine,
                deps: [ wheels ],
            },
            {
                component: spiedAppiFunctionComponent,
                deps: [ wheels ],
            },
            {
                component: lights,
                deps:[],
            },
            {
                component: car,
                deps: [ wheels, engine, spiedAppiFunctionComponent, lights ],
            },
        ])

        t.true(car.make.calledWithExactly({
            engine: engineService,
            wheels: wheelsService,
            appiFunctionComponent: appiFunctionComponentService,
            lights: lightsService
        }))
        t.true(engine.make.calledWithExactly({ wheels: wheelsService }))
        t.true(spiedAppiFunctionComponent.calledWithExactly({ wheels: wheelsService }))
        t.true(wheels.make.calledWithExactly({}))

    } catch (err) {

        t.fail(err)

    }

})

test('App should start all components in the right order', async t => {

    const { lights, car, wheels, engine } = createCarGroupComponnets()
    const app = await compose([
        {
            component: lights,
            deps: [],
        },
        {
            component: wheels,
            deps: [ lights ],
        },
        {
            component: engine,
            deps: [ wheels, lights ],
        },
        {
            component: car,
            deps: [ wheels, engine ],
        },
    ])

    await app.start()

    sinon.assert.callOrder(
        wheels.start,
        engine.start,
        car.start,
    )

    t.pass()

})

test('App should stop all components in the right (backwards) order', async t => {

    const { lights, car, wheels, engine } = createCarGroupComponnets()
    const app = await compose([
        {
            component: lights,
            deps: [],
        },
        {
            component: wheels,
            deps: [ lights ],
        },
        {
            component: engine,
            deps: [ wheels ],
        },
        {
            component: car,
            deps: [ wheels, engine ],
        },
    ])

    await app.start()
    await app.stop()

    sinon.assert.callOrder(
        car.stop,
        engine.stop,
        wheels.stop,
    )

    t.pass()

})

test('App should not throw when it starts/stops if some of components has no start/stop method', async t => {

    const { lights, car, wheels, engine } = createCarGroupComponnets()

    try {

        const app = await compose([
            {
                component: wheels,
                deps: [],
            },
            {
                component: engine,
                deps: [ wheels, lights ],
            },
            {
                component: lights,
                deps: [ wheels ],
            },
            {
                component: car,
                deps: [ wheels, engine ],
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

    const { lights, car, wheels, engine } = createCarGroupComponnets()

    try {

        await compose([
            {
                component: wheels,
                deps: [],
            },
            {
                component: unmakablePart,
                deps: [ wheels ],
            },
            {
                component: engine,
                deps: [ wheels, lights ],
            },
            {
                component: lights,
                deps: [ wheels, unmakablePart ],
            },
            {
                component: car,
                deps: [ wheels, engine ],
            },
        ])

        t.fail()

    } catch (err) {

        t.true(err.message.startsWith('Component "unmakablePart" failed while initializing with error:'))
        t.is(err.code, 'COMPONENT_INITIALIZATION_FAILED')

    }

})

test('App should throw if any of the component throws when start', async t => {

    const { lights, car, wheels, engine } = createCarGroupComponnets()

    try {

        const app = await compose([
            {
                component: wheels,
                deps: [],
            },
            {
                component: unstartablePart,
                deps: [ wheels ],
            },
            {
                component: engine,
                deps: [ wheels, lights ],
            },
            {
                component: lights,
                deps: [ wheels, unstartablePart ],
            },
            {
                component: car,
                deps: [ wheels, engine ],
            },
        ])

        await app.start()

        t.fail()

    } catch (err) {

        t.true(err.message.startsWith('Component "unstartablePart" failed while start attempt with error:'))
        t.is(err.code, 'COMPONENT_START_FAILED')

    }

})

test('App should throw if any of the component throws when stop', async t => {

    const { lights, car, wheels, engine } = createCarGroupComponnets()

    try {

        const app = await compose([
            {
                component: wheels,
                deps: [],
            },
            {
                component: unstoppablePart,
                deps: [ wheels ],
            },
            {
                component: engine,
                deps: [ wheels, lights ],
            },
            {
                component: lights,
                deps: [ wheels, unstoppablePart ],
            },
            {
                component: car,
                deps: [ wheels, engine ],
            },
        ])

        await app.start()
        await app.stop()

        t.fail()

    } catch (err) {

        t.true(err.message.startsWith('Component "unstoppablePart" failed while stop attempt with error:'))
        t.is(err.code, 'COMPONENT_STOP_FAILED')

    }

})

test('App#isComposed should return true if compose invoked successfully', async t => {

    const { lights, car, wheels, engine } = createCarGroupComponnets()

    const app = await compose([
        {
            component: functionComponent,
            name: 'functionComponent',
            deps: [],
        },
        {
            component: simpleObjectComponent,
            name: 'simpleObjectComponent',
            deps: [ functionComponent ],
        },
        {
            component: simpleArrayComponent,
            name: 'simpleArrayComponent',
            deps: [],
        },
        {
            component: wheels,
            deps: [ simpleObjectComponent ],
        },
        {
            component: unstoppablePart,
            deps: [ wheels ],
        },
        {
            component: engine,
            deps: [ wheels, lights ],
        },
        {
            component: lights,
            deps: [ wheels, unstoppablePart ],
        },
        {
            component: car,
            deps: [ wheels, engine ],
        },
    ])

    t.true(app.isComposed)

})

/* eslint-enable */
