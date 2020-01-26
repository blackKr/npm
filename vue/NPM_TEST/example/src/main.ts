

import 'babel-polyfill';
import Vue from 'vue';
import App from './App.vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './styles/common.css';


class Main {
  public static init():void {
    Vue.use(ElementUI);
    Vue.config.productionTip = false;
  }

  public static main():Vue {
    this.init();
    return new Vue({
      el: '#app',
      template: '<App/>',
      components: { App }
    });
  }
}

export default Main.main();
