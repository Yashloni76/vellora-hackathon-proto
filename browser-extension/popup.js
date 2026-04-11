document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(
    ['symp_token', 'symp_url'],
    (result) => {
      if (result.symp_url) {
        document.getElementById('symp-url').value =
          result.symp_url
      }
      if (result.symp_token) {
        document.getElementById('symp-token').value =
          result.symp_token
        document.getElementById('status').textContent =
          '✅ Connected to SYMP'
        document.getElementById('status').className =
          'status connected'
      }
    }
  )

  document.getElementById('save-btn')
    .addEventListener('click', () => {
      const token = document.getElementById('symp-token').value
      const url = document.getElementById('symp-url').value

      if (!token || !url) {
        alert('Please enter both URL and token')
        return
      }

      chrome.storage.local.set({
        symp_token: token,
        symp_url: url
      }, () => {
        document.getElementById('status').textContent =
          '✅ Connected to SYMP'
        document.getElementById('status').className =
          'status connected'
      })
    })

  document.getElementById('open-symp')
    .addEventListener('click', () => {
      chrome.storage.local.get(['symp_url'], (result) => {
        const url = result.symp_url ||
          'https://vellora-hackathon-proto.vercel.app'
        chrome.tabs.create({ url })
      })
    })
})
