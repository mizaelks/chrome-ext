console.log("inject inbox js");

window.onload = () => {
  const tabChild = document.querySelector('[tabindex="-1"]');

  if (tabChild) {
    const tabParent = tabChild.parentNode;
    tabParent.parentElement.style.setProperty(
      "--revamp-nav-bottom-toolbar-height",
      "1px"
    );
    tabParent.style.display = "none";
  }
};

class Dep {
  // 订阅池
  constructor() {
    this.id = new Date(); //这里简单的运用时间戳做订阅池的ID
    this.subs = []; //该事件下被订阅对象的集合
  }
  defined() {
    // 添加订阅者
    Dep.watch.add(this);
  }
  notify() {
    //通知订阅者有变化
    this.subs.forEach((e) => {
      if (typeof e.update === "function") {
        try {
          e.update.apply(e); //触发订阅者更新函数
        } catch (err) {
          console.warr(err);
        }
      }
    });
  }
}
Dep.watch = null;

class Watch {
  constructor(name, fn) {
    this.name = name; //订阅消息的名称
    this.id = new Date(); //这里简单的运用时间戳做订阅者的ID
    this.callBack = fn; //订阅消息发送改变时->订阅者执行的回调函数
  }
  add(dep) {
    //将订阅者放入dep订阅池
    dep.subs.push(this);
  }
  update() {
    //将订阅者更新方法
    var cb = this.callBack; //赋值为了不改变函数内调用的this
    cb(this.name);
  }
}

const addHistoryMethod = (function () {
  var historyDep = new Dep();
  return function (name) {
    if (name === "historychange") {
      return function (name, fn) {
        var event = new Watch(name, fn);
        Dep.watch = event;
        historyDep.defined();
        Dep.watch = null; //置空供下一个订阅者使用
      };
    } else if (name === "pushState" || name === "replaceState") {
      var method = history[name];
      return function () {
        method.apply(history, arguments);
        historyDep.notify();
      };
    }
  };
})();

window.addHistoryListener = addHistoryMethod("historychange");
history.pushState = addHistoryMethod("pushState");
history.replaceState = addHistoryMethod("replaceState");

let timer = null;
let isFocus = false;
let oldInputData = "";
window.addHistoryListener("history", function () {
  clearTimeout(timer);
  isFocus = false;
  oldInputData = "";

  const locationHerf = location.href;

  if (locationHerf.startsWith("https://www.instagram.com/direct/t")) {
    timer = setTimeout(() => {
      document
        .querySelector("textarea")
        .addEventListener("focus", function (e) {
          isFocus = true;
        });
      document
        .querySelector("textarea")
        .addEventListener("input", function (e) {
          oldInputData = e.target.value;
          if (oldInputData) {
            setTimeout(() => {
              const btn =
                document.querySelector("textarea")?.parentNode
                  ?.nextElementSibling;
              btn?.removeEventListener("click", pMsg, true);
              btn?.addEventListener("click", pMsg);
            }, 100);
          }
        });
    }, 500);
  }
});

document.onkeydown = function (ev) {
  var event = ev || event;
  // const textarea = document.querySelector('textarea');
  if (event.keyCode == 13 && oldInputData) {
    window.postMessage({
      isAuto: false,
      text: oldInputData,
      type: "aliLog",
      mqttStatus: window?.__mqtt?.$5?.$5,
    });
    oldInputData = "";
  }
};

function pMsg() {
  window.postMessage({
    isAuto: false,
    text: oldInputData,
    type: "aliLog",
    mqttStatus: window?.__mqtt?.$5?.$5,
  });
}
