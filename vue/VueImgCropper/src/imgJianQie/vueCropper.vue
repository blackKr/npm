

<template>
  <div class="vue-cropper" ref="cropper" @mouseover="scaleImg" @mouseout="cancleScale">
    <div class="cropper-box">
      <div class="cropper-box-canvas"
           v-show="!loading"
           :style="{
					'width': trueWidth + 'px',
					'height': trueHeight + 'px',
					'transform': 'scale(' + scale + ',' + scale + ') '
					+ 'translate3d('+ x / scale + 'px,' + y / scale + 'px,' + '0)'
					+ 'rotateZ('+ rotate * 90 +'deg)'
					}"
      >
        <img
          :src="imgs"
          alt="cropper-img"
          ref="cropperImg"
        />
      </div>
    </div>
    <div
      class="cropper-drag-box"
      :class="{'cropper-move': move && !crop, 'cropper-crop': crop, 'cropper-modal': cropping}"
      @mousedown="startMove"
      @touchstart="startMove"
    >
    </div>
    <div
      v-show="cropping"
      class="cropper-crop-box"
      :style="{
					'width': cropW + 'px',
					'height': cropH + 'px',
					'transform': 'translate3d('+ cropOffsertX + 'px,' + cropOffsertY + 'px,' + '0)'
				}">
				<span class="cropper-view-box">
					<img
            :style="{
						'width': trueWidth + 'px',
						'height': trueHeight + 'px',
						'transform': 'scale(' + scale + ',' + scale + ') ' + 'translate3d('+ (x - cropOffsertX) / scale  + 'px,' + (y - cropOffsertY) / scale + 'px,' + '0)'
						+ 'rotateZ('+ rotate * 90 +'deg)'
						}"
            :src="imgs"
            alt="cropper-img"
          />
				</span>
      <span
        class="cropper-face cropper-move"
        @mousedown="cropMove"
        @touchstart="cropMove"
      ></span>
      <span class="crop-info"
            v-if="info"
            :style="{'top': cropInfo}">
        {{  this.cropW > 0 ? this.cropW : 0 }} × {{ this.cropH > 0 ? this.cropH : 0 }}
      </span>
      <span v-if="!fixedBox">
					<span class="crop-line line-w" @mousedown="changeCropSize($event, false, true, 0, 1)" @touchstart="changeCropSize($event, false, true, 0, 1)"></span>
					<span class="crop-line line-a" @mousedown="changeCropSize($event, true, false, 1, 0)" @touchstart="changeCropSize($event, true, false, 1, 0)"></span>
					<span class="crop-line line-s" @mousedown="changeCropSize($event, false, true, 0, 2)" @touchstart="changeCropSize($event, false, true, 0, 2)"></span>
					<span class="crop-line line-d" @mousedown="changeCropSize($event, true, false, 2, 0)" @touchstart="changeCropSize($event, true, false, 2, 0)"></span>
					<span class="crop-point point1" @mousedown="changeCropSize($event, true, true, 1, 1)" @touchstart="changeCropSize($event, true, true, 1, 1)"></span>
					<span class="crop-point point2" @mousedown="changeCropSize($event, false, true, 0, 1)" @touchstart="changeCropSize($event, false, true, 0, 1)"></span>
					<span class="crop-point point3" @mousedown="changeCropSize($event, true, true, 2, 1)" @touchstart="changeCropSize($event, true, true, 2, 1)"></span>
					<span class="crop-point point4" @mousedown="changeCropSize($event, true, false, 1, 0)" @touchstart="changeCropSize($event, true, false, 1, 0)"></span>
					<span class="crop-point point5" @mousedown="changeCropSize($event, true, false, 2, 0)" @touchstart="changeCropSize($event, true, false, 2, 0)"></span>
					<span class="crop-point point6" @mousedown="changeCropSize($event, true, true, 1, 2)" @touchstart="changeCropSize($event, true, true, 1, 2)"></span>
					<span class="crop-point point7" @mousedown="changeCropSize($event, false, true, 0, 2)" @touchstart="changeCropSize($event, false, true, 0, 2)"></span>
					<span class="crop-point point8" @mousedown="changeCropSize($event, true, true, 2, 2)" @touchstart="changeCropSize($event, true, true, 2, 2)"></span>
				</span>
    </div>
  </div>
</template>

