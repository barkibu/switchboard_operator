require 'sinatra/base'

require './middlewares/operator'

module SwitchBoard
  class App < Sinatra::Base
    get '/' do
      erb :"index.html"
    end
  end
end
