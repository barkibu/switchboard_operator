class MessageBrokerAdapter
  def publish(channel, event)
    raise 'Publish message not implemented'
  end

  def subscribe(user, websocket)
    raise 'Subscribe message not implemented'
  end
end