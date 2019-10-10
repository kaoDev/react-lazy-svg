import app from './server';

app.listen(5001, '0.0.0.0', function(err, address) {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`server listening on ${address}`);
  console.log('🚀 started');
});
