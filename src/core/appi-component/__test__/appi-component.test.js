import test from 'ava'
import { AppiError } from '../..'
import { AppiComponent } from '../'

/* eslint-disable require-jsdoc */

test('Should not throw if AppiComponent successor is valid', t => {

    class MyComponent extends AppiComponent {

        static componentName = 'myComponent'

        make() {}

    }

    t.notThrows(() => new MyComponent())

})

test('Should throw if AppiComponent successor has no "componentName" static property', t => {

    class MyComponent extends AppiComponent {

        make() {}

    }

    t.throws(
        () => new MyComponent(),
        (err) => (
            err instanceof AppiError &&
            err.message === 'Appi component class "MyComponent" must have "componentName" static property'
        )
    )

})

test('Should throw if AppiComponent successor has no "make" method', t => {

    class MyComponent extends AppiComponent {

        static componentName = 'myComponent'

    }

    t.throws(
        () => new MyComponent(),
        (err) => (
            err instanceof AppiError &&
            err.message === 'Appi component class "MyComponent" must have "make" method in its prototype'
        )
    )

})

/* eslint-enable */