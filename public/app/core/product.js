function Product(data) {
    var obj = this;

    (function (obj, data) {
        for (var property in data) {
            obj[property] = data[property];
        }
    })(obj, data);

    return this;
}