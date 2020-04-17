(() => {
  const svgCheck = '<svg viewBox="0 0 16 16"><path d="M2.5 8.5l3.5 3.5l8 -8"/></svg>'
  const svgTimes = '<svg viewBox="0 0 16 16"><path d="M3 3l10 10m-10 0l10 -10"/></svg>'

  const successMessageDetails = `${ ''
}fetch https://valid.rpki.cloudflare.com
  <i pass><i>${ svgCheck }</i></i>correctly accepted valid prefixes

fetch https://invalid.rpki.cloudflare.com
  <i pass><i>${ svgCheck }</i></i>correctly rejected invalid prefixes`

  const errorMessageDetails = `${ ''
}fetch https://valid.rpki.cloudflare.com
  <i pass><i>${ svgCheck }</i></i>correctly accepted valid prefixes

fetch https://invalid.rpki.cloudflare.com
  <i fail><i>${ svgTimes }</i></i>incorrectly accepted invalid prefixes`

  const setupASNColumnToggle = () => {
    const table = document.querySelector('[data-js-table]')
    const button = document.querySelector('[data-js-toggle-asn-column]')

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

    const render = (type, message) => {
      if (type === 'running') {
        button.setAttribute('disabled', '')
      } else {
        button.removeAttribute('disabled', '')
      }

      el.setAttribute('data-type', type)
      el.textContent = message

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
          pre.innerHTML = errorMessageDetails
        }

        el.appendChild(details)
      }
    }

    const runTest = () => {
      const now = performance.now()

      const uid = Math.floor((Math.random() * 10e10)).toString(16)

      const warpFetch = fetch('https://valid.rpki.cloudflare.com/cdn-cgi/trace')
      const validFetch = fetch(`https://valid.rpki.cloudflare.com/${ uid }`)
      const invalidFetch = fetch(`https://invalid.rpki.cloudflare.com/${ uid }`)

      render('running', 'Running test...')

      const getISPInfo = (data) => {
        if (!data || data.asn === 0) return ''

        if (data.name && data.name !== '')
          return `(${ data.name }, AS${ data.asn }) `
        else
          return `(AS${ data.asn }) `
      }

      const success = (data) => {
        render('success', `Your ISP ${ getISPInfo(data) }implements BGP safely. It correctly drops invalid prefixes.`)
      }

      warpFetch
        .then(response => response.text())
        .then(response => {
          if (!response.includes('warp=off')) {
            render('success', 'You are using Cloudflare WARP, which implements BGP safely.')
            return
          }

          validFetch
            .then(response => response.json())
            .then(data => {
              let timedOut = false
              let completed = false

              setTimeout(() => {
                timedOut = true
                if (completed) return
                success(data)
              }, 2 * 1000)

              invalidFetch
                .then(() => {
                  completed = true
                  if (timedOut) return
                  render('failure', `Your ISP ${ getISPInfo(data) }does not implement BGP safely. It should be using RPKI.`)
                })
                .catch(err => success(data))
            })
            .catch(err => {
              render('error', 'An error occured trying to conduct the test. Please try again.')
            })
          })
        .catch(err => {
          render('error', 'An error occured trying to conduct the test. Please try again.')
        })
    }

    button.addEventListener('click', () => runTest())
  }

  const initDiagrams = () => {
    document.querySelectorAll('[data-js-diagram]').forEach(el => {
      const name = el.getAttribute('data-js-diagram')
      const header = el.querySelector('[data-js-diagram-header]')
      const button = document.querySelector(`[data-js-diagram-toggle-for="${ name }"]`)

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

  const init = () => {
    setupASNColumnToggle()
    initTesting()
    initDiagrams()
  }

  init()
})()
