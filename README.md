# SwitchBoard Operator

## Motivation
Acts as a kind of Concierge balancer/proxy, taking care of maintaining the websocket connection with the clients and communicates securely with the concierge.

## Architecture

The work is leveraged by the Operator middleware, intercepting websocket handshakes and returning a Faye::Websocket connection, keeping a dictionary of opened connection to allow dispatching on the right one when receiving a HTTP signed message from the Concierge.

## Scaling Issues

The connection between the concierge and the client (app / widget) is done through a websocket connection which comes with its limitations.

Theoretically, a server can admit up to 65,536 websocket connections, though Heroku’s limit ranges between 1,500 to 6,000. 
If we opt for 2 dynos to double our potential reach, we are not sure that the request coming from the Concierge will actually reach the dyno where the client is connected, hence the need of a message broker.

The quick solution to this is to use redis pubsub and actually push the message to redis, all dynos listening to the redis to pass through the message down to the client.
In the main lines:
- One bot session = One Redis Channel
- Each Dynos listen to all channels in a specific thread
- When an event is pushed onto a channel, the dyno looks for its in-memory dictionary and pushes to the websocket client if part of its dictionary.
