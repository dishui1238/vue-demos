// 1.插件
// 2.两个组件

// vue插件：
// function
// 要求必须有一个install，将来会被Vue.use调用
let Vue; // 保存Vue构造函数，插件中要使用，不导入还能用
class VueRouter {
  constructor(options) {
    this.$options = options;
    this.matched = [];
    this.current = window.location.hash.slice(1) || "/";
    // 将来发生变化，router-view的render函数能够再次执行
    Vue.util.defineReactive(this, "matched", []);
    // 监控 hash 变化 hash变化的时候更新current，从而触发router-view组件的重新渲染
    window.addEventListener("hashchange", this.onHashChange.bind(this));
    // 初始执行一次
    this.match();
  }

  onHashChange() {
    this.current = window.location.hash.slice(1);
    console.log("this.current", this.current);
    this.matched = []; // 保存匹配的路由数组
    this.match();
  }

  // 递归遍历routes，获取当前hash匹配的路由
  match(routes) {
    routes = routes || this.$options.routes;
    for (const key in routes) {
      const route = routes[key];
      if (route.path === "/" && this.current === "/") {
        this.matched.push(route);
        return;
      }
      if (route.path !== "/" && this.current.indexOf(route.path) !== -1) {
        this.matched.push(route);
        if (route.children) {
          this.match(route.children);
        }
      }
    }
  }
}
// 参数1是Vue.use调用时传入的
VueRouter.install = function(_Vue) {
  console.log("install");
  Vue = _Vue;

  // 1.挂载$router属性
  // this.$router.push()
  // 全局混入目的：延迟下面逻辑到router创建完毕并且附加到选项上时才执行
  Vue.mixin({
    beforeCreate() {
      // 次钩子在每个组件创建实例时都会调用
      // 根实例才有该选项
      if (this.$options.router) {
        Vue.prototype.$router = this.$options.router;
      }
    },
  });

  // 2.注册实现两个组件router-view,router-link
  Vue.component("router-link", {
    props: {
      to: {
        type: String,
        required: true,
      },
    },
    render(h) {
      // <a href="to">xxx</a>
      // return <a href={'#'+this.to}>{this.$slots.default}</a>
      return h(
        "a",
        {
          attrs: {
            href: "#" + this.to,
          },
        },
        this.$slots.default
      );
    },
  });
  Vue.component("router-view", {
    render(h) {
      this.$vnode.data.routerView = true;

      // 标记当前 router-view 深度
      let depth = 0;
      let parent = this.$parent;
      while (parent) {
        const vnodeData = parent.$vnode && parent.$vnode.data;
        if (vnodeData && vnodeData.routerView) {
          depth++;
        }
        parent = parent.$parent;
      }

      console.log("depth", depth, this.$router);

      // 获取当前路由对应的组件
      let component = null;
      const route = this.$router.matched[depth];
      if (route) {
        component = route.component;
      }

      return h(component);
    },
  });
};

export default VueRouter;
