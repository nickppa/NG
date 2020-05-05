# NG

## 理念
系统的使用分为三部分，模型、模板和连接器，用户可自由定义自己的模型，规则，和按照这个规则，来自己定义代码模板，通过连接器将模型和模板进行连接，并指定生成文件的路径。

## 模板
### 语法
类似于razor语法，参考了vash，针对于代码生成，会比较在意代码缩进换行的格式，因此自定义了一套模板的语法，用了jade中用到的词法分析器
1. 输出型代码，使用```@(<code>)```
    例：```@(model.name)```
2. 逻辑代码块，使用```@{<code>}```
    例：
    ```
    @{
        let pName = ng.toPascalCase(name);
    }
    ```
3. 行内文本，使用```@:<text>\n```，输出的文本不会在末位加上换行符
4. 文本块，使用```@:{<text>@:}```
5. 转义，使用```@@```，代表@
6. 截断符, ```@!```，如需要以单行文本形式输出{xxx}，会使用```@:{xxx}```,但```@:{```与逻辑代码块的标识冲突了，可以加入截断符```@:@!{xxx}```来输出{xxx}
更多的例子

for循环的模板：
```
@{
    if(model && model.arr && model.arr.length){
        for(let i in model.arr){
            let item = model.arr[i];
            let split = i == 0 ? '' : (model.split || '');
@(split)@(ng.include(model.template, item))
        }
    }
}
```

### 布局
暂时没有加入母版的概念，因为还不需要

#### 子模板
子模板使用```ng.include(<子模板filePath>, <model>)```

#### 占位符
占位符会延迟输出，等到整个template生成完以后才会将内容替换。
1. 使用```@[<placeHolderName>]```来放置占位符
2. 使用```@[<placeHolderName>(,<tag>)]{<code>}```来定义占位符中的内容
##### 占位符中tag的作用
一般定义占位符内容时，如果没有指定tag，默认就会将内容添加到占位符中
例如存在```@[p]```
在模板的两个位置定义了这个占位符的内容
```
@[p]{
@:paragraph1
}
@[p]{
@:paragraph2
}
```
那么最终在```@[p]```的位置，输出的文本会是```paragraph1paragraph2```
如果加入了tag，相同tag的只会添加一次
```
@[p,tag1]{
@:paragraph1
}
@[p,tag1]{
@:paragraph2
}
@[p,tag2]{
@:paragraph3
}
```
那么最终在```@[p]```的位置，输出的文本会是```paragraph1paragraph3```，第二段定义会被忽略

#### 换行缩进
可以在```ng.include```和```@[<placeHolderName>]```中加入空格进行换行缩进的模式切换，具体如下：
##### ```ng.include```
例子：
```
<Form.Item label="@(model.display)" {...formItemLayout}>
    {getFieldDecorator('@(model.name)', {
        rules: [@(ng.include(' for', {arr: model.rules, template: 'frontend/create/rule', split: ',\n'}))]
    })(
        <Input @(model.isPassword ? ' type="password"' : '')
            placeholder="@(model.display)"
        />
    )}
</Form.Item>
```
其中```ng.include(' for'```代码中在"子模板filePath"前面加入了空格，那么输出时会是这种效果：
```
<Form.Item label="Name1" {...formItemLayout}>
    {getFieldDecorator('ccc', {
        rules: [{required: true, message: 'Must required'},
        {validator: this.emailValidate, message: 'Must be email format'}]
    })(
        <Input 
            placeholder="Name1"
        />
    )}
</Form.Item>
```
如果去掉空格：
```
<Form.Item label="@(model.display)" {...formItemLayout}>
    {getFieldDecorator('@(model.name)', {
        rules: [@(ng.include('for', {arr: model.rules, template: 'frontend/create/rule', split: ',\n'}))]
    })(
        <Input @(model.isPassword ? ' type="password"' : '')
            placeholder="@(model.display)"
        />
    )}
</Form.Item>
```
结果会是
```
<Form.Item label="Name1" {...formItemLayout}>
    {getFieldDecorator('ccc', {
        rules: [{required: true, message: 'Must required'},
                {validator: this.emailValidate, message: 'Must be email format'}]
    })(
        <Input 
            placeholder="Name1"
        />
    )}
</Form.Item>
```
也就是如果前面加了空格，那换行时的缩进就只会对齐到该行的空格部分；
如果不加空格，换行时缩进就会对齐到文字部分
##### ```@[<placeHolderName>]```
占位符也遵循同样的规则
例子：
占位符：
```
import {
    Form@[ antd]
} from 'antd';
```
占位符的内容定义：
```
@[antd,input]{@:{,
Input@:}}
```
带空格时，输出：
```
import {
    Form,
    Input
} from 'antd';
```
如果去掉空格
```
import {
    Form@[antd]
} from 'antd';
```
结果会是
```
import {
    Form,
        Input
} from 'antd';
```

## 配置文件（连接器）
