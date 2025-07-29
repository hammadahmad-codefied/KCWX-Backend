const mongoose = require("mongoose");
const fs = require('fs');

const DB_URL = process.env.MONGODB_URI;

// const ca = fs.readFileSync('global-bundle.pem');

// console.log('DB_URL', DB_URL)

const sslOptions = {
    // sslValidate: true,
    // sslCA: ca,
    // tlsCAFile: ca
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000
  };
  
mongoose.set("strictQuery", false);
mongoose.set('bufferTimeoutMS', 30000); // Increase timeout to 30 seconds
const Connect = () => {
    mongoose.connect(
        DB_URL,
        { useNewUrlParser: true, ...sslOptions, },
    ).then((t) => {
        console.log('Connected to MongoDB');
        // Continue with your application logic
      })
      .catch((error) => {
        console.error('Failed to connect to MongoDB:', error);
        throw new Error('Failed to connect to MongoDB');
        // (e) => {
        //     console.log("Connected to database successfully!", e.name);
        // };
      });
};

module.exports = Connect;