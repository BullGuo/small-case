const colorPicker = document.querySelector("input");
const cvs = document.querySelector("canvas");
const ctx = cvs.getContext("2d");

function initCanvas() {
  const w = 500,
    h = 300;
  cvs.width = w * devicePixelRatio;
  cvs.height = h * devicePixelRatio;
  cvs.style.width = w + "px";
  cvs.style.height = h + "px";
}

initCanvas();

const shapes = [];

class Rectangle {
  constructor(color, startX, startY) {
    this.color = color;
    this.startX = startX;
    this.startY = startY;
    this.endX = startX;
    this.endY = startY;
  }

  get minX() {
    return Math.min(this.startX, this.endX);
  }

  get maxX() {
    return Math.max(this.startX, this.endX);
  }

  get minY() {
    return Math.min(this.startY, this.endY);
  }

  get maxY() {
    return Math.max(this.startY, this.endY);
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3 * devicePixelRatio;
    ctx.lineCap = "square";
    const x = this.minX * devicePixelRatio;
    const y = this.minY * devicePixelRatio;
    const width = (this.maxX - this.minX) * devicePixelRatio;
    const height = (this.maxY - this.minY) * devicePixelRatio;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
  }
}

function getShape(x, y) {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    if (
      x >= shape.minX &&
      x <= shape.maxX &&
      y >= shape.minY &&
      y <= shape.maxY
    ) {
      return shape;
    }
  }
  return undefined;
}

cvs.onmousedown = e => {
  const bouding = cvs.getBoundingClientRect();
  const shape = getShape(e.offsetX, e.offsetY);
  if (shape) {
    const { startX, startY, endX, endY } = shape;
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    window.onmousemove = e => {
      const disX = e.clientX - bouding.left - mouseX;
      const disY = e.clientY - bouding.top - mouseY;
      shape.startX = startX + disX;
      shape.startY = startY + disY;
      shape.endX = endX + disX;
      shape.endY = endY + disY;
    };
  } else {
    const rect = new Rectangle(colorPicker.value, e.offsetX, e.offsetY);
    shapes.push(rect);
    window.onmousemove = e => {
      rect.endX = e.clientX - bouding.left;
      rect.endY = e.clientY - bouding.top;
    };
  }
  window.onmouseup = () => {
    window.onmousemove = null;
    window.onmouseup = null;
  };
};

function draw() {
  requestAnimationFrame(draw);
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  shapes.forEach(shape => shape.draw());
}
draw();
