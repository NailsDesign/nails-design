import React from 'react';

const STATUS_BADGES = {
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: '✅' },
  unpaid: { label: 'Unpaid', color: 'bg-yellow-100 text-yellow-700', icon: '💸' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: '❌' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700', icon: '✔️' },
  'no-show': { label: 'No Show', color: 'bg-gray-200 text-gray-600', icon: '🚫' },
};

export default function ClientDetailsModal({
  open,
  onClose,
  client,
  allBookings = [],
  staffList = [],
}) {
  if (!open || !client) return null;

  // Filter bookings for this client
  const clientName = `${client.first_name || ''} ${client.last_name || ''}`.trim();
  const clientBookings = allBookings.filter(b => (b.client_name || '').toLowerCase() === clientName.toLowerCase());

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(255,255,255,0.7)' }}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-[700px] max-h-[85vh] overflow-y-auto relative border border-pink-100">
        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        {/* Client Info Section */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-3xl font-bold text-pink-700">
            <span role="img" aria-label="Client">👤</span>
          </div>
          <div className="flex-1">
            <div className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {clientName}
              {client.source && (
                <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold uppercase">{client.source}</span>
              )}
            </div>
            <div className="text-xs text-gray-700 mt-1 flex items-center gap-2">
              <span role="img" aria-label="Phone">📞</span> {client.phone}
              {client.email && <><span className="mx-2">·</span><span role="img" aria-label="Email">✉️</span> {client.email}</>}
            </div>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              {client.gender && <><span role="img" aria-label="Gender">⚧️</span> {client.gender}</>}
              {client.birthday && <><span role="img" aria-label="Birthday">🎂</span> {client.birthday}</>}
            </div>
            {client.do_not_send_promos && (
              <div className="text-xs text-red-500 font-semibold mt-1">Do not send promotional email</div>
            )}
          </div>
        </div>
        {/* Notes Section */}
        {client.notes && (
          <div className="mb-4">
            <div className="font-semibold text-pink-700 text-sm mb-1 flex items-center gap-2"><span role="img" aria-label="Notes">📝</span> Notes</div>
            <div className="text-xs text-gray-700 whitespace-pre-line">{client.notes}</div>
          </div>
        )}
        {/* Appointment History Section */}
        <div className="mb-2 mt-6">
          <div className="font-semibold text-pink-700 text-base mb-2 flex items-center gap-2"><span role="img" aria-label="History">📖</span> Appointment History</div>
          {clientBookings.length === 0 ? (
            <div className="text-xs text-gray-500">No appointments found for this client.</div>
          ) : (
            <table className="w-full text-xs border rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-pink-50 text-pink-900">
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Service</th>
                  <th className="p-2 text-left">Staff</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Payment</th>
                </tr>
              </thead>
              <tbody>
                {clientBookings.map((b, idx) => {
                  const staff = staffList.find(s => s.id === b.staff_id);
                  const statusBadge = STATUS_BADGES[b.status?.toLowerCase()] || STATUS_BADGES.confirmed;
                  const start = new Date(b.booking_date);
                  const dateStr = start.toLocaleDateString([], { dateStyle: 'medium' });
                  const timeStr = start.toLocaleTimeString([], { timeStyle: 'short' });
                  return (
                    <tr key={idx} className="border-b last:border-b-0">
                      <td className="p-2 whitespace-nowrap">{dateStr} {timeStr}</td>
                      <td className="p-2 whitespace-nowrap">{b.service_name}</td>
                      <td className="p-2 whitespace-nowrap">{staff ? staff.name : '-'}</td>
                      <td className="p-2 whitespace-nowrap"><span className={`px-2 py-0.5 rounded ${statusBadge.color}`}>{statusBadge.icon} {statusBadge.label}</span></td>
                      <td className="p-2 whitespace-nowrap">{b.payment_status || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
} 