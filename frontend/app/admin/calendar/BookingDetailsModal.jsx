import React, { useState } from 'react';

const STATUS_BADGES = {
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: '✅' },
  unpaid: { label: 'Unpaid', color: 'bg-yellow-100 text-yellow-700', icon: '💸' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: '❌' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700', icon: '✔️' },
  'no-show': { label: 'No Show', color: 'bg-gray-200 text-gray-600', icon: '🚫' },
};

export default function BookingDetailsModal({
  open,
  onClose,
  booking,
  customer,
  staffList = [],
  onEdit,
  onCancel,
  onMarkArrived,
  onViewClientDetails,
  isFirstVisit = true,
  onAddNote,
  onNoShow,
  onReschedule,
  onCancelAppointment,
}) {
  const [showNoteBox, setShowNoteBox] = useState(!!(booking?.note && booking.note.trim()));
  const [note, setNote] = useState(booking?.note || '');
  const [showNoShowModal, setShowNoShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Show note box if booking.note changes and is not empty
  React.useEffect(() => {
    if (booking?.note && booking.note.trim()) {
      setShowNoteBox(true);
      setNote(booking.note);
    } else {
      setShowNoteBox(false);
      setNote('');
    }
  }, [booking]);

  if (!open || !booking) return null;

  // Debug log
  console.log('BookingDetailsModal booking:', booking);
  console.log('BookingDetailsModal customer:', customer);

  // Find staff member
  const staff = staffList.find(s => s.id === booking.staff_id);
  // Format date/time
  const start = new Date(booking.booking_date);
  const end = new Date(start.getTime() + (booking.duration_minutes || 0) * 60000);
  const dateStr = start.toLocaleDateString([], { dateStyle: 'medium' });
  const timeStr = start.toLocaleTimeString([], { timeStyle: 'short' });
  const endTimeStr = end.toLocaleTimeString([], { timeStyle: 'short' });
  const statusBadge = STATUS_BADGES[booking.status?.toLowerCase()] || STATUS_BADGES.confirmed;

  // Add-ons and removals (if present)
  const addOns = booking.add_ons || booking.addOns || [];
  const removals = booking.removals || [];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(255,255,255,0.7)' }}>
      <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-[600px] max-h-[85vh] overflow-y-auto relative border border-pink-100">
        {/* Header: Name, Date, History Icon, Close Button */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2 border-b border-gray-100">
          <div>
            <div className="text-xs font-semibold tracking-widest text-gray-400 mb-1 uppercase">{customer ? `${customer.first_name} ${customer.last_name}` : booking.client_name} on {dateStr}</div>
            <div className="flex items-center gap-2">
              {isFirstVisit ? (
                <span className="font-semibold text-blue-600 text-xs">First Visit</span>
              ) : (
                <span className="font-semibold text-purple-600 text-xs">Returning</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Client history icon */}
            <button
              className="text-pink-600 hover:text-pink-800"
              title="View client details & history"
              onClick={onViewClientDetails}
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/><path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" stroke="currentColor" strokeWidth="2"/></svg>
            </button>
            {/* Close button */}
            <button
              className="text-gray-400 hover:text-gray-700 text-2xl ml-2"
              onClick={onClose}
            >
              &times;
            </button>
          </div>
        </div>
        {/* Client Info Card */}
        <div className="px-6 pt-3 pb-2 border-b border-gray-100 flex items-center gap-4">
          <div className="flex-1">
            <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {customer ? `${customer.first_name} ${customer.last_name}` : booking.client_name}
            </div>
            <div className="text-xs text-gray-700 mt-1 flex items-center gap-2">
              <span role="img" aria-label="Phone">📞</span> {customer?.phone || booking.phone}
              {customer?.email && (
                <><span className="mx-2">·</span><span role="img" aria-label="Email">✉️</span> {customer.email}</>
              )}
            </div>
          </div>
        </div>
        {/* Service and Status */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-4">
          <div className="flex-1">
            <div className="font-semibold text-pink-700 text-base flex items-center gap-2">
              <span role="img" aria-label="Service">💅</span>
              {Array.isArray(booking.service_names) && booking.service_names.length > 0 ? (
                <ul className="list-disc ml-4 text-sm text-gray-900">
                  {booking.service_names.map((name, idx) => (
                    <li key={idx}>{name}</li>
                  ))}
                </ul>
              ) : (
                <span>{booking.service_name}</span>
              )}
            </div>
            {addOns.length > 0 && (
              <div className="text-xs text-gray-700 mt-1 flex items-center gap-2"><span role="img" aria-label="Add-on">➕</span> {addOns.map((addon, idx) => addon.name || addon).join(', ')}</div>
            )}
            {removals.length > 0 && (
              <div className="text-xs text-gray-700 mt-1 flex items-center gap-2"><span role="img" aria-label="Removal">➖</span> {removals.map((removal, idx) => removal.name || removal).join(', ')}</div>
            )}
          </div>
          <div>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${statusBadge.color}`}>{statusBadge.icon} {statusBadge.label}</span>
          </div>
        </div>
        {/* Date/time, duration, team member */}
        <div className="px-6 py-3 border-b border-gray-100 grid grid-cols-3 gap-4 text-xs text-gray-700">
          <div>
            <div className="font-semibold text-gray-600 mb-1">Date</div>
            <div>{dateStr}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-600 mb-1">Time</div>
            <div>{timeStr} - {endTimeStr}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-600 mb-1">Duration</div>
            <div>{booking.duration_minutes} min</div>
          </div>
          <div>
            <div className="font-semibold text-gray-600 mb-1">Team member</div>
            <div>{staff ? staff.name : '-'}</div>
          </div>
        </div>
        {/* Note box (expandable) */}
        {showNoteBox && (
          <div className="px-6 py-2 border-b border-gray-100 bg-gray-50 relative">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gray-500">📝</span>
              <span className="font-semibold text-xs text-gray-700">Add a note</span>
            </div>
            <div className="relative">
              <textarea
                className="w-full border rounded p-2 text-sm bg-white resize-y focus:outline-none focus:ring-2 focus:ring-pink-200 min-h-[40px] max-h-[120px] pr-6"
                rows={2}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Type your note here..."
                style={{ minHeight: 40, maxHeight: 120, resize: 'vertical' }}
              />
              {/* Resize handle (triangle) */}
              <div
                className="absolute bottom-2 right-2 w-4 h-4 cursor-nwse-resize pointer-events-none"
                style={{ zIndex: 2 }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <polygon points="16,16 0,16 16,0" fill="#e5e7eb" />
                  <polygon points="16,16 12,16 16,12" fill="#a1a1aa" />
                </svg>
              </div>
            </div>
            {/* Removed dashed lines here */}
            <div className="flex justify-end mt-2 gap-2">
              <button
                className="text-xs px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
                onClick={() => {
                  if (!note.trim()) setShowNoteBox(false);
                }}
              >
                Cancel
              </button>
              <button
                className="text-xs px-3 py-1 rounded bg-pink-600 text-white hover:bg-pink-700"
                onClick={() => {
                  if (onAddNote) onAddNote(note);
                  if (!note.trim()) setShowNoteBox(false);
                }}
              >
                Save note
              </button>
            </div>
          </div>
        )}
        {/* Actions */}
        <div className="px-6 py-4 flex gap-2 justify-start bg-gray-50 rounded-b-2xl">
          <button
            className="text-blue-700 font-semibold px-3 py-1 rounded hover:bg-blue-50 transition text-sm border border-transparent hover:border-blue-200"
            onClick={() => setShowNoteBox(true)}
          >
            Add a note
          </button>
          <button
            className="text-purple-700 font-semibold px-3 py-1 rounded hover:bg-purple-50 transition text-sm border border-transparent hover:border-purple-200"
            onClick={() => setShowNoShowModal(true)}
          >
            No-show
          </button>
          <button
            className="text-gray-700 font-semibold px-3 py-1 rounded hover:bg-gray-100 transition text-sm border border-transparent hover:border-gray-200"
            onClick={onReschedule || (() => alert('Reschedule action'))}
          >
            Reschedule
          </button>
          <button
            className="text-red-600 font-semibold px-3 py-1 rounded hover:bg-red-50 transition text-sm border border-transparent hover:border-red-200"
            onClick={() => setShowCancelModal(true)}
          >
            Cancel appointment
          </button>
        </div>
        {/* No-show Modal */}
        {showNoShowModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(255,255,255,0.7)' }}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs relative border border-pink-100">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowNoShowModal(false)}>&times;</button>
              <div className="text-lg font-bold mb-2">Mark as no-show</div>
              <div className="flex gap-2 mb-3">
                <div className="flex-1 bg-gray-50 rounded p-2 text-center">
                  <div className="text-xs text-gray-500 mb-1">Booking source</div>
                  <div className="font-semibold text-gray-700">Treatwell</div>
                </div>
                <div className="flex-1 bg-gray-50 rounded p-2 text-center">
                  <div className="text-xs text-gray-500 mb-1">Payment type</div>
                  <div className="font-semibold text-gray-700">Pay at venue</div>
                </div>
              </div>
              <div className="mb-3 text-xs text-gray-700">What will happen next</div>
              <div className="flex items-center gap-2 mb-4 text-xs text-gray-600"><span>✉️</span> We will notify the client of the no-show.</div>
              <button className="w-full bg-red-500 text-white font-semibold py-2 rounded mb-2 hover:bg-red-600" onClick={() => { if (onNoShow) onNoShow(); setShowNoShowModal(false); }}>Mark as a no-show</button>
              <button className="w-full border border-gray-300 py-2 rounded text-gray-700 font-semibold hover:bg-gray-100" onClick={() => setShowNoShowModal(false)}>Cancel</button>
            </div>
          </div>
        )}
        {/* Cancel Appointment Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(255,255,255,0.7)' }}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs relative border border-pink-100">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowCancelModal(false)}>&times;</button>
              <div className="text-lg font-bold mb-2">Confirm cancellation</div>
              <div className="mb-2 text-xs text-gray-700">This cancellation has a cost.</div>
              <div className="mb-4 text-xs text-gray-700">Try to reschedule instead.</div>
              <button className="w-full bg-blue-700 text-white font-semibold py-2 rounded mb-2 hover:bg-blue-800" onClick={() => { if (onReschedule) onReschedule(); setShowCancelModal(false); }}>Reschedule instead</button>
              <button className="w-full bg-red-500 text-white font-semibold py-2 rounded hover:bg-red-600" onClick={() => { if (onCancelAppointment) onCancelAppointment(); setShowCancelModal(false); }}>Cancel appointment</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 