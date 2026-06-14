import { test, expect } from "@playwright/test"

const ACCOUNTS = [
  { username: "admin", password: "admin123", role: "ADMIN" },
  { username: "gdcn", password: "admin123", role: "BRANCH_DIRECTOR" },
  { username: "tp", password: "admin123", role: "DEPARTMENT_HEAD" },
  { username: "nv", password: "admin123", role: "EMPLOYEE" },
]

for (const acc of ACCOUNTS) {
  test(`login as ${acc.username} (${acc.role})`, async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`))
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`console.error: ${m.text()}`)
    })

    await page.goto("http://localhost:8080/login")
    await page.fill("#username", acc.username)
    await page.fill("#password", acc.password)
    await page.click('button[type="submit"]')

    // Wait for either dashboard or error
    await page.waitForURL(/dashboard/, { timeout: 20000 })

    // Verify session via API
    const me = await page.evaluate(async () => {
      const r = await fetch("/api/me")
      return { status: r.status, body: await r.json() }
    })
    if (me.status !== 200) {
      throw new Error(`/api/me returned ${me.status}: ${JSON.stringify(me.body)}`)
    }
    expect(me.body.success).toBe(true)
    expect(me.body.data.username).toBe(acc.username)
    expect(me.body.data.role).toBe(acc.role)
    expect(me.body.data).toHaveProperty("branchId")
    expect(me.body.data).toHaveProperty("fullName")

    // Take screenshot
    await page.screenshot({ path: `test-results/login-${acc.username}.png`, fullPage: true })

    // Test logout
    await page.evaluate(async () => {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    })

    // Critical: no JS errors during the flow (404 favicon is OK)
    const real = errors.filter((e) => !e.includes("favicon") && !e.includes("status of 404"))
    if (real.length > 0) {
      throw new Error(`JS errors for ${acc.username}:\n${real.join("\n")}`)
    }
  })
}

test("invalid credentials show error", async ({ page }) => {
  await page.goto("http://localhost:8080/login")
  await page.fill("#username", "wronguser")
  await page.fill("#password", "wrongpass")
  await page.click('button[type="submit"]')
  // Should NOT navigate to dashboard
  await page.waitForTimeout(2000)
  expect(page.url()).toContain("/login")
})

test("protected route redirects to login", async ({ page }) => {
  await page.goto("http://localhost:8080/dashboard")
  await page.waitForURL(/login/, { timeout: 10000 })
})
