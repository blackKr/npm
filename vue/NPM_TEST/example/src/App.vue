

<template>
  <div id="app">
    <vue-img-cropper
      :cropInfo="cropInfo"
      :visible="jianQieTc">
    </vue-img-cropper>

    <hello-msg :data="msgData"></hello-msg>
  </div>
</template>

<script lang="ts">
  import {Vue, Component, Watch, Prop} from "vue-property-decorator";
  // import VueImgCropper from "./views/imgJianQie/VueImgCropper.vue";
  import VueImgCropper from "vue-cropper-img";
  // import {CropInfo} from "vue-cropper-img";
  import helloMsg from "vue_npm_test_hello_msg"

  interface Config {
    color?: string;
    width: string;
    [propName: string]: any;
  }

  @Component({
    components: {
      VueImgCropper
      ,helloMsg
    }
  })
  export default class App extends Vue {
    jianQieTc: boolean = true;
    cropInfo: any = {
      img: "https://weijiweidaping-pro.oss-cn-qingdao.aliyuncs.com/" +
        "orgInfo/6fc6383483d0f0dec8e831190d0a3ede.jpeg"
      ,CropHeight: 90
      ,CropWidth: 90
    };
    msgData: any = {
      name: "我是谁"
    };

    private created():void{
      console.error(this.getConfig({width: "30", gan: "sada"}));
    }

    private getConfig(info: Config): Config{
      return info;
    }
  }
</script>

