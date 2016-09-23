/**
 * Enhanced base Error class that supports code and name properties.
 */
export class AppiError extends Error {

    /**
     * @param {string|Error} error Human readable message or Error instance
     * @param {string} code Error code
     * @constructor
     */
    constructor(error, code) {

        if (error instanceof Error) {

            super(error.message)

            Object.assign(this, error)

        } else {

            super(error)

        }

        this.name = this.constructor.name
        this.code = code || ''

    }

}
