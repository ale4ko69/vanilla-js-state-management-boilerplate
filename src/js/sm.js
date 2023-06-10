class StoreManager {

    static #state = {} //---- Private Static STATE field
    _state = {}        //---- Proxy Object for State

    constructor({name, context, initialState}) {
        const self = this;
        self.name = name || `sm-${+new Date().getTime()}`;
        self.context = context || window;
        self.helper = new Helper();

        //---- For use watch mutations
        self.status = 'resting';

        self._state = new Proxy(StoreManager.#state, {
            set(target, prop, val, receiver) {

                console.log('StoreManager.#state', target, prop, val)

                //---- Set the value as we would normally
                target[prop] = val;

                //---- Reset the status ready for the next operation
                self.status = 'resting';
                return true;
            },
            get(target, prop, receiver) {

                if (prop === '') {
                    return JSON.parse(JSON.stringify(Reflect.get(target, prop, receiver)));
                }

                if (target.hasOwnProperty(prop)) {

                    if (self.helper.isString(target, prop)){
                        return target[prop]
                    }
                    else if (self.helper.isNumber(target, prop)) {
                        return target[prop]
                    }
                    else {
                        return JSON.parse(JSON.stringify(Reflect.get(target, prop, receiver)));
                    }
                }
            }
        });

        self.dispatch = (prop, val, type) => {
            console.log(`dispatchEvent`, prop, val, type)

            self.context.dispatchEvent(
              new CustomEvent(self.name, {
                detail: { prop, val, type }
              })
            );
        };

    }

    useState = (prop, value) => {
        const self = this;

        self._state[prop] = value; //?

        const cbName = `set${prop.charAt(0).toUpperCase()}${prop.slice(1)}`//?

        self.dispatch(prop, value, "add");

        return {
            [prop]: self._state[prop],
            [cbName]: (value) => {
                self._state[prop] = value; //?
                self.dispatch(prop, value, "change");
                return self._state[prop]
            }
        }
    }

    useEffect = (cb, arrProps) => {
        const self = this;

        self.context.addEventListener(self.name, (e) => {
            if (!arrProps || arrProps.some((prop) => e.detail.prop.includes(prop))) {
              return cb(e, self._state);
            }
        });
    }

    state = (key) => {
        const self = this;
        return self._state[key]
    }

}

class Helper {

    isArr(obj, p) {
        return Array.isArray(obj[p])
    };

    isNumber(obj, p) {
      return (typeof obj[p] === 'number')
    }

    isString(obj, p) {
      return (typeof obj[p] === 'string')
    }

    isObject(obj, p) {
      return (typeof obj[p] === 'object')
    }

}

const Obj = document.createElement('div')

//New Store
const store = new StoreManager({name: 'alex', context: Obj}) //?

//Get Methods from Store
const {useEffect, useState, state} = store //?

//Add new property and value
const {user, setUser} = useState('user', {name: 'Kagansky Alexey'}) //?

//Use Effect for watch on the property change
useEffect((event, data) => {
    const { prop } = event.detail

    if (prop === 'user') {
        console.log('useEffect: User changed; Make any DOM changes', data)//?
    }

}, ['user'])

console.log('Current state for user', state())

function getUser() {
   fetch('https://jsonplaceholder.typicode.com/users/1')
    .then(response => response.json())
    .then(json => {
        console.log('getUser: After getUser -> json: ', json) //?
        setUser(json)
    })
}

function updateUser() {
    let _User = state('user')

    console.log('updateUser: Try to direct update state User', _User) //?

    _User = Object.assign(_User, {name: '1 Sergey Kagansky'})

    console.log('updateUser: After direct update NO CHANGES', state('user')) //?

    setUser(Object.assign(_User, {name: '2 Sergey Kagansky'}))

    console.log('updateUser: After update method setUser USER CHANGED', state('user')) //?

    setTimeout(async () => {
        await getUser()
        console.log('Started getUser') //?
    }, 2000)
}

setTimeout(updateUser, 2000)


