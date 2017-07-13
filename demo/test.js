//自定义类型
const types = {
  land: 0,
  ocean: 1
};
//自定义阈值
const threshold = {
  land: {
    r: [23, 43],
    g: [48, 68],
    b: [88, 120],
    a: [0, 255],
  },
  ocean: {
    r: [65, 100],
    g: [130, 180],
    b: [180, 220],
    a: [0, 255],
  }
};

//等img加载完成后再进行canvas绘制，否则拿不到数据
document.getElementById("tulip").onload = function() {
  //在canvas上绘制图片
  let c = document.getElementById("myCanvas");
  let ctx = c.getContext("2d");
  let img = document.getElementById("tulip");
  ctx.drawImage(img, 0, 0);
  //获取图片一些信息
  let data = ctx.getImageData(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight).data;

  let typesFromPicture = new TypesFromPicture(ctx.canvas, types, threshold);
  let types_data = typesFromPicture.calTypesFromPixels(data);
  //坐标化成100*100
  let result = typesFromPicture.gridFromTypes(types_data, 100, 100);

  console.log(JSON.stringify(result));

};