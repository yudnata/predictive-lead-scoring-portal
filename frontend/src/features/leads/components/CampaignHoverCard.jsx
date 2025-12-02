import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import LeadService from '../api/lead-service';

const CampaignHoverCard = ({ leadId, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isVisible || !leadId) return;

    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const data = await LeadService.getCampaignsByLead(leadId);
        setCampaigns(data || []);
      } catch (err) {
        console.error('Failed to fetch campaigns:', err);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [isVisible, leadId]);

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const tooltipContent = (
    <div
      className="fixed z-50 w-64 bg-dark-card rounded-lg shadow-2xl pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-white border-b pb-3 border-white/10 text-center">Tracked in Campaigns</h3>

        {loading ? (
          <div className="py-4 text-sm text-center text-gray-400">Loading...</div>
        ) : campaigns.length > 0 ? (
          <div className="space-y-2">
            {campaigns.map((campaign) => (
              <div
                key={campaign.campaign_id}
                className="transition-colors rounded-md hover:bg-gray-700/50"
              >
                <div className="font-medium text-white/80 text-sm text-center">{campaign.campaign_name}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-sm text-center text-gray-400">
            Not tracked in any campaign
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {isVisible && createPortal(tooltipContent, document.body)}
    </div>
  );
};

export default CampaignHoverCard;
