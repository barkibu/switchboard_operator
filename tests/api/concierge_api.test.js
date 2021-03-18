jest.mock('axios');
const testUrl = 'http://website.com/';
process.env.CONCIERGE_URL = testUrl;

const conciergeApi = require('../../api/concierge_api');
const axios = require('axios');

test('Sends the payload and message passed to the configurated url', async () => {
  axios.post.mockReturnValue(Promise.resolve('Ok thanks'));
  const userId = 'Test User';
  const payload = { foo: 'bar'};
  const text_message = 'My pet is sick!'
  const message = JSON.stringify({message: text_message, payload: payload, other: 'ignored'});
  
  await conciergeApi.sendMessage(userId, message);
  expect(axios.post).toHaveBeenCalledWith(testUrl + '/incoming/postback', {Body: text_message, Payload: payload, From: userId});
});
