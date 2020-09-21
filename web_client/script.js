(function () {
  var websocketServerUrl = document.getElementById("websocket_server_url");
  var messageInput = document.getElementById("message_input");
  var messageForm = document.getElementById("message_form");
  var messageList = document.getElementById("message_list");
  var connectionForm = document.getElementById("connection_form");
  var buttonContainer = document.getElementById("button-container");
  let socket;
  var currentPayload = {};

  sendMessage = (e) => { 
    if (e.preventDefault) e.preventDefault();
    socket.send(JSON.stringify({ message: messageInput.value }));
    addMessageToList(messageInput.value, true);
  }

  addMessageToList = (message, me = false) => {
    let li =document.createElement('li');
    if(me) {
      li.className = 'my-message';
    }
    li.innerHTML = message;
    messageList.appendChild(li);
  }

  sendButtonClicked = (button) => {
    return () => {
      if(button.type == 'payload') {
        socket.send(JSON.stringify({ message: button.text, payload:  button.payload }));
        addMessageToList(button.text, true);
        buttonContainer.innerHTML = '';
      }
    };
  }

  addButtonToChat = (buttons) => {
    buttonContainer.innerHTML = '';
    buttons.forEach(button => {
      const btn = document.createElement("button");
      btn.textContent = button.text;
      btn.addEventListener('click', sendButtonClicked(button));
      buttonContainer.appendChild(btn);
    });
  }

  connectToBot = (e) => {
    if (e.preventDefault) e.preventDefault();

    socket = new WebSocket(
      `ws://${websocketServerUrl.value}`
    );

    socket.onopen = function (e) {
      console.log("[open] Connection established");
      console.log("Sending to server");
      messageForm.addEventListener('submit', sendMessage)
    };

    socket.onmessage = function (event) {
      console.log(`[message] Data received from server: ${event.data}`);
      const parsed = JSON.parse(event.data);
      currentPayload = parsed.payload;
      addMessageToList(parsed.body);
      if(parsed.type == 'button'){
        addButtonToChat(parsed.buttons)
      }
    };

    socket.onclose = function (event) {
      if (event.wasClean) {
        console.log(
          `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
        );
      } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        console.log("[close] Connection died");
      }
      messageForm.removeEventListener('submit', sendMessage)
    };

    socket.onerror = function (error) {
      alert(`[error] ${error.message}`);
    };
  };

  
  connectionForm.addEventListener("submit", connectToBot);
})();