<script>
  // import exif from './exif';

  export default {
    data: function () {
      return {
        // 容器高宽
        w: 0,
        h: 0,
        // 图片缩放比例
        scale: 1,
        // 图片偏移x轴
        x: 0,
        // 图片偏移y轴
        y: 0,
        // 图片加载
        loading: true,
        // 图片真实宽度
        trueWidth: 0,
        // 图片真实高度
        trueHeight: 0,
        move: true,
        // 移动的x
        moveX: 0,
        // 移动的y
        moveY: 0,
        // 开启截图
        crop: false,
        // 正在截图
        cropping: false,
        // 裁剪框大小
        cropW: 0,
        cropH: 0,
        cropOldW: 0,
        cropOldH: 0,
        // 判断是否能够改变
        canChangeX: false,
        canChangeY: false,
        // 改变的基准点
        changeCropTypeX: 1,
        changeCropTypeY: 1,
        // 裁剪框的坐标轴
        cropX: 0,
        cropY: 0,
        cropChangeX: 0,
        cropChangeY: 0,
        cropOffsertX: 0,
        cropOffsertY: 0,
        // 支持的滚动事件
        support: '',
        // 移动端手指缩放
        touches: [],
        touchNow: false,
        // 图片旋转
        rotate: 0,
        isIos: false,
        orientation: 0,
        imgs: '',
        // 图片缩放系数
        coe: 0.1,
        // 是否正在多次缩放
        scaling: false,
        scalingSet: '',
        coeStatus: '',

        // 宽高比
        fixedNumber: [1,1],
        defaultCropWidth: 250,
        defaultCropHeight: 250,
        showCropW: 250,
        showCropH: 250,

        //min max scale
        canScaleMin: true,
        canScaleMax: true,
        minScale: 0.0000001,
        maxScale: 100000000,
        maxScaleBi: 3

        ,centerPointX: 0
        ,centerPointY: 0

        ,agoImgMoveE: ""
      }
    },
    props: {
      img: {
        type: String,
        default: ''
      },
      // 输出图片压缩比
      outputSize: {
        type: Number,
        default: 1
      },
      outputType: {
        type: String,
        // default: 'jpeg'
        default: 'png'
      },
      info: {
        type: Boolean,
        default: false
      },
      // 是否开启滚轮放大缩小
      canScale: {
        type: Boolean,
        default: true
      },
      // 是否自成截图框
      autoCrop: {
        type: Boolean,
        default: true
      },
      autoCropWidth: {
        type: Number,
        default: 250
      },
      autoCropHeight: {
        type: Number,
        default: 250
      },
      // 是否开启固定宽高比
      fixed: {
        type: Boolean,
        default: true
      },
      // 宽高比 w/h
      // fixedNumber: {
      //   type: Array,
      //   default: () => {
      //     return [1, 1]
      //   }
      // },
      // 固定大小 禁止改变截图框大小
      fixedBox: {
        type: Boolean,
        default: true
      },
      // 输出截图是否缩放
      full: {
        type: Boolean,
        default: false
      },
      // 是否可以拖动图片
      canMove: {
        type: Boolean,
        default: true
      },
      // 是否可以拖动截图框
      canMoveBox: {
        type: Boolean,
        default: false
      },
      // 上传图片按照原始比例显示
      original: {
        type: Boolean,
        default: false
      },

      // 裁剪的尺寸
      CropWidth: {
        type: Number
        ,default: 250
      },
      CropHeight: {
        type: Number
        ,default: 250
      }

      // 手动缩放
      ,myChangeScale: {
        type: Number
        ,default: 1
      }
    },
    computed: {
      cropInfo () {
        return this.cropOffsertY > 20 ? '-20px' : '0px'
      }
    },
    watch: {
      // 如果图片改变， 重新布局
      img () {
        // 当传入图片时, 读取图片信息同时展示
        this.initConfig();
        this.checkedImg()
      },
      imgs (val) {
        this.initConfig();
        if (val === '') {
          return
        }
        this.reload()
      },
      cropW () {
        this.initConfig();
        this.cropW = ~~(this.cropW);
        this.showPreview()
      },
      cropH () {
        this.initConfig();
        this.cropH = ~~(this.cropH);
        this.showPreview()
      },
      cropOffsertX () {
        this.initConfig();
        this.showPreview();
      },
      cropOffsertY () {
        this.initConfig();
        this.showPreview();
      },
      scale () {
        this.initConfig();
        this.showPreview();
        this.upCenterPoint();

        if (this.scale) {
          this.$emit("OnCurrentScaleValChange", Number(this.scale));
        }
      },
      x () {
        this.initConfig();
        this.showPreview();
      },
      y () {
        this.initConfig();
        this.showPreview();
      },
      rotate () {
        this.initConfig();
        this.showPreview();
      },
      CropWidth() {
        this.initConfig();
      },
      CropHeight() {
        this.initConfig();
      }
      ,myChangeScale() {
        this.scale = this.myChangeScale;
        this.checkScale();
        if (!this.canScaleMin) {
          this.x = this.centerPointX;
          this.y = this.centerPointY;
        }
      }
    },
    methods: {
      initConfig() {
        this.initFixedNumber();
        this.initScaleMinMax();
      },
      initFixedNumber() {
        let wBi = this.CropWidth/this.defaultCropWidth;
        let hBi = this.CropHeight/this.defaultCropHeight;
        if (wBi >= hBi) {
          this.showCropW = this.defaultCropWidth;
          this.showCropH = this.defaultCropWidth*hBi/wBi;
        }
        if (wBi < hBi) {
          this.showCropW = this.defaultCropWidth*wBi/hBi;
          this.showCropH = this.defaultCropWidth;
        }
        this.fixedNumber = [wBi,hBi];
      },
      initScaleMinMax() {
        let wScale = this.cropW/this.trueWidth;
        let hScale = this.cropH/this.trueHeight;
        let minScale = hScale;
        if (minScale > wScale) {
          minScale = wScale;
        }
        this.minScale = minScale;
        this.maxScale = minScale*this.maxScaleBi;
        if (!minScale) return;

        this.$emit("OnMaxScaleValChange", Number(minScale*this.maxScaleBi));
        this.$emit("OnMinScaleValChange", Number(minScale));
      },

      upCenterPoint() {
        this.$nextTick(() => {
          this.centerPointX = -(this.trueWidth - this.trueWidth * this.scale) / 2
            + (this.w - this.trueWidth * this.scale) / 2;
          this.centerPointY = -(this.trueHeight - this.trueHeight * this.scale) / 2
            + (this.h - this.trueHeight * this.scale) / 2;
        });
      },

      getExif(){

        var debug = false;

        var root = this;

        var EXIF = function(obj) {
          if (obj instanceof EXIF) return obj;
          if (!(this instanceof EXIF)) return new EXIF(obj);
          this.EXIFwrapped = obj;
        };

        // if (typeof exports !== 'undefined') {
        //   if (typeof module !== 'undefined' && module.exports) {
        //     exports = module.exports = EXIF;
        //   }
        //   exports.EXIF = EXIF;
        // } else {
        //   root.EXIF = EXIF;
        // }

        var ExifTags = EXIF.Tags = {
          // version tags
          0x9000 : "ExifVersion",             // EXIF version
          0xA000 : "FlashpixVersion",         // Flashpix format version

          // colorspace tags
          0xA001 : "ColorSpace",              // Color space information tag

          // image configuration
          0xA002 : "PixelXDimension",         // Valid width of meaningful image
          0xA003 : "PixelYDimension",         // Valid height of meaningful image
          0x9101 : "ComponentsConfiguration", // Information about channels
          0x9102 : "CompressedBitsPerPixel",  // Compressed bits per pixel

          // user information
          0x927C : "MakerNote",               // Any desired information written by the manufacturer
          0x9286 : "UserComment",             // Comments by user

          // related file
          0xA004 : "RelatedSoundFile",        // Name of related sound file

          // date and time
          0x9003 : "DateTimeOriginal",        // Date and time when the original image was generated
          0x9004 : "DateTimeDigitized",       // Date and time when the image was stored digitally
          0x9290 : "SubsecTime",              // Fractions of seconds for DateTime
          0x9291 : "SubsecTimeOriginal",      // Fractions of seconds for DateTimeOriginal
          0x9292 : "SubsecTimeDigitized",     // Fractions of seconds for DateTimeDigitized

          // picture-taking conditions
          0x829A : "ExposureTime",            // Exposure time (in seconds)
          0x829D : "FNumber",                 // F number
          0x8822 : "ExposureProgram",         // Exposure program
          0x8824 : "SpectralSensitivity",     // Spectral sensitivity
          0x8827 : "ISOSpeedRatings",         // ISO speed rating
          0x8828 : "OECF",                    // Optoelectric conversion factor
          0x9201 : "ShutterSpeedValue",       // Shutter speed
          0x9202 : "ApertureValue",           // Lens aperture
          0x9203 : "BrightnessValue",         // Value of brightness
          0x9204 : "ExposureBias",            // Exposure bias
          0x9205 : "MaxApertureValue",        // Smallest F number of lens
          0x9206 : "SubjectDistance",         // Distance to subject in meters
          0x9207 : "MeteringMode",            // Metering mode
          0x9208 : "LightSource",             // Kind of light source
          0x9209 : "Flash",                   // Flash status
          0x9214 : "SubjectArea",             // Location and area of main subject
          0x920A : "FocalLength",             // Focal length of the lens in mm
          0xA20B : "FlashEnergy",             // Strobe energy in BCPS
          0xA20C : "SpatialFrequencyResponse",    //
          0xA20E : "FocalPlaneXResolution",   // Number of pixels in width direction per FocalPlaneResolutionUnit
          0xA20F : "FocalPlaneYResolution",   // Number of pixels in height direction per FocalPlaneResolutionUnit
          0xA210 : "FocalPlaneResolutionUnit",    // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
          0xA214 : "SubjectLocation",         // Location of subject in image
          0xA215 : "ExposureIndex",           // Exposure index selected on camera
          0xA217 : "SensingMethod",           // Image sensor type
          0xA300 : "FileSource",              // Image source (3 == DSC)
          0xA301 : "SceneType",               // Scene type (1 == directly photographed)
          0xA302 : "CFAPattern",              // Color filter array geometric pattern
          0xA401 : "CustomRendered",          // Special processing
          0xA402 : "ExposureMode",            // Exposure mode
          0xA403 : "WhiteBalance",            // 1 = auto white balance, 2 = manual
          0xA404 : "DigitalZoomRation",       // Digital zoom ratio
          0xA405 : "FocalLengthIn35mmFilm",   // Equivalent foacl length assuming 35mm film camera (in mm)
          0xA406 : "SceneCaptureType",        // Type of scene
          0xA407 : "GainControl",             // Degree of overall image gain adjustment
          0xA408 : "Contrast",                // Direction of contrast processing applied by camera
          0xA409 : "Saturation",              // Direction of saturation processing applied by camera
          0xA40A : "Sharpness",               // Direction of sharpness processing applied by camera
          0xA40B : "DeviceSettingDescription",    //
          0xA40C : "SubjectDistanceRange",    // Distance to subject

          // other tags
          0xA005 : "InteroperabilityIFDPointer",
          0xA420 : "ImageUniqueID"            // Identifier assigned uniquely to each image
        };

        var TiffTags = EXIF.TiffTags = {
          0x0100 : "ImageWidth",
          0x0101 : "ImageHeight",
          0x8769 : "ExifIFDPointer",
          0x8825 : "GPSInfoIFDPointer",
          0xA005 : "InteroperabilityIFDPointer",
          0x0102 : "BitsPerSample",
          0x0103 : "Compression",
          0x0106 : "PhotometricInterpretation",
          0x0112 : "Orientation",
          0x0115 : "SamplesPerPixel",
          0x011C : "PlanarConfiguration",
          0x0212 : "YCbCrSubSampling",
          0x0213 : "YCbCrPositioning",
          0x011A : "XResolution",
          0x011B : "YResolution",
          0x0128 : "ResolutionUnit",
          0x0111 : "StripOffsets",
          0x0116 : "RowsPerStrip",
          0x0117 : "StripByteCounts",
          0x0201 : "JPEGInterchangeFormat",
          0x0202 : "JPEGInterchangeFormatLength",
          0x012D : "TransferFunction",
          0x013E : "WhitePoint",
          0x013F : "PrimaryChromaticities",
          0x0211 : "YCbCrCoefficients",
          0x0214 : "ReferenceBlackWhite",
          0x0132 : "DateTime",
          0x010E : "ImageDescription",
          0x010F : "Make",
          0x0110 : "Model",
          0x0131 : "Software",
          0x013B : "Artist",
          0x8298 : "Copyright"
        };

        var GPSTags = EXIF.GPSTags = {
          0x0000 : "GPSVersionID",
          0x0001 : "GPSLatitudeRef",
          0x0002 : "GPSLatitude",
          0x0003 : "GPSLongitudeRef",
          0x0004 : "GPSLongitude",
          0x0005 : "GPSAltitudeRef",
          0x0006 : "GPSAltitude",
          0x0007 : "GPSTimeStamp",
          0x0008 : "GPSSatellites",
          0x0009 : "GPSStatus",
          0x000A : "GPSMeasureMode",
          0x000B : "GPSDOP",
          0x000C : "GPSSpeedRef",
          0x000D : "GPSSpeed",
          0x000E : "GPSTrackRef",
          0x000F : "GPSTrack",
          0x0010 : "GPSImgDirectionRef",
          0x0011 : "GPSImgDirection",
          0x0012 : "GPSMapDatum",
          0x0013 : "GPSDestLatitudeRef",
          0x0014 : "GPSDestLatitude",
          0x0015 : "GPSDestLongitudeRef",
          0x0016 : "GPSDestLongitude",
          0x0017 : "GPSDestBearingRef",
          0x0018 : "GPSDestBearing",
          0x0019 : "GPSDestDistanceRef",
          0x001A : "GPSDestDistance",
          0x001B : "GPSProcessingMethod",
          0x001C : "GPSAreaInformation",
          0x001D : "GPSDateStamp",
          0x001E : "GPSDifferential"
        };

        // EXIF 2.3 Spec
        var IFD1Tags = EXIF.IFD1Tags = {
          0x0100: "ImageWidth",
          0x0101: "ImageHeight",
          0x0102: "BitsPerSample",
          0x0103: "Compression",
          0x0106: "PhotometricInterpretation",
          0x0111: "StripOffsets",
          0x0112: "Orientation",
          0x0115: "SamplesPerPixel",
          0x0116: "RowsPerStrip",
          0x0117: "StripByteCounts",
          0x011A: "XResolution",
          0x011B: "YResolution",
          0x011C: "PlanarConfiguration",
          0x0128: "ResolutionUnit",
          0x0201: "JpegIFOffset",    // When image format is JPEG, this value show offset to JPEG data stored.(aka "ThumbnailOffset" or "JPEGInterchangeFormat")
          0x0202: "JpegIFByteCount", // When image format is JPEG, this value shows data size of JPEG image (aka "ThumbnailLength" or "JPEGInterchangeFormatLength")
          0x0211: "YCbCrCoefficients",
          0x0212: "YCbCrSubSampling",
          0x0213: "YCbCrPositioning",
          0x0214: "ReferenceBlackWhite"
        };

        var StringValues = EXIF.StringValues = {
          ExposureProgram : {
            0 : "Not defined",
            1 : "Manual",
            2 : "Normal program",
            3 : "Aperture priority",
            4 : "Shutter priority",
            5 : "Creative program",
            6 : "Action program",
            7 : "Portrait mode",
            8 : "Landscape mode"
          },
          MeteringMode : {
            0 : "Unknown",
            1 : "Average",
            2 : "CenterWeightedAverage",
            3 : "Spot",
            4 : "MultiSpot",
            5 : "Pattern",
            6 : "Partial",
            255 : "Other"
          },
          LightSource : {
            0 : "Unknown",
            1 : "Daylight",
            2 : "Fluorescent",
            3 : "Tungsten (incandescent light)",
            4 : "Flash",
            9 : "Fine weather",
            10 : "Cloudy weather",
            11 : "Shade",
            12 : "Daylight fluorescent (D 5700 - 7100K)",
            13 : "Day white fluorescent (N 4600 - 5400K)",
            14 : "Cool white fluorescent (W 3900 - 4500K)",
            15 : "White fluorescent (WW 3200 - 3700K)",
            17 : "Standard light A",
            18 : "Standard light B",
            19 : "Standard light C",
            20 : "D55",
            21 : "D65",
            22 : "D75",
            23 : "D50",
            24 : "ISO studio tungsten",
            255 : "Other"
          },
          Flash : {
            0x0000 : "Flash did not fire",
            0x0001 : "Flash fired",
            0x0005 : "Strobe return light not detected",
            0x0007 : "Strobe return light detected",
            0x0009 : "Flash fired, compulsory flash mode",
            0x000D : "Flash fired, compulsory flash mode, return light not detected",
            0x000F : "Flash fired, compulsory flash mode, return light detected",
            0x0010 : "Flash did not fire, compulsory flash mode",
            0x0018 : "Flash did not fire, auto mode",
            0x0019 : "Flash fired, auto mode",
            0x001D : "Flash fired, auto mode, return light not detected",
            0x001F : "Flash fired, auto mode, return light detected",
            0x0020 : "No flash function",
            0x0041 : "Flash fired, red-eye reduction mode",
            0x0045 : "Flash fired, red-eye reduction mode, return light not detected",
            0x0047 : "Flash fired, red-eye reduction mode, return light detected",
            0x0049 : "Flash fired, compulsory flash mode, red-eye reduction mode",
            0x004D : "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
            0x004F : "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
            0x0059 : "Flash fired, auto mode, red-eye reduction mode",
            0x005D : "Flash fired, auto mode, return light not detected, red-eye reduction mode",
            0x005F : "Flash fired, auto mode, return light detected, red-eye reduction mode"
          },
          SensingMethod : {
            1 : "Not defined",
            2 : "One-chip color area sensor",
            3 : "Two-chip color area sensor",
            4 : "Three-chip color area sensor",
            5 : "Color sequential area sensor",
            7 : "Trilinear sensor",
            8 : "Color sequential linear sensor"
          },
          SceneCaptureType : {
            0 : "Standard",
            1 : "Landscape",
            2 : "Portrait",
            3 : "Night scene"
          },
          SceneType : {
            1 : "Directly photographed"
          },
          CustomRendered : {
            0 : "Normal process",
            1 : "Custom process"
          },
          WhiteBalance : {
            0 : "Auto white balance",
            1 : "Manual white balance"
          },
          GainControl : {
            0 : "None",
            1 : "Low gain up",
            2 : "High gain up",
            3 : "Low gain down",
            4 : "High gain down"
          },
          Contrast : {
            0 : "Normal",
            1 : "Soft",
            2 : "Hard"
          },
          Saturation : {
            0 : "Normal",
            1 : "Low saturation",
            2 : "High saturation"
          },
          Sharpness : {
            0 : "Normal",
            1 : "Soft",
            2 : "Hard"
          },
          SubjectDistanceRange : {
            0 : "Unknown",
            1 : "Macro",
            2 : "Close view",
            3 : "Distant view"
          },
          FileSource : {
            3 : "DSC"
          },

          Components : {
            0 : "",
            1 : "Y",
            2 : "Cb",
            3 : "Cr",
            4 : "R",
            5 : "G",
            6 : "B"
          }
        };

        function addEvent(element, event, handler) {
          if (element.addEventListener) {
            element.addEventListener(event, handler, false);
          } else if (element.attachEvent) {
            element.attachEvent("on" + event, handler);
          }
        }

        function imageHasData(img) {
          return !!(img.exifdata);
        }


        function base64ToArrayBuffer(base64, contentType) {
          contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || ''; // e.g. 'data:image/jpeg;base64,...' => 'image/jpeg'
          base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
          var binary = atob(base64);
          var len = binary.length;
          var buffer = new ArrayBuffer(len);
          var view = new Uint8Array(buffer);
          for (var i = 0; i < len; i++) {
            view[i] = binary.charCodeAt(i);
          }
          return buffer;
        }

        function objectURLToBlob(url, callback) {
          var http = new XMLHttpRequest();
          http.open("GET", url, true);
          http.responseType = "blob";
          http.onload = function(e) {
            if (this.status == 200 || this.status === 0) {
              callback(this.response);
            }
          };
          http.send();
        }

        function getImageData(img, callback) {
          function handleBinaryFile(binFile) {
            var data = findEXIFinJPEG(binFile);
            img.exifdata = data || {};
            var iptcdata = findIPTCinJPEG(binFile);
            img.iptcdata = iptcdata || {};
            if (EXIF.isXmpEnabled) {
              var xmpdata= findXMPinJPEG(binFile);
              img.xmpdata = xmpdata || {};
            }
            if (callback) {
              callback.call(img);
            }
          }

          if (img.src) {
            if (/^data\:/i.test(img.src)) { // Data URI
              var arrayBuffer = base64ToArrayBuffer(img.src);
              handleBinaryFile(arrayBuffer);

            } else if (/^blob\:/i.test(img.src)) { // Object URL
              var fileReader = new FileReader();
              fileReader.onload = function(e) {
                handleBinaryFile(e.target.result);
              };
              objectURLToBlob(img.src, function (blob) {
                fileReader.readAsArrayBuffer(blob);
              });
            } else {
              var http = new XMLHttpRequest();
              http.onload = function() {
                if (this.status == 200 || this.status === 0) {
                  handleBinaryFile(http.response);
                } else {
                  throw "Could not load image";
                }
                http = null;
              };
              http.open("GET", img.src, true);
              http.responseType = "arraybuffer";
              http.send(null);
            }
          } else if (self.FileReader && (img instanceof self.Blob || img instanceof self.File)) {
            var fileReader = new FileReader();
            fileReader.onload = function(e) {
              if (debug) console.log("Got file of length " + e.target.result.byteLength);
              handleBinaryFile(e.target.result);
            };

            fileReader.readAsArrayBuffer(img);
          }
        }

        function findEXIFinJPEG(file) {
          var dataView = new DataView(file);

          if (debug) console.log("Got file of length " + file.byteLength);
          if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
            if (debug) console.log("Not a valid JPEG");
            return false; // not a valid jpeg
          }

          var offset = 2,
            length = file.byteLength,
            marker;

          while (offset < length) {
            if (dataView.getUint8(offset) != 0xFF) {
              if (debug) console.log("Not a valid marker at offset " + offset + ", found: " + dataView.getUint8(offset));
              return false; // not a valid marker, something is wrong
            }

            marker = dataView.getUint8(offset + 1);
            if (debug) console.log(marker);

            // we could implement handling for other markers here,
            // but we're only looking for 0xFFE1 for EXIF data

            if (marker == 225) {
              if (debug) console.log("Found 0xFFE1 marker");

              return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);

              // offset += 2 + file.getShortAt(offset+2, true);

            } else {
              offset += 2 + dataView.getUint16(offset+2);
            }

          }

        }

        function findIPTCinJPEG(file) {
          var dataView = new DataView(file);

          if (debug) console.log("Got file of length " + file.byteLength);
          if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
            if (debug) console.log("Not a valid JPEG");
            return false; // not a valid jpeg
          }

          var offset = 2,
            length = file.byteLength;


          var isFieldSegmentStart = function(dataView, offset){
            return (
              dataView.getUint8(offset) === 0x38 &&
              dataView.getUint8(offset+1) === 0x42 &&
              dataView.getUint8(offset+2) === 0x49 &&
              dataView.getUint8(offset+3) === 0x4D &&
              dataView.getUint8(offset+4) === 0x04 &&
              dataView.getUint8(offset+5) === 0x04
            );
          };

          while (offset < length) {

            if ( isFieldSegmentStart(dataView, offset )){

              // Get the length of the name header (which is padded to an even number of bytes)
              var nameHeaderLength = dataView.getUint8(offset+7);
              if(nameHeaderLength % 2 !== 0) nameHeaderLength += 1;
              // Check for pre photoshop 6 format
              if(nameHeaderLength === 0) {
                // Always 4
                nameHeaderLength = 4;
              }

              var startOffset = offset + 8 + nameHeaderLength;
              var sectionLength = dataView.getUint16(offset + 6 + nameHeaderLength);

              return readIPTCData(file, startOffset, sectionLength);

              break;

            }


            // Not the marker, continue searching
            offset++;

          }

        }
        var IptcFieldMap = {
          0x78 : 'caption',
          0x6E : 'credit',
          0x19 : 'keywords',
          0x37 : 'dateCreated',
          0x50 : 'byline',
          0x55 : 'bylineTitle',
          0x7A : 'captionWriter',
          0x69 : 'headline',
          0x74 : 'copyright',
          0x0F : 'category'
        };
        function readIPTCData(file, startOffset, sectionLength){
          var dataView = new DataView(file);
          var data = {};
          var fieldValue, fieldName, dataSize, segmentType, segmentSize;
          var segmentStartPos = startOffset;
          while(segmentStartPos < startOffset+sectionLength) {
            if(dataView.getUint8(segmentStartPos) === 0x1C && dataView.getUint8(segmentStartPos+1) === 0x02){
              segmentType = dataView.getUint8(segmentStartPos+2);
              if(segmentType in IptcFieldMap) {
                dataSize = dataView.getInt16(segmentStartPos+3);
                segmentSize = dataSize + 5;
                fieldName = IptcFieldMap[segmentType];
                fieldValue = getStringFromDB(dataView, segmentStartPos+5, dataSize);
                // Check if we already stored a value with this name
                if(data.hasOwnProperty(fieldName)) {
                  // Value already stored with this name, create multivalue field
                  if(data[fieldName] instanceof Array) {
                    data[fieldName].push(fieldValue);
                  }
                  else {
                    data[fieldName] = [data[fieldName], fieldValue];
                  }
                }
                else {
                  data[fieldName] = fieldValue;
                }
              }

            }
            segmentStartPos++;
          }
          return data;
        }



        function readTags(file, tiffStart, dirStart, strings, bigEnd) {
          var entries = file.getUint16(dirStart, !bigEnd),
            tags = {},
            entryOffset, tag,
            i;

          for (i=0;i<entries;i++) {
            entryOffset = dirStart + i*12 + 2;
            tag = strings[file.getUint16(entryOffset, !bigEnd)];
            if (!tag && debug) console.log("Unknown tag: " + file.getUint16(entryOffset, !bigEnd));
            tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
          }
          return tags;
        }


        function readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
          var type = file.getUint16(entryOffset+2, !bigEnd),
            numValues = file.getUint32(entryOffset+4, !bigEnd),
            valueOffset = file.getUint32(entryOffset+8, !bigEnd) + tiffStart,
            offset,
            vals, val, n,
            numerator, denominator;

          switch (type) {
            case 1: // byte, 8-bit unsigned int
            case 7: // undefined, 8-bit byte, value depending on field
              if (numValues == 1) {
                return file.getUint8(entryOffset + 8, !bigEnd);
              } else {
                offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                vals = [];
                for (n=0;n<numValues;n++) {
                  vals[n] = file.getUint8(offset + n);
                }
                return vals;
              }

            case 2: // ascii, 8-bit byte
              offset = numValues > 4 ? valueOffset : (entryOffset + 8);
              return getStringFromDB(file, offset, numValues-1);

            case 3: // short, 16 bit int
              if (numValues == 1) {
                return file.getUint16(entryOffset + 8, !bigEnd);
              } else {
                offset = numValues > 2 ? valueOffset : (entryOffset + 8);
                vals = [];
                for (n=0;n<numValues;n++) {
                  vals[n] = file.getUint16(offset + 2*n, !bigEnd);
                }
                return vals;
              }

            case 4: // long, 32 bit int
              if (numValues == 1) {
                return file.getUint32(entryOffset + 8, !bigEnd);
              } else {
                vals = [];
                for (n=0;n<numValues;n++) {
                  vals[n] = file.getUint32(valueOffset + 4*n, !bigEnd);
                }
                return vals;
              }

            case 5:    // rational = two long values, first is numerator, second is denominator
              if (numValues == 1) {
                numerator = file.getUint32(valueOffset, !bigEnd);
                denominator = file.getUint32(valueOffset+4, !bigEnd);
                val = new Number(numerator / denominator);
                val.numerator = numerator;
                val.denominator = denominator;
                return val;
              } else {
                vals = [];
                for (n=0;n<numValues;n++) {
                  numerator = file.getUint32(valueOffset + 8*n, !bigEnd);
                  denominator = file.getUint32(valueOffset+4 + 8*n, !bigEnd);
                  vals[n] = new Number(numerator / denominator);
                  vals[n].numerator = numerator;
                  vals[n].denominator = denominator;
                }
                return vals;
              }

            case 9: // slong, 32 bit signed int
              if (numValues == 1) {
                return file.getInt32(entryOffset + 8, !bigEnd);
              } else {
                vals = [];
                for (n=0;n<numValues;n++) {
                  vals[n] = file.getInt32(valueOffset + 4*n, !bigEnd);
                }
                return vals;
              }

            case 10: // signed rational, two slongs, first is numerator, second is denominator
              if (numValues == 1) {
                return file.getInt32(valueOffset, !bigEnd) / file.getInt32(valueOffset+4, !bigEnd);
              } else {
                vals = [];
                for (n=0;n<numValues;n++) {
                  vals[n] = file.getInt32(valueOffset + 8*n, !bigEnd) / file.getInt32(valueOffset+4 + 8*n, !bigEnd);
                }
                return vals;
              }
          }
        }

        /**
         * Given an IFD (Image File Directory) start offset
         * returns an offset to next IFD or 0 if it's the last IFD.
         */
        function getNextIFDOffset(dataView, dirStart, bigEnd){
          //the first 2bytes means the number of directory entries contains in this IFD
          var entries = dataView.getUint16(dirStart, !bigEnd);

          // After last directory entry, there is a 4bytes of data,
          // it means an offset to next IFD.
          // If its value is '0x00000000', it means this is the last IFD and there is no linked IFD.

          return dataView.getUint32(dirStart + 2 + entries * 12, !bigEnd); // each entry is 12 bytes long
        }

        function readThumbnailImage(dataView, tiffStart, firstIFDOffset, bigEnd){
          // get the IFD1 offset
          var IFD1OffsetPointer = getNextIFDOffset(dataView, tiffStart+firstIFDOffset, bigEnd);

          if (!IFD1OffsetPointer) {
            // console.log('******** IFD1Offset is empty, image thumb not found ********');
            return {};
          }
          else if (IFD1OffsetPointer > dataView.byteLength) { // this should not happen
            // console.log('******** IFD1Offset is outside the bounds of the DataView ********');
            return {};
          }
          // console.log('*******  thumbnail IFD offset (IFD1) is: %s', IFD1OffsetPointer);

          var thumbTags = readTags(dataView, tiffStart, tiffStart + IFD1OffsetPointer, IFD1Tags, bigEnd)

          // EXIF 2.3 specification for JPEG format thumbnail

          // If the value of Compression(0x0103) Tag in IFD1 is '6', thumbnail image format is JPEG.
          // Most of Exif image uses JPEG format for thumbnail. In that case, you can get offset of thumbnail
          // by JpegIFOffset(0x0201) Tag in IFD1, size of thumbnail by JpegIFByteCount(0x0202) Tag.
          // Data format is ordinary JPEG format, starts from 0xFFD8 and ends by 0xFFD9. It seems that
          // JPEG format and 160x120pixels of size are recommended thumbnail format for Exif2.1 or later.

          if (thumbTags['Compression']) {
            // console.log('Thumbnail image found!');

            switch (thumbTags['Compression']) {
              case 6:
                // console.log('Thumbnail image format is JPEG');
                if (thumbTags.JpegIFOffset && thumbTags.JpegIFByteCount) {
                  // extract the thumbnail
                  var tOffset = tiffStart + thumbTags.JpegIFOffset;
                  var tLength = thumbTags.JpegIFByteCount;
                  thumbTags['blob'] = new Blob([new Uint8Array(dataView.buffer, tOffset, tLength)], {
                    type: 'image/jpeg'
                  });
                }
                break;

              case 1:
                console.log("Thumbnail image format is TIFF, which is not implemented.");
                break;
              default:
                console.log("Unknown thumbnail image format '%s'", thumbTags['Compression']);
            }
          }
          else if (thumbTags['PhotometricInterpretation'] == 2) {
            console.log("Thumbnail image format is RGB, which is not implemented.");
          }
          return thumbTags;
        }

        function getStringFromDB(buffer, start, length) {
          var outstr = "";
          for (let n = start; n < start+length; n++) {
            outstr += String.fromCharCode(buffer.getUint8(n));
          }
          return outstr;
        }

        function readEXIFData(file, start) {
          if (getStringFromDB(file, start, 4) != "Exif") {
            if (debug) console.log("Not valid EXIF data! " + getStringFromDB(file, start, 4));
            return false;
          }

          var bigEnd,
            tags, tag,
            exifData, gpsData,
            tiffOffset = start + 6;

          // test for TIFF validity and endianness
          if (file.getUint16(tiffOffset) == 0x4949) {
            bigEnd = false;
          } else if (file.getUint16(tiffOffset) == 0x4D4D) {
            bigEnd = true;
          } else {
            if (debug) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
            return false;
          }

          if (file.getUint16(tiffOffset+2, !bigEnd) != 0x002A) {
            if (debug) console.log("Not valid TIFF data! (no 0x002A)");
            return false;
          }

          var firstIFDOffset = file.getUint32(tiffOffset+4, !bigEnd);

          if (firstIFDOffset < 0x00000008) {
            if (debug) console.log("Not valid TIFF data! (First offset less than 8)", file.getUint32(tiffOffset+4, !bigEnd));
            return false;
          }

          tags = readTags(file, tiffOffset, tiffOffset + firstIFDOffset, TiffTags, bigEnd);

          if (tags.ExifIFDPointer) {
            exifData = readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, ExifTags, bigEnd);
            for (tag in exifData) {
              switch (tag) {
                case "LightSource" :
                case "Flash" :
                case "MeteringMode" :
                case "ExposureProgram" :
                case "SensingMethod" :
                case "SceneCaptureType" :
                case "SceneType" :
                case "CustomRendered" :
                case "WhiteBalance" :
                case "GainControl" :
                case "Contrast" :
                case "Saturation" :
                case "Sharpness" :
                case "SubjectDistanceRange" :
                case "FileSource" :
                  exifData[tag] = StringValues[tag][exifData[tag]];
                  break;

                case "ExifVersion" :
                case "FlashpixVersion" :
                  exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
                  break;

                case "ComponentsConfiguration" :
                  exifData[tag] =
                    StringValues.Components[exifData[tag][0]] +
                    StringValues.Components[exifData[tag][1]] +
                    StringValues.Components[exifData[tag][2]] +
                    StringValues.Components[exifData[tag][3]];
                  break;
              }
              tags[tag] = exifData[tag];
            }
          }

          if (tags.GPSInfoIFDPointer) {
            gpsData = readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, GPSTags, bigEnd);
            for (tag in gpsData) {
              switch (tag) {
                case "GPSVersionID" :
                  gpsData[tag] = gpsData[tag][0] +
                    "." + gpsData[tag][1] +
                    "." + gpsData[tag][2] +
                    "." + gpsData[tag][3];
                  break;
              }
              tags[tag] = gpsData[tag];
            }
          }

          // extract thumbnail
          tags['thumbnail'] = readThumbnailImage(file, tiffOffset, firstIFDOffset, bigEnd);

          return tags;
        }

        function findXMPinJPEG(file) {

          if (!('DOMParser' in self)) {
            // console.warn('XML parsing not supported without DOMParser');
            return;
          }
          var dataView = new DataView(file);

          if (debug) console.log("Got file of length " + file.byteLength);
          if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
            if (debug) console.log("Not a valid JPEG");
            return false; // not a valid jpeg
          }

          var offset = 2,
            length = file.byteLength,
            dom = new DOMParser();

          while (offset < (length-4)) {
            if (getStringFromDB(dataView, offset, 4) == "http") {
              var startOffset = offset - 1;
              var sectionLength = dataView.getUint16(offset - 2) - 1;
              var xmpString = getStringFromDB(dataView, startOffset, sectionLength)
              var xmpEndIndex = xmpString.indexOf('xmpmeta>') + 8;
              xmpString = xmpString.substring( xmpString.indexOf( '<x:xmpmeta' ), xmpEndIndex );

              var indexOfXmp = xmpString.indexOf('x:xmpmeta') + 10
              //Many custom written programs embed xmp/xml without any namespace. Following are some of them.
              //Without these namespaces, XML is thought to be invalid by parsers
              xmpString = xmpString.slice(0, indexOfXmp)
                + 'xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/" '
                + 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
                + 'xmlns:tiff="http://ns.adobe.com/tiff/1.0/" '
                + 'xmlns:plus="http://schemas.android.com/apk/lib/com.google.android.gms.plus" '
                + 'xmlns:ext="http://www.gettyimages.com/xsltExtension/1.0" '
                + 'xmlns:exif="http://ns.adobe.com/exif/1.0/" '
                + 'xmlns:stEvt="http://ns.adobe.com/xap/1.0/sType/ResourceEvent#" '
                + 'xmlns:stRef="http://ns.adobe.com/xap/1.0/sType/ResourceRef#" '
                + 'xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/" '
                + 'xmlns:xapGImg="http://ns.adobe.com/xap/1.0/g/img/" '
                + 'xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" '
                + xmpString.slice(indexOfXmp)

              var domDocument = dom.parseFromString( xmpString, 'text/xml' );
              return xml2Object(domDocument);
            } else{
              offset++;
            }
          }
        }

        function xml2json(xml) {
          var json = {};

          if (xml.nodeType == 1) { // element node
            if (xml.attributes.length > 0) {
              json['@attributes'] = {};
              for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                json['@attributes'][attribute.nodeName] = attribute.nodeValue;
              }
            }
          } else if (xml.nodeType == 3) { // text node
            return xml.nodeValue;
          }

          // deal with children
          if (xml.hasChildNodes()) {
            for(var i = 0; i < xml.childNodes.length; i++) {
              var child = xml.childNodes.item(i);
              var nodeName = child.nodeName;
              if (json[nodeName] == null) {
                json[nodeName] = xml2json(child);
              } else {
                if (json[nodeName].push == null) {
                  var old = json[nodeName];
                  json[nodeName] = [];
                  json[nodeName].push(old);
                }
                json[nodeName].push(xml2json(child));
              }
            }
          }

          return json;
        }

        function xml2Object(xml) {
          try {
            var obj = {};
            if (xml.children.length > 0) {
              for (var i = 0; i < xml.children.length; i++) {
                var item = xml.children.item(i);
                var attributes = item.attributes;
                for(var idx in attributes) {
                  var itemAtt = attributes[idx];
                  var dataKey = itemAtt.nodeName;
                  var dataValue = itemAtt.nodeValue;

                  if(dataKey !== undefined) {
                    obj[dataKey] = dataValue;
                  }
                }
                var nodeName = item.nodeName;

                if (typeof (obj[nodeName]) == "undefined") {
                  obj[nodeName] = xml2json(item);
                } else {
                  if (typeof (obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];

                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                  }
                  obj[nodeName].push(xml2json(item));
                }
              }
            } else {
              obj = xml.textContent;
            }
            return obj;
          } catch (e) {
            console.log(e.message);
          }
        }

        EXIF.enableXmp = function() {
          EXIF.isXmpEnabled = true;
        };

        EXIF.disableXmp = function() {
          EXIF.isXmpEnabled = false;
        };

        EXIF.getData = function(img, callback) {
          if (((self.Image && img instanceof self.Image)
            || (self.HTMLImageElement && img instanceof self.HTMLImageElement))
            && !img.complete)
            return false;

          if (!imageHasData(img)) {
            getImageData(img, callback);
          } else {
            if (callback) {
              callback.call(img);
            }
          }
          return true;
        };

        EXIF.getTag = function(img, tag) {
          if (!imageHasData(img)) return;
          return img.exifdata[tag];
        };

        EXIF.getIptcTag = function(img, tag) {
          if (!imageHasData(img)) return;
          return img.iptcdata[tag];
        };

        EXIF.getAllTags = function(img) {
          if (!imageHasData(img)) return {};
          var a,
            data = img.exifdata,
            tags = {};
          for (a in data) {
            if (data.hasOwnProperty(a)) {
              tags[a] = data[a];
            }
          }
          return tags;
        };

        EXIF.getAllIptcTags = function(img) {
          if (!imageHasData(img)) return {};
          var a,
            data = img.iptcdata,
            tags = {};
          for (a in data) {
            if (data.hasOwnProperty(a)) {
              tags[a] = data[a];
            }
          }
          return tags;
        };

        EXIF.pretty = function(img) {
          if (!imageHasData(img)) return "";
          var a,
            data = img.exifdata,
            strPretty = "";
          for (a in data) {
            if (data.hasOwnProperty(a)) {
              if (typeof data[a] == "object") {
                if (data[a] instanceof Number) {
                  strPretty += a + " : " + data[a] + " [" + data[a].numerator + "/" + data[a].denominator + "]\r\n";
                } else {
                  strPretty += a + " : [" + data[a].length + " values]\r\n";
                }
              } else {
                strPretty += a + " : " + data[a] + "\r\n";
              }
            }
          }
          return strPretty;
        };

        EXIF.readFromBinaryFile = function(file) {
          return findEXIFinJPEG(file);
        };

        if (typeof define === 'function' && define.amd) {
          define('exif-js', [], function() {
            return EXIF;
          });
        }
        return EXIF;
      },

      // 校验图片
      checkedImg () {
        if (this.img === '') return;

        this.loading = true;
        this.scale = 1;
        this.clearCrop();
        let that = this;
        let canvas = document.createElement('canvas');
        let img = new Image;
        let rotate = 0;
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          let ctx = canvas.getContext('2d');
          ctx.save();
          that.getExif().getData(img, () => {
            that.getExif().getAllTags(img);
            this.orientation = that.getExif().getTag(img, 'Orientation');
            switch (this.orientation) {
              case 6:
                rotate = 1;
                break;
              case 8:
                rotate = -1;
                break;
              case 3:
                rotate = 3;
                break;
              default:
                rotate = 0
            }
            if (rotate === 0) {
              this.imgs = this.img;
              return;
            }

            switch (rotate) {
              case 0:
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                break;
              case 1:
              case -3:
                // 旋转90度 或者-270度 宽度和高度对调
                canvas.width = height;
                canvas.height = width;
                ctx.rotate(rotate * 90  * Math.PI / 180);
                ctx.drawImage(img, 0, -height, width, height);
                break;
              case 2:
              case -2:
                canvas.width = width;
                canvas.height = height;
                ctx.rotate(rotate * 90  * Math.PI / 180);
                ctx.drawImage(img, -width, -height, width, height);
                break;
              case 3:
              case -1:
                canvas.width = height;
                canvas.height = width;
                ctx.rotate(rotate * 90  * Math.PI / 180);
                ctx.drawImage(img, -width, 0, width, height);
                break;
              default:
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
            }
            ctx.restore();
            canvas.toBlob((blob) => {
              let data = URL.createObjectURL(blob);
              this.imgs = data
            }, 'image/' + this.outputType, 1);
          })
        };
        img.onerror = () => {
          this.$emit('imgLoad', 'error');
        };
        img.crossOrigin = '*';
        img.src = this.img;
      },
      // 当按下鼠标键
      startMove (e) {
        e.preventDefault();
        // 如果move 为true 表示当前可以拖动
        if (this.move && !this.crop) {
          if (!this.canMove) {
            return false
          }
          // 开始移动
          this.moveX = (e.clientX ? e.clientX : e.touches[0].clientX) - this.x;
          this.moveY = (e.clientY ? e.clientY : e.touches[0].clientY) - this.y;
          if (e.touches) {
            window.addEventListener('touchmove', this.moveImg);
            window.addEventListener('touchend', this.leaveImg);
            if (e.touches.length == 2) {
              // 记录手指刚刚放上去
              this.touches = e.touches;
              window.addEventListener('touchmove', this.touchScale);
              window.addEventListener('touchend', this.cancleTouchScale);
            }
          } else {
            window.addEventListener('mousemove', this.moveImg);
            window.addEventListener('mouseup', this.leaveImg);
          }
        } else {
          // 截图ing
          this.cropping = true;
          // 绑定截图事件
          window.addEventListener('mousemove', this.createCrop);
          window.addEventListener('mouseup', this.endCrop);
          window.addEventListener('touchmove', this.createCrop);
          window.addEventListener('touchend', this.endCrop);
          this.cropOffsertX = e.offsetX
            ? e.offsetX
            : (e.touches[0].pageX - this.$refs.cropper.offsetLeft);
          this.cropOffsertY = e.offsetY
            ? e.offsetY
            : (e.touches[0].pageY - this.$refs.cropper.offsetTop);
          this.cropX = e.clientX ? e.clientX : e.touches[0].clientX;
          this.cropY = e.clientY ? e.clientY : e.touches[0].clientY;
          this.cropChangeX = this.cropOffsertX;
          this.cropChangeY = this.cropOffsertY;
          this.cropW = 0;
          this.cropH = 0;
        }
      },

      // 移动端缩放
      touchScale (e) {
        e.preventDefault();
        // 记录变化量
        // 第一根手指
        var oldTouch1 = {
          x: this.touches[0].clientX,
          y: this.touches[0].clientY
        };
        var newTouch1 = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
        // 第二根手指
        var oldTouch2 = {
          x: this.touches[1].clientX,
          y: this.touches[1].clientY
        };
        var newTouch2 = {
          x: e.touches[1].clientX,
          y: e.touches[1].clientY
        };
        var oldL = Math.sqrt(Math.pow(oldTouch1.x - oldTouch2.x, 2) + Math.pow(oldTouch1.y - oldTouch2.y, 2))
        var newL = Math.sqrt(Math.pow(newTouch1.x - newTouch2.x, 2) + Math.pow(newTouch1.y - newTouch2.y, 2))
        var cha = ~~(newL - oldL);
        // 根据图片本身大小 决定每次改变大小的系数, 图片越大系数越小
        // 1px - 0.2
        var coe = 1;
        coe = coe / this.trueWidth > coe / this.trueHeight
          ? coe / this.trueHeight : coe / this.trueWidth;
        coe = coe > 0.1 ? 0.1 : coe;
        var num = coe * cha;
        if (!this.touchNow) {
          this.touchNow = true;
          if (cha > 0) {
            this.scale += Math.abs(num)
          } else if (cha < 0) {
            this.scale > Math.abs(num) ? this.scale -= Math.abs(num) : this.scale
          }
          this.touches = e.touches;
          setTimeout(() => {
            this.touchNow = false
          }, 8);
        }
      },

      cancleTouchScale (e) {
        window.removeEventListener('touchmove', this.touchScale);
      },

      // 移动图片
      moveImg (e) {
        e.preventDefault();
        if (e.touches && e.touches.length === 2) {
          this.touches = e.touches;
          window.addEventListener('touchmove', this.touchScale);
          window.addEventListener('touchend', this.cancleTouchScale);
          window.removeEventListener('touchmove', this.moveImg);
          return;
        }

        let nowX = e.clientX ? e.clientX : e.touches[0].clientX;
        let nowY = e.clientY ? e.clientY : e.touches[0].clientY;
        this.$nextTick(() => {
          if (this.scale*this.trueWidth <= this.showCropW
            && this.scale*this.trueHeight <= this.showCropH) {
            this.x = this.centerPointX;
            this.y = this.centerPointY;
            return;
          }

          // console.log(e);
          let cropParentDom = document.getElementsByClassName("cropper-crop-box")[0];
          let imgParentDom = document.getElementsByClassName("cropper-box-canvas")[0];
          let imgParentDomInfo = imgParentDom.getBoundingClientRect();
          // console.log(cropParentDom.getBoundingClientRect());
          // console.log(imgParentDom.getBoundingClientRect());
          if (this.scale*this.trueWidth > this.showCropW
            && this.scale*this.trueHeight > this.showCropH
            && this.checkPointInRect(imgParentDomInfo,nowX,nowY,e)) {
            return;
          }

          this.agoImgMoveE = e;
          this.x = ~~(nowX - this.moveX);
          this.y = ~~(nowY - this.moveY);
        });
      },
      checkPointInRect(info,nowX,nowY,e) {
        // let cropParentDom = document.getElementsByClassName("cropper-crop-box")[0];
        // let cropInfo = cropParentDom.getBoundingClientRect();
        // let cropLeftX = cropInfo.x;
        // let cropRightX = cropInfo.x + cropInfo.width;
        // let cropTopY = cropInfo.y;
        // let cropBottomY = cropInfo.y + cropInfo.height;
        // if (info.x >= cropLeftX
        //   && info.y <= cropTopY && info.y+info.height >= cropBottomY
        //   && (this.agoImgMoveE && e.clientX >  this.agoImgMoveE.clientX)){
        //   this.y = ~~(nowY - this.moveY);
        //   console.log(11111111111111111);
        //   return true;
        // }
        //
        // if (info.x+info.width <= cropRightX
        //   && info.y <= cropTopY && info.y+info.height >= cropBottomY
        //   && (this.agoImgMoveE && e.clientX <  this.agoImgMoveE.clientX)) {
        //   this.y = ~~(nowY - this.moveY);
        //   console.log(22222222222222222222222);
        //   return true;
        // }
        //
        // if (info.y >= cropTopY
        //   && info.x <= cropLeftX && info.x+info.width >= cropRightX
        //   && (this.agoImgMoveE && e.clientY >  this.agoImgMoveE.clientY)) {
        //   this.x = ~~(nowX - this.moveX);
        //   console.log(33333333333333333333);
        //   return true;
        // }
        //
        // if (info.y+info.height <= cropBottomY
        //   && info.x <= cropLeftX && info.x+info.width >= cropRightX
        //   && (this.agoImgMoveE && e.clientY >  this.agoImgMoveE.clientY)) {
        //   this.x = ~~(nowX - this.moveX);
        //   console.log(4444444444444444444);
        //   return true;
        // }
        //
        // if (this.agoImgMoveE
        //   && (info.x > cropLeftX || info.x+info.width < cropRightX
        //     || info.y > cropTopY || info.y+info.height < cropBottomY)
        //   && this.scale*this.trueWidth >= this.showCropW
        //   && this.scale*this.trueHeight >= this.showCropH) {
        //   console.log(5555555555555555555);
        //   return true;
        // }

        // if ((info.x >= cropLeftX
        //   || info.x+info.width <= cropRightX)
        //   || info.y >= cropTopY
        //   || info.y+info.height <= cropBottomY ) {
        //   this.y = ~~(nowY - this.moveY);
        //   return true;
        // }

        return false;
      },

      // 移动图片结束
      leaveImg (e) {
        window.removeEventListener('mousemove', this.moveImg);
        window.removeEventListener('touchmove', this.moveImg);
        window.removeEventListener('mouseup', this.leaveImg);
        window.removeEventListener('touchend', this.leaveImg);
      },
      // 缩放图片
      scaleImg () {
        this.support = "onwheel" in document.createElement("div")
          ? "wheel" : document.onmousewheel !== undefined
            ? "mousewheel" : "DOMMouseScroll";
        if (this.canScale) {
          window.addEventListener(this.support, this.changeSize);
        }
      },
      // 移出框
      cancleScale () {
        if (this.canScale) {
          window.removeEventListener(this.support, this.changeSize);
        }
      },

      //判断是否可以缩放
      checkScale() {
        if (this.scale <= this.minScale ) {
          this.canScaleMin = false;
          this.canScaleMax = true;
          return;
        }

        if (this.scale >= this.maxScale ) {
          this.canScaleMin = true;
          this.canScaleMax = false;
          return;
        }

        this.canScaleMin = true;
        this.canScaleMax = true;
      },
      // 改变大小函数
      changeSize (e) {
        e.preventDefault();
        this.checkScale();

        var change = e.deltaY || e.wheelDelta;
        // 根据图片本身大小 决定每次改变大小的系数, 图片越大系数越小
        var isFirefox = navigator.userAgent.indexOf('Firefox');
        change = isFirefox > 0 ? change * 30 : change;
        // 1px - 0.2
        var coe = this.coe;
        coe = coe / this.trueWidth > coe / this.trueHeight
          ? coe / this.trueHeight : coe / this.trueWidth;
        var num = coe * change;
        
        let newScale = this.scale;
        
        num < 0 ? newScale += Math.abs(num) : newScale
        > Math.abs(num) ? newScale -= Math.abs(num) : newScale;
        if (newScale > this.scale && !this.canScaleMax) {
          return;
        }

        if (newScale < this.scale && !this.canScaleMin) {
          this.x = this.centerPointX;
          this.y = this.centerPointY;
          return;
        }

        this.scale = newScale;

        // 延迟0.1s 每次放大大或者缩小的范围
        let status = num < 0 ? 'add' : 'reduce';
        if (status !== this.coeStatus) {
          this.coeStatus = status;
          this.coe = 0.1;
        }
        if (!this.scaling) {
          this.scalingSet = setTimeout(() => {
            this.scaling = false;
            this.coe = this.coe += 0.01
          }, 50);
        }
        this.scaling = true;
      },
      // 修改图片大小函数
      changeScale (num) {
        num = num || 1;
        var coe = 20;
        coe = coe / this.trueWidth > coe / this.trueHeight
          ? coe / this.trueHeight : coe / this.trueWidth;
        num = num * coe;
        num > 0 ? this.scale += Math.abs(num) : this.scale > Math.abs(num)
          ? this.scale -= Math.abs(num) : this.scale;
      },
      // 创建截图框
      createCrop (e) {
        e.preventDefault();
        // 移动生成大小
        var nowX = e.clientX ? e.clientX : e.touches ? e.touches[0].clientX : 0;
        var nowY = e.clientY ? e.clientY : e.touches ? e.touches[0].clientY : 0;
        this.$nextTick(() => {
          var fw = ~~(nowX - this.cropX);
          var fh = ~~(nowY - this.cropY);
          if (fw > 0) {
            this.cropW = fw + this.cropChangeX > this.w
              ? this.w - this.cropChangeX : fw;
            this.cropOffsertX = this.cropChangeX;
          } else {
            this.cropW = (this.w - this.cropChangeX + Math.abs(fw)) > this.w
              ? this.cropChangeX : Math.abs(fw);
            this.cropOffsertX = this.cropChangeX  + fw > 0
              ? this.cropChangeX + fw : 0;
          }

          if (!this.fixed) {
            if (fh > 0) {
              this.cropH = fh + this.cropChangeY > this.h
                ? this.h - this.cropChangeY : fh;
              this.cropOffsertY = this.cropChangeY
            } else {
              this.cropH = (this.h - this.cropChangeY + Math.abs(fh)) > this.h
                ? this.cropChangeY : Math.abs(fh);
              this.cropOffsertY = this.cropChangeY  + fh > 0
                ? this.cropChangeY + fh : 0
            }
          } else {
            var fixedHeight = ~~(this.cropW / this.fixedNumber[0] * this.fixedNumber[1]);
            if (fixedHeight + this.cropOffsertY > this.h) {
              this.cropH = this.h - this.cropOffsertY;
              this.cropW = ~~(this.cropH / this.fixedNumber[1] * this.fixedNumber[0]);
              if (fw > 0) {
                this.cropOffsertX = this.cropChangeX
              } else {
                this.cropOffsertX = this.cropChangeX - this.cropW
              }
            } else {
              this.cropH = fixedHeight
            }
            this.cropOffsertY = this.cropOffsertY;
          }
        })
      },
      // 改变截图框大小
      changeCropSize (e, w, h, typeW, typeH) {
        e.preventDefault();
        window.addEventListener('mousemove', this.changeCropNow);
        window.addEventListener('mouseup', this.changeCropEnd);
        window.addEventListener('touchmove', this.changeCropNow);
        window.addEventListener('touchend', this.changeCropEnd);
        this.canChangeX = w;
        this.canChangeY = h;
        this.changeCropTypeX = typeW;
        this.changeCropTypeY = typeH;
        this.cropX = e.clientX ? e.clientX : e.touches[0].clientX;
        this.cropY = e.clientY ? e.clientY : e.touches[0].clientY;
        this.cropOldW = this.cropW;
        this.cropOldH = this.cropH;
        this.cropChangeX = this.cropOffsertX;
        this.cropChangeY = this.cropOffsertY;
        if (this.fixed) {
          if (this.canChangeX && this.canChangeY) {
            this.canChangeY = 0;
          }
        }
      },
      // 正在改变
      changeCropNow (e) {
        e.preventDefault();
        var nowX = e.clientX
          ? e.clientX : e.touches
            ? e.touches[0].clientX : 0;
        var nowY = e.clientY
          ? e.clientY : e.touches
            ? e.touches[0].clientY : 0;
        this.$nextTick(() => {
          var fw = ~~(nowX - this.cropX);
          var fh = ~~(nowY - this.cropY);
          if (this.canChangeX) {
            if (this.changeCropTypeX === 1) {
              if (this.cropOldW - fw > 0) {
                this.cropW = this.w - this.cropChangeX - fw <= this.w
                  ? this.cropOldW - fw : this.cropOldW + this.cropChangeX;
                this.cropOffsertX = this.w - this.cropChangeX - fw <= this.w
                  ? this.cropChangeX + fw : 0;
              } else {
                this.cropW = Math.abs(fw) + this.cropChangeX <= this.w
                  ? Math.abs(fw) - this.cropOldW
                  : this.w - this.cropOldW - this.cropChangeX;
                this.cropOffsertX = this.cropChangeX + this.cropOldW;
              }
            } else if (this.changeCropTypeX === 2) {
              if (this.cropOldW + fw > 0) {
                this.cropW = this.cropOldW + fw + this.cropOffsertX <= this.w
                  ? this.cropOldW + fw : this.w - this.cropOffsertX;
                this.cropOffsertX = this.cropChangeX
              } else {
                this.cropW = (this.w - this.cropChangeX + Math.abs(fw + this.cropOldW))
                <= this.w ? Math.abs(fw + this.cropOldW) : this.cropChangeX;
                this.cropOffsertX =
                  (this.w - this.cropChangeX + Math.abs(fw + this.cropOldW))
                  <= this.w ? this.cropChangeX - Math.abs(fw + this.cropOldW) : 0;
              }
            }
          }

          if (this.canChangeY) {
            if (this.changeCropTypeY === 1) {
              if (this.cropOldH - fh > 0) {
                this.cropH = this.h - this.cropChangeY - fh <= this.h
                  ? this.cropOldH - fh : this.cropOldH + this.cropChangeY;
                this.cropOffsertY = this.h - this.cropChangeY - fh <= this.h
                  ? this.cropChangeY + fh : 0;
              } else {
                this.cropH = Math.abs(fh) + this.cropChangeY <= this.h
                  ? Math.abs(fh) - this.cropOldH
                  : this.h - this.cropOldH - this.cropChangeY;
                this.cropOffsertY = this.cropChangeY + this.cropOldH;
              }
            } else if (this.changeCropTypeY === 2) {
              if (this.cropOldH + fh > 0) {
                this.cropH = this.cropOldH + fh + this.cropOffsertY
                <= this.h ? this.cropOldH + fh : this.h - this.cropOffsertY;
                this.cropOffsertY = this.cropChangeY
              } else {
                this.cropH =
                  (this.h - this.cropChangeY + Math.abs(fh + this.cropOldH))
                  <= this.h ? Math.abs(fh + this.cropOldH) : this.cropChangeY;
                this.cropOffsertY =
                  (this.h - this.cropChangeY + Math.abs(fh + this.cropOldH))
                  <= this.h ? this.cropChangeY - Math.abs(fh + this.cropOldH) : 0;
              }
            }
          }

          if (this.canChangeX && this.fixed) {
            var fixedHeight = ~~(this.cropW / this.fixedNumber[0] * this.fixedNumber[1]);
            if (fixedHeight + this.cropOffsertY > this.h) {
              this.cropH = this.h - this.cropOffsertY;
              this.cropW = ~~(this.cropH / this.fixedNumber[1] * this.fixedNumber[0]);
            } else {
              this.cropH = fixedHeight;
            }
          }

          if (this.canChangeY && this.fixed) {
            var fixedWidth = ~~(this.cropH / this.fixedNumber[1] * this.fixedNumber[0]);
            if (fixedWidth + this.cropOffsertX > this.w) {
              this.cropW = this.w - this.cropOffsertX;
              this.cropH = ~~(this.cropW / this.fixedNumber[0] * this.fixedNumber[1]);
            } else {
              this.cropW = fixedWidth;
            }
          }
        });
      },
      // 结束改变
      changeCropEnd (e) {
        window.removeEventListener('mousemove', this.changeCropNow);
        window.removeEventListener('mouseup', this.changeCropEnd);
        window.removeEventListener('touchmove', this.changeCropNow);
        window.removeEventListener('touchend', this.changeCropEnd);
      },
      // 创建完成
      endCrop () {
        if (this.cropW === 0 && this.cropH === 0) {
          this.cropping = false;
        }
        window.removeEventListener('mousemove', this.createCrop);
        window.removeEventListener('mouseup', this.endCrop);
        window.removeEventListener('touchmove', this.createCrop);
        window.removeEventListener('touchend', this.endCrop);
      },
      // 开始截图
      startCrop () {
        this.crop = true;
        // console.log('开始截图')
      },
      // 停止截图
      stopCrop () {
        this.crop = false;
        // console.log('停止截图')
      },
      // 清除截图
      clearCrop () {
        this.cropping = false;
        this.cropW = 0;
        this.cropH = 0;
        // console.log('清除截图')
      },
      // 截图移动
      cropMove (e) {
        // console.log(e);
        this.startMove(e);
        e.preventDefault();
        if (!this.canMoveBox) {
          this.crop = false;
          this.startMove(e);
          return false
        }
        window.addEventListener('mousemove', this.moveCrop);
        window.addEventListener('mouseup', this.leaveCrop);
        window.addEventListener('touchmove', this.moveCrop);
        window.addEventListener('touchend', this.leaveCrop);
        this.cropX = (e.clientX ? e.clientX : e.touches[0].clientX) - this.cropOffsertX;
        this.cropY = (e.clientY ? e.clientY : e.touches[0].clientY) - this.cropOffsertY;
      },

      moveCrop (e) {
        e.preventDefault();
        this.moveImg(e);


        // var nowX = e.clientX ? e.clientX : e.touches[0].clientX
        // var nowY = e.clientY ? e.clientY : e.touches[0].clientY
        // this.$nextTick(() => {
        //   var fw = ~~(nowX - this.cropX)
        //   var fh = ~~(nowY - this.cropY)
        //   if (fw <= 1) {
        //     this.cropOffsertX = 1
        //   } else if (~~(fw + this.cropW) > this.w) {
        //     this.cropOffsertX = this.w - this.cropW - 1
        //   } else {
        //     this.cropOffsertX = fw
        //   }
        //
        //   if (fh <= 1) {
        //     this.cropOffsertY = 1
        //   } else if (~~(fh + this.cropH) > this.h) {
        //     this.cropOffsertY = this.h - this.cropH - 1
        //   } else {
        //     this.cropOffsertY = fh
        //   }
        // })
      },

      leaveCrop (e) {
        window.removeEventListener('mousemove', this.moveCrop)
        window.removeEventListener('mouseup', this.leaveCrop)
        window.removeEventListener('touchmove', this.moveCrop)
        window.removeEventListener('touchend', this.leaveCrop)
      },
      // 获取转换成base64 的图片信息
      getCropData (cb) {
        let canvas = document.createElement('canvas');
        let img = new Image;
        let rotate = this.rotate;
        let trueWidth = this.trueWidth;
        let trueHeight = this.trueHeight;
        let cropOffsertX = this.cropOffsertX;
        let cropOffsertY = this.cropOffsertY;
        img.onload = () => {
          if (~~(this.cropW) !== 0) {
            let ctx = canvas.getContext('2d');
            let width = this.cropW;
            let height = this.cropH;
            let imgW = trueWidth * this.scale;
            let imgH = trueHeight * this.scale;
            // 图片x轴偏移
            let dx = (this.x - cropOffsertX) + this.trueWidth * (1 - this.scale) / 2;
            // 图片y轴偏移
            let dy = (this.y - cropOffsertY) + this.trueHeight * (1 - this.scale) / 2;
            // console.log(dx, dy)
            //保存状态
            canvas.width = width;
            canvas.height = height;
            ctx.save();
            switch (rotate) {
              case 0:
                if (!this.full) {
                  ctx.drawImage(img, dx, dy, imgW, imgH)
                } else {
                  // 输出原图比例截图
                  canvas.width = width / this.scale;
                  canvas.height = height / this.scale;
                  ctx.drawImage(img, dx / this.scale, dy / this.scale
                    , imgW / this.scale, imgH / this.scale);
                }
                break;
              case 1:
              case -3:
                if (!this.full) {
                  // 换算图片旋转后的坐标弥补
                  dx = dx + (imgW - imgH) / 2;
                  dy = dy + (imgH - imgW) / 2;
                  ctx.rotate(rotate * 90  * Math.PI / 180);
                  ctx.drawImage(img, dy, -dx - imgH, imgW, imgH);
                } else {
                  canvas.width = width / this.scale;
                  canvas.height = height / this.scale;
                  // 换算图片旋转后的坐标弥补
                  dx = dx / this.scale + (imgW / this.scale - imgH / this.scale) / 2;
                  dy = dy / this.scale + (imgH / this.scale - imgW / this.scale) / 2;
                  ctx.rotate(rotate * 90  * Math.PI / 180);
                  ctx.drawImage(img, dy, (-dx - imgH / this.scale)
                    , imgW / this.scale, imgH / this.scale);
                }
                break;
              case 2:
              case -2:
                if (!this.full) {
                  ctx.rotate(rotate * 90  * Math.PI / 180);
                  ctx.drawImage(img, -dx - imgW, -dy - imgH, imgW, imgH);
                } else {
                  canvas.width = width / this.scale;
                  canvas.height = height / this.scale;
                  ctx.rotate(rotate * 90  * Math.PI / 180);
                  dx = dx / this.scale;
                  dy = dy / this.scale;
                  ctx.drawImage(img, -dx - imgW / this.scale
                    , -dy - imgH / this.scale, imgW / this.scale, imgH / this.scale);
                }
                break;
              case 3:
              case -1:
                if (!this.full) {
                  // 换算图片旋转后的坐标弥补
                  dx = dx + (imgW - imgH) / 2;
                  dy = dy + (imgH - imgW) / 2;
                  ctx.rotate(rotate * 90  * Math.PI / 180);
                  ctx.drawImage(img, -dy - imgW, dx, imgW, imgH);
                } else {
                  canvas.width = width / this.scale;
                  canvas.height = height / this.scale;
                  // 换算图片旋转后的坐标弥补
                  dx = dx / this.scale + (imgW / this.scale - imgH / this.scale) / 2;
                  dy = dy / this.scale + (imgH / this.scale - imgW / this.scale) / 2;
                  ctx.rotate(rotate * 90  * Math.PI / 180);
                  ctx.drawImage(img, -dy - imgW / this.scale, dx
                    , imgW / this.scale, imgH / this.scale);
                }
                break;
              default:
                if (!this.full) {
                  ctx.drawImage(img, dx, dy, imgW, imgH);
                } else {
                  // 输出原图比例截图
                  canvas.width = width / this.scale;
                  canvas.height = height / this.scale;
                  ctx.drawImage(img, dx / this.scale, dy / this.scale
                    , imgW / this.scale, imgH / this.scale);
                }
            }
            ctx.restore();
          } else {
            let width = trueWidth * this.scale;
            let height = trueHeight * this.scale;
            let ctx = canvas.getContext('2d');
            ctx.save();
            switch (rotate) {
              case 0:
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                break;
              case 1:
              case -3:
                // 旋转90度 或者-270度 宽度和高度对调
                canvas.width = height;
                canvas.height = width;
                ctx.rotate(rotate * 90  * Math.PI / 180);
                ctx.drawImage(img, 0, -height, width, height);
                break;
              case 2:
              case -2:
                canvas.width = width;
                canvas.height = height;
                ctx.rotate(rotate * 90  * Math.PI / 180);
                ctx.drawImage(img, -width, -height, width, height);
                break;
              case 3:
              case -1:
                canvas.width = height;
                canvas.height = width;
                ctx.rotate(rotate * 90  * Math.PI / 180);
                ctx.drawImage(img, -width, 0, width, height);
                break;
              default:
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
            }
            ctx.restore();
          }

          let data = canvas.toDataURL('image/gif', this.outputSize);
          data = data.replace(/^data:image\/(png|jpg|jpeg|gif);base64,/, "");
          // let data = canvas.toDataURL('image/' + this.outputType, this.outputSize);
          data = "data:image/"+ this.outputType +";base64,"+data;
          cb(data);
        };
        // 判断图片是否是base64
        var s = this.img.substr(0, 4);
        if (s !== 'data') {
          img.crossOrigin = 'anonymous';
        }
        img.src = this.imgs;
      },
      //转化base64 为blob对象
      getCropBlob(cb) {
        this.getCropData((data) => {
          var arr = data.split(',')
          var mime = arr[0].match(/:(.*?);/)[1]
          var bstr = atob(arr[1])
          var n = bstr.length
          var u8arr = new Uint8Array(n)
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
          }
          cb(
            new Blob([u8arr], {
                type: mime
              }
            ))
        })
      },

      // 自动预览函数
      showPreview() {
        var obj = {};
        obj.div = {
          'width': this.cropW + 'px',
          'height': this.cropH + 'px'
        };
        obj.img = {
          'width': this.trueWidth + 'px',
          'height': this.trueHeight + 'px',
          'transform': 'scale(' + this.scale + ',' + this.scale + ') '
            + 'translate3d('+ (this.x - this.cropOffsertX) / this.scale
            + 'px,' + (this.y - this.cropOffsertY) / this.scale + 'px,' + '0)'
            + 'rotateZ('+ this.rotate * 90 + 'deg)'
        };
        obj.w = this.cropW;
        obj.h = this.cropH;
        obj.url = this.imgs;
        this.$emit('realTime',  obj);
      },
      // reload 图片布局函数
      reload () {
        let img = new Image;
        img.onload = () => {
          // 读取图片的信息原始信息， 解析是否需要旋转
          // 读取图片的旋转信息
          // 得到外层容器的宽度高度
          this.w =  ~~(window.getComputedStyle(this.$refs.cropper).width.replace('px', ''));
          this.h =  ~~(window.getComputedStyle(this.$refs.cropper).height.replace('px', ''));

          // 存入图片真实高度
          this.trueWidth = img.width;
          this.trueHeight = img.height;

          // 判断是否需要压缩大图
          if (!this.original) {
            if (this.trueWidth > this.w) {
              // 如果图片宽度大于容器宽度
              this.scale = this.w / this.trueWidth;
            }

            if (this.trueHeight * this.scale > this.h) {
              this.scale = this.h / this.trueHeight;
            }
          } else {
            this.scale = 1;
          }

          this.$nextTick(() => {
            this.x = -(this.trueWidth - this.trueWidth * this.scale) / 2
              + (this.w - this.trueWidth * this.scale) / 2;
            this.y = -(this.trueHeight - this.trueHeight * this.scale) / 2
              + (this.h - this.trueHeight * this.scale) / 2;
            this.loading = false;
            // 获取是否开启了自动截图
            if (this.autoCrop) {
              this.goAutoCrop();
            }
            // 图片加载成功的回调
            this.$emit('imgLoad', 'success');
          })
        };
        img.onerror = () => {
          this.$emit('imgLoad', 'error');
        };
        img.src = this.imgs;
      },
      // 自动截图函数
      goAutoCrop () {
        this.cropping = true
        // 截图框默认大小
        // 如果为0 那么计算容器大小 默认为80%
        var w = this.autoCropWidth
        var h = this.autoCropHeight
        if (w === 0 || h === 0) {
          w = this.w * 0.8
          h = this.h * 0.8
        }
        w = w > this.w ? this.w : w
        h = h > this.h ? this.h : h
        if (this.fixed) {
          h = w / this.fixedNumber[0] * this.fixedNumber[1]
        }
        // 如果比例之后 高度大于h
        if (h > this.h) {
          h = this.h
          w = h / this.fixedNumber[1] * this.fixedNumber[0]
        }
        this.changeCrop(w, h)
      },
      // 手动改变截图框大小函数
      changeCrop (w, h) {
        // 判断是否大于容器
        this.cropW = w
        this.cropH = h
        // 居中走一走
        this.cropOffsertX = (this.w - w) / 2
        this.cropOffsertY = (this.h - h) / 2
      },
      // 重置函数， 恢复组件置初始状态
      refresh () {
        // console.log('refresh')
        this.imgs = ''
        this.scale = 1
        this.crop = false
        this.rotate = 0
        this.w = 0
        this.h = 0
        this.trueWidth = 0
        this.trueHeight = 0
        this.clearCrop()
      },

      // 向左边旋转
      rotateLeft () {
        this.rotate = this.rotate <= -3 ? 0 : this.rotate - 1
      },

      // 向右边旋转
      rotateRight () {
        this.rotate = this.rotate >= 3 ? 0 : this.rotate + 1
      },

      // 清除旋转
      rotateClear () {
        this.rotate = 0
      }
    },
    mounted () {
      let that = this;
      this.initConfig();
      this.showPreview();
      this.checkedImg();
      var u = navigator.userAgent;
      this.isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
      // 兼容blob
      if (!HTMLCanvasElement.prototype.toBlob) {
        Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
          value: function (callback, type, quality) {
            let binStr = atob( this.toDataURL(type, quality).split(',')[1] ),
              len = binStr.length,
              arr = new Uint8Array(len);
            for (var i=0; i<len; i++ ) {
              arr[i] = binStr.charCodeAt(i);
            }
            callback( new Blob( [arr], {type: that.type || 'image/png'} ) )
          }
        })
      }
    }
  }
