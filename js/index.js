/**
 * Created by Ganother on 2017/4/5.
 */
function selector (select, Aparent) {
  let parent = Aparent || document
  let realSelector
  if (select.indexOf('#') !== -1) {
    realSelector = select.slice(1)
    return parent.getElementById(realSelector)
  } else if (select.indexOf('.') !== -1) {
    realSelector = select.slice(1)
    return parent.querySelectorAll(realSelector)
  } else {
    return parent.getElementsByTagName(select)
  }
}
const canvas = selector('#canvas')
const ctx = canvas.getContext('2d')
ctx.globalCompositeOperation = 'source-atop'

// 兼容3倍retina屏， 需要把canvas画布大小设为物理大小的3倍，否则会模糊
const RATIO = 3

const tool = selector('#tool')
const toolHeight = tool.offsetHeight
let canvasOffset = canvas.getBoundingClientRect()
const canvasWidth = canvas.width = canvasOffset.width * RATIO
const canvasHeight = canvas.height = (canvasOffset.height - toolHeight) * RATIO
canvas.style.height = canvasHeight / RATIO + 'px'
canvasOffset = canvas.getBoundingClientRect()

// 坐标转换 相对窗口坐标变为canvas实际坐标
function windowToCanvas(x, y) {
  return {
    x: (x - canvasOffset.left) * (canvasWidth / canvasOffset.width),
    y: (y - canvasOffset.top) * (canvasHeight / canvasOffset.height)
  }
}

// 获取鼠标canvas坐标
function getTouchPosition(e){
  let touch = e.changedTouches[0]
  return windowToCanvas(touch.clientX, touch.clientY)
}

// 工具基础 宽度，颜色，是否在绘画中，是否被选中
class Basic {
  constructor (width = RATIO, color = '#000') {
    this.width = width
    this.color = color
    this.drawing = false
    this.isSelect = false
  }
}

//铅笔类 通过简单的路径描点连线
class Pencil extends Basic {
  constructor (width = RATIO, color = '#000') {
    super(width, color)
    this.name = 'pencil'
    this.dom = selector(`#${this.name}`)
  }
  begin (loc) {
    // 先保存画布状态，再改变画布状态
    ctx.save()
    ctx.lineWidth = this.width
    ctx.strokeStyle = this.color
    ctx.beginPath()
    ctx.moveTo(loc.x, loc.y)
  }
  draw (loc) {
    ctx.lineTo(loc.x, loc.y)
    ctx.stroke()
  }
  end (loc) {
    ctx.lineTo(loc.x, loc.y)
    ctx.stroke()
    // 恢复到之前的画布状态
    ctx.restore()
  }
  bindEvent () {
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault()
      if (!this.isSelect) {
        return false
      }
      this.drawing = true
      let loc = getTouchPosition(e)
      this.begin(loc)
    })
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault()
      if (!this.isSelect) {
        return false
      }
      if (this.drawing) {
        let loc = getTouchPosition(e)
        this.draw(loc)
      }
    })
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault()
      if (!this.isSelect) {
        return false
      }
      let loc = getTouchPosition(e)
      this.end(loc)
      this.drawing = false
    })
  }
}

// 橡皮 颜色为背景色的铅笔，但是在对称变换的时候会有问题，以后会改成用clearRect来擦除
class Eraser extends Pencil {
  constructor (width) {
    super(width, '#fff')
    this.name = 'eraser'
    this.dom = selector(`#${this.name}`)
  }
}

// 线段类 拖动开始时先储存画布当前数据，之后每次拖动，先把画布数据铺上，再化线段
class Line extends Basic {
  constructor (width = RATIO, color = '#000') {
    super(width, color)
    this.startPosition = {
      x: 0,
      y: 0
    }
    this.firstDot = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    this.name = 'line'
    this.dom = selector(`#${this.name}`)
  }
  begin (loc) {
    // 获取当前画布数据
    this.firstDot = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    Object.assign(this.startPosition, loc)
    ctx.save()
    ctx.lineWidth = this.width
    ctx.strokeStyle = this.color
  }
  draw (loc) {
    // 铺上拖动开始时的画布数据，并绘制一条线段，之后每次触发都会县覆盖掉已绘制的线段，再绘制新线段
    ctx.putImageData(this.firstDot, 0, 0)
    ctx.beginPath()
    ctx.moveTo(this.startPosition.x, this.startPosition.y)
    ctx.lineTo(loc.x, loc.y)
    ctx.stroke()
  }
  end (loc) {
    ctx.putImageData(this.firstDot, 0, 0)
    ctx.beginPath()
    ctx.moveTo(this.startPosition.x, this.startPosition.y)
    ctx.lineTo(loc.x, loc.y)
    ctx.stroke()
    ctx.restore()
  }
  bindEvent () {
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault()
      if (!this.isSelect) {
        return false
      }
      this.drawing = true
      let loc = getTouchPosition(e)
      this.begin(loc)
    })
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault()
      if (!this.isSelect) {
        return false
      }
      if (this.drawing) {
        let loc = getTouchPosition(e)
        this.draw(loc)
      }
    })
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault()
      if (!this.isSelect) {
        return false
      }
      let loc = getTouchPosition(e)
      this.end(loc)
      this.drawing = false
    })
  }
}

