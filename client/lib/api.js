const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE;
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agentic_hire_token');
    }
    return null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({ success: false, error: 'Failed to parse JSON response' }));

    if (!response.ok) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }

    return data;
  }

  // Auth
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  signup(name, email, password, role = 'recruiter') {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  }

  getMe() {
    return this.request('/auth/me');
  }

  // Jobs
  getJobs(status) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/jobs${query}`);
  }

  getJob(id) {
    return this.request(`/jobs/${id}`);
  }

  createJob(jobData) {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  // Candidates & Applications (Public Upload)
  uploadApplication(formData) {
    return this.request('/candidates/upload', {
      method: 'POST',
      body: formData,
    });
  }

  getCandidates(jobId, status) {
    const params = new URLSearchParams();
    if (jobId) params.append('job_id', jobId);
    if (status) params.append('status', status);
    return this.request(`/candidates?${params.toString()}`);
  }

  getCandidate(id) {
    return this.request(`/candidates/${id}`);
  }

  // Workflows
  getWorkflow(id) {
    return this.request(`/workflow/${id}`);
  }

  getAllWorkflows() {
    return this.request('/workflow');
  }

  approveWorkflow(workflowId, action, recruiterNotes = '') {
    return this.request('/workflow/approve', {
      method: 'POST',
      body: JSON.stringify({
        workflow_id: workflowId,
        action,
        recruiter_notes: recruiterNotes,
      }),
    });
  }

  retryWorkflow(workflowId) {
    return this.request('/workflow/retry', {
      method: 'POST',
      body: JSON.stringify({ workflow_id: workflowId }),
    });
  }

  // Analytics & Specs
  getAnalytics() {
    return this.request('/analytics');
  }

  getHiringSpecs() {
    return this.request('/specs/hiring');
  }
}

export const api = new ApiClient();
export default api;
