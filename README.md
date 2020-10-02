# SwitchBoard Operator

## Motivation
Acts as a kind of Concierge balancer/proxy, taking care of maintaining the websocket connection with the clients and communicates securely with the concierge.

## Architecture

Basic NodeJS express server to handle the message coming from the Concierge
Custom Signature check to verify Concierge identity
Websocket library used is https://github.com/websockets/ws.

## Get Started
- Copy the .env.example into .env and set the appropriate values
- docker-compose run --rm switchboard_operator npm install
- docker-compose up -d

🥳 The server is up and running, listening on $SWITCHBOARD_PORT for Web Socket connections and on signed POST request to pass messages through to the web socket connections.

An plain HTML/JS (no css 😅) web client for the bot is available in the [web_client](./web_client/index.html) directory.


## Env Variables
- **SWITCHBOARD_PORT** the port the application will be exposed on
- **SWITCHBOARD_SECRET_KEY** Secret used to encrypt the userId into the client session (web socket connection)
- **CONCIERGE_URL** is the url where the Concierge is expecting messages to be posted (Something like `http://concierge_host/incoming/postback`)
- **CONCIERGE_POSTBACK_SECRET_KEY** The secret generated on the Concierge Instance used to verify the request receives actually come from the Concierge.
- **REDISCLOUD_URL** is the Redis connection URL used in pubsub to allow this project to be scaled on multiple instances.

## Scaling Issues

The connection between the concierge and the client (app / widget) is done through a websocket connection which comes with its limitations.

Theoretically, a server can admit up to 65,536 websocket connections, though Heroku’s limit ranges between 1,500 to 6,000. 
If we opt for 2 dynos to double our potential reach, we are not sure that the request coming from the Concierge will actually reach the dyno where the client is connected, hence the need of a message broker.

The quick solution to this is to use redis pubsub and actually push the message to redis, all dynos listening to the redis to pass through the message down to the client.
In the main lines:
- Each message received from the concierge are pushed on a Redis Channel
- Each Dynos listen to the channel
- When an event is pushed onto a channel, the dyno looks for its in-memory dictionary and pushes to the websocket client if part of its dictionary.

## Idle in AWS

While the websocket is open between the Pet Parent and the nodeJs server, if no message is send during more than 60s the connection will be dropped. This can be configured on AWS side: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/application-load-balancers.html#connection-idle-timeout but to be noted that there are other (infrastructure) parties involved in the dance that might have their own idle timeout values...

The websocket connection upgrade request accepts a session params that will be used as identifier of the pet parent. This way even if the connection drops, idle or the server goes down for a while, the client implementation can recover the session and keep chatting without having to start over.