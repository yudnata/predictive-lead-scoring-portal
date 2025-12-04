import React, { useState } from 'react';
import KanbanCard from './KanbanCard';

const statusConfig = {
  Uncontacted: {
    color: '#FFCA28',
    bgColor: 'bg-[#FFCA28]/10',
    borderColor: 'border-[#FFCA28]/30',
    hoverBorderColor: 'hover:border-[#FFCA28]',
  },
  Contacted: {
    color: '#42A5F5',
    bgColor: 'bg-[#42A5F5]/10',
    borderColor: 'border-[#42A5F5]/30',
    hoverBorderColor: 'hover:border-[#42A5F5]',
  },
  Deal: {
    color: '#66BB6A',
    bgColor: 'bg-[#66BB6A]/10',
    borderColor: 'border-[#66BB6A]/30',
    hoverBorderColor: 'hover:border-[#66BB6A]',
  },
  Reject: {
    color: '#EF5350',
    bgColor: 'bg-[#EF5350]/10',
    borderColor: 'border-[#EF5350]/30',
    hoverBorderColor: 'hover:border-[#EF5350]',
  },
};

const KanbanColumn = ({
  status,
  statusId,
  leads,
  onDrop,
  onAddOutbound,
  onDelete,
  onDragStart,
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const config = statusConfig[status] || statusConfig.Uncontacted;

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const leadCampaignId = e.dataTransfer.getData('leadId');
    if (leadCampaignId) {
      onDrop(parseInt(leadCampaignId, 10), statusId);
    }
  };

  return (
    <div className="bg-dark-card rounded-xl">
      {/* Row Header */}
      <div
        className={`p-3 flex items-center gap-2 border-l-4 ${config.bgColor}`}
        style={{ borderLeftColor: config.color }}
      >
        <h3 className="text-white font-bold text-sm uppercase tracking-wide">{status}</h3>
        <span
          className="px-2 py-1 text-xs font-semibold rounded-full"
          style={{
            backgroundColor: `${config.color}20`,
            color: config.color,
          }}
        >
          {leads.length}
        </span>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-4 transition-all ${
          isDraggingOver
            ? `${config.bgColor} border-2 border-dashed ${config.borderColor}`
            : 'border-2 border-transparent'
        }`}
      >
        {leads.length > 0 ? (
          <div className="overflow-x-auto pb-2">
            <div
              className={`grid gap-3 grid-flow-col auto-cols-[300px] ${
                leads.length === 1
                  ? 'grid-rows-1'
                  : leads.length === 2
                  ? 'grid-rows-2'
                  : 'grid-rows-3'
              }`}
            >
              {leads.map((lead) => (
                <KanbanCard
                  key={lead.lead_campaign_id}
                  lead={lead}
                  onAddOutbound={onAddOutbound}
                  onDelete={onDelete}
                  onDragStart={onDragStart}
                  onChangeStatus={onDrop}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-24 w-full text-gray-500 text-sm">
            {isDraggingOver ? 'Drop here' : 'No leads'}
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
