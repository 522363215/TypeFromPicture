### TypeFromPicture


----------
图片进行网格化，然后根据像素值求出每一个格子对应的类型，最后返回一个二维数组

### 使用


----------


```
npm install type-from-picture@1.0.1 -save
```


### 带了一个简单的demo

----------

```
git clone https://github.com/522363215/TypeFromPicture.git

运行demo下的 index.html
```

### 博客地址


----------
http://blog.csdn.net/qq_22218005


----------


### 好久没有写博客，正好借此写下最近遇到的一个问题，慢慢把写博客的习惯捡起来，哈哈！
#### 问题：给一个图片，把这张图片进行坐标化，并且 在生成的二位坐标系上标记出每个坐标点所属的类型。
#### 这样说好像有点难理解，我都有点小迷啦...直接上图...

![海域图](http://img.blog.csdn.net/20170311225334955?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMjIyMTgwMDU=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

#### 这张图有一个应用就是，在海域上有一艘船，船肯定必须在水上啦，所以对船来说陆地就是船的障碍物，所以目标就是把图片进行坐标化，然后在二维坐标上标记出障碍物的位置，这样就可以在给定船一个起始和结束坐标时，可以让船避开障碍物进行移动

#### 刚看到这个需求，还没有思路，就让UI直接把这张图网格化，然后我自己再根据图片上的小格子里面是陆地还是海洋来一一进行人工标记坐标
![这里写图片描述](http://img.blog.csdn.net/20170311230900476?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMjIyMTgwMDU=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
#### 没标记多久就觉得这...这要是标记完眼都TM得累死啦，而且要是换张图片呢，这不是直接炸锅...幸好有我大H5帮我解决这个问题，Ok，来慢慢分析一下：

#### 先确定一下要解决的几个问题:

- 如何确定哪一个位置是陆地还是海洋
- 如何把图片进行坐标化
- 如果不光要区别分陆地、海洋，还有暴风、旋涡等多种类型

#### 思路：
- 第一个问题，可以利用图片像素点来解决，不同的类型关键就在于像素的RGBA不同，只要我们能拿到图片中像素的数据就可以找出每一个像素所属的类型，难点就在于RGBA四个值的阈值设置。
- 第二个问题，我们可以自己设计一个比例来进行坐标化，比如1920 * 1080像素的图片，我们可以按100 * 100来进行坐标化，那么每一个格子所占的像素点数就知道啦，然后这个格子中不同类型所占的像素个数也知道，我的做法是取类型个数最多为这个格子最终的类型，但是你也可以有自己的算法来找出最终的类型（按百分比什么的度都可以）。
- 第三个问题主要就是代码层次上面的，需要代码健壮性和扩展性要强

#### 上面问题和思路说的差不多啦（感觉上面说的有点啰嗦...），主要就是利用H5的Canvas来进行处理的，下面直接上代码

```
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
```

#### 我这里封装了一个类，里面也有注释，有一些健壮性问题没有处理，但可以拿来简单的使用，下面再附上简单的使用方法

>index.html
```
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
  <title></title>
</head>
<body>

<p>要使用的图片：</p>
<img src="../img/海域地图.jpg"  width="300" height="150" alt="tulip" id="tulip" style="margin-left:0px;" />

<p>Canvas:</p>

<canvas id="myCanvas" width="1920" height="1080" style="border:1px solid #d3d3d3;">
Your browser does not support the HTML5 canvas tag.
</canvas>

<script type="text/javascript" src="../TypeFromPicture.js"></script>
<script type="text/javascript" src="./test.js"></script>
</body>
</html>
```

#### 这里有一个注意点就是，canvas标签的width和height设置成你原始图片宽高像素值

>test.js
```
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
//下面加上我封装的类，我这里就不写啦
```

#### 不要以为这样就完啦哦，你们打开index.html页面时会报错的

```
Uncaught SecurityError: Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The canvas has been tainted by cross-origin data.
```

#### canva需要跨域数据，当然跨域的方法有很多啦，我这里提供一个简单的方法，设置chrome浏览器配置就可以，打开chrome的属性，在目标后面加上
![这里写图片描述](http://img.blog.csdn.net/20170311225635756?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMjIyMTgwMDU=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
```
--args --disable-web-security --user-data-dir
```
#### **注意要先加一个空格哦**

#### 然后就可以在浏览器控制台里看到log输出，把输出的数据copy到一个txt文件里，然后就可以使用java、c#等语言进行文件流读取，封装成想要的数据即可！

#### 可以使用 屏幕吸色器来对图片中的像素值进行提取