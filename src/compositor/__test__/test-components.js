import { AppiComponent } from '../..'

/* eslint-disable require-jsdoc */

export const carService = { name: 'Car' }
export const engineService = { name: 'Engine' }
export const wheelsService = { name: 'Wheels' }
export const lightsService = { name: 'Lights' }
export const unstartableService = { name: 'Unstartable' }
export const unstopableService = { name: 'Unstopable' }
export const functionComponentService = { name: 'FunctionComponentService' }
export const appiFunctionComponentService = { name: 'AppiFunctionComponentService' }
export const simpleObjectComponent = { name: 'simpleObjectComponent' }
export const simpleArrayComponent = { name: 'simpleArrayComponent' }

class Car extends AppiComponent {

    static componentName = 'car'

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

class Engine extends AppiComponent {

    static componentName = 'engine'

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

class Wheels extends AppiComponent {

    static componentName = 'wheels'

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

class Lights extends AppiComponent {

    static componentName = 'lights'

    make() {

        return new Promise((resolve) => setTimeout(() => {

            this.service = lightsService

            resolve(this.service)

        }, 30))

    }

}

class UnmakablePart extends AppiComponent {

    static componentName = 'unmakablePart'

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

class UnstartablePart extends AppiComponent {

    static componentName = 'unstartablePart'

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

class UnstoppablePart extends AppiComponent {

    static componentName = 'unstoppablePart'

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

function functionComponent() {

    return functionComponentService

}

function appiFunctionComponent() {

    return new Promise((resolve) => setTimeout(() => resolve(appiFunctionComponentService), 30))

}

appiFunctionComponent.componentName = 'appiFunctionComponent'

const unmakablePart = new UnmakablePart()
const unstartablePart = new UnstartablePart()
const unstoppablePart = new UnstoppablePart()

export {
    appiFunctionComponent, functionComponent,
    Car, Wheels, Engine, Lights,
    unmakablePart, unstartablePart, unstoppablePart
}

/* eslint-enable */
