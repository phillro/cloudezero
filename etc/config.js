module.exports = {
  mongo:{
    dbName:'heroku_app8902478',
    port:41347,
    host:'ds041347.mongolab.com',
    user:'cloudezero',
    password:process.env.MONGO_PASSWORD
  },
  redis:{
    url:'redis://redistogo:e178a863c9c44954821e7bb50c317c2b@grouper.redistogo.com:9135/'
  },
  email:{
    server:{
      user:'bronsteinomatic@gmail.com',
      password:'cloude000',
      host:'smtp.gmail.com',
      domain:'cloudezero.net',
      ssl:true},
    from:'J.P. Bronstein <bronsteinomatic@gmail.com>'
  }
};