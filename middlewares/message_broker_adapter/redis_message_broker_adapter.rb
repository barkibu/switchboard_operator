require 'redis'

require_relative './websocket_in_memory_balancer'

class RedisMessageBrokerAdapter < MessageBrokerAdapter
  CHANNEL_PREFIX = 'bot-session'

  def initialize
    @balancer = WebsocketInMemoryBalancer.new
    uri      = URI.parse(ENV["REDISCLOUD_URL"])
    @redis   = Redis.new(host: uri.host, port: uri.port, password: uri.password)

    Thread.new do
      redis_sub = Redis.new(host: uri.host, port: uri.port, password: uri.password)
      redis_sub.psubscribe("#{CHANNEL_PREFIX}:*") do |on|
        on.pmessage do |pattern, channel, msg|
          p "Channel #{channel} Received message: #{msg}"
          @balancer.send_message channel, JSON.parse(msg)
        rescue
          p "Could not parse the message : #{message}"
        end
      end
    end
  end

  def publish(session, event)
    @redis.publish(channel_name(session), event.to_json)
  end

  def subscribe(user, websocket)
    session = SecureRandom.hex # TODO: replace this random id with something better!
  
    websocket.on :open do |event|
      p [:open, websocket.object_id]
      @balancer.add_client_channel(channel_name(session), websocket)
    end

    websocket.on :message do |event|
      @balancer.send_to_concierge(session, event)
    end
  
    websocket.on :close do |event|
      p [:close, event.code, event.reason]
      @balancer.remove_client_channel(channel_name(session))
    end
  end

  private

  def channel_name(session)
    "#{CHANNEL_PREFIX}:#{session}"
  end
end