import('node-fetch')
  .then((fetch) => {
    global.fetch = fetch.default || fetch
  })
  .catch((err) => console.log(err))
