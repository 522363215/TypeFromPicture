(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) : (global.Qarticles = factory());
}(this, function() {
  /**
   * 把图片进行网格化，然后根据像素值求出每一个格子对应的类型，最后返回一个二维数组
   */
  class TypesFromPicture {

    constructor(canvas, types, threshold) {
      this.canvas = canvas;
      this.types = types;
      this.threshold = threshold;
    }

    /**
     * [calTypesFromPixels 计算所有像素点所属的类型]
     * @param  {[type]} pixels [所有像素点数据]
     * @return {[type]}        [所有像素点所属的类型数组]]
     */
    calTypesFromPixels(pixels) {

      let types_data = new Array();

      let len = pixels.length;
      for (let i = 0; i < len; i += 4) {
        types_data[i / 4] = this.calTypeFromPixel(pixels.slice(i, i + 4));
      }
      return types_data;

    }

    /**
     * [calTypeFromPixel 计算一个像素点所属的类型]
     * @param  {[type]} pixelArray  [图片的所有像素点]
     * @return {[type]}             [单个像素点所属的类型]
     */
    calTypeFromPixel(pixelArray) {

      let isBreak = false;
      //默认是第一个类型值
      let type = Object.keys(this.types)[0];
      Object.keys(this.threshold).map((v) => {
        if (!isBreak &&
          pixelArray[0] >= this.threshold[v].r[0] && pixelArray[0] <= this.threshold[v].r[1] &&
          pixelArray[1] >= this.threshold[v].g[0] && pixelArray[1] <= this.threshold[v].g[1] &&
          pixelArray[2] >= this.threshold[v].b[0] && pixelArray[2] <= this.threshold[v].b[1] &&
          pixelArray[3] >= this.threshold[v].a[0] && pixelArray[3] <= this.threshold[v].a[1]) {
          type = this.types[v];
          isBreak = true;
        }
      });
      return type;

    }


    /**
     * [gridFromTypes 网格化图片以及每个格子对应的类型]
     * @param  {[type]} typesData [图片每一个像素点对应类型的数组]
     * @param  {[type]} col       [纵轴平均分成几份]
     * @param  {[type]} row       [横轴平均分成几份]
     * @return {[type]}           [格式化后每个格子对应类型的一维数组]
     */
    gridFromTypes(typesData, col, row) {

      let XArray = new Array(),
        YArray = new Array();

      //~~使用: ~~1.1 === 1 、~~1.8 === 1 、~~-1.1 === -1、~~-1.8 === -1 
      let _col = ~~col,
        _row = ~~row;
      let w = this.canvas.clientWidth,
        h = this.canvas.clientHeight;
      let grid_w = ~~(w / _col),
        grid_h = ~~(h / _row);

      let grid_data = new Array();
      for (let i = 0; i < _row; i++) {
        for (let y = 0; y < _col; y++) {
          let tmp_type = this.calGridType(typesData, y * grid_w, (y + 1) * grid_w, i * grid_h, (i + 1) * grid_h);
          // grid_data[y + i * _row] = this.types[tmp_type];
          YArray[y] = this.types[tmp_type];
        }
        XArray[i] = YArray.slice(0);
      }
      return XArray;

    }

    /**
     * [calGridType 计算每个格子的类型]
     * @param  {[type]} typesData   [转换后类型数据]
     * @param  {[type]} startX [格子横轴开始点]
     * @param  {[type]} endX   [格子横轴结束点]
     * @param  {[type]} startY [格子纵轴开始点]
     * @param  {[type]} endY   [格子纵轴开始点]
     * @return {[type]}        [计算后格子的类型]
     */
    calGridType(typesData, startX, endX, startY, endY) {

      let counter = {};
      Object.keys(this.types).map((v) => {
        counter[v] = 0;
      });

      for (let y = startY; y < endY; y++) {
        for (let i = startX; i < endX; i++) {
          Object.keys(this.types).map((v) => {
            if (this.types[v] === typesData[this.canvas.clientWidth * y + i]) {
              counter[v]++;
            }
          });
        }
      }
      return this.calMaxInArray(counter);

    }

    /**
     * [calMaxInArray 计算数组中最大值]
     * @param  {[type]} origal [保存类型数量的对象]
     * @return {[type]}        [数量最多的类型]
     */
    calMaxInArray(origal) {
      let max = -1,
        type = '';
      Object.keys(origal).map((v) => {
        if (origal[v] > max) {
          max = origal[v];
          type = v;
        }
      });
      return type;
    }
  }

  return TypesFromPicture;

}));