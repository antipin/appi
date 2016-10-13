import { AppiError } from '../../core/appi-error'

export class UserError extends AppiError {

    static TOKEN_EXPIRED = Symbol()
    static TOKEN_MALFORMED = Symbol()

}