// 方形 记录初始坐标，根据鼠标坐标画正方形，和线段类似
class Rect extends Basic {
  constructor (width = RATIO, color = '#000') {
    super(width, color)
    this.startPosition = {
      x: 0,
      y: 0
    }
    this.firstDot = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    this.name = 'rect'
    this.dom = selector(`#${this.name}`)
  }
  begin (loc) {
    this.firstDot = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    Object.assign(this.startPosition, loc)
    ctx.save()
    ctx.lineWidth = this.width
    ctx.strokeStyle = this.color
  }
  draw (loc) {
    ctx.putImageData(this.firstDot, 0, 0)
    const rect = {
      x: this.startPosition.x <= loc.x ? this.startPosition.x : loc.x,
      y: this.startPosition.y <= loc.y ? this.startPosition.y : loc.y,
      width: Math.abs(this.startPosition.x - loc.x),
      height: Math.abs(this.startPosition.y - loc.y)
    }
    ctx.beginPath()
    ctx.rect(rect.x, rect.y, rect.width, rect.height)
    ctx.stroke()
  }
  end (loc) {
    ctx.putImageData(this.firstDot, 0, 0)
    const rect = {
      x: this.startPosition.x <= loc.x ? this.startPosition.x : loc.x,
      y: this.startPosition.y <= loc.y ? this.startPosition.y : loc.y,
      width: Math.abs(this.startPosition.x - loc.x),
      height: Math.abs(this.startPosition.y - loc.y)
    }
    ctx.beginPath()
    ctx.rect(rect.x, rect.y, rect.width, rect.height)
    ctx.stroke()
    ctx.restore()
  }
  bindEvent () {
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault()
      if (!this.isSelect) {
        return false
      }
      this.drawing = true
      let loc = getTouchPosition(e)
      this.begin(loc)
    })
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault()
      if (!this.isSelect) {
        return false
      }
      if (this.drawing) {
        let loc = getTouchPosition(e)
        this.draw(loc)
      }
    })
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault()
      if (!this.isSelect) {
        return false
      }
      let loc = getTouchPosition(e)
      this.end(loc)
      this.drawing = false
    })
  }
}

// 圆形 均匀压缩法 根据起始坐标和结束坐标找一个方形，方形的长边作为圆的半径 画以长边为边的正方形的内切圆 再根据长边与窄边的比例，压缩为原方形的内切椭圆
class Round extends Basic{
  constructor (width = RATIO, color = '#000') {
    super(width, color)
    this.startPosition = {
      x: 0,
      y: 0
    }
    this.firstDot = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    this.name = 'round'
    this.dom = selector(`#${this.name}`)
  }
  drawCalculate (loc) {
    ctx.save()
    ctx.lineWidth = this.width
    ctx.strokeStyle = this.color
    ctx.putImageData(this.firstDot, 0, 0)
    const rect = {
      width: loc.x - this.startPosition.x,
      height: loc.y - this.startPosition.y
    }
    const rMax = Math.max(Math.abs(rect.width), Math.abs(rect.height))
//    const rMin = Math.min(Math.abs(rect.width), Math.abs(rect.height))
    rect.x = this.startPosition.x + rect.width / 2
    rect.y = this.startPosition.y + rect.height / 2
    rect.scale = {
      x: Math.abs(rect.width) / rMax,
      y: Math.abs(rect.height) / rMax
    }
    ctx.scale(rect.scale.x, rect.scale.y)
    ctx.beginPath()
    ctx.arc(rect.x / rect.scale.x, rect.y / rect.scale.y, rMax / 2, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
  begin (loc) {
    this.firstDot = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    Object.assign(this.startPosition, loc)
  }
  draw (loc) {
    this.drawCalculate(loc)
  }
  end (loc) {
    this.drawCalculate(loc)
  }
  bindEvent () {
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault()
      if (!this.isSelect) {
        return false
      }
      this.drawing = true
      let loc = getTouchPosition(e)
      this.begin(loc)
    })
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault()
      if (!this.isSelect) {
        return false
      }
      if (this.drawing) {
        let loc = getTouchPosition(e)
        this.draw(loc)
      }
    })
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault()
      if (!this.isSelect) {
        return false
      }
      let loc = getTouchPosition(e)
      this.end(loc)
      this.drawing = false
    })
  }
}

