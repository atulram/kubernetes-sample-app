const redis = require("redis");
const express = require("express");
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

app.use(express.json())
app.use(cors())


let client;

//(async () => {})();

client = redis.createClient({
    host: REDIS_HOST,
    port: REDIS_PORT
  });
  
client.on('connect', () => {
    console.log('Redis client connected');
});

client.on('error', (err) => {
    console.log(`Something went wrong ${err}`);
});

client.connect();
  

/*
const redisRetrieve = async (key) => {
    return new Promise((resolve, reject) => {
        // Get a value from the Redis database
        console.log("reading redis", key);
        client.get(key, (err, result) => {
            if (err) {
                console.log("Error while fetching form redis", err);
                return reject(err);
            }
            console.log("redis result", key);
            return resolve(result);
        });
    });
}

const redisStore = async (key, value) => {
    return new Promise((resolve, reject) => {
        // Set a value in the Redis database
        client.set(key, value, (err, reply) => {
            if (err) {
                console.log("Error while writing to redis", err);
                return reject(err);
            }
            return resolve(reply);
            
        });
    });
}
*/


app.get('/retrieve', async (req, res)=>{
    try {
        const key = req.query.key;
        console.log("carrot retrieve request for key ",  key);
        const ans = await client.get(key);
        console.log("retrieved value ",  ans);
        res.send({"ans": ans});
    } catch(err){
        console.log(err);
        res.send({"ans": null});
    }
});

app.post('/store', async (req, res)=>{
    try {
        const {key, value} = req.body;
        console.log("carrot store request for ",  key, ' : ', value);
        const reply = await client.set(key, JSON.stringify(value))
        console.log("stored data to redis ", reply);
        res.send({"message": 'success'});
    } catch(err){
        console.log(err);
        res.send({"message": err});
    }
});


app.listen(
    PORT,
    () => console.log(`Server running at http://localhost:${PORT}`)
)