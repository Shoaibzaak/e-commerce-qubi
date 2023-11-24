

 const google = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //todo: based on env, change url to localhost, dev or prod
    callbackURL: "http://localhost:3000/auth/google/callback"
  };
  module.exports=google

  