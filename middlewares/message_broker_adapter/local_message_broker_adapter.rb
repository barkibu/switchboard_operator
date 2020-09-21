require_relative './websocket_in_memory_balancer'

class LocalMessageBrokerAdapter < MessageBrokerAdapter
  def initialize
    @balancer = WebsocketInMemoryBalancer.new
  end

  def publish(channel, event)
    @balancer.send_message(channel, event)
    p 'done publishing'
  end

  def subscribe(user, websocket)
    channel = SecureRandom.hex # TODO: replace this random id with something better!
  
    websocket.on :open do |event|
      p [:open, websocket.object_id]
      @balancer.add_client_channel(channel, websocket)
    end

    websocket.on :message do |event|
      @balancer.send_to_concierge(channel, event)
    end
  
    websocket.on :close do |event|
      p [:close, event.code, event.reason]
      @balancer.remove_client_channel(channel)
    end
  end
end