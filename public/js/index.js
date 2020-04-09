(() => {
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
                render('failure', 'Your ISP did not implement BGP safely. It should be using RPKI.')
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
    initTesting()
  }

  init()
})()
