import faunadb, { query as q } from "faunadb";

const UpdateRedirect = async (userRequest, userResponse) => {

    const { FAUNADB_SECRET: faunadb_secret } = process.env
    const client = new faunadb.Client({ secret: faunadb_secret })

    const shortcode = userRequest.url.replace(/\/redirects\/?/, '')

    const data = JSON.parse(userRequest.body)
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
        userResponse.status(404)
        userResponse.json({ message: "This shortcode doesn't exist", shortcode: shortcode })

    } else {

        // Update shortcode  
        await client.query(
            q.Replace(
                // q.Ref(q.Collection("redirects"), "224572974137606656"),
                redirectInfo[0].ref,
                {
                    data: {
                        "shortcode": shortcode,
                        "dest": dest
                    }
                }
            )
        )
        
        userResponse.status(200)
        userResponse.json({ message: "This shortcode has been updated", shortcode: shortcode, dest: dest })

    }

    userResponse.end()

};

export default UpdateRedirect;
