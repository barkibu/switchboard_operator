require 'faye/websocket'
require 'api_auth'
require 'json'

require './middlewares/message_broker_adapter'
require './middlewares/concierge_request_checker'

module SwitchBoard
  class Operator
    include ConciergeRequestChecker

    KEEPALIVE_TIME = 15 # in seconds

    def initialize(app)
      @app     = app
      @message_broker_adapter = RedisMessageBrokerAdapter.new
    end

    def call(env)
      if Faye::WebSocket.websocket?(env)       
        create_websocket_connection env
      else
        broadcast env

        [204, {}, {}]
      end
    rescue RequestSignatureError => _
      @app.call(env)
    end

    private
    
    def create_websocket_connection(env)
      ws = Faye::WebSocket.new(env, nil, {ping: KEEPALIVE_TIME })
      # TODO Extract some data to identify the user, 
      #ideally passed as a token from another identity provider party 
      user = nil 
      @message_broker_adapter.subscribe user, ws
      # Return async Rack response
      ws.rack_response
    end

    def broadcast(env)
      signed_request! env
      payload = Rack::Request.new(env).params
      unless payload.empty?
        @message_broker_adapter.publish(payload['to'], payload)
      end
    end
  end
end