const express = require("express");
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express();
const faunadb = require("faunadb"), q = faunadb.query

const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

require('dotenv').config()

var corsOptions = {
    origin: process.env.DASHBOARD_URL,
    optionsSuccessStatus: 200
}

const port = 3000;

const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://' + process.env.AUTH0_DOMAIN + '/.well-known/jwks.json'
  }),
  audience: process.env.API_IDENTIFIER,
  issuer: 'https://' + process.env.AUTH0_DOMAIN + '/',
  algorithms: ['RS256']
});

app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(jwtCheck);

app.get("/redirects", async (userRequest, userResponse) => {

    const client = new faunadb.Client({ secret: process.env.FAUNADB_SECRET })
    const data = await client
        .query(q.Paginate(q.Match(q.Ref("indexes/all_redirects"))))
        .then(response => {
            const redirectRefs = response.data
            const getAllRedirectDataQuery = redirectRefs.map(ref => {
                return q.Get(ref)
            });
            return client.query(getAllRedirectDataQuery);
        })
        .catch(error => {
            return []
            userResponse.end()
        })

    const output = data.map(item => {
        return {
            shortcode: item.data.shortcode,
            dest: item.data.dest,
            clicks: 0
        }
    })

    userResponse.send(output)
    userResponse.end()

})

app.get("/redirects/:shortcode", async (userRequest, userResponse) => {

    const client = new faunadb.Client({ secret: process.env.FAUNADB_SECRET })

    const shortcode = userRequest.params.shortcode

    const redirectInfo = await client
        .query(q.Paginate(q.Match(q.Ref("indexes/redirect"), shortcode)))
        .then(response => {
            const redirectRefs = response.data;
            const getAllRedirectDataQuery = redirectRefs.map(ref => {
                return q.Get(ref);
            });
            return client.query(getAllRedirectDataQuery);
        })
        .catch(error => userResponse.send("Not found"));

    const clickCount = await client
        .query(q.Count(q.Match(q.Ref("indexes/clicks"), shortcode)))
        .then(response => response)
        .catch(error => userResponse.send("No clicks"))

    if (redirectInfo.length == 1) {
        let data = redirectInfo[0].data
        data.clicks = clickCount
        userResponse.json(data)
    } else {
        userResponse.status(404)
        userResponse.send("Not found");
    }

    userResponse.end();

})

app.post('/redirects', async (req, res) => {

    const client = new faunadb.Client({ secret: process.env.FAUNADB_SECRET })
    const data = req.body
    const shortcode = data.shortcode || ''
    const dest = data.dest || ''

    // Is shortcode taken?
    const redirectInfo = await client
        .query(q.Paginate(q.Match(q.Ref("indexes/redirect"), shortcode)))
        .then(response => {
            const redirectRefs = response.data;
            const getAllRedirectDataQuery = redirectRefs.map(ref => {
                return q.Get(ref);
            });
            return client.query(getAllRedirectDataQuery);
        })
    if (redirectInfo.length != 0) {
        res.status(403)
        res.json({ message: "This shortcode has already been used", shortcode: shortcode })

    } else {

        // Create shortcode
        await client.query(
            q.Create(q.Collection("redirects"), {
                data: {
                    shortcode: shortcode,
                    dest: dest
                }
            })
        );

        res.status(201)
        res.json({ message: "This shortcode has been created", shortcode: shortcode, dest: dest })

    }

    res.end()

})

app.put('/redirects/:shortcode', async (req, res) => {
    
    const client = new faunadb.Client({ secret: process.env.FAUNADB_SECRET })
    
    const shortcode = req.params.shortcode
    const data = req.body
    const dest = data.dest || ''
    
    // Load
    const redirectInfo = await client
        .query(q.Paginate(q.Match(q.Ref("indexes/redirect"), shortcode)))
        .then(response => {
            const redirectRefs = response.data;
            const getAllRedirectDataQuery = redirectRefs.map(ref => {
                return q.Get(ref);
            });
            return client.query(getAllRedirectDataQuery);
        })
    if (redirectInfo.length == 0) {
        res.status(404)
        res.json({ message: "This shortcode doesn't exist", shortcode: shortcode })

    } else {

        // Update shortcode  
        await client.query(
            q.Replace(
                redirectInfo[0].ref,
                {
                    data: {
                        "shortcode": shortcode,
                        "dest": dest
                    }
                }
            )
        )

        res.status(200)
        res.json({ message: "This shortcode has been updated", shortcode: shortcode, dest: dest })

    }

    res.end()

})

app.get("/clicks/:shortcode", async (userRequest, userResponse) => {

    const client = new faunadb.Client({ secret: process.env.FAUNADB_SECRET })
    const shortcode = userRequest.params.shortcode

    const data = await client
        .query(q.Paginate(q.Match(q.Ref("indexes/clicks"), shortcode)))
        .then(response => {
            const clickRefs = response.data
            const getAllClickDataQuery = clickRefs.map(ref => {
                return q.Get(ref)
            });
            return client.query(getAllClickDataQuery);
        })
        .catch(error => userResponse.send("No clicks"))

    const output = data.map(item => {
        return item.data
    })

    userResponse.send(output)
    userResponse.end()
})

app.listen(port, () => {
    console.log(`Running: http://localhost:3000`);
});