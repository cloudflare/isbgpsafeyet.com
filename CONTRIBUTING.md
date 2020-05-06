# Contributing to isbgpsafeyet.com

Thank you for helping to keep the list up to date! We welcome contributions as well.

This project is governed by Cloudflare's [code of conduct](https://github.com/cloudflare/.github/blob/master/CODE_OF_CONDUCT.md) and 
[guidelines](https://github.com/cloudflare/.github/blob/master/CONTRIBUTING.md).

## I have a question on RPKI or the website

First, have a look at the FAQ on the website.
Please raise an [issue](https://github.com/cloudflare/isbgpsafeyet.com/issues/new/choose)
if you haven't found the answer.

## Adding networks and Twitter accounts

* [operators.csv](https://github.com/cloudflare/isbgpsafeyet.com/blob/master/data/operators.csv) [[edit it online](https://github.com/cloudflare/isbgpsafeyet.com/edit/master/data/operators.csv)]
* [twitter.csv](https://github.com/cloudflare/isbgpsafeyet.com/blob/master/data/twitter.csv) [[edit it online](https://github.com/cloudflare/isbgpsafeyet.com/edit/master/data/twitter.csv)]

Follow the steps below:
* when adding a new network:
  * the columns are:
    * name: most common name of a network (eg: AT&T)
    * type: ISP, cloud or transit
    * details: indicates the progression of an RPKI deployment (eg: signed + filtering/filtering peers only)
    * status: the RPKI state:
      _unsafe_ (nothing deployed, only signed or not filtering),
      _partially safe_ (not filtering all the peers),
      _safe_ (fully signed and fully filtering)
    * asn: autonomous system number (eg: 7018 for AT&T)
    * rank: you can look them up using the ASN: https://asrank.caida.org/asns/3356
  * sort the row by the rank
* when adding a Twitter account, sort them by ASN

Create a pull-request.
We will review it and merge it if it's valid.
Try to include proof if you're indicating a filtering ISP (mailing-list message, website, tweet, RIPE Atlas test).

If you wish to publish a new major deployment as part of the *latest updates*: edit the following:
[index.html](https://github.com/cloudflare/isbgpsafeyet.com/blob/master/src/index.html) [[edit it online](https://github.com/cloudflare/isbgpsafeyet.com/edit/master/src/index.html)]
Make sure you provide enough information to validate the statement.
