import React, { useState } from 'react';
import {
  Wrench,
  Search,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  User,
  Edit,
  Eye,
  Trash2,
  MessageCircle,
  DollarSign,
  FileText,
  Smartphone,
  Sparkles,
  AlertCircle,
  Tag,
  Check,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { RepairBooking, RepairStatus } from '../../types.ts';
import { DataStorageService } from '../../services/dataStorage.ts';
import { formatDate, formatNPR } from '../../utils/formatters.ts';

interface RepairBookingsManagerProps {
  bookings: RepairBooking[];
  onBookingsChange: () => void;
}

const ALL_STATUSES: RepairStatus[] = [
  'New',
  'Contacted',
  'Diagnosing',
  'Price Estimated',
  'Repair Approved',
  'Repairing',
  'Ready',
  'Completed',
  'Cancelled'
];

const STATUS_COLORS: Record<RepairStatus, { bg: string; text: string; border: string; label: string }> = {
  'New': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'New' },
  'Contacted': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Contacted' },
  'Diagnosing': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Diagnosing' },
  'Price Estimated': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Price Estimated' },
  'Repair Approved': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', label: 'Repair Approved' },
  'Repairing': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Repairing' },
  'Ready': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Ready for Pickup' },
  'Completed': { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200', label: 'Completed' },
  'Cancelled': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300', label: 'Cancelled' }
};

export const RepairBookingsManager: React.FC<RepairBookingsManagerProps> = ({
  bookings,
  onBookingsChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [brandFilter, setBrandFilter] = useState<string>('ALL');

  // Modal states
  const [viewingBooking, setViewingBooking] = useState<RepairBooking | null>(null);
  const [editingBooking, setEditingBooking] = useState<RepairBooking | null>(null);
  const [photoModalUrl, setPhotoModalUrl] = useState<string | null>(null);

  // Edit Form Fields
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editMobileBrand, setEditMobileBrand] = useState('');
  const [editMobileModel, setEditMobileModel] = useState('');
  const [editProblemType, setEditProblemType] = useState('');
  const [editProblemDescription, setEditProblemDescription] = useState('');
  const [editPreferredDate, setEditPreferredDate] = useState('');
  const [editPreferredTime, setEditPreferredTime] = useState('');
  const [editStatus, setEditStatus] = useState<RepairStatus>('New');
  const [editTentativePrice, setEditTentativePrice] = useState<string>('');
  const [editFinalPrice, setEditFinalPrice] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editTechnicianName, setEditTechnicianName] = useState<string>('');
  const [editTechnicianPhone, setEditTechnicianPhone] = useState<string>('');

  const storeSettings = DataStorageService.getStoreSettings();

  // Quick status update on table row
  const handleQuickStatusUpdate = (id: string, newStatus: RepairStatus) => {
    DataStorageService.updateRepairBookingStatus(id, newStatus);
    onBookingsChange();
    if (viewingBooking && viewingBooking.id === id) {
      setViewingBooking(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Open Edit Modal
  const openEditModal = (b: RepairBooking) => {
    setEditingBooking(b);
    setEditCustomerName(b.customerName || '');
    setEditPhoneNumber(b.phoneNumber || '');
    setEditMobileBrand(b.mobileBrand || 'Other');
    setEditMobileModel(b.mobileModel || b.phoneModel || '');
    setEditProblemType(b.problemType || b.issueType || '');
    setEditProblemDescription(b.problemDescription || b.description || '');
    setEditPreferredDate(b.preferredDate || '');
    setEditPreferredTime(b.preferredTime || '');
    setEditStatus(b.status || 'New');
    setEditTentativePrice(b.tentativePrice !== undefined ? String(b.tentativePrice) : (b.estimatedCost !== undefined ? String(b.estimatedCost) : ''));
    setEditFinalPrice(b.finalPrice !== undefined ? String(b.finalPrice) : '');
    setEditNotes(b.notes || '');
    setEditTechnicianName(b.technicianName || storeSettings.technicianName || '');
    setEditTechnicianPhone(b.technicianPhone || storeSettings.technicianPhone || storeSettings.phone1 || '');
  };

  // Save Edit Form
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    const tentativeNum = editTentativePrice ? parseFloat(editTentativePrice) : undefined;
    const finalNum = editFinalPrice ? parseFloat(editFinalPrice) : undefined;

    DataStorageService.updateRepairBooking(editingBooking.id, {
      customerName: editCustomerName.trim(),
      phoneNumber: editPhoneNumber.trim(),
      mobileBrand: editMobileBrand.trim(),
      mobileModel: editMobileModel.trim(),
      problemType: editProblemType.trim(),
      problemDescription: editProblemDescription.trim(),
      preferredDate: editPreferredDate,
      preferredTime: editPreferredTime,
      status: editStatus,
      tentativePrice: isNaN(tentativeNum as number) ? undefined : tentativeNum,
      finalPrice: isNaN(finalNum as number) ? undefined : finalNum,
      notes: editNotes.trim(),
      technicianName: editTechnicianName.trim() || undefined,
      technicianPhone: editTechnicianPhone.trim() || undefined
    });

    onBookingsChange();
    setEditingBooking(null);
  };

  // Delete booking
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this repair booking? This action cannot be undone.')) {
      DataStorageService.deleteRepairBooking(id);
      onBookingsChange();
      if (viewingBooking && viewingBooking.id === id) {
        setViewingBooking(null);
      }
    }
  };

  // Filter Bookings
  const filteredBookings = bookings.filter(b => {
    const q = searchQuery.toLowerCase().trim();
    const brand = b.mobileBrand || '';
    const model = b.mobileModel || b.phoneModel || '';
    const code = b.bookingCode || '';
    const customer = b.customerName || '';
    const phone = b.phoneNumber || '';
    const problem = b.problemType || b.issueType || '';

    const matchesSearch =
      !q ||
      customer.toLowerCase().includes(q) ||
      phone.toLowerCase().includes(q) ||
      brand.toLowerCase().includes(q) ||
      model.toLowerCase().includes(q) ||
      code.toLowerCase().includes(q) ||
      problem.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesBrand = brandFilter === 'ALL' || brand.toLowerCase() === brandFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesBrand;
  });

  // Calculate stats
  const stats = {
    total: bookings.length,
    newCount: bookings.filter(b => b.status === 'New').length,
    active: bookings.filter(b => ['New', 'Contacted', 'Diagnosing', 'Price Estimated', 'Repair Approved', 'Repairing'].includes(b.status)).length,
    ready: bookings.filter(b => b.status === 'Ready').length,
    completed: bookings.filter(b => b.status === 'Completed').length
  };

  // Generate WhatsApp notification text
  const generateWhatsAppMessage = (b: RepairBooking) => {
    let msg = `Namaste ${b.customerName || 'Sir/Madam'}, this is Pandey Mobile Store & Repair Lab, Traffic Chowk, Butwal.\n\n`;
    msg += `Regarding your device repair:\n`;
    msg += `• Booking ID: ${b.bookingCode || b.id}\n`;
    msg += `• Device: ${b.mobileBrand || ''} ${b.mobileModel || b.phoneModel || ''}\n`;
    msg += `• Issue: ${b.problemType || b.issueType || ''}\n`;
    msg += `• Status: ${b.status}\n`;

    if (b.tentativePrice) {
      msg += `• Tentative Cost: ${formatNPR(b.tentativePrice)}\n`;
    }
    if (b.finalPrice) {
      msg += `• Final Cost: ${formatNPR(b.finalPrice)}\n`;
    }
    if (b.notes) {
      msg += `• Lab Notes: ${b.notes}\n`;
    }
    msg += `\nPlease feel free to reply or visit our store at ${storeSettings.address}, ${storeSettings.city}. Phone: ${storeSettings.technicianPhone || storeSettings.phone1}.`;
    return encodeURIComponent(msg);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Stats */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Repair Bookings & Service Lab</h3>
              <p className="text-xs text-slate-500">
                Manage smartphone repairs, pricing quotes, technician notes and customer updates
              </p>
            </div>
          </div>
        </div>

        {/* Stats Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span>{stats.newCount} New</span>
          </div>

          <div className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold">
            <span>{stats.active} In Lab</span>
          </div>

          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
            <span>{stats.ready} Ready</span>
          </div>

          <div className="px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold">
            <span>{stats.total} Total</span>
          </div>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, phone, device model, booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Brand Filter */}
          <div className="sm:w-48">
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white cursor-pointer"
            >
              <option value="ALL">All Mobile Brands</option>
              <option value="Apple">Apple / iPhone</option>
              <option value="Samsung">Samsung</option>
              <option value="Vivo">Vivo</option>
              <option value="POCO">POCO</option>
              <option value="HONOR">HONOR</option>
              <option value="Redmi">Redmi / Xiaomi</option>
              <option value="OnePlus">OnePlus</option>
              <option value="Realme">Realme</option>
              <option value="Other">Other Brands</option>
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All Bookings ({bookings.length})
          </button>

          {ALL_STATUSES.map(st => {
            const count = bookings.filter(b => b.status === st).length;
            const active = statusFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
                  active
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{st}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-800'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bookings Table View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <Wrench className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-700">No repair bookings match your filter</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When visitors schedule a phone repair from the website, appointments will appear here with customer details and issue logs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Booking Code & Time</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Device & Problem</th>
                  <th className="py-3 px-4">Appointment Slot</th>
                  <th className="py-3 px-4">Repair Pricing</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredBookings.map((b) => {
                  const style = STATUS_COLORS[b.status] || STATUS_COLORS['New'];
                  const deviceTitle = `${b.mobileBrand || ''} ${b.mobileModel || b.phoneModel || ''}`.trim();

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Booking Code & Timestamp */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] border border-indigo-100 block w-fit">
                            {b.bookingCode || 'ID-' + b.id.slice(-6)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {formatDate(b.createdAt)}
                          </span>
                        </div>
                      </td>

                      {/* Customer info */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block">{b.customerName}</span>
                          <a
                            href={`tel:${b.phoneNumber}`}
                            className="text-indigo-600 font-mono text-[11px] hover:underline flex items-center space-x-1"
                          >
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{b.phoneNumber}</span>
                          </a>
                          {(b.technicianPhone || b.technicianName) && (
                            <div className="pt-1 flex items-center space-x-1">
                              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium" title="Assigned Technician">
                                <span>🔧</span>
                                <span className="font-bold truncate max-w-[85px]">{b.technicianName || 'Tech'}</span>
                                {b.technicianPhone && (
                                  <a href={`tel:${b.technicianPhone}`} className="font-mono text-amber-900 hover:underline">
                                    • {b.technicianPhone}
                                  </a>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Device & Problem */}
                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-slate-900">{deviceTitle}</span>
                            {b.photo && (
                              <button
                                type="button"
                                onClick={() => setPhotoModalUrl(b.photo || null)}
                                className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-black hover:bg-amber-200 cursor-pointer"
                                title="Click to view attached photo"
                              >
                                Photo 📷
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] font-semibold text-slate-700">
                            {b.problemType || b.issueType}
                          </p>
                          {(b.problemDescription || b.description) && (
                            <p className="text-[10px] text-slate-500 line-clamp-2 italic">
                              "{b.problemDescription || b.description}"
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Appointment Slot */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-800 block">{b.preferredDate}</span>
                          <span className="text-[10px] text-slate-500 block">{b.preferredTime}</span>
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          {b.tentativePrice ? (
                            <div className="text-[11px]">
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Tentative</span>
                              <span className="font-mono font-bold text-amber-700">{formatNPR(b.tentativePrice)}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No tentative</span>
                          )}

                          {b.finalPrice ? (
                            <div className="text-[11px]">
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Final Cost</span>
                              <span className="font-mono font-black text-emerald-700">{formatNPR(b.finalPrice)}</span>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1.5">
                          <select
                            value={b.status}
                            onChange={(e) => handleQuickStatusUpdate(b.id, e.target.value as RepairStatus)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-black border cursor-pointer ${style.bg} ${style.text} ${style.border}`}
                          >
                            {ALL_STATUSES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>

                          {b.notes && (
                            <span className="text-[10px] text-slate-500 block truncate max-w-[120px]" title={b.notes}>
                              📝 {b.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          
                          {/* WhatsApp */}
                          <a
                            href={`https://wa.me/977${b.phoneNumber.replace(/\D/g, '')}?text=${generateWhatsAppMessage(b)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                            title="Message customer on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          {/* View details */}
                          <button
                            type="button"
                            onClick={() => setViewingBooking(b)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="View Full Booking Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => openEditModal(b)}
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors cursor-pointer"
                            title="Edit Repair, Prices & Notes"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(b.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete Booking"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW BOOKING DETAIL MODAL */}
      {viewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
              <div className="flex items-center space-x-2.5">
                <Wrench className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base font-serif">Repair Booking Summary</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{viewingBooking.bookingCode || viewingBooking.id}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingBooking(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              
              {/* Status Header Bar */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Current Status</span>
                  <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black border mt-1 ${
                    STATUS_COLORS[viewingBooking.status]?.bg || 'bg-slate-100'
                  } ${STATUS_COLORS[viewingBooking.status]?.text || 'text-slate-800'} ${STATUS_COLORS[viewingBooking.status]?.border || 'border-slate-300'}`}>
                    {viewingBooking.status}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Booked At</span>
                  <span className="font-semibold text-slate-800 block mt-1">{formatDate(viewingBooking.createdAt)}</span>
                </div>
              </div>

              {/* Customer Info Section */}
              <div className="space-y-2">
                <h4 className="font-black uppercase tracking-wider text-slate-500 text-[10px] flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Customer Details</span>
                </h4>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Name:</span>
                    <span className="font-bold text-slate-900">{viewingBooking.customerName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Phone:</span>
                    <div className="flex items-center space-x-2">
                      <a href={`tel:${viewingBooking.phoneNumber}`} className="font-mono font-bold text-indigo-600 hover:underline">
                        {viewingBooking.phoneNumber}
                      </a>
                      <a
                        href={`https://wa.me/977${viewingBooking.phoneNumber.replace(/\D/g, '')}?text=${generateWhatsAppMessage(viewingBooking)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px]"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Device & Issue Section */}
              <div className="space-y-2">
                <h4 className="font-black uppercase tracking-wider text-slate-500 text-[10px] flex items-center space-x-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Device & Reported Issue</span>
                </h4>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Brand & Model:</span>
                    <span className="font-bold text-slate-900">
                      {viewingBooking.mobileBrand} {viewingBooking.mobileModel || viewingBooking.phoneModel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Problem Type:</span>
                    <span className="font-bold text-indigo-700">{viewingBooking.problemType || viewingBooking.issueType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Problem Description:</span>
                    <p className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-normal">
                      {viewingBooking.problemDescription || viewingBooking.description || 'No additional description.'}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Preferred Date & Slot:</span>
                    <span className="font-semibold text-slate-800">
                      {viewingBooking.preferredDate} ({viewingBooking.preferredTime})
                    </span>
                  </div>
                </div>
              </div>

              {/* Attached Photo */}
              {viewingBooking.photo && (
                <div className="space-y-2">
                  <h4 className="font-black uppercase tracking-wider text-slate-500 text-[10px]">Customer Attached Photo</h4>
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center p-2">
                    <img
                      src={viewingBooking.photo}
                      alt="Damaged device"
                      className="max-h-52 w-auto object-contain rounded-xl cursor-pointer"
                      onClick={() => setPhotoModalUrl(viewingBooking.photo || null)}
                    />
                  </div>
                </div>
              )}

              {/* Assigned Technician & Direct Contact */}
              <div className="space-y-2">
                <h4 className="font-black uppercase tracking-wider text-slate-500 text-[10px] flex items-center space-x-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  <span>Assigned Lab Technician & Direct Helpline</span>
                </h4>
                <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Technician Name:</span>
                      <span className="font-bold text-slate-900 text-xs">
                        {viewingBooking.technicianName || storeSettings.technicianName || 'Pandey Mobile Senior Lab Engineer'}
                      </span>
                    </div>

                    {(viewingBooking.technicianPhone || storeSettings.technicianPhone || storeSettings.phone1) && (
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold uppercase">Direct Phone:</span>
                        <span className="font-mono font-black text-amber-950 text-xs">
                          {viewingBooking.technicianPhone || storeSettings.technicianPhone || storeSettings.phone1}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick Action Contact Buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60">
                    <a
                      href={`tel:${viewingBooking.technicianPhone || storeSettings.technicianPhone || storeSettings.phone1}`}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shadow-xs"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Technician</span>
                    </a>

                    <a
                      href={`https://wa.me/977${(viewingBooking.technicianPhone || storeSettings.technicianPhone || storeSettings.whatsapp || '').replace(/\D/g, '')}?text=Namaste%20Technician%2C%20regarding%20Repair%20Ticket%20${viewingBooking.bookingCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shadow-xs"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Lab Pricing & Notes */}
              <div className="space-y-2">
                <h4 className="font-black uppercase tracking-wider text-slate-500 text-[10px] flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Lab Pricing & Technician Notes</span>
                </h4>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tentative Price Quote:</span>
                    <span className="font-bold font-mono text-amber-700">
                      {viewingBooking.tentativePrice ? formatNPR(viewingBooking.tentativePrice) : 'Not provided yet'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Final Repair Price:</span>
                    <span className="font-black font-mono text-emerald-700">
                      {viewingBooking.finalPrice ? formatNPR(viewingBooking.finalPrice) : 'Not finalized'}
                    </span>
                  </div>
                  {viewingBooking.notes && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-500 block mb-1">Internal Lab Notes:</span>
                      <p className="bg-amber-50/70 p-2 rounded-xl border border-amber-200 text-amber-900 text-xs">
                        {viewingBooking.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  const toEdit = viewingBooking;
                  setViewingBooking(null);
                  openEditModal(toEdit);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit / Update Booking</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingBooking(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EDIT BOOKING MODAL */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
              <div className="flex items-center space-x-2.5">
                <Edit className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-base font-serif">Edit Repair Booking & Service Quote</h3>
                  <p className="text-xs text-slate-400">Booking Code: {editingBooking.bookingCode || editingBooking.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingBooking(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              
              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={editCustomerName}
                    onChange={(e) => setEditCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={editPhoneNumber}
                    onChange={(e) => setEditPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Mobile Brand & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Brand *</label>
                  <input
                    type="text"
                    required
                    value={editMobileBrand}
                    onChange={(e) => setEditMobileBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Model *</label>
                  <input
                    type="text"
                    required
                    value={editMobileModel}
                    onChange={(e) => setEditMobileModel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                  />
                </div>
              </div>

              {/* Problem Type & Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Problem Type *</label>
                <input
                  type="text"
                  required
                  value={editProblemType}
                  onChange={(e) => setEditProblemType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Problem Description</label>
                <textarea
                  rows={2}
                  value={editProblemDescription}
                  onChange={(e) => setEditProblemDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={editPreferredDate}
                    onChange={(e) => setEditPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Time</label>
                  <input
                    type="text"
                    value={editPreferredTime}
                    onChange={(e) => setEditPreferredTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                  />
                </div>
              </div>

              {/* Status Selector */}
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-indigo-950">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Repair Lifecycle Status</span>
                </div>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as RepairStatus)}
                  className="w-full px-3 py-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900 cursor-pointer shadow-xs"
                >
                  {ALL_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Pricing Quotes */}
              <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/70 space-y-3">
                <div className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-amber-950">
                  <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                  <span>Repair Pricing Estimates</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tentative Repair Price (NPR)</label>
                    <input
                      type="number"
                      placeholder="Enter tentative price"
                      value={editTentativePrice}
                      onChange={(e) => setEditTentativePrice(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Final Repair Price (NPR)</label>
                    <input
                      type="number"
                      placeholder="Enter final price"
                      value={editFinalPrice}
                      onChange={(e) => setEditFinalPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-emerald-800"
                    />
                  </div>
                </div>
              </div>

              {/* Assigned Lab Technician & Number */}
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-amber-950">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    <span>Assigned Technician & Direct Contact</span>
                  </div>
                  {storeSettings.technicianPhone && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditTechnicianName(storeSettings.technicianName || 'Chief Lab Specialist');
                        setEditTechnicianPhone(storeSettings.technicianPhone || storeSettings.phone1 || '');
                      }}
                      className="text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-md border border-amber-300 cursor-pointer"
                    >
                      ⚡ Use Store Default Tech
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Technician / Lab Specialist Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Er. Ramesh Pandey"
                      value={editTechnicianName}
                      onChange={(e) => setEditTechnicianName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Technician Direct Phone Number</span>
                      {editTechnicianPhone && (
                        <span className="text-[10px] text-emerald-700 font-bold">Visible on receipt</span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9847460603"
                      value={editTechnicianPhone}
                      onChange={(e) => setEditTechnicianPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-amber-950"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Technician / Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Enter technician remarks, replacement parts status, or customer notes..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                />
              </div>

              {/* Form Footer */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* PHOTO ZOOM MODAL */}
      {photoModalUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 cursor-pointer"
          onClick={() => setPhotoModalUrl(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-slate-900 rounded-2xl p-2 border border-slate-700">
            <button
              onClick={() => setPhotoModalUrl(null)}
              className="absolute top-4 right-4 p-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={photoModalUrl}
              alt="Zoomed phone damage"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

    </div>
  );
};
