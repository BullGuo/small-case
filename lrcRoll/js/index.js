/*
 * @Description:
 * @Author: jiangguo
 * @Date: 2023-09-27 22:36:17
 * @LastEditTime: 2023-09-29 19:28:23
 * @LastEditors: jiangguo
 * @FilePath: \small-case\lrcRoll\js\index.js
 */
function parseLrc() {
  const arr = lrc.split("\n").map(item => {
    let [time, text] = item.split("]");
    const [minute, second] = time.replace(/\[/, "").split(":");
    time = +minute * 60 + +second;
    return { time, text };
  });
  return arr;
}

const lrcData = parseLrc();

const doms = {
  audio: document.querySelector("audio"),
  container: document.querySelector(".container"),
  ul: document.querySelector(".container ul")
};

function renderLrc() {
  // 创建新的文档片段保存在内存中 不存在于dom 因此将子元素插入时不会引起reflow
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < lrcData.length; i++) {
    const li = document.createElement("li");
    li.textContent = lrcData[i].text;
    fragment.appendChild(li);
  }
  doms.ul.appendChild(fragment);
}

renderLrc();

function findIndex() {
  const curTime = doms.audio.currentTime;
  for (let i = 0; i < lrcData.length; i++) {
    if (lrcData[i].time > curTime) {
      return i - 1;
    }
  }
  return lrcData.length - 1;
}

function setActive() {
  const index = findIndex();
  const activeLi = document.querySelector(".active");
  if (activeLi) {
    activeLi.classList.remove("active");
  }
  const curLi = doms.ul.children[index];
  if (curLi) {
    curLi.classList.add("active");
  }
}

const liHeight = doms.ul.children[0].offsetHeight;
const containerHeight = doms.container.offsetHeight;
const maxOffset = doms.ul.offsetHeight - containerHeight;

function setOffset() {
  const index = findIndex();
  let offsetValue = liHeight * index - containerHeight / 2 - liHeight / 2;
  if (offsetValue < 0) {
    offsetValue = 0;
  }
  if (offsetValue > maxOffset) {
    offsetValue = maxOffset;
  }
  doms.ul.style.transform = `translateY(-${offsetValue}px)`;
  setActive();
}

doms.audio.addEventListener("timeupdate", setOffset);
