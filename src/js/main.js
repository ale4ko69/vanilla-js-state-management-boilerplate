import StateManager from './state-manager.js'

class ToDoList {

    todoTempl = {
        name: '',
        done: false
    }

    constructor(props = {}) {
        const self = this;

        this.state = new StateManager({
            list: [],
            count: 0
        }, 'todo')

        // window.addEventListener('todo', (ev) => {
        //     const { detail } = ev
        //     if(detail.prop === 'list'){
        //         this.renderList()
        //     }
        // })

        this.state.recoil((e, d) => {
            const {prop} = e.detail

            if (prop === 'list') {
                this.renderList()
            }
            else if (prop === 'count') {
                this.renderCounter()
            }
        }, ['list', 'count'])

        const form = document.querySelector(`.js-form`)

        form.addEventListener('submit', (ev) => {
            ev.preventDefault()
            const input = document.querySelector('#new-item-field');
            const val = input.value;
            input.value = ''
            this.add('list', val)
        })
    }

    add(prop, payload) {
        console.log(`Add item`, prop, payload)
        this.state.add(prop, {...this.todoTempl, name: payload})
        const count = this.state.data.count + 1
        this.state.change('count', count)
    }

    remove(prop, index) {
        console.log(`Remove item`)
        this.state.remove(prop, index)
        const count = this.state.data.count - 1
        this.state.change('count', count)
    }

    changeList(prop, payload) {
        console.log(`Change item`)
        const data = [...this.state.data[prop]]
        const result = data.splice(payload, 1);
        this.state.change(prop, data)
        const count = this.state.data.count - 1
        this.state.change('count', count)
    }

    renderList() {
        const li = []
        const { data } = this.state
        data.list.forEach((item, index) => {
            li.push(`<li data-index='${index}'>${item.name}</li>`)
        })
        document.querySelector(`.js-items ul`).innerHTML = li.join('')
    }

    renderCounter() {
        const { count } = this.state.data;
        document.querySelector(`.js-total`).innerHTML = count
    }

    render() {
        document.querySelector(`.js-items`).innerHTML = `<ul aria-role='list'></ul><hr><div>Total: <span class="js-total">0</span></div>`
    }
}

export default ToDoList
