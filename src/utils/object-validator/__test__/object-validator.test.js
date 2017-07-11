import test from 'ava'
import joi from 'joi'
import { validateObject } from '../'

/* eslint-disable require-jsdoc */

test('validateObject should return data if it matches its schema', t => {

    const data = validateObject({
        data: {
            foo: 'bar'
        },
        schema: {
            foo: joi.string().only([ 'bar' ])
        }
    })

    t.deepEqual(data, { foo: 'bar' })

})

test('validateObject should throw if data do not matches its schema', t => {

    t.throws(
        () => {

            validateObject({
                data: {
                    foo: 'bar'
                },
                schema: {
                    foo: joi.number()
                }
            })

        },
        (err) => err.message === 'child "foo" fails because ["foo" must be a number]'
    )

})

test('validateObject should throw if declaration has no data property', t => {

    t.throws(
        () => {

            validateObject({
                doto: {
                    foo: 'bar'
                },
                schema: {
                    foo: joi.string().only([ 'bar' ])
                }
            })

        },
        (err) => err.message === 'child "data" fails because ["data" is required]'
    )

})

test('validateObject should throw if declaration has no schema property', t => {

    t.throws(
        () => {

            validateObject({
                data: {
                    foo: 'bar'
                },
                scheeema: {
                    foo: joi.string().only([ 'bar' ])
                }
            })

        },
        (err) => err.message === 'child "schema" fails because ["schema" is required]'
    )

})

test('validateObject should process values if required', t => {

    const data = validateObject({
        data: {
            foo: 'bar',
            bar: 42,
        },
        schema: {
            foo: joi.string().only([ 'bar' ]),
            bar: joi.number(),
        },
        processing: {
            foo: value => value + value
        }
    })

    t.deepEqual(data, {
        foo: 'barbar',
        bar: 42,
    })

})

/* eslint-enable */