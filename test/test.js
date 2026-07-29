/**
 * Hello Dear — Automated System Test Script
 * ------------------------------------------------------------------
 * Exercises the live REST API exposed by server.js end-to-end.
 * This is API-level *system* testing (real HTTP calls against a
 * running server + real MySQL database), NOT unit testing.
 *
 * Companion document: test.md (§4 Traceability table — TC-xx IDs
 * below match that table so results can be pasted straight into
 * the demo / bug reports).
 *
 * Requirements:
 *   - Node.js 18+ (uses the built-in `fetch`)
 *   - Backend running: `npm start` (defaults to http://localhost:3000)
 *   - Database freshly seeded (see test.md §8 "How to Run")
 *
 * Usage:
 *   node test.js
 *
 * Optional environment variables:
 *   BASE_URL         API base URL (default http://localhost:3000)
 *   ADMIN_ID         Admin login used for admin-only test cases
 *   ADMIN_PASSWORD   Must match INITIAL_ADMIN_ID / INITIAL_ADMIN_PASSWORD
 *                    used when running `npm run seed-admin`.
 *                    If not set, admin-only tests are skipped (not failed).
 *
 * Exit code: 0 if every executed test passed, 1 otherwise (CI-friendly).
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const ADMIN_ID = process.env.ADMIN_ID || null;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || null;

// ---- tiny test runner -------------------------------------------------

const results = [];

function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed");
}

async function test(id, name, fn) {
  try {
    await fn();
    results.push({ id, name, status: "PASS" });
    console.log(`✅ PASS  ${id}  ${name}`);
  } catch (error) {
    results.push({ id, name, status: "FAIL", error: error.message });
    console.log(`❌ FAIL  ${id}  ${name}`);
    console.log(`         → ${error.message}`);
  }
}

function skip(id, name, reason) {
  results.push({ id, name, status: "SKIP", error: reason });
  console.log(`➖ SKIP  ${id}  ${name}  (${reason})`);
}

async function api(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  let body = null;
  try {
    body = await response.json();
  } catch {
    // some endpoints may return no body
  }
  return { status: response.status, ok: response.ok, body };
}

// ---- shared state across test cases -----------------------------------

const state = {};
const stamp = Date.now();
const testEmail = `test.user.${stamp}@university.edu`;
const testPassword = "TestPass123!";
const testNickname = `Tester${stamp}`;

// ---- test cases (IDs match test.md §4) --------------------------------

async function run() {
  console.log(`\nHello Dear — System Test Run\nBASE_URL = ${BASE_URL}\n`);

  // US-01: Sign up
  await test("TC-01", "Signup succeeds with valid data", async () => {
    const res = await api("/api/signup", {
      method: "POST",
      body: JSON.stringify({ email: testEmail, password: testPassword, nickname: testNickname })
    });
    assert(res.status === 201, `expected 201, got ${res.status}`);
  });

  await test("TC-02", "Signup rejects a duplicate email (409)", async () => {
    const res = await api("/api/signup", {
      method: "POST",
      body: JSON.stringify({ email: testEmail, password: testPassword, nickname: testNickname })
    });
    assert(res.status === 409, `expected 409, got ${res.status}`);
  });

  // US-02: Login
  await test("TC-03", "Login succeeds with correct credentials", async () => {
    const res = await api("/api/login", {
      method: "POST",
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    assert(res.status === 200, `expected 200, got ${res.status}`);
    assert(res.body && res.body.id, "response missing user id");
    assert(res.body.nickname === testNickname, "nickname mismatch in login response");
    state.userId = res.body.id;
  });

  await test("TC-04", "Login is rejected with the wrong password (401)", async () => {
    const res = await api("/api/login", {
      method: "POST",
      body: JSON.stringify({ email: testEmail, password: "wrong-password" })
    });
    assert(res.status === 401, `expected 401, got ${res.status}`);
  });

  // US-03: Admin login (needs credentials via env vars)
  if (ADMIN_ID && ADMIN_PASSWORD) {
    await test("TC-05", "Admin login succeeds with correct credentials", async () => {
      const res = await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ adminId: ADMIN_ID, password: ADMIN_PASSWORD })
      });
      assert(res.status === 200, `expected 200, got ${res.status}`);
    });

    await test("TC-06", "Admin login is rejected with the wrong password (401)", async () => {
      const res = await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ adminId: ADMIN_ID, password: "wrong-password" })
      });
      assert(res.status === 401, `expected 401, got ${res.status}`);
    });
  } else {
    skip("TC-05", "Admin login succeeds with correct credentials", "ADMIN_ID/ADMIN_PASSWORD not set");
    skip("TC-06", "Admin login is rejected with the wrong password (401)", "ADMIN_ID/ADMIN_PASSWORD not set");
  }

  // US-04: Suspended account cannot log in
  await test("TC-07", "Suspended user cannot log in", async () => {
    assert(state.userId, "requires TC-03 to have set state.userId");
    const patch = await api(`/api/admin/users/${state.userId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "suspended" })
    });
    assert(patch.status === 200, `suspend request failed, status ${patch.status}`);

    const res = await api("/api/login", {
      method: "POST",
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    assert(res.status === 403, `expected 403 (suspended), got ${res.status}`);

    // restore for the remaining tests
    const restore = await api(`/api/admin/users/${state.userId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "active" })
    });
    assert(restore.status === 200, `restore request failed, status ${restore.status}`);
  });

  // US-05 / US-06: Create posts
  await test("TC-08", "Logged-in user can create a public post", async () => {
    const res = await api("/api/posts", {
      method: "POST",
      body: JSON.stringify({
        authorId: state.userId,
        category: "academic",
        content: "System test public post " + stamp,
        isPublic: true
      })
    });
    assert(res.status === 201, `expected 201, got ${res.status}`);
    assert(res.body.isPublic === true, "post should be public");
    state.publicPostId = res.body.id;
  });

  await test("TC-09", "Logged-in user can create a private post", async () => {
    const res = await api("/api/posts", {
      method: "POST",
      body: JSON.stringify({
        authorId: state.userId,
        category: "mental-health",
        content: "System test private post " + stamp,
        isPublic: false
      })
    });
    assert(res.status === 201, `expected 201, got ${res.status}`);
    assert(res.body.isPublic === false, "post should be private");
    state.privatePostId = res.body.id;
  });

  await test("TC-10", "Creating a post without content is rejected (400)", async () => {
    const res = await api("/api/posts", {
      method: "POST",
      body: JSON.stringify({ authorId: state.userId, category: "other" })
    });
    assert(res.status === 400, `expected 400, got ${res.status}`);
  });

  // US-07: Visibility rules
  await test("TC-11", "Public post appears for an anonymous (no userId) request", async () => {
    const res = await api("/api/posts");
    assert(res.status === 200, `expected 200, got ${res.status}`);
    const found = res.body.find((p) => p.id === state.publicPostId);
    assert(found, "public post not found in feed for anonymous request");
  });

  await test("TC-12", "Private post is hidden from other users but visible to its author", async () => {
    const asStranger = await api(`/api/posts?userId=999999999`);
    const strangerSees = asStranger.body.some((p) => p.id === state.privatePostId);
    assert(!strangerSees, "private post leaked to a different user");

    const asOwner = await api(`/api/posts?userId=${state.userId}`);
    const ownerSees = asOwner.body.some((p) => p.id === state.privatePostId);
    assert(ownerSees, "author could not see their own private post");
  });

  // US-08: Comments
  await test("TC-13", "User can add a comment to a post", async () => {
    const res = await api(`/api/posts/${state.publicPostId}/comments`, {
      method: "POST",
      body: JSON.stringify({ authorId: state.userId, content: "Great post! (system test)" })
    });
    assert(res.status === 201, `expected 201, got ${res.status}`);

    const posts = await api(`/api/posts?userId=${state.userId}`);
    const post = posts.body.find((p) => p.id === state.publicPostId);
    assert(post.comments.length >= 1, "comment was not persisted");
  });

  // US-09: Reports
  await test("TC-14", "User can report a post", async () => {
    const res = await api("/api/reports", {
      method: "POST",
      body: JSON.stringify({ postId: state.publicPostId, reporterId: state.userId, reason: "System test report" })
    });
    assert(res.status === 201, `expected 201, got ${res.status}`);
  });

  // US-10: Resources directory
  await test("TC-15", "Resources list can be retrieved", async () => {
    const res = await api("/api/resources");
    assert(res.status === 200, `expected 200, got ${res.status}`);
    assert(Array.isArray(res.body), "resources response should be an array");
  });

  // US-11: Feedback
  await test("TC-16", "Feedback with sufficient length is accepted", async () => {
    const res = await api("/api/feedback", {
      method: "POST",
      body: JSON.stringify({ authorId: state.userId, content: "This is automated feedback from test.js" })
    });
    assert(res.status === 201, `expected 201, got ${res.status}`);
  });

  await test("TC-16b", "Feedback under 5 characters is rejected (400)", async () => {
    const res = await api("/api/feedback", {
      method: "POST",
      body: JSON.stringify({ authorId: state.userId, content: "hi" })
    });
    assert(res.status === 400, `expected 400, got ${res.status}`);
  });

  // US-12: Admin dashboard stats
  await test("TC-17", "Admin stats endpoint returns counts", async () => {
    const res = await api("/api/admin/stats");
    assert(res.status === 200, `expected 200, got ${res.status}`);
    ["userCount", "postCount", "publicPostCount", "privatePostCount", "commentCount"].forEach((key) => {
      assert(typeof res.body[key] === "number", `missing/invalid numeric field: ${key}`);
    });
  });

  // US-13: Reports management
  await test("TC-18", "Admin can list all reports", async () => {
    const res = await api("/api/reports");
    assert(res.status === 200, `expected 200, got ${res.status}`);
    state.reportId = res.body.find((r) => r.postId === state.publicPostId)?.id;
    assert(state.reportId, "could not find the report created in TC-14");
  });

  await test("TC-19", "Admin can resolve a report", async () => {
    const res = await api(`/api/reports/${state.reportId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "resolved" })
    });
    assert(res.status === 200, `expected 200, got ${res.status}`);
  });

  // US-14: User management
  await test("TC-20", "Admin can suspend then restore a user", async () => {
    const suspend = await api(`/api/admin/users/${state.userId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "suspended" })
    });
    assert(suspend.status === 200, `suspend failed, status ${suspend.status}`);

    const restore = await api(`/api/admin/users/${state.userId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "active" })
    });
    assert(restore.status === 200, `restore failed, status ${restore.status}`);
  });

  // US-15: Resource management
  await test("TC-21", "Admin can add a resource", async () => {
    const res = await api("/api/resources", {
      method: "POST",
      body: JSON.stringify({
        category: "Academic",
        title: "System Test Resource " + stamp,
        description: "Created by test.js",
        contactEmail: "test@university.edu",
        location: "Test Building"
      })
    });
    assert(res.status === 201, `expected 201, got ${res.status}`);
    state.resourceId = res.body.id;
  });

  await test("TC-22", "Admin can edit a resource", async () => {
    const res = await api(`/api/resources/${state.resourceId}`, {
      method: "PUT",
      body: JSON.stringify({
        category: "Academic",
        title: "System Test Resource (edited)",
        description: "Edited by test.js",
        contactEmail: "test@university.edu",
        location: "Test Building"
      })
    });
    assert(res.status === 200, `expected 200, got ${res.status}`);
  });

  await test("TC-23", "Admin can delete a resource", async () => {
    const res = await api(`/api/resources/${state.resourceId}`, { method: "DELETE" });
    assert(res.status === 200, `expected 200, got ${res.status}`);
  });

  // US-16: Feedback management
  await test("TC-24", "Admin can mark feedback reviewed then delete it", async () => {
    const list = await api("/api/feedback");
    const item = list.body.find((f) => f.content.includes("automated feedback from test.js"));
    assert(item, "could not find the feedback created in TC-16");

    const patch = await api(`/api/feedback/${item.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "reviewed" })
    });
    assert(patch.status === 200, `expected 200, got ${patch.status}`);

    const del = await api(`/api/feedback/${item.id}`, { method: "DELETE" });
    assert(del.status === 200, `expected 200, got ${del.status}`);
  });

  // US-17: Settings
  await test("TC-25", "Admin can read and update platform settings", async () => {
    const get1 = await api("/api/settings");
    assert(get1.status === 200, `expected 200, got ${get1.status}`);

    const toggled = !get1.body.allowGuestBrowsing;
    const put = await api("/api/settings", {
      method: "PUT",
      body: JSON.stringify({ ...get1.body, allowGuestBrowsing: toggled })
    });
    assert(put.status === 200, `expected 200, got ${put.status}`);

    const get2 = await api("/api/settings");
    assert(get2.body.allowGuestBrowsing === toggled, "setting did not persist");

    // restore original value so re-runs are not affected
    await api("/api/settings", {
      method: "PUT",
      body: JSON.stringify({ ...get2.body, allowGuestBrowsing: get1.body.allowGuestBrowsing })
    });
  });

  // ---- cleanup: remove the test post so it doesn't clutter the feed ----
  await test("TC-99", "Cleanup: remove posts created during this test run", async () => {
    for (const id of [state.publicPostId, state.privatePostId]) {
      if (!id) continue;
      const res = await api(`/api/posts/${id}`, { method: "DELETE" });
      assert(res.status === 200, `cleanup failed for post ${id}, status ${res.status}`);
    }
  });

  // ---- summary -----------------------------------------------------
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const skipped = results.filter((r) => r.status === "SKIP").length;

  console.log("\n----------------------------------------");
  console.log(`Total: ${results.length}   Passed: ${passed}   Failed: ${failed}   Skipped: ${skipped}`);
  console.log("----------------------------------------\n");

  if (failed > 0) {
    console.log("Failed cases (open a GitHub Issue for each, see test.md §6):");
    results.filter((r) => r.status === "FAIL").forEach((r) => console.log(`  - ${r.id}: ${r.name} → ${r.error}`));
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error("Test run crashed before completing:", error);
  process.exitCode = 1;
});
