const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "API request failed")
  }

  return data
}


// ========================================
// PROJECTS
// ========================================

export async function getProjects() {
  return request("/projects")
}

export async function createProject(payload) {
  return request("/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}


// ========================================
// ACTIVITIES
// ========================================

export async function getActivities() {
  return request("/activities")
}

export async function getActivityRisk() {
  return request("/analytics/activity-risk")
}


// ========================================
// FIELD REPORTS
// ========================================

export async function getFieldReports() {
  return request("/field-reports")
}

export async function createFieldReport(payload) {
  return request("/field-reports", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}


// ========================================
// MATCHING
// ========================================

export async function matchActivity(payload) {
  return request("/matching/match", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}


// ========================================
// VERIFICATION
// ========================================

export async function getVerificationQueue() {
  return request("/verification")
}

export async function updateVerification(reportId, payload) {
  return request(`/verification/${reportId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}


// ========================================
// ANALYTICS
// ========================================

export async function getProjectSummary() {
  return request("/analytics/project-summary")
}