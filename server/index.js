
const fastify = require('fastify')()
const Random = require('random-js');
const ws = require('fastify-ws');

const mt = Random.engines.mt19937();
mt.autoSeed()
const rand = (min, max) => Random.integer(min, max)(mt);

fastify.register(ws, {
  library: 'uws' 
})

const clients = [];

const sendMessage = (socket, data) => {
  socket.send(JSON.stringify(data))
}

const sendToChat = (clientId, data) => {
  const msg = JSON.parse(data);
  clients.forEach(client => {
    if (clientId == client.id) return;
    sendMessage(client.socket, {
      text: msg.text,
      userId: clientId,
      type: 'message'
    })
  })
}

fastify.ready(err => {
  if (err) throw err

  fastify.ws
    .on('connection', socket => {
      const id = rand(0, 10000);
      const client = {
      	id,
      	socket
      }
      sendMessage(socket, {
        id,
        type: 'login'
      })
      clients.push(client)
      socket.on('message', msg => sendToChat(client.id, msg))
      socket.on('close', () => {
        const index = clients.findIndex(cl => client.id == cl.id);
        clients.splice(index, 1);
      });
    })
})

fastify.listen(34567)