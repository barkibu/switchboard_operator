require 'sinatra/base'

require './middlewares/operator'

module SwitchBoard
  class App < Sinatra::Base
    enable :dump_errors
    get "/" do
      erb :"index.html"
    end
  end
end