import test from 'ava'
import { resolveDependencyGraph } from '../'

/* eslint-disable require-jsdoc */

class Node {

    constructor(name) {

        this.name = name

    }

    toString() {

        return `(${this.name})`

    }

}

const a = new Node('a')
const b = new Node('b')
const c = new Node('c')
const d = new Node('d')
const e = new Node('e')
const f = new Node('f')
const g = new Node('g')

test('Should resolve graph in a right order', t => {

    const graph = [
        {
            node: a,
            deps: [ d ],
        },
        {
            node: b,
            deps: [ a, c, f ],
        },
        {
            node: c,
            deps: [ d, a ],
        },
        {
            node: d,
            deps: [],
        },
        {
            node: e,
            deps: [ b, f ],
        },
        {
            node: f,
            deps: [],
        },
        {
            node: g,
            deps: [ e ],
        },
    ]
    const depsResolution = resolveDependencyGraph(graph)

    t.deepEqual(depsResolution, [ f, d, a, c, b, e, g ])

})

test('Should resolve empty graph', t => {

    const depsResolution = resolveDependencyGraph([])

    t.deepEqual(depsResolution, [])

})

test('Should throw if cycle dependencies detected', t => {

    const graph = [
        {
            node: a,
            deps: [ d, e ],
        },
        {
            node: b,
            deps: [ a, c, f ],
        },
        {
            node: c,
            deps: [ d, a, f ],
        },
        {
            node: d,
            deps: [],
        },
        {
            node: e,
            deps: [ b, f ],
        },
        {
            node: f,
            deps: [],
        },
        {
            node: g,
            deps: [ e ],
        },
    ]

    try {

        resolveDependencyGraph(graph)

        t.fail()

    } catch (err) {

        t.is(err.message, 'Dependency cycle detected: (e) -> (b) -> (c) -> (a) -> (e)')

    }

})

test('Should throw if graph`s item has no "node" property', t => {

    const graph = [
        {
            deps: [ d, e ],
        },
        {
            node: b,
            deps: [ a, c, f ],
        },
        {
            node: c,
            deps: [ d, a, f ],
        }
    ]

    try {

        resolveDependencyGraph(graph)

        t.fail()

    } catch (err) {

        t.is(err.message, 'Every graph item should have valid "node" and "deps" properties')

    }

})

test('Should throw if graph`s item has no "deps" property', t => {

    const graph = [
        {
            node: a,
        },
        {
            node: b,
            deps: [ a, c, f ],
        },
        {
            node: c,
            deps: [ d, a, f ],
        }
    ]

    try {

        resolveDependencyGraph(graph)

        t.fail()

    } catch (err) {

        t.is(err.message, 'Every graph item should have valid "node" and "deps" properties')

    }

})

test('Should throw if graph is not an array', t => {

    try {

        resolveDependencyGraph({})

        t.fail()

    } catch (err) {

        t.is(err.message, 'Graph should be represented as an array')

    }

})

test('Should throw if some nodes defined more than once', t => {

    const graph = [
        {
            node: a,
            deps: [ d ],
        },
        {
            node: a,
            deps: [ c ],
        },
        {
            node: c,
            deps: [],
        },
        {
            node: d,
            deps: [],
        }
    ]

    try {

        resolveDependencyGraph(graph)

        t.fail()

    } catch (err) {

        t.is(err.message, 'Graph node (a) defined more than once')

    }

})

test.failing('Should throw if some dependencies refers to not defined nodes', t => {

    const graph = [
        {
            node: a,
            deps: [ d ],
        }
    ]

    try {

        resolveDependencyGraph(graph)

        t.fail()

    } catch (err) {

        t.is(err.message, 'Some of dependencies refers to not defined nodes')

    }

})

/* eslint-enable */
