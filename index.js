
// process.on('unhandledRejection', (reason, promise) => {
//   console.error('Unhandled Rejection at:', promise, 'reason:', reason);
// });

// const  { Telegraf} = require('telegraf');
// const { message } = require('telegraf/filters');
// const WebSocket = require('ws');
// const http = require('http');

// const server = http.createServer();

// const bot = new Telegraf('6297816480:AAHRovrvmvSfmq-18CoMVBcyP12eF6pYDdo');

// const wss = new WebSocket.Server({ 
//   server: server,
//   perMessageDeflate: false,
//  });

// wss.on('connection', (ws) => {
//     console.log('WebSocket Client Connected');

//     const pingInterval = setInterval(() => {
//       if (ws.readyState === WebSocket.OPEN) {
//         ws.ping();
//       } else {
//         clearInterval(pingInterval);
//       }
//     }, 3000);
  
//     ws.on('pong', () => {
//       console.log('Received Pong');
//     });
  
//     // Listen for messages from the frontend
// //     ws.on('message', (message) => {
// //       try {
// //        console.log(`Received message from frontend: ${JSON.parse(message)}`); 
// //       } catch (error) {
// //         console.error('Error parsing message:', error);
// //       }
// //  });
// });

// bot.use(async (ctx, next) => {
//   const user = ctx?.message;
//   console.log({user})
//   console.time(`Processing update ${ctx.update.update_id}`);
//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       if(user !== undefined) {
//       client.send(JSON.stringify(user));
//     }
//     }
//   });
//   await next() // runs next middleware
//   // runs after next middleware finishes
//   console.timeEnd(`Processing update ${ctx.update.update_id}`);
// })

// // bot.on(message('text'), (ctx) => ctx.reply('Hello World'));
// bot.launch();
// // Enable graceful stop
// process.once('SIGINT', () => {
//     bot.stop('SIGINT');
//     wss.close();
//   });
  
//   process.once('SIGTERM', () => {
//     bot.stop('SIGTERM');
//     wss.close();
//   });

// const port = process.env.PORT || 8080;
// server.listen(port, () => {
//   console.log(`WebSocket server is running on port ${port}`);
// });

const  { Telegraf} = require('telegraf');
const { message } = require('telegraf/filters');
const {WebSocketServer ,WebSocket} = require('ws');
const http = require('http');
const express = require('express')

const bot = new Telegraf('6297816480:AAHRovrvmvSfmq-18CoMVBcyP12eF6pYDdo');

const app = express();
const port = process.env.PORT || 8080;

function onSocketPreError(error) {
    console.log(error);
}

function onSocketPostError(error) {
    console.log(error);
}


console.log(`Attempting to run server on port ${port}`);

const s = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

const wss = new WebSocketServer({ noServer: true });

s.on('upgrade', (req, socket, head) => {
    socket.on('error', onSocketPreError);

    // perform auth
    if (!!req.headers['BadAuth']) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
        socket.removeListener('error', onSocketPreError);
        wss.emit('connection', ws, req);
    });
});

wss.on('connection', (ws, req) => {
  console.log("connected")
    ws.on('error', onSocketPostError);

    ws.on('message', (msg, isBinary) => {
      bot.use(async (ctx, next) => {
        const user = ctx?.message;
        console.log({user})
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              if(user !== undefined) {
                client.send(JSON.stringify(user));
              }
            }
        });
        await next();
      })
    });

    ws.on('close', () => {
        console.log('Connection closed');
    });
});