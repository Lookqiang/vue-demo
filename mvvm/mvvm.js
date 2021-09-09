class MVVM {
  constructor(config) {
    let { el, data, methods } = config;
    this.el = document.querySelector(el);

    this.data = data;

    this.methods = methods;
    this.dataPool = new Map();
    this.showPool = new Map();
    this.methodsPoll = new Map();
    this.init();
  }
  init() {
    this.initData();
    this.initDom();
    this.bindEvent();
    this.initView();
  }
  initData() {
    //数据劫持
    const _this = this;

    for (let key in this.data) {
      Object.defineProperty(this, key, {
        get() {
          console.log("访问:", key, _this.data[key]);
          return _this.data[key];
        },
        set(newValue) {
          console.log("设置:", key, newValue);
          if (_this.dataPool.get(key)) {
            _this.dataPool.get(key).innerHTML = newValue;
          }
          _this.updateView(key, this.showPool);
          _this.data[key] = newValue;
        },
      });
    }
  }
  initDom() {
    this.bindDom(this.el);
    this.bindInput(this.el);
  }
  updateView(data, showPool) {
    if (!data) {
      for (let [k, v] of showPool) {
        if (v.type === "if") {
          v.comment = document.createComment("v-if");
          !v.show && k.parentNode.replaceChild(v.comment, k);
        }
        if (v.type === "show") {
          !v.show && (k.style.display = "none");
        }
      }
      return;
    }
    for (let [k, v] of showPool) {
      if (data === v.value) {
        if (v.type === "if") {
          v.show ? k.parentNode.replaceChild(v.comment, k) : v.comment.parentNode.replaceChild(k, v.comment);
        }
        if (v.type === "show") {
          k.style.display = v.show ? "none" : "inline-block";
        }
        v.show = !v.show;
      }
    }
  }
  bindInput(el) {
    const allInputs = el.querySelectorAll("input");
    allInputs.forEach((input) => {
      const _vModel = input.getAttribute("v-model");
      if (_vModel) {
        input.value = this[_vModel];
        input.addEventListener("keyup", this.handleInput.bind(this, _vModel, input), false);
      }
    });
  }

  handleInput(key, input) {
    const _value = input.value;
    this[key] = _value;
  }

  bindDom(el) {
    const childNodes = el.childNodes;
    childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        const _value = node.nodeValue;
        if (_value.trim().length) {
          let _isValid = /\{\{(.+?)\}\}/.test(_value);
          if (_isValid) {
            const _key = _value.match(/\{\{(.+?)\}\}/)[1].trim();

            this.dataPool.set(_key, node.parentNode);
            node.parentNode.innerHTML = this[_key];
          }
        }
      }
      if (node.nodeType === 1) {
        const vIf = node.getAttribute("v-if");
        const vShow = node.getAttribute("v-show");
        const vClick = node.getAttribute("@click");
        if (vIf) {
          this.showPool.set(node, {
            type: "if",
            show: this[vIf],
            value: vIf,
          });
        }
        if (vShow) {
          this.showPool.set(node, {
            type: "show",
            show: this[vShow],
            value: vShow,
          });
        }
        if (vClick) {
          this.methodsPoll.set(node, this.methods[vClick]);
        }
      }
      node.childNodes && this.bindDom(node);
    });
  }
  initView() {
    this.updateView(null, this.showPool);
  }
  bindEvent() {
    for (let [k, v] of this.methodsPoll) {
      k.addEventListener("click", v.bind(this), false);
    }
  }
  setData(key, value) {
    this[key] = value;
  }
}
