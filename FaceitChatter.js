const WebSocket = require('ws');
const env = require('dotenv').config();

const PLAIN = (process.env.PLAIN);
const guid = (process.env.BOTGUID);
const chat_id = (process.env.CHATID);


async function startSocket() {
  var ws = new WebSocket('wss://chat-server.faceit.com/websocket');

  ws.on('open', async function open() {
    console.log('connected');
    ws.send("<open xmlns='urn:ietf:params:xml:ns:xmpp-framing' to='faceit.com' version='1.0'/>");
    await sleep(300);
    ws.send("<auth xmlns='urn:ietf:params:xml:ns:xmpp-sasl' mechanism='PLAIN'>" + PLAIN + "</auth>");
    await sleep(300);
    ws.send("<open xmlns='urn:ietf:params:xml:ns:xmpp-framing' to='faceit.com' version='1.0'/>");
    await sleep(300);
    ws.send("<iq type='set' id='_bind_auth_2' xmlns='jabber:client'><bind xmlns='urn:ietf:params:xml:ns:xmpp-bind'><resource>rn_9.26.4_483491080838051</resource></bind></iq>");
    await sleep(300);
    ws.send("<iq type='set' id='_session_auth_2' xmlns='jabber:client'><session xmlns='urn:ietf:params:xml:ns:xmpp-session'/></iq>");
    await sleep(300);
    ws.send("<iq id='" + guid + "@faceit.com-vcard-query' type='get' to='" + guid + "@faceit.com' xmlns='jabber:client'><vCard xmlns='vcard-temp'/></iq>");
    await sleep(300);
    ws.send("<presence  to='" + chat_id + "@conference.faceit.com/" + guid
      + "' xmlns='jabber:client'><x xmlns='http://jabber.org/protocol/muc'><history maxstanzas='0'/></x><unsubscribe><initial_presences /><presence_updates /></unsubscribe><priority>10</priority></presence>");
  });

  ws.on('close', function close() {
    console.log('reconnecting');
    startSocket();
  });

  ws.on('message', function incoming(data) {
    console.log(data);
    if (data.startsWith('<message')) {
      let message = new RegExp(/<message from='(.*?)@conference.faceit.com\/(.*?).*<body>(.*)<\/body>/).exec(data);;
      if (message) {
        console.log(message);
        if (message[3] == '!discord') sendMessage(ws, 'Join our discord server: <discordlink>');
        if (message[3] == '!twitter') sendMessage(ws, 'Follow us on twitter: our twitter page');
        if (message[3] == '!guide') sendMessage(ws, 'Check out our handy starting guide: www.guide.com');
      }
    }
  });
}

function sendMessage(ws, message) {
  ws.send("<message id='1' to='" + chat_id
    + "@conference.faceit.com' type='groupchat' xmlns='jabber:client'><body>" + message
    + "</body></message>")
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

startSocket();

