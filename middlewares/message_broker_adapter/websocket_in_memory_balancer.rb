require 'rest-client'

class WebsocketInMemoryBalancer 
  def initialize
    @clients = {}
  end

  def client_count
    @clients.count
  end

  def send_to_concierge(session, event)
    p 'SENDING CLIENT REQUEST TO THE CONCIERGE 🐶 => 🤖'
    RestClient.post "http://host.docker.internal:5000/incoming/postback", payload(session, event),  {content_type: :json}
  end

  def payload(session, event)
    parsedEventData = JSON.parse(event.data)
    {Body: parsedEventData['message'], From: session, Payload: parsedEventData['payload']}.to_json
  end

  def add_client_channel(channel, socket)
    @clients[channel] = socket
  end

  def remove_client_channel(channel)
    @clients[channel].close unless @clients[channel].nil?
    @clients = @clients.reject { |k| k == id }
  end

  def send_message(channel, message)
    p 'SENDING CONCIERGE MESSAGE TO THE CLIENT 🤖 => 🐶'
    # FayeWebsocket depends on EventMachine. Without this, the send is actually processed with a significant delay 
    # and reach the user 5 to 10seconds later
    EM.defer do
      @clients[channel].send(message.to_json)
    end
  end
end

  
