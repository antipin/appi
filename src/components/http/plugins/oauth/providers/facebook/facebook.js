/**
 * Returns facebook provider configuration
 * @param {Object} config
 * @returns {Object}
 */
export function makeFacebookProvider(config) {

    return {
        strategyOptions: {
            provider: 'facebook',
            isSecure: config.oauth.isSecure,
            password: config.oauth.cookiePassword,
            clientId: config.oauth.providers.facebook.clientId,
            clientSecret: config.oauth.providers.facebook.clientSecret,
            runtimeStateCallback: (request) => {

                let result = ''

                if (request.query) {

                    const query = JSON.stringify(request.query)
                    const based64Query = Buffer.from(query).toString('base64')

                    result = `.${based64Query}`

                }

                return result

            }

        }

    }

}
