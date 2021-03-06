import app from './server';

app.listen(5001, 'localhost', function (err, address) {
  if (err) {
    app.log.error(err.message, err);
    process.exit(1);
  }
  app.log.info(`server listening on ${address}!`);
  console.log('🚀 started');
});
