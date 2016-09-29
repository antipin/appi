import joi from 'joi'
import { resolveDependencyGraph } from '../utils/dependency-graph-resolver'
import { AppiError } from '../'

/**
 * @typedef {Function} Component
 */

/**
 * @typedef {Object} ComponentsGraphItem
 * @property {Component} component
 * @property {Array.<Component>} deps
 */

/**
 * @typedef {Array.<ComponentsGraphItem>} ComponentsGraph
 */

const componentSchema = joi.func()
const componentsGraphItemSchema = joi
    .object({
        component: componentSchema.required(),
        deps: joi.array().items(componentSchema).required(),

    })
const componentsGraphSchema = joi.array().items(componentsGraphItemSchema)

/**
 * Class is used for App related errors
 * @extends AppiError
 */
class AppError extends AppiError {

    static COMPONENT_INITIALIZATION_FAILED = 'COMPONENT_INITIALIZATION_FAILED'
    static COMPONENT_STOP_FAILED = 'COMPONENT_STOP_FAILED'
    static COMPONENT_START_FAILED = 'COMPONENT_START_FAILED'

}

/**
 * Main application class that is responsible for composing an app from components,
 * start components in the right order and stop them in backwards order
 */
class App {

    /**
     *
     * @param {ComponentsGraph} graph
     * @throws {ValidationError} if graph is invalid
     * @throws {GraphError} if graph has cycles or any other kind of malformed structures
     */
    constructor(graph) {

        const graphValidation = joi.validate(graph, componentsGraphSchema)

        if (graphValidation.error) {

            throw graphValidation.error

        }

        /**
         * Helper structure that maps components constructors to its instance
         * @type {Map}
         * @private
         */
        this.componentToInstanceMap = new Map()

        /**
         * Helper structure that maps components to its dependencies
         * @type {Map}
         * @private
         */
        this.componentToDepsMap = App.buildComponentToDepsMap(graph)

        /**
         * Array of resolved components
         * @type {Array.<Component>}
         * @private
         */
        this.resolvedComponents = App.resolveComponentsGraph(graph)

    }

    /**
     * Composes an app from interrelated components.
     * In fact it runs #make method on all components due to components resolution order.
     * @returns {Promise}
     * @todo Possible optimisation: some components can be initialized in parallel
     */
    async compose() {

        const { resolvedComponents, componentToDepsMap, componentToInstanceMap } = this

        // We should initialize all components. Here we have components in the right (resolved) order,
        // so we can initialize it one by one
        for (const Component of resolvedComponents) {

            // First we should collect all results of dependencies (which are resolved already) for current component
            const depsServices = Object.create(null)

            for (const componentDependency of componentToDepsMap.get(Component)) {

                const componentInstance = componentToInstanceMap.get(componentDependency)

                depsServices[componentDependency.name] = componentInstance.service

            }

            // Here we have all required arguments (depsServices) for make method of current Component
            const componentInstance = new Component()

            try {

                await componentInstance.make(depsServices)

            } catch (err) {

                throw new AppError(
                    `Component "${Component.name}" failed while initializing`,
                    AppError.COMPONENT_INITIALIZATION_FAILED
                )

            }

            // Saving result of current Component for next components
            componentToInstanceMap.set(Component, componentInstance)

        }

    }

    /**
     * Detects if app is composed
     * @returns {boolean}
     */
    get isComposed() {

        return this.componentToInstanceMap.size === this.resolvedComponents.length

    }

    /**
     * Starts all components that have start method in direct order
     * @returns {Promise}
     */
    async start() {

        if (this.isComposed === false) {

            throw new AppError('Can not start an app that was not composed.')

        }

        const { resolvedComponents, componentToInstanceMap } = this

        for (const Component of resolvedComponents) {

            const componentInstance = componentToInstanceMap.get(Component)

            if (typeof componentInstance.start === 'function') {

                try {

                    await componentInstance.start()

                } catch (err) {

                    throw new AppError(
                        `Component "${Component.name}" failed while start attempt`,
                        AppError.COMPONENT_START_FAILED
                    )

                }

            }

        }

    }

    /**
     * Stops all components that have stop method in backward order
     * @returns {Promise}
     */
    async stop() {

        if (this.isComposed === false) {

            throw new AppError('Can not stop an app before it was composed. Call #compose method first.')

        }

        const { resolvedComponents, componentToInstanceMap } = this
        const resolvedComponentsReversed = resolvedComponents.slice(0).reverse()

        for (const Component of resolvedComponentsReversed) {

            const componentInstance = componentToInstanceMap.get(Component)

            if (typeof componentInstance.stop === 'function') {

                try {

                    await componentInstance.stop()

                } catch (err) {

                    throw new AppError(
                        `Component "${Component.name}" failed while stop attempt`,
                        AppError.COMPONENT_STOP_FAILED
                    )

                }

            }

        }

    }

    /**
     * Maps components to its dependencies
     * @param {ComponentsGraph} componentsGraph
     * @returns {Map}
     * @private
     */
    static buildComponentToDepsMap(componentsGraph) {

        const componentsToDepsMap = new Map()

        for (const item of componentsGraph) {

            componentsToDepsMap.set(item.component, item.deps)

        }

        return componentsToDepsMap

    }

    /**
     * Resolves components dependency graph
     * @param {ComponentsGraph} componentsGraph
     * @returns {Array.<Component>}
     * @private
     */
    static resolveComponentsGraph(componentsGraph) {

        const graph = componentsGraph.map(graphItem => ({
            node: graphItem.component,
            deps: graphItem.deps,
        }))

        return resolveDependencyGraph(graph)

    }

}

/**
 * Composes application by putting together components with correspondent dependencies in specified order.
 * @param {ComponentsGraph} componentsGraph
 * @throws {ValidationError} if declarations is not corresponds with schema
 * @returns {Object} App object
 */
export async function compose(componentsGraph) {

    const app = new App(componentsGraph)

    await app.compose()

    return app

}
