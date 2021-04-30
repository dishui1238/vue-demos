// 1.插件：挂载$store
// 2.实现Store

let Vue;

class Store {
  // options 为 new Vuex.Store 时传入的数据 {state: {…}, getters: {…}, mutations: {…}, actions: {…}}
  constructor(options) {
    this._mutations = options.mutations;
    this._actions = options.actions;
    this._wrappedGetters = options.getters;

    this.commit = this.commit.bind(this);
    this.dispatch = this.dispatch.bind(this);
    // 3. 实现 getters
    this.getters = {}; // 仓库上面挂载一个getters, 暴露给用户
    const computed = {}; // {doubleCounter: doubleCounter(){return state.counter * 2}}
    // $store.getters.doubleCounter
    const store = this;
    Object.keys(this._wrappedGetters).forEach((key) => {
      const fn = store._wrappedGetters[key];

      // 转化为 computed 可以转化为无参数形式
      computed[key] = function() {
        return fn(store.state);
      };
      // 为 getters 定义只读属性
      Object.defineProperty(store.getters, key, {
        get: () => {
          return store._vm[key];
        },
      });
    });

    // data响应式处理
    // this.$store.state.xx
    this._vm = new Vue({
      data: {
        $$state: options.state,
      },
      computed,
    });
  }

  get state() {
    return this._vm._data.$$state;
  }

  set state(v) {
    console.error("please use replaceState to reset state");
  }

  // 1. 实现 commit
  commit(type, payload) {
    const entry = this._mutations[type];
    if (!entry) {
      console.error("unkown mutation type");
    }

    entry(this.state, payload);
  }

  // 2. 实现 dispatch
  dispatch(type, payload) {
    const entry = this._actions[type];
    if (!entry) {
      console.error("unkown action type");
    }

    entry(this, payload);
  }
}

// Vue.use
// install.apply(this, [this,...])
function install(_Vue) {
  Vue = _Vue;

  Vue.mixin({
    beforeCreate() {
      // 根实例才有this.$options.store，即 main.js
      if (this.$options.store) {
        console.log("store", this.$options.store);
        // this.$store = this.$options.store  // 在当前实例上挂 $store
        Vue.prototype.$store = this.$options.store; // 在vue原型上挂 $store，所有 vue 实例都能访问
      } else {
        //如果不是根组件的话，也把$store挂到上面,因为是树状组件，所以用这种方式
        // this.$store = this.$parent && this.$parent.$store;
      }
    },
  });
}

export default { Store, install };
