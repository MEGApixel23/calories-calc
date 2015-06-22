function CaloriesCalc() {
    var obj = this,
        eventLoadData = document.createEvent("Event");

    eventLoadData.initEvent('loadData', true, true);

    var eventReady = document.createEvent("Event");
    eventReady.initEvent('calcReady', true, true);

    this.products = [];
    this.consumptions = [];

    obj.preInit = [
        function() {
            $.ajax({
                method: 'GET',
                url: '/products',
                dataType: 'json',
                success: function (res) {
                    obj.products = res;
                    obj.products = obj.getProducts();
                    document.dispatchEvent(eventLoadData);
                }
            });
        }, function() {
            $.ajax({
                method: 'GET',
                url: '/consumptions',
                dataType: 'json',
                success: function (res) {
                    obj.consumptions = res;
                    document.dispatchEvent(eventLoadData);
                }
            });
        }
    ];

    this.init = function() {
        var initFunctionsRuns = 0;

        document.addEventListener('loadData', function() {
            initFunctionsRuns++;

            if (initFunctionsRuns === obj.preInit.length) {
                document.dispatchEvent(eventReady);
            }
        }, false);

        for (var i in obj.preInit) {
            obj.preInit[i]();
        }
    };

    this.getProducts = function() {
        for (var i=0; i<obj.products.length; i++) {
            obj.products[i] = new Product(obj.products[i]);
        }

        return obj.products;
    };

    this.getConsumptions = function() {
        return obj.consumptions;
    };

    this.findProduct = function(search) {
        for (var i=0; i<obj.products.length; i++) {
            if (obj.products[i].id == search || obj.products[i].name == search)
                return obj.products[i];
        }

        return null;
    };

    this.stat = function() {
        var product = {}, consumption = {}, stat = {}, key = '';
        for (var i in obj.consumptions) {
            consumption = obj.consumptions[i];
            product = obj.findProduct(consumption.product_id);
                        
            if (!product)
                continue;

            key = obj.dateKey(consumption.timestamp);

            if (!stat.hasOwnProperty(key))
                stat[key] = {calories: 0.0, consumptions: []};

            consumption.calories = consumption.weight * product.calories / product.weight;
            stat[key].calories += consumption.calories;
            stat[key].consumptions.push(consumption);
        }

        return stat;
    };

    this.dateKey = function(data) {
        var timestamp, date;

        if (data.hasOwnProperty('timestamp'))
            timestamp = data.timestamp;
        else
            timestamp = data;

        timestamp = parseInt(timestamp);

        if (!timestamp)
            throw new Error('No timestamp passed');

        date = new Date(timestamp * 1000);

        return date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
    };

    this.init();

    return this;
}

var calc = new CaloriesCalc();

document.addEventListener('calcReady', function() {
    var stat = calc.stat();

    (function() {
        for (var i in calc.products) {
            var product = calc.products[i],
                $option = $('<option></option>');

            $option.val(product.id);
            $option.text(product.name);

            $('#product-id').append($option);
        }
    })();

    (function() {
        var $container = $('#consumptions-table tbody');

        for (var date in stat) {
            var consumptions = stat[date],
                $headTr = $('<tr></tr>');

            $headTr.addClass('danger');

            $headTr.append([
                $('<td colspan="3"></td>').text(date),
                $('<td colspan="1"></td>').text(consumptions.calories),
            ]);
            $container.append($headTr);

            for (var i in consumptions.consumptions) {
                var consumption = consumptions.consumptions[i],
                    product = calc.findProduct(consumption.product_id),
                    $tr = $('<tr></tr>');

                $tr.attr({'data-id': consumption.id});
                $tr.append([
                    $('<td></td>').text(product.name),
                    $('<td></td>').text(calc.dateKey(consumption.timestamp)),
                    $('<td></td>').text(consumption.weight),
                    $('<td></td>').text(consumption.calories)
                ]);

                $container.append($tr);
            }
        }
    })();

    $('#form-add-consumption').submit(function(e) {
        var $datetime = $('[type=datetime]'),
            val = $datetime.val(),
            date = Date.parse(val);

        $datetime.val(date/1000);
    });

    $('[type=datetime]').datepicker();
}, false);