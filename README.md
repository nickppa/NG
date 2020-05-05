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

## 模型
可自由定义js模型，各种规则可自由约定。
### 内置
#### 模型本身
| 名字 | 类型 | 说明 |
| --- | --- | --- |
| _path | 字符串 | 文件路径 |
| _fileName | 字符串 | 文件名，不带扩展名 |
| _file | 字符串 | 文件名，带扩展名 |
| _dirPaths | 字符串数组 | 文件夹路径数组，相对于模型根目录 |
| _props.name | 字符串 | 类名 |
#### 模型成员
对于对象类型的成员
_ref: 若定义了```ref: '<filePath>'```（这里的```<filePath>```是相对于配置中的模型文件夹的相对路径），_ref则会指向相应的模型
```
class OrderDetail{
    ccc = {
        display: 'Name1',
        ref: 'order-manage/test.js',
        rules:[{type: 'required', message: 'Must required'},{type: 'email', message: 'Must be email format'}]
    }
}

module.exports = OrderDetail;
```

## 配置文件（包含连接器）
| 名字 | 类型 | 说明 |
| --- | --- | --- |
| root | 字符串 | 根目录，若为空，则会使用process.cwd()作为根目录 |
| outputDir | 字符串 | 输出目录 |
| deleteOutput | 布尔值 | 生成代码时是否清空输出目录 |
| modelsDir | 字符串 | 模型目录，系统会遍历整个模型目录中的模型文件，包括子目录 |
| templateDir | 字符串 | 模版目录 |
| helper | 对象 | 用户可自定义function, 在模版中可使用```ng.自定义function```来调用这里自定义的function |
| customModelProp | function | 输入参数为模型对象，用户可在该function中，对系统生成的模型进行修改，可修改添加属性，当然，使用delete，也可删除属性 |
| customFieldProp | function | 输入参数为模型对象的成员，用户可在该function中，对系统生成的模型中的对象类型的成员进行修改，可修改添加属性 |
| global | 对象 | 全局变量，用户可在模版中直接调用这里定义的全局变量，如global.appName |
| mapping | function | "连接器"，输入参数为模型对象，用户需要返回对象数组，来指定模型，和输出的路径 |
### 返回的模型对象
| 名字 | 类型 | 说明 |
| --- | --- | --- |
| scope | 字符串 | ng的范围 |
| seq | 数字 | 生成的顺序，数字越小，越先生成 |
| model | 对象 | 模型对象 |
| template | 字符串 | 模版路径，相对于配置中模版目录的相对路径 |
| output | 字符串 | 输出路径，相对于配置中输出目录的相对路径 |

scope支持以```.```分隔开的树形模式，例如```root```能包含```root.module1```, ```root.module1.module1_1```，如果你在scope```root.module1```中的模版中有定义```@[p]{<code>}```，那么在scope```root```所定义的模版中就能使用到```@[p]```的内容