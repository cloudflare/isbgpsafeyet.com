import './vendor/sortable.min.js'
import 'focus-visible-polyfill'

const svgCheck = '<svg viewBox="0 0 16 16"><path d="M2.5 8.5l3.5 3.5l8 -8"/></svg>'
const svgTimes = '<svg viewBox="0 0 16 16"><path d="M3 3l10 10m-10 0l10 -10"/></svg>'

const successMessageDetails = `${ ''
}fetch https://valid.rpki.cloudflare.com
  <i pass><i>${ svgCheck }</i></i>correctly accepted valid prefixes

fetch https://invalid.rpki.cloudflare.com
  <i pass><i>${ svgCheck }</i></i>correctly rejected invalid prefixes`

const failureMessageDetails = `${ ''
}fetch https://valid.rpki.cloudflare.com
  <i pass><i>${ svgCheck }</i></i>correctly accepted valid prefixes

fetch https://invalid.rpki.cloudflare.com
  <i fail><i>${ svgTimes }</i></i>incorrectly accepted invalid prefixes`

const setupShowAllRowsToggle = () => {
  const table = document.querySelector('[data-js-table]')
  const button = document.querySelector('[data-js-toggle-show-all-rows]')

  if (!table || !button) return

  const tableSummary = document.querySelector('[data-js-table-summary]')
  const majorCount = table.querySelectorAll('tr[data-is-major="true"]').length

  button.addEventListener('click', () => {
    if (table.getAttribute('data-show-all-rows') === 'false') {
      table.setAttribute('data-show-all-rows', 'true')
      button.textContent = '－ Show fewer'
      tableSummary.textContent = 'Displaying all operators'
    } else {
      table.setAttribute('data-show-all-rows', 'false')
      button.textContent = '＋ Show all'
      tableSummary.textContent = `Displaying ${ majorCount } major operators`
    }
  })
}

const setupASNColumnToggle = () => {
  const table = document.querySelector('[data-js-table]')
  const button = document.querySelector('[data-js-toggle-asn-column]')

  if (!button) return

  button.addEventListener('click', () => {
    if (table.getAttribute('data-hide-asn-column') === 'true') {
      table.setAttribute('data-hide-asn-column', 'false')
      button.textContent = '－ Hide ASN column'
    } else {
      table.setAttribute('data-hide-asn-column', 'true')
      button.textContent = '＋ Show ASN column'
    }
  })
}

