

<template>
  <div v-if="visibleTc" class="JianQieImgViewTc">
    <div class="JianQieImgView" style="" id="JianQieImgView">
      <div class="JianQieImgViewTitle">选择裁剪区域</div>

      <div class="JianQieImgViewContentView">
        <div class="JianQieImgViewContent">
          <vue-cropper
            @OnCurrentScaleValChange="OnCurrentScaleValChange"
            @OnMinScaleValChange="OnMinScaleValChange"
            @OnMaxScaleValChange="OnMaxScaleValChange"
            v-if="cropInfo && cropInfo.img"
            ref="cropper"
            :myChangeScale="myChangeScale"
            :img="cropInfo.img"
            :outputType="outputType"
            :CropWidth="cropInfo.CropWidth"
            :CropHeight="cropInfo.CropHeight"
          ></vue-cropper>
        </div>

        <change-scale-cropper
          @OnMyChangeScale="OnMyChangeScale"
          style="margin-top: 30px;"
          :maxScaleVal="maxScaleVal"
          :minScaleVal="minScaleVal"
          :currentScaleVal="currentScaleVal">
        </change-scale-cropper>

        <div class="JianQieButtonView">
          <div @click="cancelJianQie">取消</div>
          <div @click="confirmJianQie">确定</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Vue, Prop, Watch, Component } from "vue-property-decorator";
  import vueCropper from "./vueCropper.vue";
  import changeScaleCropper from "./changeScaleCropper.vue";

  export interface CropInfo {
    img: string,
    CropWidth: number,
    CropHeight: number
  }

  @Component({
    components: {
      vueCropper
      ,changeScaleCropper
    }
    ,computed: {
      viewInfo() {
        let info:any = document.getElementById("JianQieImgView");
        if (info && info.style) {
          return info.style.display;
        }
      }
    }
  })
  export default class JianQieImg extends Vue {
    @Prop({default: true}) visible!: boolean;
    @Prop({default: {img: "",CropWidth: 250,CropHeight:250}}) cropInfo!: any;

    @Watch('visible', {immediate: true, deep: true})
    onVisibleChanged(newVal: boolean) {
      this.visibleTc = newVal;
      if (newVal) {
        this.OnViewDisplay();
      }
    }

    @Watch('visibleTc', {immediate: true, deep: true})
    onVisibleTcChanged(newVal: boolean) {
      if (newVal) return;

      let tcView:any = document.getElementsByClassName("JianQieImgViewZuJianComponent")[0];
      if (!tcView || !tcView.style) return;

      tcView.parentNode.removeChild(tcView);
    }

    @Watch('cropInfo', {immediate: true, deep: true})
    onCropInfoChanged(newVal: any) {
      if (!newVal) return;

      if (!newVal.img) return;

      let arr = newVal.img!.split(',');
      if (!arr![0]!.match(/:(.*?);/) || arr![0]!.match(/:(.*?);/)!.length < 2) {
        this.outputType = "png";
        return;
      }

      let mime = arr![0]!.match(/:(.*?);/)![1]!;
      this.outputType = mime.split("/")[1];
    }

    visibleTc: boolean = false;
    currentScaleVal: number = 1;
    minScaleVal: number = 1;
    maxScaleVal: number = 1;
    myChangeScale: number = 1;
    outputType: string = "png";

    mounted() {
      this.visibleTc = this.visible;
      this.OnViewDisplay();
    }
    OnViewDisplay():void {
      if (!this.visibleTc) return;

      this.$nextTick(() => {
        let info:any = document.getElementById("JianQieImgView");
        if (!info || !info.style) return;

        if (info.style.display !== "none"
          && !document.getElementsByClassName("JianQieImgViewZuJianComponent")[0]) {
          let newDiv = document.createElement("div");
          newDiv.className = "JianQieImgViewZuJianComponent";
          newDiv.style.position = "fixed";
          newDiv.style.left = "0";
          newDiv.style.top = "0";
          newDiv.style.width = "100%";
          newDiv.style.height = "100%";
          newDiv.style.opacity = "0.5";
          newDiv.style.background = "#000";
          newDiv.style.zIndex = "3000";

          let body = document.getElementsByTagName("body")[0];
          body.appendChild(newDiv);
        }
      });
    }

    OnCurrentScaleValChange(val: number) {
      this.currentScaleVal = val;
    }
    OnMinScaleValChange(val: number) {
      this.minScaleVal = val;
    }
    OnMaxScaleValChange(val: number) {
      this.maxScaleVal = val;
    }

    OnMyChangeScale(val: number) {
      this.myChangeScale = val;
    }

    dataURLtoFile(dataurl: string, filename: string) {//将base64转换为文件
      if (!dataurl) return;

      let arr = dataurl!.split(',')
        , mime = arr![0]!.match(/:(.*?);/)![1]!
        , bstr = atob(arr[1]!)
        , n = bstr.length
        , u8arr = new Uint8Array(n);
      while(n--){
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, {type:mime});
    }
    cancelJianQie() {
      this.visibleTc = false;
      this.$emit("OnCropFileCancel",false);
    }
    confirmJianQie() {
      (<any>this.$refs.cropper).stopCrop();
      (<any>this.$refs.cropper).getCropData((data: string) => {
        let newFile = this.dataURLtoFile(data,'cropImg'+new Date().getTime());
        this.$emit('OnCropFileChange', newFile);
      });
    }
  }
</script>

<style>
  .JianQieImgViewTc{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    margin: 0;
    z-index: 3100;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .JianQieImgView{
    width: 420px;
    margin: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
  .JianQieImgViewTitle{
    height: 46px;
    background: #18B87E;
    font-family: MicrosoftYaHei;
    font-size: 20px;
    color: #FFFFFF;
    text-align: center;
    line-height: 46px;
  }

  .JianQieImgViewContentView{
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    background-color: #ffffff;
    padding: 36px;
    box-sizing: border-box;
  }
  .JianQieImgViewContent{
    width: 100%;
    height: 300px;
  }

  .JianQieButtonView{
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-top: 15px;
  }
  .JianQieButtonView>div{
    cursor: pointer;
    width: 100px;
    height: 40px;
    border-radius: 2px;
    font-family: MicrosoftYaHei;
    font-size: 18px;
    text-align: center;
    color: #FFFFFF;
    background: #B3B3B3;
    line-height: 40px;
  }
  .JianQieButtonView>div:last-child{
    background: #18B87E;
    margin-left: 48px;
  }
  .JianQieButtonView>div:hover{
    transform: scale(1.02);
  }
</style>
