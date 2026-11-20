import React, { useState, useEffect } from 'react';
import { Wrench, Clock, AlertTriangle, CheckCircle2, Plus, Phone, Star, ShieldAlert, ChevronRight, FileText } from 'lucide-react';
import { api } from '../services/api';
import { MaintenanceTicket, Property } from '../types';
import { MaintenanceModal } from '../components/MaintenanceModal';
import { useAuth } from '../context/AuthContext';

interface Props {
  properties: Property[];
}

export const MaintenancePage: React.FC<Props> = ({ properties }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || '');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const loadTickets = async () => {
    try {
      const res = await api.getMaintenanceTickets();
      if (res.success) {
        setTickets(res.tickets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleApproveQuote = async (ticketId: string, approved: boolean) => {
    try {
      const res = await api.manageQuotation({ ticketId, approved });
      if (res.success) {
        loadTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ESCALATED') return t.isEscalated;
    return t.status === activeFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            <span>Module 4: RentEase AI Care</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            AI-Driven Maintenance Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Multi-modal triage, urgency prediction, SLA monitoring, automated escalations, and verified vendor quotes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Report Maintenance Issue</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'AWAITING_OWNER_APPROVAL', 'ESCALATED', 'COMPLETED'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeFilter === filter
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {filter.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No maintenance tickets found for this filter.
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isEmergency = ticket.aiSuggestedUrgency === 'EMERGENCY';
            const isHigh = ticket.aiSuggestedUrgency === 'HIGH';

            return (
              <div
                key={ticket.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition hover:shadow-md space-y-4 ${
                  ticket.isEscalated
                    ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-200'
                    : 'border-slate-200/80'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{ticket.id.slice(0, 8)}
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900">{ticket.title}</h3>
                      {ticket.isEscalated && (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> ESCALATED SLA
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{ticket.property?.title} ({ticket.property?.city})</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        isEmergency
                          ? 'bg-rose-100 text-rose-800'
                          : isHigh
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ticket.aiSuggestedUrgency} Priority
                    </span>

                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {ticket.description}
                </p>

                {/* Vendor & Quote Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Matched Local Contractor:
                    </span>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{ticket.assignedVendorName || 'HydraFlow Plumbing Services'}</span>
                      <span className="text-amber-500 font-semibold text-[11px]">⭐ 4.8</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Tel: {ticket.assignedVendorPhone || '+91 98490 12345'}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end justify-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Work Order Estimate:
                    </span>
                    <div className="flex items-center space-x-3">
                      <span className="text-base font-black text-slate-900">
                        {ticket.quoteAmount ? `₹${ticket.quoteAmount.toLocaleString('en-IN')}` : 'Awaiting Quote'}
                      </span>
                      {ticket.quoteAmount && !ticket.quoteApprovedByOwner && (
                        <div className="flex space-x-1.5">
                          <button
                            onClick={() => handleApproveQuote(ticket.id, true)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
                          >
                            Approve Quote
                          </button>
                          <button
                            onClick={() => handleApproveQuote(ticket.id, false)}
                            className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {ticket.quoteApprovedByOwner && (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Owner Authorized
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer SLA Deadline */}
                <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>SLA Deadline: {new Date(ticket.slaDeadline).toLocaleString()}</span>
                  </div>
                  <span>Input: {ticket.complaintInputType}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ticket Modal */}
      {isModalOpen && (
        <MaintenanceModal
          propertyId={selectedPropertyId}
          onClose={() => setIsModalOpen(false)}
          onTicketCreated={loadTickets}
        />
      )}
    </div>
  );
};
