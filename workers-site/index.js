import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'
import OPERATORS from '../public/data/operators.csv'

import parse from 'csv-parse/lib/sync'

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
 */
const DEBUG = false

addEventListener('fetch', event => {
  try {
    event.respondWith(handleEvent(event))
  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        }),
      )
    }
    event.respondWith(new Response('Internal Error', { status: 500 }))
  }
})

async function handleEvent(event) {
  const url = new URL(event.request.url)
  let options = {}

  /**
   * You can add custom logic to how we fetch your assets
   * by configuring the function `mapRequestToAsset`
   */
  // options.mapRequestToAsset = handlePrefix(/^\/docs/)

  try {
    if (DEBUG) {
      // customize caching
      options.cacheControl = {
        bypassCache: true,
      }
    }

    if (url.pathname === "/" || url.pathname === "/index.html"){
      const page = await getAssetFromKV(event, options)

      return new HTMLRewriter()
        .on('head', new StringInjector("OPERATORS", OPERATORS))
        .on('table.BGPSafetyTable', new OperatorsTableBuilder(OPERATORS))
        .transform(page)
    }

    return await getAssetFromKV(event, options)
  } catch (e) {
    // if an error is thrown try to serve the asset at 404.html
    if (!DEBUG) {
      try {
        let notFoundResponse = await getAssetFromKV(event, {
          mapRequestToAsset: req => new Request(`${new URL(req.url).origin}/404.html`, req),
        })

        return new Response(notFoundResponse.body, { ...notFoundResponse, status: 404 })
      } catch (e) {}
    }

    return new Response(e.message || e.toString(), { status: 500 })
  }
}

class StringInjector {
  constructor(name, body) {
    this.name = name
    this.body = body
  }

  element(element){
    element.prepend(`
    <script>
      ${ this.name } = \`${ this.escapeQuotes(this.body) }\`;
    </script>
    `, {
      html: true
    })
  }

  escapeQuotes(value) {
    return value.replace(new RegExp('`', 'g'), '\\\`')
  }
}



function template(rows){
  function each(value, func){
    let out = ''
    for (let key in value){
      out += func(value[key], key)
    }
    return out
  }

  function tbody(v){
    return `
      <tbody>
        ${ each(v, row) }
      </tbody>
    `
  }

  function row(r){
    return `
      <tr data-status="${ r.status.replace(/ /g, '-') }">
        ${ each(r, cell) }
      </tr>
    `
  }

  function cell(val, key){
    return `
      <td data-column="${ key }">${ val }
    `
  }

  return tbody(rows)
}

class OperatorsTableBuilder {
  constructor(operators) {
    this.operators = operators
  }

  element(element){
    const rows = parse(this.operators, {
      columns: true
    })

    element.append(template(rows), {
      html: true
    })
  }
}

/**
 * Here's one example of how to modify a request to
 * remove a specific prefix, in this case `/docs` from
 * the url. This can be useful if you are deploying to a
 * route on a zone, or if you only want your static content
 * to exist at a specific path.
 */
function handlePrefix(prefix) {
  return request => {
    // compute the default (e.g. / -> index.html)
    let defaultAssetKey = mapRequestToAsset(request)
    let url = new URL(defaultAssetKey.url)

    // strip the prefix from the path for lookup
    url.pathname = url.pathname.replace(prefix, '/')

    // inherit all other props from the default request
    return new Request(url.toString(), defaultAssetKey)
  }
}
