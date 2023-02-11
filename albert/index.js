const request = require("request");
const express = require("express");
const cors = require('cors');
const app = express();
const PORT = 4000;
// const CARROT_HOST = 'localhost';
const CARROT_HOST = 'carrot-service.cluster.local';
const CARROT_PORT = 5000;
const PROTOCOL = 'http'

app.use(express.json());
app.use(cors());

const makeRequest = async (options) => {
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) {
              return reject(error);
            }
            resolve({ response, body });
          });
    });
}

const getFromRedis = async (key) => {
    let PATH = 'retrieve';
    const URL = `${PROTOCOL}://${CARROT_HOST}:${CARROT_PORT}/${PATH}`
    console.log("requesting ", URL);

    let options = {
        method: 'GET',
        url: URL,
        qs: { key }
    };
    const { response, body } = await makeRequest(options);
    console.log('Response status code:', response.statusCode);
    console.log('Response body:', body);
    return JSON.parse(body).ans;
}

const setToRedis = async (key, value) => {
    let PATH = 'store';
    const URL = `${PROTOCOL}://${CARROT_HOST}:${CARROT_PORT}/${PATH}`
    console.log("requesting ", URL);

    let options = {
        method: 'POST',
        url: URL,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            key,
            value
        })
    };
    const { response, body } = await makeRequest(options);
    console.log('Response status code:', response.statusCode);
    console.log('Response body:', body);
    return JSON.parse(body).ans;
}

app.post('/add', async (req, res)=>{
    try {
        const {opn1, opn2} = req.body;
        console.log("albert received data ",  opn1, ' + ', opn2);

        const key = opn1+'+'+opn2;
        let ans = await getFromRedis(key);
        if(!ans){
            ans = opn1+opn2;
            console.log("Setting data to redis ", key, ' : ', ans)
            await setToRedis(key, ans);
        }
        console.log("answer: ", ans);
        res.send({"ans": ans});
    } catch(err){
        console.log(err);
        res.send({"ans": null});
    }
});

app.post('/sub', async (req, res)=>{
    try {
        const {opn1, opn2} = req.body;
        console.log("albert received data ",  opn1, ' - ', opn2);
        const key = opn1+'-'+opn2;
        let ans = await getFromRedis(key);
        if(!ans){
            ans = opn1-opn2;
            console.log("Setting data to redis ", key, ' : ', ans)
            await setToRedis(key, ans);
        }
        console.log("answer: ", ans);
        res.send({"ans": ans});
    } catch(err){
        console.log(err);
        res.send({"ans": null});
    }
});


app.listen(
    PORT,
    () => console.log(`Server running at http://localhost:${PORT}`)
)