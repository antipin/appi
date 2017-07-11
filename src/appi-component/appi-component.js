import { AppiError } from '../'

/**
 * Base class for Appi components
 */
export class AppiComponent {

    /**
     * Validates successor class
     */
    constructor() {

        if (typeof this.constructor.componentName === 'undefined') {

            throw new AppiError(
                `Appi component class "${this.constructor.name}" must have "componentName" static property`
            )

        }

        if (typeof this.constructor.prototype.make !== 'function') {

            throw new AppiError(
                `Appi component class "${this.constructor.name}" must have "make" method in its prototype`
            )

        }

    }

    /**
     * @type {string}
     */
    get name() {

        return this.constructor.componentName

    }

}