</script>

<style scoped>
  .vue-cropper {
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    direction: ltr;
    touch-action: none;
    /*background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC');*/
  }

  .cropper-box, .cropper-box-canvas, .cropper-drag-box, .cropper-crop-box, .cropper-face{
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    user-select: none;
  }

  .cropper-box-canvas img {
    position: relative;
    user-select: none;
    transform: none;
    max-width: none;
    max-height: none;
  }

  .cropper-box {
    overflow: hidden;
  }

  .cropper-move {
    cursor: move;
  }

  .cropper-crop {
    cursor: crosshair;
  }

  .cropper-modal {
    /*background: rgba(0, 0, 0, 0.5);*/
  }

  .cropper-crop-box {
    /*border: 2px solid #39f;*/
  }

  .cropper-view-box {
    display: block;
    overflow: hidden;
    width: 100%;
    height: 100%;
    outline: 2px solid #18B87E;
    outline-color: #18B87E;
    user-select: none;
  }

  .cropper-view-box img {
    user-select: none;
    max-width: none;
    max-height: none;
  }

  .cropper-face {
    top: 0;
    left: 0;
    background-color: #fff;
    opacity: 0.1;
  }

  .crop-info {
    position: absolute;
    left: 0px;
    min-width: 65px;
    text-align: center;
    color: white;
    line-height: 20px;
    background-color: rgba(0, 0, 0, 0.8);
    font-size: 12px;
  }

  .crop-line {
    position: absolute;
    display: block;
    width: 100%;
    height: 100%;
    opacity: .1;
  }

  .line-w {
    top: -3px;
    left: 0;
    height: 5px;
    cursor: n-resize;
  }

  .line-a {
    top: 0;
    left: -3px;
    width: 5px;
    cursor: w-resize;
  }

  .line-s {
    bottom: -3px;
    left: 0;
    height: 5px;
    cursor: s-resize;
  }

  .line-d {
    top: 0;
    right: -3px;
    width: 5px;
    cursor: e-resize;
  }

  .crop-point {
    position: absolute;
    width: 8px;
    height: 8px;
    opacity: .75;
    background-color: #39f;
    border-radius: 100%;
  }

  .point1 {
    top: -4px;
    left: -4px;
    cursor: nw-resize;
  }

  .point2 {
    top: -5px;
    left: 50%;
    margin-left: -3px;
    cursor: n-resize;
  }

  .point3 {
    top: -4px;
    right: -4px;
    cursor: ne-resize;
  }

  .point4 {
    top: 50%;
    left: -4px;
    margin-top: -3px;
    cursor: w-resize;
  }

  .point5 {
    top: 50%;
    right: -4px;
    margin-top: -3px;
    cursor: w-resize;
  }

  .point6 {
    bottom: -5px;
    left: -4px;
    cursor: sw-resize;
  }

  .point7 {
    bottom: -5px;
    left: 50%;
    margin-left: -3px;
    cursor: s-resize;
  }

  .point8 {
    bottom: -5px;
    right: -4px;
    cursor: nw-resize;
  }

  @media screen and (max-width: 500px) {
    .crop-point {
      position: absolute;
      width: 20px;
      height: 20px;
      opacity: .45;
      background-color: #39f;
      border-radius: 100%;
    }

    .point1 {
      top: -10px;
      left: -10px;
    }

    .point2, .point4, .point5, .point7 {
      display: none;
    }

    .point3 {
      top: -10px;
      right: -10px;
    }

    .point4 {
      top: 0;
      left: 0;
    }

    .point6 {
      bottom: -10px;
      left: -10px;
    }

    .point8 {
      bottom: -10px;
      right: -10px;
    }
  }
</style>
