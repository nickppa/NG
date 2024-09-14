module.exports = {
    name: 'OrderDetail',
    display: 'OrderDetail',
    type: 'edit',
    dtype: 'int',
    inputs: [
        {
            name: 'ccc',
            display: 'Name1',
            ref: 'order-manage/test.js',
            rules:[{type: 'required', message: 'Must required'},{type: 'email', message: 'Must be email format'}]
        }
    ]
};