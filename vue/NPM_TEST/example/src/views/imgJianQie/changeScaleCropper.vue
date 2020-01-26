

<template>
  <div class="changeScaleCropperView">
    <img
      @mousedown="mouseDownScale('changeScaleMin')"
      @mouseup="mouseUpScale('changeScaleMin')"
      class="changeScaleMinImgSrc"
      :src="changeScaleMinImgSrc"/>

    <div class="changeScaleCropperLineView">
      <div :style="{
      left: movePointLeft === 0
      ? '-8px':movePointLeft === 100
      ? movePointLeft + '%' - '8px': movePointLeft + '%'}"
           @mousedown="mouseDownMoveScale"
           class="changeScaleCropperPoint"></div>
      <div :style="{width: movePointLeft + '%'}" class="lineGrayActive"></div>
      <div class="changeScaleCropperViewLineGray"></div>
    </div>

    <img
      @mousedown="mouseDownScale('changeScaleMax')"
      @mouseup="mouseUpScale('changeScaleMax')"
      class="changeScaleMaxImgSrc"
      :src="changeScaleMaxImgSrc"/>
  </div>
</template>

<script lang="ts">
  import { Vue, Prop, Watch, Component } from "vue-property-decorator";

  @Component
  export default class changeScaleCropper extends Vue {
    @Prop({default: 1}) currentScaleVal!: number;
    @Prop({default: 1}) minScaleVal!: number;
    @Prop({default: 1}) maxScaleVal!: number;

    @Watch('currentScaleVal', {immediate: true, deep: true})
    onCurrentScaleValChanged(newVal: number) {
      if (newVal) {
        this.upCurrentLeft();
      }
    }

    @Watch('minScaleVal', {immediate: true, deep: true})
    onMinScaleValChanged(newVal: number) {
      if (newVal) {
        this.upCurrentLeft();
      }
    }

    @Watch('maxScaleVal', {immediate: true, deep: true})
    onMaxScaleValChanged(newVal: number) {
      if (newVal) {
        this.upCurrentLeft();
      }
    }

    changeScaleMinImgSrc: string = require("./images/Reduce.png");
    changeScaleMaxImgSrc: string = require("./images/Plus.png");

    movePointLeft: number = 0;
    scaleVal: number = 1;

    startDownTimeStamp: number = 0;
    startDownTimeStampTimeOut: any = null;
    downTimeStampInterval: any = null;

    upCurrentLeft(currentVal: number = this.currentScaleVal): void {
      if (!this.minScaleVal || !this.maxScaleVal || !this.currentScaleVal) {
        return;
      }

      let movePointLeft =
        (currentVal - this.minScaleVal)*100
        /(this.maxScaleVal - this.minScaleVal);
      movePointLeft = movePointLeft >= 100 ? 100 : movePointLeft;
      this.scaleVal = currentVal;
      this.movePointLeft = movePointLeft;
    }

    changeScaleMin(): void {
      if (this.scaleVal <= this.minScaleVal) {
        this.stopPress();
        return;
      }

      this.scaleVal -= 0.01;
      this.upCurrentLeft(this.scaleVal);
      this.$emit("OnMyChangeScale", this.scaleVal);
    }
    changeScaleMax(): void {
      if (this.scaleVal >= this.maxScaleVal) {
        this.stopPress();
        return;
      }

      this.scaleVal += 0.01;
      this.upCurrentLeft(this.scaleVal);
      this.$emit("OnMyChangeScale", this.scaleVal);
    }

    mouseDownScale(method: string): void {
      this.startDownTimeStamp = new Date().getTime();
      this.startDownTimeStampTimeOut = setTimeout(() => {
        if (!this.startDownTimeStampTimeOut) return;

        this.downTimeStampInterval = setInterval(() => {
          if (!this.downTimeStampInterval) return;

          (<any>this)[method!]();
        },100);
      },501);
    }
    mouseUpScale(method: string): void {
      let clickTime: number = new Date().getTime();
      if (clickTime - this.startDownTimeStamp <= 500) {
        this.stopPress();
        (<any>this)[method!]();
        return;
      }

      this.stopPress();
    }
    stopPress():void {
      clearTimeout(this.startDownTimeStampTimeOut);
      this.startDownTimeStampTimeOut = null;

      clearInterval(this.downTimeStampInterval);
      this.downTimeStampInterval = null;
    }

    mouseDownMoveScale(e: any):void{
      window.addEventListener('mousemove', this.mouseMoveScale);
      window.addEventListener('mouseup', this.mouseUpMoveScale);
    }
    mouseUpMoveScale():void{
      window.removeEventListener('mouseup', this.mouseUpMoveScale);
      window.removeEventListener('mousemove', this.mouseMoveScale);
      this.stopPress();
    }
    mouseMoveScale(e: any):void{
      let parentDom: any =
        <any>document.getElementsByClassName("changeScaleCropperViewLineGray")[0];
      let parentDomInfo: any = parentDom.getBoundingClientRect();
      let width: number = parentDomInfo.width;
      let parentDomX = parentDomInfo.x;

      let scaleCha: number = this.maxScaleVal - this.minScaleVal;
      let xCha = e.x - parentDomX;
      if (xCha < 0) return;

      let changeScale: number = xCha*scaleCha/width;
      if (this.scaleVal >= this.maxScaleVal) {
        this.stopPress();
        return;
      }

      this.scaleVal = this.minScaleVal + changeScale;
      this.upCurrentLeft(this.scaleVal);
      this.$emit("OnMyChangeScale", this.scaleVal);
    }
  }
</script>

<style scoped>
  .changeScaleCropperView{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }
  .changeScaleMinImgSrc
  ,.changeScaleMaxImgSrc{
    width: 24px;
    height: 24px;
    margin: auto 0;
    flex-shrink: 0;
    cursor: pointer;
  }
  .changeScaleMinImgSrc{
    margin-right: 20px;
    cursor: pointer;
  }
  .changeScaleMaxImgSrc{
    margin-left: 20px;
  }
  .changeScaleCropperLineView{
    position: relative;
    height: 24px;
    line-height: 24px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
  }
  .changeScaleCropperViewLineGray{
    height: 5px;
    background: #EEEEEE;
    width: 100%;
    margin: auto;
  }
  .lineGrayActive{
    position: absolute;
    top: 50%;
    left: 0;
    height: 5px;
    background: #18B87E;
    margin-top: -2.5px;
  }
  .changeScaleCropperPoint{
    position: absolute;
    z-index: 20;
    background: #18B87E;
    border-radius: 100%;
    width: 16px;
    height: 16px;
    top: 50%;
    margin-top: -8px;
    cursor: pointer;
  }
</style>
