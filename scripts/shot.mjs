import { chromium } from 'playwright'

const target = process.argv[2] ?? 'http://127.0.0.1:4173/'
const out = process.argv[3] ?? '/tmp/shot.png'

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 })

const errors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})
page.on('pageerror', (err) => errors.push(String(err)))

await page.goto(target, { waitUntil: 'networkidle', timeout: 45000 })
await page.waitForTimeout(2500)
await page.screenshot({ path: out, fullPage: false })

console.log('url:', page.url())
console.log('title:', await page.title())
if (errors.length) console.log('console errors:\n' + errors.join('\n'))
else console.log('console errors: none')

await browser.close()
