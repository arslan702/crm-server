const  { Telegraf} = require('telegraf');
const { message } = require('telegraf/filters');
const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();

const bot = new Telegraf('6297816480:AAHRovrvmvSfmq-18CoMVBcyP12eF6pYDdo');

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('WebSocket Client Connected');
  
    // Listen for messages from the frontend
    ws.on('message', (message) => {
      console.log(`Received message from frontend: ${JSON.parse(message)}`);
 });
});

bot.use(async (ctx, next) => {
  const user = ctx?.message;
  console.log({user})
  console.time(`Processing update ${ctx.update.update_id}`);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      if(user !== undefined) {
      client.send(JSON.stringify(user));
    }
    }
  });
  await next() // runs next middleware
  // runs after next middleware finishes
  console.timeEnd(`Processing update ${ctx.update.update_id}`);
})

// bot.on(message('text'), (ctx) => ctx.reply('Hello World'));
bot.launch();
// Enable graceful stop
process.once('SIGINT', () => {
    bot.stop('SIGINT');
    wss.close();
  });
  
  process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
    wss.close();
  });

const port = 8000;
server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
});