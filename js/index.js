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
const tool = selector('#tool')
const toolHeight = tool.offsetHeight
let canvasOffset = canvas.getBoundingClientRect()
const canvasWidth = canvas.width = canvasOffset.width * 3
const canvasHeight = canvas.height = (canvasOffset.height - toolHeight) * 3
canvas.style.height = canvasHeight / 3 + 'px'
canvasOffset = canvas.getBoundingClientRect()
function windowToCanvas(x, y) {
  return {
    x: (x - canvasOffset.left) * (canvasWidth / canvasOffset.width),
    y: (y - canvasOffset.top) * (canvasHeight / canvasOffset.height)
  }
}

function getTouchPosition(e){
  let touch = e.changedTouches[0]
  return windowToCanvas(touch.clientX, touch.clientY)
}

class Pencil {
  constructor (width, color) {
    this.width = width
    this.color = color
    this.drawing = false
    this.isSelect = false
    this.name = 'pencil'
    this.dom = selector(`#${this.name}`)
  }
  begin (loc) {
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

class Eraser extends Pencil {
  constructor (width) {
    super(width, '#fff')
    this.name = 'eraser'
    this.dom = selector(`#${this.name}`)
  }
}

class Line {
  constructor (width) {
    this.width = width
    this.color = "#000"
    this.startPosition = {
      x: 0,
      y: 0
    }
    this.firstDot = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    this.isSelect = false
    this.drawing = false
    this.name = 'line'
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

class Rect {
  constructor (width, color) {
    this.width = width || 3
    this.color = color || '#000'
    this.startPosition = {
      x: 0,
      y: 0
    }
    this.firstDot = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    this.isSelect = false
    this.drawing = false
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

class Round {
  constructor (width, color) {
    this.width = width || 3
    this.color = color || '#000'
    this.startPosition = {
      x: 0,
      y: 0
    }
    this.firstDot = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    this.isSelect = false
    this.drawing = false
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

class Tool {
  constructor () {
    this.pencil = new Pencil(3, '#000')
    this.eraser = new Eraser(30)
    this.line = new Line(3)
    this.rect = new Rect(3)
    this.round = new Round(3)
    let allTools = [this.pencil, this.line, this.rect, this.eraser, this.round]
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
      lineWidth.range.value = this[name].width / 3
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
      tools[tools.selected].width = width * 3
    })
  }
}

const tools = new Tool()
const palette = new Palette()
const lineWidth = new LineWidth()

lineWidth.bindEvent()
palette.bindEvent()
tools.bindEvent()

selector("#symmetry").addEventListener('click', () => {
  console.log(233)
  ctx.save()
  ctx.translate(canvasWidth, 0)
  ctx.scale(-1, 1)
  let ori = canvas.toDataURL()
  let image = new Image()
  image.onload = function () {
    ctx.drawImage(image, 0, 0)
    ctx.restore()
    ctx.save()
    ctx.translate(0, canvasHeight)
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