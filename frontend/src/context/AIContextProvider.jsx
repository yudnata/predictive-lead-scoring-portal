import React, { useState, useCallback } from 'react';
import { AIContext } from './AIContext';

export const AIContextProvider = ({ children }) => {
  const [pageContext, setPageContext] = useState(null);

  const setLeadsContext = useCallback((leads) => {
    if (!leads || leads.length === 0) {
      setPageContext(null);
      return;
    }

    const simplifiedLeads = leads.map((lead) => ({
      id: lead.lead_id,
      name: lead.lead_name,
      job: lead.job_name,
      score: lead.lead_score ? (lead.lead_score * 100).toFixed(1) + '%' : 'N/A',
      status: lead.crm_status || 'Available',
      email: lead.lead_email,
      phone: lead.lead_phone_number,
      age: lead.lead_age,
      balance: lead.lead_balance ? `€${lead.lead_balance.toLocaleString()}` : 'N/A',
    }));

    setPageContext({
      type: 'leads',
      description: `Daftar ${simplifiedLeads.length} leads yang sedang dilihat user`,
      data: simplifiedLeads,
    });
  }, []);

  const setLeadDetailContext = useCallback((lead) => {
    if (!lead) {
      return;
    }

    setPageContext({
      type: 'lead_detail',
      description: `Detail lead yang sedang dilihat: ${lead.lead_name || lead.name}`,
      data: {
        id: lead.lead_id,
        name: lead.lead_name || lead.name,
        email: lead.lead_email || lead.email,
        phone: lead.lead_phone_number || lead.phone,
        age: lead.lead_age || lead.age,
        job: lead.job_name || lead.job,
        marital: lead.marital_status,
        education: lead.education_level,
        balance: lead.lead_balance ? `€${lead.lead_balance.toLocaleString()}` : 'N/A',
        score: lead.lead_score
          ? (lead.lead_score * 100).toFixed(1) + '%'
          : lead.score
          ? (lead.score * 100).toFixed(1) + '%'
          : 'N/A',
        status: lead.crm_status || lead.status || 'Available',
        housingLoan: lead.lead_housing_loan,
        personalLoan: lead.lead_loan,
        lastContactDuration: lead.last_contact_duration_sec,
        campaignCount: lead.campaign_count,
      },
    });
  }, []);

  const setDashboardContext = useCallback((stats) => {
    if (!stats) {
      setPageContext(null);
      return;
    }
    setPageContext({
      type: 'dashboard',
      description: 'Data statistik dashboard',
      data: stats,
    });
  }, []);

  const setCampaignsContext = useCallback((campaigns) => {
    if (!campaigns || campaigns.length === 0) {
      setPageContext(null);
      return;
    }

    const simplifiedCampaigns = campaigns.map((c) => ({
      id: c.campaign_id,
      name: c.campaign_name,
      status: c.status,
      startDate: c.start_date,
      endDate: c.end_date,
      totalLeads: c.total_leads || 0,
    }));

    setPageContext({
      type: 'campaigns',
      description: `Daftar ${simplifiedCampaigns.length} campaigns`,
      data: simplifiedCampaigns,
    });
  }, []);

  const setTrackerContext = useCallback((trackedLeads) => {
    if (!trackedLeads || trackedLeads.length === 0) {
      setPageContext(null);
      return;
    }

    const simplified = trackedLeads.map((lead) => ({
      id: lead.lead_id || lead.lead_campaign_id,
      name: lead.lead_name,
      status: lead.status,
      campaign: lead.campaign_name,
      score: lead.score ? (lead.score * 100).toFixed(1) + '%' : 'N/A',
    }));

    setPageContext({
      type: 'leads_tracker',
      description: `Daftar ${simplified.length} leads yang sedang di-track`,
      data: simplified,
    });
  }, []);

  const setHistoryContext = useCallback((history) => {
    if (!history || history.length === 0) {
      setPageContext(null);
      return;
    }

    const simplified = history.map((h) => ({
      id: h.history_id,
      leadName: h.lead_name,
      action: h.action,
      date: h.created_at,
      campaignName: h.campaign_name,
    }));

    setPageContext({
      type: 'history',
      description: `Daftar ${simplified.length} riwayat aktivitas`,
      data: simplified,
    });
  }, []);

  const setCalendarContext = useCallback((events) => {
    if (!events || events.length === 0) {
      setPageContext(null);
      return;
    }

    setPageContext({
      type: 'calendar',
      description: `Daftar ${events.length} events di calendar`,
      data: events,
    });
  }, []);

  const setOutboundContext = useCallback((leads) => {
    if (!leads || leads.length === 0) {
      setPageContext(null);
      return;
    }

    const simplified = leads.map((l) => ({
      id: l.lead_id,
      name: l.lead_name,
      campaign: l.campaign_name,
      score: l.score,
      status: l.latest_outcome || l.status,
      sales: l.tracked_by_name,
      balance: l.lead_balance ? `€${l.lead_balance.toLocaleString()}` : 'N/A',
    }));

    setPageContext({
      type: 'outbound_list',
      description: `List of ${simplified.length} outbound leads`,
      data: simplified,
    });
  }, []);

  const setOutboundDetailContext = useCallback((lead, history = []) => {
    if (!lead) return;

    const simplifiedHistory = history.map((h) => ({
      date: h.created_at,
      action: h.activity_type,
      outcome: h.outcome,
      notes: h.notes,
      sales: h.sales_name,
    }));

    setPageContext({
      type: 'outbound_detail',
      description: `Detail outbound lead: ${lead.lead_name} dengan ${history.length} riwayat aktivitas`,
      data: {
        info: {
          name: lead.lead_name,
          job: lead.job_name,
          score: lead.score ? (lead.score * 100).toFixed(1) + '%' : 'N/A',
          balance: lead.lead_balance,
          age: lead.lead_age,
          status: lead.latest_outcome || lead.crm_status,
        },
        logs: simplifiedHistory,
      },
    });
  }, []);

  const setSegmentAnalysisContext = useCallback((stats) => {
    if (!stats || stats.length === 0) {
      setPageContext(null);
      return;
    }

    const simplified = stats.map((s) => ({
      segment: s.lead_segment,
      avgScore: s.avg_score ? (parseFloat(s.avg_score) * 100).toFixed(1) + '%' : 'N/A',
      leadCount: s.lead_count,
    }));

    setPageContext({
      type: 'segment_analysis',
      description: `Statistik ${simplified.length} segment leads`,
      data: simplified,
    });
  }, []);

  const clearContext = useCallback(() => {
    setPageContext(null);
  }, []);

  return (
    <AIContext.Provider
      value={{
        pageContext,
        setLeadsContext,
        setLeadDetailContext,
        setDashboardContext,
        setCampaignsContext,
        setTrackerContext,
        setHistoryContext,
        setCalendarContext,
        setOutboundContext,
        setOutboundDetailContext,
        setSegmentAnalysisContext,
        clearContext,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};
