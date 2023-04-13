# isbgpsafeyet.com

**Is BGP safe yet?** is an initiative by Cloudflare to make BGP more secure by deploying RPKI.

A list of major operators tracks the status of their RPKI deployments into three categories:
safe, partially safe and unsafe. Contributions are welcome.

[Contribute to the list →](https://github.com/cloudflare/isbgpsafeyet.com/tree/master/data)

The website also provides a simple test to determine if your operator is filtering RPKI invalid prefixes.

[Visit isbgpsafeyet.com →](https://isbgpsafeyet.com/)

## Running

IsBGPSafeYet is built with Webpack and deployed with Workers Sites.

To run locally:

- `npm install`
- `npm run start`

If you have never used Wrangler before you will need to [Configure Wrangler](https://developers.cloudflare.com/workers/quickstart#configure).

If you have a zone on Cloudflare to test with, you will also have to update the wrangler.toml file:

- Update the `account_id`, `zone_id`, and `route` values

To produce a build and deploy:

- `npm run build`
- `npm run deploy-worker`
