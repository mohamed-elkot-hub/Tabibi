export default () => ({
  port: parseInt(process.env.PORT as string) || 3000,

  sessionSecret: process.env.SESSION_SECRET,
  database:{
    uri:process.env.MONGO_URI,
  },

  node_env: process.env.NODE_ENV,
});