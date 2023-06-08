const express = require('express');
const axios = require('axios');
const redis = require('redis');
const responseTime = require('response-time');


const app = express();

// response time for request to be handled
app.use(responseTime());

// setting up redis
const client = redis.createClient({
    host: '127.0.0.1',
    port: 6379,
});
client.connect().catch(console.error)


app.get('/users', async (req, res, next) => {
    try {
//We are checeking if requested data is present in redis cache memory or not.
     const cacheResponse = await client.get('users');
//if its present then, send it to the client directly
     if(cacheResponse){

        console.log("using cached data");
        res.send(JSON.parse(cacheResponse));
        return
     }
/*
if its not present in redis cache, then send a request to the server, 
get the requested data and :
    1. Store it in cache for future requests
    2. Send it to the user 
*/
 const response = await axios.get('https://reqres.in/api/users?page=1');

//we are saving the data in cache, for 5 seconds.    
 const saveResult = await client.setEx('users', 5, JSON.stringify(response.data));

     console.log("New Data Cached", saveResult);
     res.send(response.data);
    } catch (error) {
        res.send(error.message)
    }
});

//port no: 6969
app.listen(6969, () => {
    console.log("App is ruuning on port 6969 🚀");
});
