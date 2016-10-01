import { AppiComponent } from '../..'

/* eslint-disable require-jsdoc */

export const carService = { name: 'Car' }
export const engineService = { name: 'Engine' }
export const wheelsService = { name: 'Wheels' }
export const lightsService = { name: 'Lights' }
export const unstartableService = { name: 'Unstartable' }
export const unstopableService = { name: 'Unstopable' }
export const functionComponentService = { name: 'FunctionComponentService' }
export const simpleObjectComponent = { name: 'simpleObjectComponent' }

export class Car extends AppiComponent {

    make() {

        return new Promise((resolve) => setTimeout(() => {

            this.service = carService

            resolve(this.service)

        }, 30))

    }

    start() {

        return new Promise((resolve) => setTimeout(() => resolve(), 15))

    }

    stop() {

        return new Promise((resolve) => setTimeout(() => resolve(), 15))

    }

}

export class Engine extends AppiComponent {

    make() {

        return new Promise((resolve) => setTimeout(() => {

            this.service = engineService

            resolve(this.service)

        }, 20))

    }

    start() {

        return new Promise((resolve) => setTimeout(() => resolve(), 10))

    }

    stop() {

        return new Promise((resolve) => setTimeout(() => resolve(), 15))

    }

}

export class Wheels extends AppiComponent {

    make() {

        return new Promise((resolve) => setTimeout(() => {

            this.service = wheelsService

            resolve(this.service)

        }, 10))

    }

    start() {

        return new Promise((resolve) => setTimeout(() => resolve(), 5))

    }

    stop() {

        return new Promise((resolve) => setTimeout(() => resolve(), 15))

    }

}

export class Lights extends AppiComponent {

    make() {

        return new Promise((resolve) => setTimeout(() => {

            this.service = lightsService

            resolve(this.service)

        }, 30))

    }

}

export class UnmakablePart extends AppiComponent {

    make() {

        return new Promise((resolve, reject) => setTimeout(() => {

            reject(new Error('UnmakablePart can not be made'))

        }, 30))

    }

    start() {

        return new Promise((resolve) => setTimeout(() => resolve(), 15))

    }

    stop() {

        return new Promise((resolve) => setTimeout(() => resolve(), 15))

    }

}

export class UnstartablePart extends AppiComponent {

    make() {

        return new Promise((resolve) => setTimeout(() => {

            this.service = unstartableService

            resolve(this.service)

        }, 30))

    }

    start() {

        return new Promise((resolve, reject) => setTimeout(() => reject(new Error()), 15))

    }

    stop() {

        return new Promise((resolve) => setTimeout(() => resolve(), 15))

    }

}

export class UnstopablePart extends AppiComponent {

    make() {

        return new Promise((resolve) => setTimeout(() => {

            this.service = unstopableService

            resolve(this.service)

        }, 30))

    }

    start() {

        return new Promise((resolve) => setTimeout(() => resolve(), 15))

    }

    stop() {

        return new Promise((resolve, reject) => setTimeout(() => reject(new Error()), 15))

    }

}

export function functionComponent() {

    return functionComponentService

}

/* eslint-enable */
