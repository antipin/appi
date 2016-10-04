import joi from 'joi'
import { resolveDependencyGraph, AppiError, AppiComponent } from '../'

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

/**
 * Class is used for App related errors
 * @extends AppiError
 */
class AppError extends AppiError {

    static DEPENDENCY_GRAPH_VALIDATION_FAILED = 'DEPENDENCY_GRAPH_VALIDATION_FAILED'
    static COMPONENT_INITIALIZATION_FAILED = 'COMPONENT_INITIALIZATION_FAILED'
    static COMPONENT_STOP_FAILED = 'COMPONENT_STOP_FAILED'
    static COMPONENT_START_FAILED = 'COMPONENT_START_FAILED'

}

/**
 * Main application class that is responsible for composing an app from components,
 * start components in the right order and stop them in backwards order
 */
class App {

    static COMPONENT_TYPE_APPI_CLASS = Symbol('COMPONENT_TYPE_APPI_CLASS')
    static COMPONENT_TYPE_APPI_FUNC = Symbol('COMPONENT_TYPE_APPI_FUNC')
    static COMPONENT_TYPE_DEFAULT = Symbol('COMPONENT_TYPE_DEFAULT')
    static COMPONENT_TYPE_UNSUPPORTED = Symbol('COMPONENT_TYPE_UNSUPPORTED')

    /**
     *
     * @param {ComponentsGraph} graph
     * @throws {AppError} if graph is invalid
     * @throws {GraphError} if graph has cycles or any other kind of malformed structures
     */
    constructor(graph) {

        App.validate(graph)

        /**
         * Helper structure that maps components constructors to its instance
         * @type {Map}
         * @private
         */
        this.componentToInstanceMap = new Map()

        /**
         * Helper structure that maps components to its service
         * @type {Map}
         * @private
         */
        this.componentToServiceMap = new Map()

        /**
         * Helper structure that maps components' name to its service
         * @type {Map}
         * @private
         */
        this.componentNameToServiceMap = new Map()

        /**
         * Helper structure that maps components to its GraphItem
         * @type {Map}
         * @private
         */
        this.componentToGraphItemMap = App.buildComponentToGraphItemMap(graph)

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

        const { resolvedComponents, componentToInstanceMap, componentToServiceMap, componentNameToServiceMap } = this

        // We should initialize all components. Here we have components in the right (resolved) order,
        // so we can initialize it one by one
        for (const component of resolvedComponents) {

            const dependenciesValues = this.extractDependenciesValues(component)
            const componentType = App.detectComponentType(component)
            const componentName = this.getComponentName(component)

            switch (componentType) {

                case App.COMPONENT_TYPE_APPI_CLASS:

                    try {

                        const componentInstance = new component()

                        // Saving instance and value of current component for next components
                        await componentInstance.make(dependenciesValues)
                        componentToInstanceMap.set(component, componentInstance)
                        componentToServiceMap.set(component, componentInstance.service)
                        componentNameToServiceMap.set(componentName, componentInstance.service)

                    } catch (err) {

                        throw new AppError(
                            `Component "${component.name}" failed while initializing with error: "${err.message}"`,
                            AppError.COMPONENT_INITIALIZATION_FAILED
                        )

                    }

                    break

                case App.COMPONENT_TYPE_APPI_FUNC:

                    try {

                        const componentResult = await component(dependenciesValues)
                        componentToServiceMap.set(component, componentResult)
                        componentNameToServiceMap.set(componentName, componentResult)

                    } catch (err) {

                        throw new AppError(
                            `Component "${component.name}" failed while initializing with error: "${err.message}"`,
                            AppError.COMPONENT_INITIALIZATION_FAILED
                        )

                    }

                    break

                case App.COMPONENT_TYPE_DEFAULT:

                    // Saving service of current component for next components
                    componentToServiceMap.set(component, component)
                    componentToServiceMap.set(componentName, component)

                    break

                default:

                    throw new AppError(
                        `Component has unsupportable type "${typeof component}"`,
                        AppError.COMPONENT_INITIALIZATION_FAILED
                    )

            }

        }

    }

