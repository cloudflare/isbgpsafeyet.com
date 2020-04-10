(() => {
  const initTable = () => {
    fetch('data/operators.csv')
      .then(r => r.text())
      .then(d3.csvParse)
      .then(data => {
        const table = document.querySelector('[data-js-table]')
        const tbody = table.querySelector('tbody')
        const columns = Array.from(table.querySelectorAll('th')).map(th => th.getAttribute('data-column'))

        data.forEach(d => {
          const tr = document.createElement('tr')
          tr.setAttribute('data-status', d.status.split(' ').join('-'))

          columns.forEach(name => {
            const td = document.createElement('td')
            td.setAttribute('data-column', name)
            td.innerText = d[name]

            if (name === 'asn') {
              td.setAttribute('data-value', d[name])
            }

            if (name === 'status') {
              td.setAttribute('data-value', [, 'safe', 'partially safe', 'unsafe'].indexOf(d[name]))
            }

            tr.appendChild(td)
          })

          tbody.appendChild(tr)
        })
      })
  }

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
          pre.textContent = 'fetch https://valid.rpki.cloudflare.com: [succeeded]\nfetch https://invalid.rpki.cloudflare.com: [failed]'
        } else {
          pre.textContent = 'fetch https://valid.rpki.cloudflare.com: [succeeded]\nfetch https://invalid.rpki.cloudflare.com: [succeeded]'
        }

        el.appendChild(details)
      }
    }

    const runTest = () => {
      const now = performance.now()

      const uid = Math.floor((Math.random() * 10e10)).toString(16)

      const validFetch = fetch(`https://valid.rpki.cloudflare.com/${ uid }`)
      const invalidFetch = fetch(`https://invalid.rpki.cloudflare.com/${ uid }`)

      render('running', 'Running test...')

      const success = () => {
        render('success', 'Your ISP implements BGP safely. It correctly dropped invalid prefixes.')
      }

      validFetch
        .then(() => {
          let timedOut = false
          let completed = false

          setTimeout(() => {
            timedOut = true
            if (completed) return
            success()
          }, 2 * 1000)

          invalidFetch
            .then(data => data.text())
              .then(text => {
                completed = true
                if (timedOut) return
                render('failure', 'Your ISP does not implement BGP safely. It should be using RPKI.')
              })
            .catch(err => success())
        })
        .catch(err => {
          render('error', 'An error occured trying to conduct the test. Please try again.')
        })
    }

    button.addEventListener('click', () => runTest())
  }

  const init = () => {
    initTable()
    setupASNColumnToggle()
    initTesting()
  }

  init()
})()
