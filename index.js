
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const  { Telegraf} = require('telegraf');
const { message } = require('telegraf/filters');
const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();

// const bot = new Telegraf('6020220501:AAE6cU6WA0VoRFofwz8-Eli5jA4anjm-ewE');

const wss = new WebSocket.Server({ 
  server: server,
  perMessageDeflate: false,
 });

wss.on('connection', (ws) => {
    console.log('WebSocket Client Connected');
  
    // Listen for messages from the frontend
    ws.on('message', (message) => {
      try {
      //  console.log(`Received message from frontend: ${JSON.parse(message)}`); 
      console.log("Message from frontend")
      } catch (error) {
        console.error('Error parsing message:', error);
      }
 });
});

bot.use(async (ctx, next) => {
  // console.log({ctx})
  // console.log(ctx?.telegram?.options)
  const callbackQuery = ctx?.callbackQuery;
  console.log({callbackQuery})
  const user = ctx?.message;
  console.log({user})
  console.time(`Processing update ${ctx.update.update_id}`);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      if(user !== undefined) {
      client.send(JSON.stringify({...user, type: "message"}));
    } else {
      client.send(JSON.stringify({...callbackQuery, type: "callbackquery"}))
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

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
});