import joi from 'joi'

/**
 * Returns config data and its schema
 * @param {Object} env
 * @returns {SchemedData}
 */
export function getConfig(env) {

    const {
        APP_HOST = '0.0.0.0',
        APP_PORT = 8000,
        AUTH_SALT, AUTH_SECRET, AUTH_TTL,
        OAUTH_COOKIE_PASSWORD, OAUTH_FACEBOOK_ID, OAUTH_FACEBOOK_SECRET,
        /**
         * Forces usage of https while oauth communication
         * @type {string}
         */
        OAUTH_IS_SECURE = 'true',
        /**
         * Default maximum http request payload size
         * @type {number}
         */
        HTTP_POST_MAX_BODY_SIZE = 50 * 1024 * 1024
    } = env

    return {
        data: {
            server: {
                host: APP_HOST,
                port: APP_PORT,
                routes: {
                    payload: {
                        maxBytes: HTTP_POST_MAX_BODY_SIZE,
                    },
                },
            },
            auth: {
                passwordSalt: AUTH_SALT,
                jwtSecret: AUTH_SECRET,
                jwtExpiresIn: AUTH_TTL,
            },
            oauth: {
                cookiePassword: OAUTH_COOKIE_PASSWORD,
                isSecure: OAUTH_IS_SECURE === 'true',
                providers: {
                    facebook: {
                        clientId: OAUTH_FACEBOOK_ID,
                        clientSecret: OAUTH_FACEBOOK_SECRET,
                    },
                },
            },
        },
        schema: {
            server: joi.object({
                host: joi.string()
                    .hostname()
                    .required(),
                port: joi.number()
                    .min(1024)
                    .max(65535)
                    .required(),
                routes: joi.object({
                    payload: joi.object({
                        maxBytes: joi.number()
                            .required(),
                    }),
                }),
            }),
            auth: joi.object({
                passwordSalt: joi.string()
                    .alphanum()
                    .min(32)
                    .required(),
                jwtSecret: joi.string()
                    .alphanum()
                    .min(32)
                    .required(),
                jwtExpiresIn: joi.number()
                    .required(),
            }),
            oauth: joi.object({
                cookiePassword: joi.string()
                    .alphanum()
                    .min(8)
                    .required(),
                isSecure: joi.boolean()
                    .required(),
                providers: joi.object({
                    facebook: joi.object({
                        clientId: joi.string()
                            .required(),
                        clientSecret: joi.string()
                            .hex()
                            .length(32)
                            .required(),
                    }),
                }),
            }),
        }
    }

}
