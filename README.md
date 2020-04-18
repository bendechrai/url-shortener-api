# URL Shortener API

## API Usage

### Get all redirects

**Request**

```
GET https://url-shortener-api/redirects
```

**Response**

Array of object containing `shortcode` and `dest`:

```
[
    {
        "shortcode": "twitter",
        "dest": "https://twitter.com/bendechrai"
    },
    {
        "shortcode": "youtube",
        "dest": "https://youtube.com/c/bendechrai"
    }
]
```

### Get redirect

**Request**

```
GET https://url-shortener-api/redirects/[shortcode]
```

**Response**

Object containing `shortcode`, `dest`, `clicks` (the number of times this redirect has been used), and `history` (a 30 day history of clicks per day). *Note: clicks and history is still under development.*

```
{
    "shortcode": "twitter",
    "dest": "https://twitter.com/bendechrai",
    "clicks": null,
    "history": []
}
```

### Create redirect

**Request**

```
POST https://url-shortener-api/redirects
{
    "shortcode": "twtter",
    "dest": "https://twitter.com/bendechrai"
}
```

**Response**

An object containing `message`, the `shortcode`, and on success, the `dest`.

On success:

```
Status: 201 Created
{
    "message": "This shortcode has been created",
    "shortcode": "twtter",
    "dest": "https://twitter.com/bendechrai"
}
```

On failure due to shortcode being in use already:

```
Status: 403 Forbidden
{
    "message": "This shortcode has already been used",
    "shortcode": "twitter"
}
```

### Update redirect

**Request**

```
PUT https://url-shortener-api/redirects/[shortcode]
{
    "dest": "https://twitter.com/bendechrai"
}
```

**Response**

An object containing `message`, the `shortcode`, and on success, the `dest`.

On success:

```
Status: 200 OK
{
    "message": "This shortcode has been updated",
    "shortcode": "twitter",
    "dest": "https://twitter.com/bendechrai"
}
```

On failure due to shortcode not found:

```
Status: 404 Not Found
{
    "message": "This shortcode doesn't exist",
    "shortcode": "twiter"
}
```

## Deploy your own

This install guide assumes you have already installed [url-shortener-redirector](https://github.com/bendechrai/url-shortener-redirector)

### Clone and deploy!

Now run the following in your terminal:

```
git clone https://github.com/bendechrai/url-shortener-api.git
cd url-shortener-api
now --prod
```

### Integrate Fauna into Zeit

1. View your [Zeit Integrations](https://zeit.co/dashboard/integrations) and click on the URL Shortener Config;
1. Select the `url-shortener-api` from the drop downi; and
1. Click on the **Link to project** button for `url-shortener` Fauna Database.