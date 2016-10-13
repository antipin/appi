import path from 'path'
import joi from 'joi'

/**
 * Returns config data and its schema
 * @param {Object} env
 * @returns {SchemedData}
 */
export function getConfig(env) {

    const {
        LOCAL_FS_PATH = '/var/appi-file-storage/',
        LOCAL_FS_EXTENSIONS = 'jpg,jpeg,gif,png,txt,pdf',
        /**
         * Maximum file size in bytes
         * @type {number}
         */
        LOCAL_FS_MAX_SIZE = 50 * 1024 * 1024
    } = env

    return {
        data: {
            path: LOCAL_FS_PATH,
            allowedExtensions: LOCAL_FS_EXTENSIONS,
            maxSizeInBytes: LOCAL_FS_MAX_SIZE
        },
        schema: {
            path: joi.string()
                .required(),
            allowedExtensions: joi.string()
                .required(),
            maxSizeInBytes: joi.number()
                .required(),
        },
        processing: {
            path: value => path.join(value, '/'), // ensure trailing slash
            allowedExtensions: value => value.split(','),
        }
    }

}
