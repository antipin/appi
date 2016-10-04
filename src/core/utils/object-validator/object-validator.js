import joi from 'joi'

/**
 * @typedef {Object} SchemedData
 * @property {Object} data
 * @property {Object} schema
 */

/**
 * Validates data against its schema
 * @param {SchemedData} declaration
 * @returns {Object} data
 * @throws {ValidationError}
 */
export function validateObject(declaration) {

    const declValidation = joi.validate(declaration, joi.object({
        data: joi.object().required(),
        schema: joi.object().required(),
    }))

    if (declValidation.error) {

        throw declValidation.error

    }

    const { data, schema } = declaration
    const dataValidation = joi.validate(data, joi.object(schema))

    if (dataValidation.error) {

        throw dataValidation.error

    }

    return data

}
