

<template>
  <div id="app">
    <vue-img-cropper
      :cropInfo="cropInfo"
      :visible="jianQieTc">
    </vue-img-cropper>
  </div>
</template>

<script lang="ts">
  import {Vue, Component, Watch, Prop} from "vue-property-decorator";
  import VueImgCropper from "./views/imgJianQie/VueImgCropper.vue";
  import {CropInfo} from "./views/imgJianQie/VueImgCropper";

  @Component({
    components: {
      VueImgCropper
    }
  })
  export default class App extends Vue {
    jianQieTc: boolean = true;
    cropInfo: CropInfo = {
      img: "https://weijiweidaping-pro.oss-cn-qingdao.aliyuncs.com/" +
        "orgInfo/6fc6383483d0f0dec8e831190d0a3ede.jpeg"
      ,CropHeight: 90
      ,CropWidth: 90
    }
  }
</script>

