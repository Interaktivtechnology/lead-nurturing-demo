var API, addMessage, apiRequest, chatClosed, chatStarted, closeChat, createUser, get, getMessages, messageSent, messagesPolling, newEvent, newMessage, pendingMessages, prechatSubmit, restorePreviousChat, sendMessage, set, setAgent, startChat, unset;

get = function(key) {
  return localStorage.getItem(key);
};

set = function(key, value) {
  return localStorage.setItem(key, value);
};

unset = function(key) {
  return localStorage.removeItem(key);
};


API = {
  url: 'https://api.livechatinc.com/visitors/',
  licence_id: '7155511',
  welcome_message: 'hello ' + get('name') + ', what can I do for you?',
  name : get('name'),
  email : get('email')
};


apiRequest = function(method, url, callback, data) {
  return $.ajax({
    method: method,
    url: url,
    headers: {
      'X-API-Version': 2
    },
    success: callback,
    error: (function(_this) {
      return function(json) {
        console.error('error response:', json);
        clearInterval(window.interval);
        unset('secured_session_id');
        unset('visitor_id');
        return addMessage('Connection lost, chat ended', 'system');
      };
    })(this),
    data: data
  });
};

addMessage = function(message, type) {
  if (type !== 'system') {
    message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  $('#container').append('<div class="message ' + type + '"><span>' + message + '</span></div>');
  return $('#messages').animate({
    scrollTop: $('#container').height() + 75
  }, 'slow');
};

messageSent = function(data) {
  return true;
};

sendMessage = function(event) {
  var data, message, url;
  if (event != null) {
    event.preventDefault();
  }
  message = $('#textbox textarea').val();
  url = API.url + get('visitor_id') + '/chat/send_message';
  data = {
    licence_id: API.licence_id,
    secured_session_id: get('secured_session_id'),
    message: message
  };
  return apiRequest('POST', url, messageSent, data);
};

setAgent = function(info) {
  var ref, ref1, ref2;
  $('#img').html($('<img src="//' + ((ref = info.agent) != null ? ref.avatar : void 0) + '">'));
  $('#name').html((ref1 = info.agent) != null ? ref1.name : void 0);
  $('#title').html((ref2 = info.agent) != null ? ref2.job_title : void 0);
  return $('#intro').hide();
};

newMessage = function(data) {
  return addMessage(data.text, data.user_type);
};

newEvent = function(data) {
  if (data.type === 'agent_details') {
    setAgent(data);
  }
  if (data.message_id) {
    set('last_message_id', data.message_id);
  }
  if (data.type === 'message') {
    return newMessage(data);
  }
};

pendingMessages = function(data) {
  var event, i, len, ref, results;
  ref = data.events;
  results = [];
  for (i = 0, len = ref.length; i < len; i++) {
    event = ref[i];
    results.push(newEvent(event));
  }
  return results;
};

getMessages = function() {
  var data, url;
  url = API.url + get('visitor_id') + '/chat/get_pending_messages';
  data = {
    licence_id: API.licence_id,
    secured_session_id: get('secured_session_id')
  };
  if (get('last_message_id') != null) {
    data.last_message_id = get('last_message_id');
  }
  return apiRequest('GET', url, pendingMessages, data);
};

messagesPolling = function() {
  if (get('secured_session_id') == null) {
    clearInterval(window.interval);
  }
  return window.interval = setInterval((function(_this) {
    return function() {
      return getMessages();
    };
  })(this), 3000);
};

chatClosed = function(json) {
  unset('secured_session_id');
  unset('visitor_id');
  unset('last_message_id');
  $('#chat').hide();
  return addMessage('Chat has ended', 'system');
};

closeChat = function() {
  var data, url;
  clearInterval(window.interval);
  url = API.url + get('visitor_id') + '/chat/close';
  data = {
    licence_id: API.licence_id,
    secured_session_id: get('secured_session_id')
  };
  return apiRequest('POST', url, chatClosed, data);
};

chatStarted = function(data) {
  if (data.banned) {
    bannedInfo();
  }
  if (get('secured_session_id') == null) {
    unset('last_message_id');
  }
  set('secured_session_id', data.secured_session_id);
  $('#textbox').submit(sendMessage).show();
  getMessages();
  return messagesPolling();
};

startChat = function(event) {
  var data, url;
  if (event != null) {
    event.preventDefault();
  }
  url = API.url + get('visitor_id') + '/chat/start';
  data = {
    licence_id: API.licence_id,
    welcome_message: API.welcome_message
  };
  if (get('email') != null) {
    data.email = get('email');
  }
  if (get('name') != null) {
    data.nick = get('name');
  }
  apiRequest('POST', url, chatStarted, data);
  return addMessage(API.welcome_message, 'agent');
};

createUser = function(event) {
  var lang;
  if (event != null) {
    event.preventDefault();
  }
  lang = navigator.language || navigator.userLanguage;
  set('name', $('#prechat #name').val());
  set('email', $('#prechat #email').val());
  set('lang', lang);
  if (!get('visitor_id')) {
    set('visitor_id', (+new Date() + Math.random()) * 1e4);
  }
  return startChat();
};

prechatSubmit = function(event) {

  createUser(event);
  $('#prechat').hide();
  return $('#textbox textarea').focus();
};

restorePreviousChat = function() {
  var data, url;
  $('#prechat').hide();
  url = API.url + get('visitor_id') + '/chat/get_pending_messages';
  data = {
    licence_id: API.licence_id,
    secured_session_id: get('secured_session_id')
  };
  apiRequest('GET', url, pendingMessages, data);
  return chatStarted(data);
};

$(function() {
  
  if (get('secured_session_id') != '') {
    restorePreviousChat();
  }
  else if(get('visitor_id')){
  	startChat();	
  }
  else{
  	$('#prechat').submit(prechatSubmit);
  	if (get('name') != null) {
	    $('#name').val(get('name'));
	  }
	  if (get('email') != null) {
	    $('#email').val(get('email'));
	  }
	  if ($('#prechat')) {
	    $('#prechat #name').focus();
	  }
  }
 
  $('#textbox').keypress((function(_this) {
    return function(event) {
      if (event.which === 13) {
        event.preventDefault();
        if ($('#textbox textarea').val().length) {
          $('#textbox').submit();
        }
        $('#textbox textarea').val('');
        return $('#textbox textarea').focus();
      }
    };
  })(this));
  
  return $('#close').click(closeChat);
});
