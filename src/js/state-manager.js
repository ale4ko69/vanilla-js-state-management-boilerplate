/*
    Working on a small 1D object reactive store, with array methods. Uses CustomEvent.
    You mutilate the data, then recoil in horror.
    For recoil functions, you can set which property changes are relevant. E.g. you can listen to just the list and string properties:

    const state = new StateManager({
      string: 'foo',
      list: [1,2,3],
      ignored: 'bla'
    })

    state.recoil((e, d) => {
    console.log(e.detail.type) // the type of mutilation (change, add, or remove)
    console.log(e.detail.prop) // which property was changed
    console.log(e.detail.val) // the new value for the changed property
    }, ['list', 'string'])

*/

/**
 *
 * @param {*} data - initialized data
 * @param {*} name - name of the Store
 * @param {*} context - context of the runtimem by default window
 */

function StateManager(data, name, context) {
    this.name = name || `state-manager-${+new Date().getTime()}`; //?
    this.data = data;
    this.context = context || window;

    this.isArr = function(p) {
        return Array.isArray(this.data[p])
    };

    this.isNumber = function(p) {
      return (typeof this.data[p] === 'number')
    }

    this.isString = function(p) {
      return (typeof this.data[p] === 'string')
    }

    this.isObject = function(p) {
      return (typeof this.data[p] === 'object')
    }

    this.dispatch = function(prop, val, type) {
      console.log(`dispatchEvent`, prop, val, type)

      this.context.dispatchEvent(
        new CustomEvent(this.name, {
          detail: { prop, val, type }
        })
      );
    };
}

  /**
   *
   */

StateManager.prototype = {
    change(prop, val) {
      this.data[prop] = val;
      this.dispatch(prop, val, "change");
    },

    add(prop, val) {

      if (this.isArr(prop)) {
        // if (typeof val === 'undefined') val =
        this.data[prop].push(val);
      }
      else if (this.isString(prop)) {
        (this.data[prop] = val)
      }
      else if (this.isNumber(prop)) {
        (this.data[prop] = val)
      }
      else {
        (this.data[prop] = [...this.data[prop], val]);
      }
      this.dispatch(prop, val, "add");
    },

    remove(prop, val) {

      if(this.isArr(prop)) {
        const removed = this.data[prop].splice(val, 1);
        this.dispatch(prop, removed, "remove");
      }
      else if (this.isObject(prop)) {
        delete this.data[prop];
        this.dispatch(prop, prop[val], "remove");
      }
      else {
        (this.data[prop] = '')
      }


    },

    recoil(cb, arrProps) {
      this.context.addEventListener(this.name, (e) => {
        if (!arrProps || arrProps.some((prop) => e.detail.prop.indexOf(prop) > -1)) {
          return cb(e, this.data);
        }
      });
    }
};


// const state = new StateManager({
//   string: 'foo',
//   list: [1,2,3],
//   ignored: 'bla'
// }, 'mystore') //?

// var a = state.recoil((e, d) => {
//   console.log(e.detail.type) //? the type of mutilation (change, add, or remove)
//   console.log(e.detail.prop) //? which property was changed
//   console.log(e.detail.val) //? the new value for the changed property
//   return e.detail
// }, ['list', 'string'])//?

// state.add('list', [4]) //?

export default StateManager;
