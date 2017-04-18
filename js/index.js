/**
 * Created by Ganother on 2017/4/5.
 */
  function selector (select, Aparent) {
  let parent = Aparent || document
  let realSelector
  if (select.indexOf('#') != -1) {
    realSelector = select.slice(1)
    return parent.getElementById(realSelector)
  } else if (select.indexOf('.') != -1) {
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
  let position = {
    x: (x - canvasOffset.left) * (canvasWidth / canvasOffset.width),
    y: (y - canvasOffset.top) * (canvasHeight / canvasOffset.height)
  }
  return position
}

function getTouchPosition(e){
  let touch = e.changedTouches[0]
  let loc = windowToCanvas(touch.clientX, touch.clientY)
  return loc
}

let thisTool
class Pencil {
  constructor (width) {
    this.width = width
    this.color = "#000"
    this.drawing = false
    this.isSelect = false
    this.name = 'pencil'
    this.dom = document.getElementById(this.name)
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
    this.dom = document.getElementById(this.name)
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
    this.name = 'rect'
    this.dom = document.getElementById(this.name)
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

class Tool {
  constructor () {
    this.pencil = new Pencil(2)
    this.line = new Line(2)
    this.rect = new Rect(2)
    let allTools = [this.pencil, this.line, this.rect]
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
      if (name == 'round') {
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

      } else {
        palette.entrance.style.color = this[name].color
      }
    })
    this.pencil.bindEvent()
    this.line.bindEvent()
    this.rect.bindEvent()
  }
}

class Palette {
  constructor () {
    this.dom = document.getElementById("Palette")
    this.entrance = document.getElementById("toPalette")
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
        const color = window.getComputedStyle(target, null).backgroundColor
        this.entrance.style.color = color
        tools[tools.selected].color = color
      }
    })
  }
}
const tools = new Tool()
const palette = new Palette()
palette.bindEvent()
tools.bindEvent()
