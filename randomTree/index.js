/*
 * @Description:
 * @Author: jiangguo
 * @Date: 2024-01-09 15:41:44
 * @LastEditTime: 2024-01-09 23:01:36
 * @LastEditors: jiangguo
 * @FilePath: \small-case\tree\index.js
 */
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const WIDTH = 500;
const HEIGHT = 500;

function initCanvas() {
  canvas.width = WIDTH * devicePixelRatio;
  canvas.height = HEIGHT * devicePixelRatio;
  canvas.style.width = WIDTH + "px";
  canvas.style.height = HEIGHT + "px";
}

initCanvas();

function getEndPoint(point, length, angle) {
  return {
    x: point.x + Math.cos(angle) * length,
    y: point.y + Math.sin(angle) * length
  };
}

let pendingTasks = [];

function draw(start, angle, length, deep) {
  const end = getEndPoint(start, length, angle);
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.strokeStyle = "#fff";
  ctx.stroke();
  if (deep >= 0 || Math.random() < 0.5) {
    pendingTasks.push(() => {
      draw(
        end,
        angle - Math.random() * 0.2,
        length + (Math.random() * 2 - 1),
        deep - 1
      );
    });
  }
  if (deep >= 0 || Math.random() < 0.5) {
    pendingTasks.push(() => {
      draw(
        end,
        angle + Math.random() * 0.2,
        length + (Math.random() * 2 - 1),
        deep - 1
      );
    });
  }
}

function frame() {
  const tasks = [];
  pendingTasks = pendingTasks.filter(i => {
    if (Math.random() > 0.5) {
      tasks.push(i);
      return false;
    }
    return true;
  });
  tasks.forEach(fn => fn());
}

let framesCount = 0;
function startFrame() {
  requestAnimationFrame(() => {
    framesCount += 1;
    if (framesCount % 2 === 0) frame();
    startFrame();
  });
}

startFrame();

draw({ x: WIDTH / 2, y: HEIGHT }, -Math.PI / 2, 10, 3);
