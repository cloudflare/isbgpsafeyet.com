# isbgpsafeyet.com

**Is BGP safe yet?** is an initiative by Cloudflare to make BGP more secure by deploying RPKI.

A list of major operators tracks the status of their RPKI deployments into three categories:
safe, partially safe and unsafe. Contributions are welcome.

[Contribute to the list →](https://github.com/cloudflare/isbgpsafeyet.com/blob/master/public/data/operators.csv)

The website also provides a simple test to determine if your operator is filtering RPKI invalid prefixes.

[Visit isbgpsafeyet.com →](https://isbgpsafeyet.com/)

## Running

IsBGPSafeYet is built with Webpack and deployed with Workers Sites.

To run locally:

- `npm install`
- `npm run start`

If you have never used Wrangler before you will need to [Configure Wrangler](https://developers.cloudflare.com/workers/quickstart#configure).

You will also have to update the wrangler.toml file.

If you have a zone on Cloudflare to test with:

- Update the `account_id`, `zone_id`, and `route` values

If you do not have a zone on Cloudflare to test with:

- Update the `account_id`, remove the `zone_id` and `route` fields, and add `workers_dev = true`

To produce a build:

- `npm run build`
