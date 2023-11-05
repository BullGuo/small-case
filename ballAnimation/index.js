const ball = document.querySelector(".ball");

function init() {
  const x = window.innerWidth / 2;
  const y = window.innerHeight / 2;
  ball.style.transform = `translate(${x}px, ${y}px)`;
}
init();

function createPointer(left, top) {
  const pointer = document.createElement("div");
  pointer.classList.add("pointer");
  pointer.style.left = `${left}px`;
  pointer.style.top = `${top}px`;
  document.body.appendChild(pointer);
  pointer.addEventListener("animationend", () => {
    pointer.remove();
  });
}

window.addEventListener("click", e => {
  createPointer(e.clientX, e.clientY);
  move(e.clientX, e.clientY);
});

function move(x, y) {
  const bouding = ball.getBoundingClientRect();
  const ballX = bouding.left + bouding.width / 2;
  const ballY = bouding.top + bouding.height / 2;
  ball.getAnimations().forEach(animation => animation.cancel());
  const rad = Math.atan2(y - ballY, x - ballX);
  const deg = (rad * 180) / Math.PI;
  // 不更改dom树与css树 不需要主线程参与
  ball.animate(
    [
      {
        transform: `translate(${ballX}px, ${ballY}px) rotate(${deg}deg)`
      },
      {
        transform: `translate(${ballX}px, ${ballY}px) rotate(${deg}deg) scaleX(1.5)`,
        offset: 0.6
      },
      {
        transform: `translate(${x}px, ${y}px) rotate(${deg}deg) scaleX(1.5)`,
        offset: 0.8
      },
      {
        transform: `translate(${x}px, ${y}px) rotate(${deg}deg)`
      }
    ],
    {
      duration: 500,
      fill: "forwards"
    }
  );
}
