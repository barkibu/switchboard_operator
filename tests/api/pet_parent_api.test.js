const redis = require("redis");

monkeyPatchRedis(redis);

const REDIS_URL_TEST = "redis://fake_redis_host.com";
process.env.REDISCLOUD_URL = REDIS_URL_TEST;

const petParentApi = require("../../api/pet_parent_api");

var mockClient;

beforeEach(() => {
  mockClient = { publish: jest.fn(), subscribe: jest.fn(), on: jest.fn() };
  redis.createClient.mockReturnValue(mockClient);
});

test(".publishMessageToBroker publish onto the Redis Channel", () => {
  const params =
    "My Stringified event to send to the pet parent but first needs to go to redis!";
  petParentApi.publishMessageToBroker(params);

  expect(redis.createClient).toHaveBeenCalledWith(REDIS_URL_TEST);
  expect(mockClient.publish).toHaveBeenCalledWith("bot-message", params);
});

test(".setupBrokerListener listen to `message`", () => {
  petParentApi.setupBrokerListener(new Map());
  expect(mockClient.on).toHaveBeenCalledWith("message", expect.anything());
});
test(".setupBrokerListener listen to `end`", () => {
  petParentApi.setupBrokerListener(new Map());
  expect(mockClient.on).toHaveBeenCalledWith("end", expect.anything());
});
test(".setupBrokerListener listen to `end`", () => {
  petParentApi.setupBrokerListener(new Map());
  expect(mockClient.subscribe).toHaveBeenCalledWith("bot-message");
});

test("WWhen end is triggered, the subscription is re-called", () => {
  var onEndListener;
  mockClient.on.mockImplementation((event, listener) => {
    switch (event) {
      case "end": {
        onEndListener = listener;
        break;
      }
    }
  });
  petParentApi.setupBrokerListener(new Map());

  expect(onEndListener).not.toBeNull();
  onEndListener();
  expect(mockClient.subscribe.mock.calls.length).toBe(2);
});

test("When message is triggered, send is called", () => {
  const map = new Map();
  const mockWS = { send: jest.fn() };
  const userId = "bob";
  map.set(userId, mockWS);
  const message = JSON.stringify({ to: userId, foo: "bar", some: "other Attribute" });
  var onMessageListener;
  mockClient.on.mockImplementation((event, listener) => {
    switch (event) {
      case "message": {
        onMessageListener = listener;
        break;
      }
    }
  });
  petParentApi.setupBrokerListener(map);

  expect(onMessageListener).not.toBeNull();
  onMessageListener("bot-message", message);
  expect(mockWS.send).toHaveBeenCalledWith(message);
});

function monkeyPatchRedis(redis) {
  redis.createClient = jest.fn().mockReturnValue({
    on: jest.fn(),
    quit: jest.fn(),
    get: jest.fn(),
  });
}