    /**
     * Starts all components that have start method in direct order
     * @returns {Promise}
     */
    async start() {

        if (this.isComposed === false) {

            throw new AppError('Can not start an app that was not composed')

        }

        const { resolvedComponents, componentToInstanceMap } = this

        for (const component of resolvedComponents) {

            const componentInstance = componentToInstanceMap.get(component)

            if (componentInstance && typeof componentInstance.start === 'function') {

                try {

                    await componentInstance.start()

                } catch (err) {

                    throw new AppError(
                        `Component "${component.name}" failed while start attempt with error: "${err.message}"`,
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

        for (const component of resolvedComponentsReversed) {

            const componentInstance = componentToInstanceMap.get(component)

            if (componentInstance && typeof componentInstance.stop === 'function') {

                try {

                    await componentInstance.stop()

                } catch (err) {

                    throw new AppError(
                        `Component "${component.name}" failed while stop attempt with error: "${err.message}"`,
                        AppError.COMPONENT_STOP_FAILED
                    )

                }

            }

        }

    }

    /**
     * Returns service instance by component name
     * @param {string} componentName
     * @returns {Object}
     */
    getService(componentName) {

        return this.componentNameToServiceMap.get(componentName)

    }

    /**
     * Detects if app is composed
     * @returns {boolean}
     */
    get isComposed() {

        return this.componentToGraphItemMap.size === this.resolvedComponents.length

    }

    /**
     * Extracts all values from exact component's dependencies
     * @param {Any} component
     * @returns {Object} Map of dependency name to its value
     * @private
     */
    extractDependenciesValues(component) {

        const { componentToGraphItemMap , componentToServiceMap } = this
        const dependenciesValues = Object.create(null)
        const graphItem = componentToGraphItemMap.get(component)

        for (const componentDependency of graphItem.deps) {

            const dependencyGraphItem = componentToGraphItemMap.get(componentDependency)

            dependenciesValues[dependencyGraphItem.name] = componentToServiceMap.get(componentDependency)

        }

        return dependenciesValues

    }

    /**
     * Validates input graph
     * @param {ComponentsGraph} graph
     * @throws {AppError} if graph is invalid
     * @returns {void}
     */
    static validate(graph) {

        const componentSchema = joi.alternatives()
            .try(
                joi.func(),
                joi.object()
            )
        const componentsGraphItemSchema = joi.object({
            component: componentSchema
                .required(),
            name: joi.string()
                .regex(/^[A-z][A-z0-9]+$/),
            deps: joi.array()
                .items(componentSchema)
                .required()
        })
        const componentsGraphSchema = joi.array()
            .items(componentsGraphItemSchema)

        // Perform basic joi schema validation
        const graphValidation = joi.validate(graph, componentsGraphSchema)

        if (graphValidation.error) {

            throw new AppError(
                graphValidation.error.message,
                AppError.DEPENDENCY_GRAPH_VALIDATION_FAILED
            )

        }

        // Check if all graph items has names and all names are unique.
        const names = Object.create(null)

        graph.forEach((graphItem, index) => {

            const name = App.extractNameFromGraphItem(graphItem, index)

            if (names[name]) {

                throw new AppError(
                    `Dependency graph item name "${name}" is not unique`,
                    AppError.DEPENDENCY_GRAPH_VALIDATION_FAILED
                )

            } else {

                names[name] = name

            }

        })

    }

    /**
     * Returns component name by component object
     * @param {Any} component
     * @returns {string}
     */
    getComponentName(component) {

        const graphItem = this.componentToGraphItemMap.get(component)

        return graphItem.name

    }

    /**
     * Detects component type
     * @param {Any} component
     * @returns {Symbol}
     */
    static detectComponentType(component) {

        if (component.prototype instanceof AppiComponent) {

            return App.COMPONENT_TYPE_APPI_CLASS

        } else if (typeof component === 'function' && component.isAppiComponent === true) {

            return App.COMPONENT_TYPE_APPI_FUNC

        } else if (typeof component === 'function' || typeof component === 'object') {

            return App.COMPONENT_TYPE_DEFAULT

        }

        return App.COMPONENT_TYPE_UNSUPPORTED

    }

    /**
     * Maps components to its dependencies
     * @param {ComponentsGraph} componentsGraph
     * @returns {Map}
     * @private
     */
    static buildComponentToGraphItemMap(componentsGraph) {

        const map = new Map()

        for (const item of componentsGraph) {

            map.set(item.component, {
                component: item.component,
                deps: item.deps,
                name: App.extractNameFromGraphItem(item)
            })

        }

        return map

    }

    /**
     * Extracts name from graph item. First we try to get name from graphItem "name" property,
     * if it's empty and component is a function/class we are using Function.name
     * @param {ComponentsGraphItem} graphItem
     * @param {number} [index] graph item index in graph array
     * @returns {string}
     */
    static extractNameFromGraphItem(graphItem, index = -1) {

        const variablePattern = /^[A-z][A-z0-9]+$/
        const { name, component } = graphItem
        const isNamedFunction = (typeof component === 'function' && typeof component.name !== 'undefined')
        let result

        if (typeof name === 'string' && name.match(variablePattern) !== null) {

            result = graphItem.name

        } else if (isNamedFunction === true) {

            result = component.name

        } else {

            throw new AppError(
                `Dependency graph item #${index} has invalid or empty "name" property`,
                AppError.DEPENDENCY_GRAPH_VALIDATION_FAILED
            )

        }

        return result

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
