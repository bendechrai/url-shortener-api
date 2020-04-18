import faunadb, { query as q } from "faunadb"

const GetClicks = async (userRequest, userResponse) => {

    const { FAUNADB_SECRET: faunadb_secret } = process.env
    const client = new faunadb.Client({ secret: faunadb_secret })

    const data = await client
        .query(q.Paginate(q.Match(q.Ref("indexes/all_clicks"))))
        .then(response => {
            const clickRefs = response.data
            const getAllClickDataQuery = clickRefs.map(ref => {
                return q.Get(ref)
            });
            return client.query(getAllClickDataQuery);
        })
        .catch(error => {
            return []
            userResponse.end()
        })

    const output = data.map(item => {
        return item.data
    })

    userResponse.send(output)
    userResponse.end()

};

export default GetClicks