// 整合绘图工具
class Tool {
  constructor () {
    this.pencil = new Pencil(RATIO, '#000')
    this.eraser = new Eraser(RATIO * 10)
    this.line = new Line()
    this.rect = new Rect()
    this.round = new Round()
    let allTools = [this.pencil, this.line, this.rect, this.eraser, this.round]
    // 设置watcher 改变工具时改变工具的isSelected属性
    Object.defineProperty(this, 'selected', {
      set : function (value) {
        for (let item of allTools) {
          if (item.name === value) {
            item.isSelect = true
            item.dom.style.color = '#f00'
          } else {
            item.isSelect = false
            item.dom.style.color = '#000'
          }
        }
      },
      get : function () {
        for (let item of allTools) {
          if (item.isSelect) {
            return item.name
          }
        }
      }
    })
  }
  bindEvent () {
    this.selected = 'pencil'
    tool.addEventListener('click', (e) => {
      let target = e.target
      let name = target.getAttribute('id')
      this.selected = name
      lineWidth.range.value = this[name].width / RATIO
      if (name === 'eraser') {
        return false
      }
      palette.entrance.style.color = this[name].color
    })
    this.pencil.bindEvent()
    this.line.bindEvent()
    this.rect.bindEvent()
    this.eraser.bindEvent()
    this.round.bindEvent()
  }
}

//调色板
class Palette {
  constructor () {
    this.dom = selector("#Palette")
    this.entrance = selector("#toPalette")
    this.show = false
  }
  bindEvent () {
    this.dom.addEventListener('click', (e) => {
      const target = e.target
      if (target === this.entrance) {
        this.show = !this.show
        if (this.show) {
          this.dom.className = 'palette palette-show'
        } else {
          this.dom.className = 'palette'
        }
      } else if (target.className.indexOf('item') !== -1) {
        if (tools[tools.selected].name === 'eraser') {
          return false
        }
        const color = window.getComputedStyle(target, null).backgroundColor
        this.entrance.style.color = color
        tools[tools.selected].color = color
      }
    })
  }
}

//长度选择
class LineWidth {
  constructor () {
    this.dom = selector("#width")
    this.entrance = selector("#toWidth")
    this.range = selector("#lineWidth")
    this.show = false
  }
  bindEvent () {
    this.entrance.addEventListener('click', (e) => {
      this.show = !this.show
      if (this.show) {
        this.dom.className = 'width width-show'
      } else {
        this.dom.className = 'width'
      }
    })
    this.range.addEventListener('change', (e) => {
      const width = this.range.value
      tools[tools.selected].width = width * RATIO
    })
  }
}

const tools = new Tool()
const palette = new Palette()
const lineWidth = new LineWidth()

lineWidth.bindEvent()
palette.bindEvent()
tools.bindEvent()

//对称变换工具
selector("#symmetry").addEventListener('click', () => {
  ctx.save()
  ctx.translate(canvasWidth, 0)
  // 垂直翻转后导出画布
  ctx.scale(-1, 1)
  let ori = canvas.toDataURL()
  let image = new Image()
  image.onload = function () {
    // 把翻转的图像数据画上
    ctx.drawImage(image, 0, 0)
    ctx.restore()
    ctx.save()
    ctx.translate(0, canvasHeight)
    // 水平翻转后导出画布
    ctx.scale(1, -1)
    let ori2 = canvas.toDataURL()
    let image2 = new Image()
    image2.onload = function () {
      ctx.drawImage(image2, 0, 0)
      ctx.restore()
    }
    image2.src = ori2
  }
  image.src = ori
})