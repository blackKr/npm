

<template>
  <vue-img-cropper
    :cropInfo="cropInfo"
    :visible="imgCropperVisible">
  </vue-img-cropper>
</template>

<script lang="ts">
  import {Vue, Component, Watch, Prop} from "vue-property-decorator";
  import VueImgCropper from "./imgJianQie/VueImgCropper.vue";
  import {CropInfo} from "./imgJianQie/VueImgCropper.vue";

  @Component({
    components: {
      VueImgCropper
    }
  })
  export default class App extends Vue {
    @Prop({default: true}) imgCropperVisible!: boolean;
    @Prop({default: {
            img: "https://weijiweidaping-pro.oss-cn-qingdao.aliyuncs.com/" +
                "orgInfo/6fc6383483d0f0dec8e831190d0a3ede.jpeg"
            ,CropHeight: 90
            ,CropWidth: 90
        }}) cropInfo!: CropInfo;
  }
</script>
