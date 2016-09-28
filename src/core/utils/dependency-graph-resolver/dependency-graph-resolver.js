/**
 * @typedef {Object} Node
 */

/**
 * @typedef {Object} GraphItem
 * @property {Node} node
 * @property {Array.<Node>} deps
 */

/**
 * @typedef {Array.<GraphItem>} Graph
 */

/**
 * Class is used for GraphResolver related errors
 * @extends Error
 */
class GraphError extends Error {

}

/**
 * Resolves dependency graph. Graph nodes and deps could be represent as any js type
 */
class GraphResolver {

    /**
     * @param {Graph} graph
     */
    constructor(graph) {

        GraphResolver.validate(graph)

        /**
         * Input graph
         * @type {Graph}
         * @private
         */
        this.graph = graph

        /**
         * Helper structure that maps nodes to its deps
         * @type {Map}
         * @private
         */
        this.graphToDepsMap = GraphResolver.makeNodeToDepsMap(graph)

        /**
         * Stack of nodes
         * @type {Array.<Node>}
         * @private
         */
        this.stack = this.graph.map(item => item.node)

        /**
         * Storage of nodes that were successfully resolved
         * @type {Set}
         * @private
         */
        this.resolvedNodes = new Set()

        /**
         * Storage of nodes that were visited but at that moment they were unresolvable
         * @type {Set}
         * @private
         */
        this.visitedNodes = new Set()

    }

    /**
     * Trying to resolve dependency graph
     * @throws {GraphError} if graph has cycled dependencies
     * @returns {Array.<Node>}
     */
    resolve() {

        const { stack, resolvedNodes, visitedNodes, graphToDepsMap } = this

        while (stack.length > 0) {

            const currentNode = stack[stack.length - 1]

            if (this.isNodeResolved(currentNode)) {

                stack.pop()

            } else if (this.isNodeResolvable(currentNode)) {

                stack.pop()
                resolvedNodes.add(currentNode)
                visitedNodes.delete(currentNode)

            } else {

                // Cycle detection
                if (visitedNodes.has(currentNode)) {

                    throw new GraphError(`Dependency cycle detected: ${this.extractCycle(currentNode).join(' -> ')}`)

                }

                // Add to .visitedNodes
                visitedNodes.add(currentNode)

                // Add its dependencies to .stack
                Array.prototype.push.apply(stack, graphToDepsMap.get(currentNode))

            }

        }

        return Array.from(resolvedNodes)

    }

    /**
     * Detects if node is resolved already
     * @param {Node} node
     * @returns {boolean}
     * @private
     */
    isNodeResolved(node) {

        return this.resolvedNodes.has(node)

    }

    /**
     * Detects if node can be resolved right now (all dependencies are resolved)
     * @param {Node} node
     * @returns {boolean}
     * @private
     */
    isNodeResolvable(node) {

        const { graphToDepsMap } = this

        return graphToDepsMap.get(node).every(depNode => this.isNodeResolved(depNode))

    }

    /**
     * Extracts nodes that forms the cycle from this.visitedNodes set
     * @param {Node} node
     * @returns {Array.<Node>}
     * @private
     */
    extractCycle(node) {

        const { visitedNodes } = this
        const result = []
        let isNodeFound = false

        for (const visitedNode of visitedNodes) {

            if (node === visitedNode) {

                isNodeFound = true

            }

            if (isNodeFound === true) {

                result.push(visitedNode)

            }

        }

        result.push(node)

        return result

    }

    /**
     * Builds a map of nodes to its dependencies
     * @param {Graph} graph
     * @returns {Map}
     * @private
     */
    static makeNodeToDepsMap(graph) {

        const nodeToDepsMap = new Map()

        for (const item of graph) {

            nodeToDepsMap.set(item.node, item.deps)

        }

        return nodeToDepsMap

    }

    /**
     * Builds a map of nodes to its dependencies
     * @param {Graph} graph
     * @throws {GraphError} if graph is not an Array
     * @throws {GraphError} if any graph item is not valid
     * @throws {GraphError} if any node defined more than once
     * @returns {void}
     * @private
     */
    static validate(graph) {

        if (Array.isArray(graph) === false) {

            throw new GraphError('Graph should be represented as an array')

        }

        const nodes = new Set()
        const allowedNodeTypes = [ 'object', 'function', 'string', 'number' ]

        for (const item of graph) {

            if (allowedNodeTypes.includes(typeof item.node) === false || Array.isArray(item.deps) === false) {

                throw new GraphError('Every graph item should have valid "node" and "deps" properties')

            }

            if (nodes.has(item.node)) {

                throw new GraphError(`Graph node ${item.node.toString()} defined more than once`)

            }

            nodes.add(item.node)

        }

    }

}

/**
 * It takes a graph of objects that represents dependencies between them and resolves it in a right order
 *
 * @param {Graph} graph Dependency graph that is needed to be resolved
 * @throws {GraphError} if graph has cycled dependencies
 * @returns {Array.<Node>} Resolved graph in the form of array
 */
export function resolveDependencyGraph(graph) {

    const graphResolver = new GraphResolver(graph)

    return graphResolver.resolve()

}
