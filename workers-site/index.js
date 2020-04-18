import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'
import OPERATORS_STRING from '../data/operators.csv'

import parse from 'csv-parse/lib/sync'
import pickBy from 'lodash.pickby'

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
 */
const DEBUG = false

function statusSortIndex(status){
  return [, 'safe', 'partially safe', 'unsafe'].indexOf(status)
}

const OPERATORS = parse(OPERATORS_STRING, {columns: true})

OPERATORS.sort(function(a, b){
  return +a.rank - +b.rank
})

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

  try {
    if (DEBUG) {
      options.cacheControl = {
        bypassCache: true,
      }
    }

    const page = await getAssetFromKV(event, options)

    // Allow headers to be altered
    const response = new Response(page.body, page)

    if (url.pathname === "/" || url.pathname === "/index.html") {
      response.headers.set('Cache-Control', 'public; max-age=60')

      return new HTMLRewriter()
        .on('head', new VarInjector('OPERATORS', OPERATORS))
        .on('table.BGPSafetyTable', new OperatorsTableBuilder(OPERATORS))
        .transform(response)
    } else {
      response.headers.set('Cache-Control', 'public; max-age=86400')

      return response
    }
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

class VarInjector {
  constructor(name, body) {
    this.name = name
    this.body = body
  }

  element(element) {
    element.prepend(`
    <script>
      const ${ this.name } = ${ JSON.stringify(this.body) };
    </script>
    `, {
      html: true
    })
  }
}

function template(rows) {
  const columns = ['name', 'type', 'details', 'status', 'asn']

  function each(value, func) {
    let out = ''
    for (let key in value) {
      out += func(value[key], key)
    }
    return out
  }

  function tbody(v) {
    return `
      <tbody>
        ${ each(v, row) }
      </tbody>
    `
  }

  function row(r) {
    r = pickBy(r, (v, k) => {
      return (columns.indexOf(k) !== -1)
    })

    return `
      <tr data-status="${ r.status.replace(/ /g, '-') }">
        ${ each(r, cell) }
      </tr>
    `
  }

  function cell(val, key) {
    return `
      <td data-column="${ key }" data-value="${ sortKey(key, val).toString().replace(/"/g, '&quot;') }">${ val }
    `
  }

  function sortKey(key, val) {
    if (key === 'status')
      return statusSortIndex(val)
    else
      return val
  }

  return tbody(rows)
}

class OperatorsTableBuilder {
  constructor(operators) {
    this.operators = operators
  }

  element(element) {
    element.append(template(this.operators), {
      html: true
    })
  }
}

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
