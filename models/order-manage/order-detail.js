let props = require('../props');
let dtype = require('../dtype');

@props({display: 'OrderDetail', type: 'edit'})
class OrderDetail{
    @dtype('int')
    ccc = {
        display: 'Name1',
        ref: 'order-manage/test.js',
        rules:[{type: 'required', message: 'Must required'},{type: 'email', message: 'Must be email format'}]
    }
}

module.exports = OrderDetail;