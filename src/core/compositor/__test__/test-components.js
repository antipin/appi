/* eslint-disable require-jsdoc */

export const carService = { name: 'Car' }
export const engineService = { name: 'Engine' }
export const wheelsService = { name: 'Wheels' }
export const lightsService = { name: 'Lights' }
export const unstartableService = { name: 'Unstartable' }
export const unstopableService = { name: 'Unstopable' }

export class Car {

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

export class Engine {

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

export class Wheels {

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

export class Lights {

    make() {

        return new Promise((resolve) => setTimeout(() => {

            this.service = lightsService

            resolve(this.service)

        }, 30))

    }

}

export class UnmakablePart {

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

export class UnstartablePart {

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

export class UnstopablePart {

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

/* eslint-enable */
