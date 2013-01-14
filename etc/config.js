module.exports = {
  mongo:{
    dbName:process.env.MONGO_DB,
    port:process.env.MONGO_PORT,
    host:process.env.MONGO_HOST,
    user:process.env.MONGO_USERNAME,
    password:process.env.MONGO_PASSWORD
  },
  redis:{
    url:'redis://redistogo:e178a863c9c44954821e7bb50c317c2b@grouper.redistogo.com:9135/'
  },
  email:{
    server:{
      user:'bronsteinomatic@gmail.com',
      password:process.env.EMAIL_PASSWORD,
      host:'smtp.gmail.com',
      domain:'cloudezero.net',
      ssl:true},
    from:'J.P. Bronstein <bronsteinomatic@gmail.com>'
  }
};