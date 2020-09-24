# SwitchBoard Operator

## Motivation
Acts as a kind of Concierge balancer/proxy, taking care of maintaining the websocket connection with the clients and communicates securely with the concierge.

## Architecture

Basic NodeJS express server to handle the message coming from the Concierge
Custom Signature check to verify Concierge identity
Websocket library used is https://github.com/websockets/ws.

## Scaling Issues

The connection between the concierge and the client (app / widget) is done through a websocket connection which comes with its limitations.

Theoretically, a server can admit up to 65,536 websocket connections, though Heroku’s limit ranges between 1,500 to 6,000. 
If we opt for 2 dynos to double our potential reach, we are not sure that the request coming from the Concierge will actually reach the dyno where the client is connected, hence the need of a message broker.

The quick solution to this is to use redis pubsub and actually push the message to redis, all dynos listening to the redis to pass through the message down to the client.
In the main lines:
- Each message received from the concierge are pushed on a Redis Channel
- Each Dynos listen to the channel
- When an event is pushed onto a channel, the dyno looks for its in-memory dictionary and pushes to the websocket client if part of its dictionary.
