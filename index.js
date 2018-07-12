
const Koa = require('koa')
const Router = require('koa-router')
const koaBody = require('koa-body')
const Boom = require('boom')

const app = new Koa()
const router = new Router()

function validate (token, delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(token % 2 === 0)
    }, delay)
  })
}

const confDefult = {
  delay: 10,
  key: 123213123,
  dbToken: '23h4239he8392he42983he'
}

function validateMiddleware (conf = confDefult) {
  let confMerge = Object.assign(confDefult, conf)
  return async (ctx, next) => {
    if ('auth' in ctx.request.header) {
      let isValid = await validate(ctx.request.header.auth, confMerge.delay)
      if (isValid) {
        ctx.userID = `valid user: ${ctx.request.header.auth}`
        return next()
      }
    }

    ctx.throw(404, 'Invalid auth')
  }
}

router
  .get('/msg/123', (ctx, next) => {
    ctx.body = {
      msg: 'hola mundo',
      id: 123
    }
  })
  .post('/todo', validateMiddleware({delay: 500}), (ctx, next) => {
    // req: {author: 123, todo: 'comprar leche'}
    ctx.body = {
      id: ctx.userID,
      todo: `el usuario ${ctx.request.body.author}, debe: ${ctx.request.body.todo}`
    }
  })
  .post('/todo2', validateMiddleware({delay: 500}), (ctx, next) => {
    // req: {author: 123, todo: 'comprar leche'}
    console.log(ctx.request.body)
    ctx.body = {
      todo: `222 222222 2 222 `
    }
  })

// app.use(validateMiddleware)

app.use(koaBody())
app.use(router.routes())
app.use(router.allowedMethods({
  throw: true,
  notImplemented: () => new Boom.notImplemented(),
  methodNotAllowed: () => new Boom.methodNotAllowed()
}))

app.listen(3000, () => {
  console.log('Server Run... 🚀')
})
