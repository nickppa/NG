# NG

## Ideas
This code generater system has three parts: data model, template and the connector, the user can define his own data model, rules, and create the custom template by following these rules. I think the best template is the user's own template, because he knows his requirement best.
At last, the user can use connector to connect the data model and template together to generate the code.

## The template
### Grammar
This is like razor, I've read the source code of vash(https://github.com/kirbysayshi/vash), its focus is generate html file, so it will the format of the template, but for the code generater, I will focus on the code format, so I redesigned a new template engine, use the lexer code from jade, like vash did.
1. The output code, means it will generate out the text, use```@(<code>)```
    For example: ```@(model.name)```
2. The logical code block, use```@{<code>}```
    For example:
    ```
    @{
        let pName = ng.toPascalCase(name);
    }
    ```
3. The inline text, use```@:<text>\n```, the output text will not end with ```\n```
4. The text block, use```@:{<text>@:}```
5. Escaping, use```@@```instead of ```@```
6. Truncation, ```@!```, if you want tot output an inline text```{xxx}```, you will use```@:{xxx}```, but```@:{```means the begining of the logical code block, so you can add truncation, like this:```@:@!{xxx}```to output ```{xxx}```

more examples
the __for__ template:
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

### The layout
Not implement master page currently, because I don't think it will help mush.

#### Sub-Template
The sub template use```ng.include(<sub-template's file path>, <model>)```

#### Place holder
The place holder will generate the text at the last moment, it will be replaced when the whole template is finishing its generation.
1. Use ```@[<placeHolderName>]``` to set the place holder
2. Use ```@[<placeHolderName>(,<tag>)]{<code>}```to define the content of the place holder
##### The tag inside the place holder
If you didn't use the ```tag``` in the place holder, it will append the text to the place holder.
For example, if exists ```@[p]``` in the template
and we defined its content at two place of the template:
```
@[p]{
@:paragraph1
}
@[p]{
@:paragraph2
}
```
At last we will get the text ```paragraph1paragraph2``` at the position of the ```@[p]```
If we use the tag in place holder, the same tag will only append once
for example:
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
We will get the text ```paragraph1paragraph3``` at the ```@[p]``` finally, the 2nd one will be ignored.

#### Wrap & indent
We can add space to the ```ng.include``` and ```@[<placeHolderName>]```to switch the mode, see the details as below：
##### ```ng.include```
For example:
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
The code ```ng.include(' for'``` added a space at the front of the "sub-template file path", so the output will be：
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
If we remove the space：
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
The result will be:
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
That means if we added a space at the front of the sub-template's file path, when wrap, the indent will set to the line's space part;
If not so, when wrapped, the indent will set to the text part.
##### ```@[<placeHolderName>]```
The place holder will follow this rule
For example:
The place holder
```
import {
    Form@[ antd]
} from 'antd';
```
The define of the place holder
```
@[antd,input]{@:{,
Input@:}}
```
if has space, it will output
```
import {
    Form,
    Input
} from 'antd';
```
if removed the space
```
import {
    Form@[antd]
} from 'antd';
```
The result will be like this
```
import {
    Form,
        Input
} from 'antd';
```

## The model
Feel free to define the custom js data model, also the rules.
### The build-in properties
#### The data model
| Name | Type | Description |
| --- | --- | --- |
| _path | ```string``` | the path of the file |
| _fileName | ```string``` | the name of the file without extension |
| _fullFileName | ```string``` | the name of the file with extension |
| _dirPaths | ```string[]``` | the string array of the folder path, relative to the data model's directory |
| _name | ```string``` | the class name |
#### The fields of the data model
for the object type
_ref: if you defined ```ref: '<filePath>'```(The ```<filePath>``` here is a relative path to the data model's directory), the _ref property will point to the specific data model
```
module.exports = {
    ccc: {
        display: 'Name1',
        ref: 'order-manage/test.js',
        rules:[{type: 'required', message: 'Must required'},{type: 'email', message: 'Must be email format'}]
    }
};
```

## Configuration(including the connector)
| Name | Type | Description |
| --- | --- | --- |
| root | string | the root directory, if it is empty, it will use ```process.cwd()``` to be the root directory |
| outputDir | string | the output directory |
| deleteOutput | bool | whether to clean the folder before generate the code |
| modelsDir | string | the directory of the data model, the system will walk through all the files under the directory, including the sub directory |
| templateDir | string | the template directory |
| helper | object | the user can define his own function, in the template we can use ```ng.myFunction``` to call the function here |
| customModelProp | function | the input parameter is the data model object, the user can change the model here |
| customFieldProp | function | the input parameter is the data model object's field, the user can modify the field here |
| global | object | the global variable, user can use it in the template, for example: ```global.appName``` |
| mapping | function | __connector__, the input parameter is the data model object, the user need to return an object array to deine the data model and the output path |
### The data structure of the connector's returned object
| Name | Type | Description |
| --- | --- | --- |
| scope | string | ng's scope |
| seq | number | the generate sequence of the template, if the number is lower, it will be generated earlier |
| model | object | the data model object |
| template | string | the path of the template, relative to the template directory of the configuration |
| output | string | the path of the output file, relative to the output directory of the configuration |
| noRender | bool | if this is set to true, it will not render the template, but only copy the file to output position |

The __scope__ supported the tree mode which is splited by ```.```, for example, ```root``` can contains ```root.module1``` and ```root.module1.module1_1```, if you defined ```@[p]{<code>}``` in the template of the scope```root.module1```, then in the template of the scope```root``` can use the content for the place holder ```@[p]```.