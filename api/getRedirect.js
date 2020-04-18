import faunadb, { query as q } from "faunadb"

const GetRedirect = async (userRequest, userResponse) => {

  const { FAUNADB_SECRET: faunadb_secret } = process.env
  const client = new faunadb.Client({ secret: faunadb_secret })

  const shortcode = userRequest.url.replace(/\/redirects\/?/, '')

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

  if (redirectInfo.length == 1) {
    let data = redirectInfo[0].data
    data.clicks = null
    data.history = [
    ]
    userResponse.json(data)
  } else {
    userResponse.status(404)
    userResponse.send("Not found");
  }

  userResponse.end();


}

export default GetRedirect