require 'irb'
require 'json'

class Controller
  def call(env)
    @request = Rack::Request.new(env)

    case @request.path
      when '/products'
        render_json(get_resource 'products')
      when '/product/add'
        add_resource 'product', @request.params
        render_json(get_resource 'products')
      when '/consumptions'
        render_json(get_resource 'consumptions')
      when '/consumption/add'
        add_resource 'consumption', @request.params
        render_json(get_resource 'consumptions')
      else
        render 'index'
    end
  end

  def get_resource(item_name)
    path = File.expand_path("../storage/#{item_name}.json", __FILE__)
    JSON.parse(File.read path)
  end

  def add_resource type, params = []
    if type === 'product'
      products = get_resource 'products'

      product = Hash.new
      product[:id] = (products.last['id'] ? products.last['id'] : 0) + 1

      params.each do |key, val|
        product[key] = val.encode
      end

      products << product
      save_resource 'products', products
    elsif 'consumption'
      consumptions = get_resource 'consumptions'

      consumption = Hash.new
      consumption[:id] = (consumptions.last['id'] ? consumptions.last['id'] : 0) + 1

      params.each do |key, val|
        consumption[key] = val.encode
      end

      consumptions << consumption
      save_resource 'consumptions', consumptions
    end
  end

  def save_resource(type, data)
    path = File.expand_path("../storage/#{type}.json", __FILE__)
    File.write(path, data.to_json)
  end

  def render(template)
    path = File.expand_path("../templates/#{template}.html.erb", __FILE__)
    result = ERB.new(File.read(path)).result(binding)

    Rack::Response.new(result)
  end

  def render_json(data)
    Rack::Response.new(data.to_json, 200, {'Content-Type' => 'application/json'})
  end
end