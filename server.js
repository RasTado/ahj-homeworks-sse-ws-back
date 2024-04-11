const http = require("http");
const Koa = require("koa");
const WS = require("ws");
const { koaBody } = require("koa-body");
const User = require("./data/users");

const router = require("./routes");

const app = new Koa();

app.use(
  koaBody({
    urlencoded: true,
    multipart: true,
  })
);

app.use(async (ctx, next) => {
  const origin = ctx.request.get("Origin");
  if (!origin) {
    return await next();
  }

  const headers = { "Access-Control-Allow-Origin": "*" };

  if (ctx.request.method !== "OPTIONS") {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get("Access-Control-Request-Method")) {
    ctx.response.set({
      ...headers,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH",
    });

    if (ctx.request.get("Access-Control-Request-Headers")) {
      ctx.response.set(
        "Access-Control-Allow-Headers",
        ctx.request.get("Access-Control-Request-Headers")
      );
    }

    ctx.response.status = 204;
  }
});

app.use(router());

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());

// WS

const wsServer = new WS.Server({ server });

wsServer.on("connection", (ws) => {
  ws.on("message", (msg) => {
    const message = JSON.parse(msg);

    if (message.type === "addUser") {
      const user = User.getByName(message.user);
      if (!user) {
        const newUser = new User(message.user);
        newUser.save();

        const users = User.getAll();

        [...wsServer.clients]
          .filter((o) => o.readyState === WS.OPEN)
          .forEach((o) =>
            o.send(JSON.stringify({ type: "users", data: users }))
          );

        return;
      }
      ws.send(JSON.stringify({ type: "error" }));
      return;
    } else if (message.type === "addMes") {
      [...wsServer.clients]
        .filter((o) => o.readyState === WS.OPEN)
        .forEach((o) =>
          o.send(JSON.stringify({ type: "addMes", data: message }))
        );
    } else if (message.type === "deleteUser") {
      User.deleteUser(message.user);
      const users = User.getAll();
      [...wsServer.clients]
        .filter((o) => o.readyState === WS.OPEN)
        .forEach((o) => o.send(JSON.stringify({ type: "users", data: users })));
    }
  });
});

server.listen(port);
