class MVVM {
  constructor(el, data) {
    this.el = document.querySelector(el);
    // this._data = data;
    this.dataPool = {};

    this.data = data;
    this.init();
  }
  init() {
    this.initData();
    this.initDom();
  }
  initData() {
    //数据劫持
    const _this = this;
    // this.data = {};

    // for (let key in this._data) {
    //   Object.defineProperty(this.data, key, {
    //     get() {
    //       console.log("获取数据", key, _this._data[key]);
    //       return _this._data[key];
    //     },
    //     set(newValue) {
    //       console.log("设置数据", key, newValue, _this.dataPool);
    //       if (_this.dataPool[key]) {
    //         _this.dataPool[key].map((node) => {
    //           node.innerHTML = newValue;
    //         });
    //       }
    //       _this._data[key] = newValue;
    //     },
    //   });
    // }
    this.data = new Proxy(this.data, {
      get(target, key) {
        return Reflect.get(target, key);
      },
      set(target, key, value) {
        if (_this.dataPool[key]) {
          _this.dataPool[key].map((node) => {
            node.innerHTML = value;
          });
        }
        return Reflect.set(target, key);
      },
    });
  }
  initDom() {
    this.bindDom(this.el);
    this.bindInput(this.el);
  }
  bindInput(el) {
    const allInputs = el.querySelectorAll("input");
    allInputs.forEach((input) => {
      const _vModel = input.getAttribute("v-model");
      if (_vModel) {
        input.value = this.data[_vModel];
        input.addEventListener("keyup", this.handleInput.bind(this, _vModel, input), false);
      }
    });
  }
  handleInput(key, input) {
    const _value = input.value;
    this.data[key] = _value;
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
            if (!this.dataPool[_key]) {
              this.dataPool[_key] = [];
            }
            this.dataPool[_key].push(node.parentNode);
            node.parentNode.innerHTML = this.data[_key];
          }
        }
      }
      node.childNodes && this.bindDom(node);
    });
  }

  setData(key, value) {
    this.data[key] = value;
  }
}
