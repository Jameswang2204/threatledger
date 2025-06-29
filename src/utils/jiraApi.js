import axios from 'axios';

const JIRA_BASE  = process.env.REACT_APP_JIRA_BASE_URL;
const JIRA_USER  = process.env.REACT_APP_JIRA_USER;
const JIRA_TOKEN = process.env.REACT_APP_JIRA_API_TOKEN;

const jira = axios.create({
  baseURL:  `${JIRA_BASE}/rest/api/3`,
  auth:     { username: JIRA_USER, password: JIRA_TOKEN },
  headers:  { Accept: 'application/json', 'Content-Type': 'application/json' },
});

export async function createJiraTicket({ title, description, riskId }) {
  const payload = {
    fields: {
      project:   { key: 'PROJ' },            // ← your Jira project key
      summary:   `Risk #${riskId}: ${title}`,
      description,
      issuetype: { name: 'Task' },           // or “Bug”, “Story”, etc.
    }
  };
  const resp = await jira.post('/issue', payload);
  return resp.data; // will include e.g. { key: "PROJ-123", id: "..."}
}