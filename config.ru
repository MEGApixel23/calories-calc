Encoding::default_internal = Encoding::UTF_8
Encoding::default_external = Encoding::UTF_8

require_relative 'app/controller'
use Rack::Reloader
use Rack::Static, :urls => ['/app', '/vendor', '/css'], :root => 'public'
run Controller.new