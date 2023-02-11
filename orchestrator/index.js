const request = require("request");
const express = require("express");
const cors = require('cors');
const app = express()
const PORT = 3000;
// const ALBERT_HOST = 'localhost';
const ALBERT_HOST = 'albert-service.cluster.local';
const ALBERT_PORT = 4000;
const PROTOCOL = 'http'

app.use(express.json())
app.use(cors())

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

const calculate = async (opn1, opn2, op) => {
    let PATH = op === '+' ? 'add' : 'sub';
    const URL = `${PROTOCOL}://${ALBERT_HOST}:${ALBERT_PORT}/${PATH}`
    console.log("requesting ", URL);

    let options = {
        method: 'POST',
        url: URL,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            opn1,
            opn2
        })
    };
    const { response, body } = await makeRequest(options);
    console.log('Response status code:', response.statusCode);
    console.log('Response body:', body);
    return JSON.parse(body).ans;
}

app.post('/calculate', async (req, res)=>{
    try {
        const {opn1, opn2, opn3, op1, op2} = req.body;
        console.log("calculate received data ",  opn1, op1, opn2, op2, opn3);
        let temp, ans;
        temp = await calculate(opn1, opn2, op1);
        console.log("operation-1 : ",  opn1, op1, opn2, " = ", temp);
        ans = await calculate(temp, opn3, op2);
        console.log("operation-2 : ",  temp, op2, opn3, " = ", ans);
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