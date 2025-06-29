// src/context/RiskContext.js
import React, { createContext, useState } from 'react';
import { createJiraTicket } from '../utils/jiraApi';

export const RiskContext = createContext();

export const RiskProvider = ({ children }) => {
  const [risks, setRisks] = useState([]);

  // Simple ID generator for treatments & attachments
  const makeId = () =>
    Date.now().toString(36) + Math.random().toString(36).substr(2);

  /**
   * Adds a new risk, initializing all fields and seeding the changeLog.
   */
  const addRisk = (risk) => {
    const newRisk = {
      ...risk,
      owner:          risk.owner || '',
      status:         risk.status || 'Open',       // Open | In Progress | Mitigated | Closed
      mappedControls: [],                          // e.g. ['NIST CSF', ...]
      assessments:    [],                          // { date, likelihood, impact, by, notes }[]
      treatments:     [],                          // { id, description, dueDate, completed, attachments }[]
      inherentScore:  risk.score,
      residualScore:  risk.score,
      dateCreated:    new Date(),
      dateUpdated:    new Date(),
      changeLog: [
        {
          timestamp: new Date(),
          user:      risk.owner || 'System',
          action:    'Created Risk',
          details:   `Title="${risk.title}", Score=${risk.score}`,
        }
      ],
    };
    setRisks(prev => [...prev, newRisk]);
  };

  /**
   * Deletes a risk by its index.
   */
  const deleteRisk = (idx) => {
    setRisks(prev => prev.filter((_, i) => i !== idx));
  };

  /**
   * Updates a risk’s fields, bumps dateUpdated, and optionally appends an audit log entry.
   */
  const updateRisk = (idx, updates, logEntry) => {
    setRisks(prev =>
      prev.map((r, i) => {
        if (i !== idx) return r;
        const updated = {
          ...r,
          ...updates,
          dateUpdated: new Date(),
        };
        if (logEntry) {
          updated.changeLog = [
            ...(r.changeLog || []),
            { timestamp: new Date(), ...logEntry }
          ];
        }
        return updated;
      })
    );
  };

  /**
   * Creates a Jira ticket for the given risk index, then saves the issue key back to the risk.
   */
  const linkTicket = async (idx) => {
    const r = risks[idx];
    // call out to your Jira API helper
    const issue = await createJiraTicket({
      title:       r.title,
      description: r.desc,
      riskId:      idx,
    });
    updateRisk(
      idx,
      { ticketLink: issue.key },
      {
        user:    'System',
        action:  'Create Ticket',
        details: `Created Jira ${issue.key}`,
      }
    );
  };

  return (
    <RiskContext.Provider value={{
      risks,
      addRisk,
      deleteRisk,
      updateRisk,
      makeId,      // for treatment/attachment IDs
      linkTicket,  // our new Jira‐linking function
    }}>
      {children}
    </RiskContext.Provider>
  );
};