const initTesting = () => {
  const button = document.querySelector('[data-js-test]')
  const el = document.querySelector('[data-js-test-results]')

  const render = ({ type, message, tweet }) => {
    if (type === 'running') {
      button.setAttribute('disabled', '')
    } else {
      button.removeAttribute('disabled', '')
    }

    el.setAttribute('data-type', type)
    el.innerHTML = ''

    const messageEl = document.createElement('span')
    messageEl.textContent = message
    el.appendChild(messageEl)

    if (tweet) {
      messageEl.textContent += ' '
      const tweetWrapper = document.createElement('span')
      tweetWrapper.className = 'Markdown'
      const tweetLink = document.createElement('a')
      tweetLink.href = `https://twitter.com/intent/tweet/?via=Cloudflare&text=${ encodeURIComponent(tweet) }`
      tweetLink.innerHTML = 'Tweet&nbsp;this&nbsp;→'
      tweetWrapper.appendChild(tweetLink)
      el.appendChild(tweetWrapper)
    }

    if (type === 'success' || type === 'failure') {
      const details = document.createElement('details')
      const summary = document.createElement('summary')
      const pre = document.createElement('pre')

      details.appendChild(summary)
      details.appendChild(pre)

      summary.textContent = 'Details'

      if (type === 'success') {
        pre.innerHTML = successMessageDetails
      } else {
        pre.innerHTML = failureMessageDetails
      }

      el.appendChild(details)
    }
  }

  const getISPInfo = (data, forTweet) => {
    if (!data || data.asn === 0) return ' '

    if (data.name && data.name !== '') {
      if (forTweet) {
        for (var i=0; i < ISP_TWITTER.length; i++){
          if (ISP_TWITTER[i].asn === data.asn.toString()){
            const twitterUsername = `@${ ISP_TWITTER[i].handle }`
            return `, ${ twitterUsername } (AS${ data.asn }), `
          }
        }
      }

      return ` (${ data.name }, AS${ data.asn }) `
    }

    return ` (AS${ data.asn }) `
  }

  const renderSuccessWARP = () => {
    render({
      type: 'success',
      message: 'You are using Cloudflare WARP, which implements BGP safely.'
    })
  }

  const renderSuccess = data => {
    if (data.blackholed) {
      renderFailure(data)
    } else {
      render({
        type: 'success',
        message: `Your ISP${ getISPInfo(data) }implements BGP safely. It correctly drops invalid prefixes.`,
        tweet: `My Internet provider${ getISPInfo(data, true) }implements BGP safely! Check out https://isbgpsafeyet.com to see if your ISP implements BGP in a safe way or if it leaves the Internet vulnerable to malicious route hijacks.`
      })
    }
  }

  const renderFailure = data => {
    render({
      type: 'failure',
      message: `Your ISP${ getISPInfo(data) }does not implement BGP safely. It should be using RPKI to protect the Internet from BGP hijacks.`,
      tweet: `Unfortunately, my Internet provider${ getISPInfo(data, true) }does NOT implement BGP safely. Check out https://isbgpsafeyet.com to see if your ISP implements BGP in a safe way or if it leaves the Internet vulnerable to malicious route hijacks.`
    })
  }

  const renderError = () => {
    render({
      type: 'error',
      message: 'An error occurred trying to conduct the test. Please try again.'
    })
  }

  const runTest = () => {
    const now = performance.now()

    const uid = Math.floor((Math.random() * 10e10)).toString(16)

    const warpFetch = fetch('https://valid.rpki.cloudflare.com/cdn-cgi/trace')
    const validFetch = fetch(`https://valid.rpki.cloudflare.com/${ uid }`)
    const invalidFetch = fetch(`https://invalid.rpki.cloudflare.com/${ uid }`)

    render({
      type: 'running',
      message: 'Running test...'
    })

    warpFetch
      .then(response => response.text())
      .then(response => {
        if (!response.includes('warp=off')) {
          return renderSuccessWARP()
        }

        validFetch
          .then(response => response.json())
          .then(data => {
            let timedOut = false
            let completed = false

            setTimeout(() => {
              timedOut = true
              if (completed) return
              renderSuccess(data)
            }, 2 * 1000)

            invalidFetch
              .then(() => {
                completed = true
                if (timedOut) return
                renderFailure(data)
              })
              .catch(err => renderSuccess(data))
          })
          .catch(err => {
            renderError()
          })
        })
      .catch(err => {
        renderError()
      })
  }

  if (button)
    button.addEventListener('click', () => runTest())
}

const initDiagrams = () => {
  document.querySelectorAll('[data-js-diagram]').forEach(el => {
    const name = el.getAttribute('data-js-diagram')
    const header = el.querySelector('[data-js-diagram-header]')
    const button = document.querySelector(`[data-js-diagram-toggle-for="${ name }"]`)

    if (!button)
      return

    const copy = {
      unsafe: {
        header: {
          happy: 'Normal request',
          sad: 'Hijacked'
        },
        button: {
          happy: 'Hijack the request',
          sad: 'Undo BGP hijack'
        }
      },
      safe: {
        header: {
          happy: 'BGP with RPKI',
          sad: 'BGP with RPKI'
        },
        button: {
          happy: 'Attempt to hijack',
          sad: 'Undo hijack attempt'
        }
      }
    }

    button.addEventListener('click', () => {
      if (el.getAttribute('path') === 'happy') {
        el.setAttribute('path', 'sad')
        button.className = 'Button Button-is-bordered Button-has-depth'
      } else {
        el.setAttribute('path', 'happy')
        button.className = 'Button Button-is-primary Button-is-elevated'
      }

      const path = el.getAttribute('path')
      header.textContent = copy[name].header[path]
      button.textContent = copy[name].button[path]
    })
  })
}

const openPossibleTargetFAQItem = () => {
  const target = document.querySelector(':target')
  if (!target || target.tagName.toLowerCase() !== 'details') return

  target.setAttribute('open', '')
  target.scrollIntoView()
}

const init = () => {
  setupShowAllRowsToggle()
  setupASNColumnToggle()
  initTesting()
  initDiagrams()

  requestAnimationFrame(() => {
    openPossibleTargetFAQItem()
  })
}

init()
