import faunadb, { query as q } from "faunadb";

const CreateRedirect = async (userRequest, userResponse) => {

    const { FAUNADB_SECRET: faunadb_secret } = process.env
    const client = new faunadb.Client({ secret: faunadb_secret })

    const data = JSON.parse(userRequest.body)
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
        userResponse.status(403)
        userResponse.json({ message: "This shortcode has already been used", shortcode: shortcode })

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

        userResponse.status(201)
        userResponse.json({ message: "This shortcode has been created", shortcode: shortcode, dest: dest })

    }

    userResponse.end()

};

export default CreateRedirect;
