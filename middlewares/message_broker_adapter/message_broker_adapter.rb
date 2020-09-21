class MessageBrokerAdapter
  def publish(_channel, _event)
    raise 'Publish message not implemented'
  end

  def subscribe(_user, _websocket)
    raise 'Subscribe message not implemented'
  end
end
