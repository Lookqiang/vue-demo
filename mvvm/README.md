简易的实现 v-if v-show @click 数据双向绑定

设计思路

1、对数据重新定义属性 Object.defineProperty() Proxy

2、初始化 dom 对 dom 和 data 进行 关联

    一个 map 来存储 dom 和 data 的关系

    一个 map 来存储 dom 和 绑定事件 的关系

    v-if ：map =》 { dom:{ type:'if' , show:Boolean ,data:和 data 对应的 property } }

    v-show ：map =》 { dom:{ type:'show' , show:Boolean ,data:和 data 对应的 property } }

    @click ：map =》 { dom: event function}

3、初始化视图

4、dom 绑定事件

5、更新视图和数据
