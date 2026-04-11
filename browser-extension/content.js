// Sites where we NEVER show popup
const BLOCKED_SITES = [
  'hospital', 'pharmacy', 'medical', 'health',
  'apollo', 'practo', 'netmeds', 'pharmeasy',
  '1mg', 'govt', 'gov.in', 'nic.in', 'irctc',
  'paytm bills', 'billdesk', 'tax', 'income',
  'coursera', 'udemy', 'unacademy', 'byjus',
  'school', 'college', 'university', 'edu',
  'bank', 'insurance', 'lic', 'hdfc life',
  'electricity', 'water board', 'municipal'
]

// Sites where we ALWAYS show popup
const SHOPPING_SITES = [
  'amazon', 'flipkart', 'myntra', 'meesho',
  'ajio', 'nykaa', 'snapdeal', 'shopsy',
  'zomato', 'swiggy', 'blinkit', 'zepto',
  'bookmyshow', 'paytm', 'phonepe',
  'steam', 'epicgames', 'playstation',
  'uber', 'ola', 'rapido',
  'makemytrip', 'goibibo', 'yatra',
  'bigbasket', 'jiomart', 'dmart'
]

// Checkout button patterns to detect
const CHECKOUT_PATTERNS = [
  'place order', 'place your order',
  'proceed to pay', 'proceed to payment',
  'pay now', 'buy now', 'confirm order',
  'complete purchase', 'checkout',
  'continue to payment', 'make payment'
]

const currentSite = window.location.hostname.toLowerCase()

// Check if site is blocked
const isBlockedSite = BLOCKED_SITES
  .some(site => currentSite.includes(site))

// Check if site is shopping
const isShoppingSite = SHOPPING_SITES
  .some(site => currentSite.includes(site))

