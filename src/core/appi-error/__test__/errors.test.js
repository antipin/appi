import test from 'ava'
import { AppiError } from '../'

/* eslint-disable require-jsdoc */

test('#constructor should create correct instance when called with error message', t => {

    class MyError extends AppiError {}

    const errorMessage = 'Some error occurred'
    const myError = new MyError(errorMessage)

    t.is(myError.message, errorMessage)
    t.is(myError.name, 'MyError')

})

test('#constructor should create correct instance when called with instance of Error', t => {

    class MyError extends AppiError {}

    const errorMessage = 'Some general error occurred'
    const error = new Error(errorMessage)
    error.foo = 'bar'
    const myError = new MyError(error)

    t.is(myError.message, errorMessage)
    t.is(myError.name, 'MyError')
    t.is(myError.code, '')
    t.is(myError.foo, 'bar')

})

test('#constructor should create correct instance with code when called with error message and code', t => {

    class MyError extends AppiError {

        static SOME_CODE = 'SOME_CODE'

    }

    const errorMessage = 'Some error occurred'
    const myError = new MyError(errorMessage, MyError.SOME_CODE)

    t.is(myError.code, MyError.SOME_CODE)

})

test('#constructor should create correct instance with code when called with error object and code', t => {

    class MyError extends AppiError {

        static SOME_CODE = 'SOME_CODE'

    }

    const errorMessage = 'Some error occurred'
    const error = new Error(errorMessage)
    const myError = new MyError(error, MyError.SOME_CODE)

    t.is(myError.code, MyError.SOME_CODE)

})

test('Class that extends AppiError should have AppiError codes as well as own codes', t => {

    class MySuperError extends AppiError {

        static SOME_SUPER_CODE = 'SOME_SUPER_CODE'

    }

    class MyError extends MySuperError {

        static SOME_CODE = 'SOME_CODE'

    }

    t.is(MyError.SOME_SUPER_CODE, 'SOME_SUPER_CODE')
    t.is(MyError.SOME_CODE, 'SOME_CODE')

})

/* eslint-enable */