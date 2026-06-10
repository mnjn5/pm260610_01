import { chromium } from 'playwright'

const base = 'http://localhost:5174'
const ts = Date.now()
const email = `mycompany.tester.${ts}@gmail.com`
const password = 'TestPass123!'
const username = `tester${ts}`

const browser = await chromium.launch()
const page = await browser.newPage()
const errors = []
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`) })
page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`))
page.on('response', async (res) => {
  if (res.status() >= 400 && res.url().includes('supabase.co')) {
    let body = ''
    try { body = await res.text() } catch {}
    errors.push(`[http ${res.status()}] ${res.url()} -> ${body}`)
  }
})

console.log('--- 1. Register ---')
await page.goto(base + '/register', { waitUntil: 'networkidle' })
await page.fill('input[type="text"]', username)
await page.fill('input[type="email"]', email)
await page.fill('input[type="password"]', password)
await page.click('button[type="submit"]')
await page.waitForTimeout(2000)
console.log('after register url=', page.url())

console.log('--- 2. Check redirected / logged in (header shows logout) ---')
const headerText = await page.locator('header, nav').first().textContent().catch(() => '')
console.log('header snippet:', headerText?.slice(0, 200))

console.log('--- 3. Try /admin as normal user ---')
await page.goto(base + '/admin', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
console.log('normal user /admin -> url=', page.url())

console.log('--- 4. Logout ---')
const logoutBtn = page.locator('button:has-text("로그아웃"), a:has-text("로그아웃")')
if (await logoutBtn.count() > 0) {
  await logoutBtn.first().click()
  await page.waitForTimeout(1000)
}
console.log('after logout url=', page.url())

console.log('\n--- console/page errors ---')
console.log(errors.length ? errors.join('\n') : '(none)')

console.log('\n--- credentials for promotion ---')
console.log(JSON.stringify({ email, username }))

await browser.close()