if (!isBlockedSite) {
  let popupShown = false

  // Detect checkout buttons
  const detectCheckout = () => {
    if (popupShown) return

    const allButtons = document.querySelectorAll(
      'button, input[type="submit"], a'
    )

    allButtons.forEach(btn => {
      const text = btn.textContent
        .toLowerCase().trim()

      const isCheckoutBtn = CHECKOUT_PATTERNS
        .some(pattern => text.includes(pattern))

      if (isCheckoutBtn && !btn.dataset.sympTracked) {
        btn.dataset.sympTracked = 'true'

        btn.addEventListener('click', (e) => {
          if (popupShown) return
          popupShown = true

          // Try to detect amount on page
          const amountPatterns = [
            /₹\s*[\d,]+/,
            /Rs\.?\s*[\d,]+/,
            /INR\s*[\d,]+/
          ]

          let detectedAmount = ''
          const pageText = document.body.innerText

          for (const pattern of amountPatterns) {
            const match = pageText.match(pattern)
            if (match) {
              detectedAmount = match[0]
                .replace(/[₹Rs.INR\s,]/g, '')
                .trim()
              break
            }
          }

          // Show SYMP popup
          showSympPopup(detectedAmount, currentSite)
        })
      }
    })
  }

  // Show the SYMP popup
  function showSympPopup(amount, site) {
    // Remove existing popup
    const existing = document.getElementById('symp-popup')
    if (existing) existing.remove()

    const siteName = site.replace('www.', '').split('.')[0]
    const capitalSite = siteName.charAt(0).toUpperCase()
      + siteName.slice(1)

    const popup = document.createElement('div')
    popup.id = 'symp-popup'
    popup.innerHTML = `
      <div id="symp-overlay">
        <div id="symp-modal">

          <div id="symp-header">
            <div id="symp-logo">
              <span id="symp-logo-text">SYMP</span>
              <span id="symp-logo-sub">Smart Your Money Plan</span>
            </div>
            <button id="symp-close">✕</button>
          </div>

          <div id="symp-title">
            💳 Add this to your expenses?
          </div>
          <div id="symp-subtitle">
            You just purchased on ${capitalSite}
          </div>

          <div id="symp-amount-section">
            <label class="symp-label">AMOUNT (₹)</label>
            <div id="symp-amount-wrapper">
              <span id="symp-rupee">₹</span>
              <input
                type="number"
                id="symp-amount"
                placeholder="Enter amount"
                value="${amount || ''}"
              />
            </div>
          </div>

          <div id="symp-category-section">
            <label class="symp-label">CATEGORY</label>
            <div id="symp-categories">
              <button class="symp-cat active" data-cat="shopping">🛍️ Shopping</button>
              <button class="symp-cat" data-cat="food">🍔 Food</button>
              <button class="symp-cat" data-cat="travel">✈️ Travel</button>
              <button class="symp-cat" data-cat="entertainment">🎬 Fun</button>
              <button class="symp-cat" data-cat="health">💊 Health</button>
              <button class="symp-cat" data-cat="other">💸 Other</button>
            </div>
          </div>

          <div id="symp-mood-section">
            <label class="symp-label">YOUR MOOD</label>
            <div id="symp-moods">
              <button class="symp-mood" data-mood="happy">😊</button>
              <button class="symp-mood active" data-mood="neutral">😐</button>
              <button class="symp-mood" data-mood="sad">😢</button>
              <button class="symp-mood" data-mood="stressed">😤</button>
              <button class="symp-mood" data-mood="excited">🤩</button>
            </div>
          </div>

          <div id="symp-expense-title-section">
            <label class="symp-label">EXPENSE NAME</label>
            <input
              type="text"
              id="symp-expense-title"
              placeholder="e.g. Amazon order, Zomato dinner"
              value="${capitalSite} purchase"
            />
          </div>

          <div id="symp-actions">
            <button id="symp-skip">Skip</button>
            <button id="symp-save">
              + Add to SYMP
            </button>
          </div>

          <div id="symp-login-note">
            Make sure you are logged into SYMP
          </div>

        </div>
      </div>
    `

    // Add styles
    const style = document.createElement('style')
    style.textContent = `
      #symp-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.7);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont,
          'Segoe UI', sans-serif;
      }
      #symp-modal {
        background: #111311;
        border: 1px solid #1f2b1f;
        border-radius: 16px;
        padding: 24px;
        width: 360px;
        max-width: 90vw;
        box-shadow: 0 0 40px rgba(0,255,136,0.2);
      }
      #symp-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      #symp-logo {
        display: flex;
        flex-direction: column;
      }
      #symp-logo-text {
        color: #00ff88;
        font-size: 18px;
        font-weight: bold;
        letter-spacing: 2px;
      }
      #symp-logo-sub {
        color: #6b7280;
        font-size: 10px;
      }
      #symp-close {
        background: transparent;
        border: 1px solid #1f2b1f;
        color: #6b7280;
        width: 28px;
        height: 28px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
      }
      #symp-title {
        color: #ffffff;
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 4px;
      }
      #symp-subtitle {
        color: #6b7280;
        font-size: 12px;
        margin-bottom: 20px;
      }
      .symp-label {
        display: block;
        color: #6b7280;
        font-size: 10px;
        letter-spacing: 1px;
        margin-bottom: 8px;
      }
      #symp-amount-section {
        margin-bottom: 16px;
      }
      #symp-amount-wrapper {
        position: relative;
      }
      #symp-rupee {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #00ff88;
        font-size: 16px;
        font-weight: bold;
      }
      #symp-amount {
        width: 100%;
        padding: 10px 12px 10px 28px;
        background: #0a0a0a;
        border: 1px solid #1f2b1f;
        border-radius: 8px;
        color: #fff;
        font-size: 14px;
        outline: none;
        box-sizing: border-box;
      }
      #symp-amount:focus {
        border-color: #00ff88;
      }
      #symp-expense-title-section {
        margin-bottom: 16px;
      }
      #symp-expense-title {
        width: 100%;
        padding: 10px 12px;
        background: #0a0a0a;
        border: 1px solid #1f2b1f;
        border-radius: 8px;
        color: #fff;
        font-size: 14px;
        outline: none;
        box-sizing: border-box;
      }
      #symp-expense-title:focus {
        border-color: #00ff88;
      }
      #symp-category-section {
        margin-bottom: 16px;
      }
      #symp-categories {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .symp-cat {
        padding: 6px 10px;
        background: #0a0a0a;
        border: 1px solid #1f2b1f;
        border-radius: 20px;
        color: #6b7280;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
      }
      .symp-cat.active {
        background: rgba(0,255,136,0.1);
        border-color: #00ff88;
        color: #00ff88;
      }
      #symp-mood-section {
        margin-bottom: 20px;
      }
      #symp-moods {
        display: flex;
        gap: 8px;
      }
      .symp-mood {
        flex: 1;
        padding: 8px;
        background: #0a0a0a;
        border: 1px solid #1f2b1f;
        border-radius: 8px;
        cursor: pointer;
        font-size: 18px;
        transition: all 0.2s;
      }
      .symp-mood.active {
        background: rgba(0,255,136,0.1);
        border-color: #00ff88;
      }
      #symp-actions {
        display: flex;
        gap: 10px;
        margin-bottom: 12px;
      }
      #symp-skip {
        flex: 1;
        padding: 11px;
        background: transparent;
        border: 1px solid #1f2b1f;
        border-radius: 8px;
        color: #6b7280;
        cursor: pointer;
        font-size: 14px;
      }
      #symp-save {
        flex: 2;
        padding: 11px;
        background: linear-gradient(135deg, #00ff88, #00cc6a);
        border: none;
        border-radius: 8px;
        color: #000;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
      }
      #symp-login-note {
        color: #6b7280;
        font-size: 10px;
        text-align: center;
      }
      #symp-success {
        text-align: center;
        padding: 20px;
        color: #00ff88;
        font-size: 16px;
        font-weight: bold;
      }
    `

    document.head.appendChild(style)
    document.body.appendChild(popup)

    let selectedCategory = 'shopping'
    let selectedMood = 'neutral'

    // Category selection
    document.querySelectorAll('.symp-cat')
      .forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.symp-cat')
            .forEach(b => b.classList.remove('active'))
          btn.classList.add('active')
          selectedCategory = btn.dataset.cat
        })
      })

    // Mood selection
    document.querySelectorAll('.symp-mood')
      .forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.symp-mood')
            .forEach(b => b.classList.remove('active'))
          btn.classList.add('active')
          selectedMood = btn.dataset.mood
        })
      })

    // Close button
    document.getElementById('symp-close')
      .addEventListener('click', () => {
        popup.remove()
        popupShown = false
      })

    // Skip button
    document.getElementById('symp-skip')
      .addEventListener('click', () => {
        popup.remove()
        popupShown = false
      })

    // Save button
    document.getElementById('symp-save')
      .addEventListener('click', async () => {
        const amount = document.getElementById('symp-amount').value
        const title = document.getElementById('symp-expense-title').value

        if (!amount || !title) {
          alert('Please enter amount and expense name')
          return
        }

        const saveBtn = document.getElementById('symp-save')
        saveBtn.textContent = 'Saving...'
        saveBtn.disabled = true

        // Get auth token from storage
        chrome.storage.local.get(
          ['symp_token', 'symp_url'],
          async (result) => {
            const apiUrl = result.symp_url ||
              'https://vellora-hackathon-proto.vercel.app'
            const token = result.symp_token

            try {
              const res = await fetch(
                `${apiUrl}/api/expenses/add`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    title: title,
                    amount: parseFloat(amount),
                    category: selectedCategory,
                    mood: selectedMood,
                    source: 'extension'
                  })
                }
              )

              if (res.ok) {
                document.getElementById('symp-modal').innerHTML = `
                  <div id="symp-success">
                    <div style="font-size:40px;margin-bottom:12px">✅</div>
                    <div style="color:#00ff88;font-size:18px;font-weight:bold">
                      Added to SYMP!
                    </div>
                    <div style="color:#6b7280;font-size:13px;margin-top:8px">
                      ${title} - ₹${amount} logged
                    </div>
                  </div>
                `
                setTimeout(() => {
                  popup.remove()
                  popupShown = false
                }, 2000)
              } else {
                throw new Error('Failed to save')
              }
            } catch (err) {
              document.getElementById('symp-modal').innerHTML = `
                <div id="symp-success">
                  <div style="font-size:40px;margin-bottom:12px">⚠️</div>
                  <div style="color:#f59e0b;font-size:16px;font-weight:bold">
                    Could not connect to SYMP
                  </div>
                  <div style="color:#6b7280;font-size:12px;margin-top:8px">
                    Make sure you are logged into SYMP
                  </div>
                  <button onclick="this.closest('#symp-popup').remove()"
                    style="margin-top:16px;padding:8px 20px;
                    background:#00ff88;border:none;border-radius:8px;
                    color:#000;font-weight:bold;cursor:pointer">
                    Close
                  </button>
                </div>
              `
            }
          }
        )
      })
  }

  // Run detector
  detectCheckout()

  // Re-run on DOM changes (for dynamic pages)
  const observer = new MutationObserver(() => {
    detectCheckout()
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}
