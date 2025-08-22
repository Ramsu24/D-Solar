'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, FilePen, User, Mail, Phone, AlertTriangle, CheckCircle, XCircle, Archive, Info } from 'lucide-react';
import { AppointmentStatus, Appointment, Pagination } from '@/types/appointment';

// Status badge component
const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
  let badgeClass = '';
  let label = '';
  let icon = null;
  
  switch (status) {
    case 'pending_customer':
      badgeClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
      label = 'Pending Customer';
      icon = <AlertTriangle size={14} className="mr-1" />;
      break;
    case 'pending_admin':
      badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
      label = 'Pending Approval';
      icon = <Info size={14} className="mr-1" />;
      break;
    case 'confirmed':
      badgeClass = 'bg-green-100 text-green-800 border-green-200';
      label = 'Confirmed';
      icon = <CheckCircle size={14} className="mr-1" />;
      break;
    case 'cancelled':
      badgeClass = 'bg-red-100 text-red-800 border-red-200';
      label = 'Cancelled';
      icon = <XCircle size={14} className="mr-1" />;
      break;
    case 'archived':
      badgeClass = 'bg-gray-100 text-gray-800 border-gray-200';
      label = 'Archived';
      icon = <Archive size={14} className="mr-1" />;
      break;
    case 'completed':
      badgeClass = 'bg-purple-100 text-purple-800 border-purple-200';
      label = 'Completed';
      icon = <CheckCircle size={14} className="mr-1" />;
      break;
    default:
      badgeClass = 'bg-gray-100 text-gray-800 border-gray-200';
      label = status;
  }
  
  return (
    <span className={`px-2.5 py-1.5 rounded-full text-xs font-medium border ${badgeClass} flex items-center transition-all duration-200 shadow-sm`}>
      {icon}
      {label}
    </span>
  );
};

const AppointmentsPage = () => {
  // State for appointments data
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [statusToUpdate, setStatusToUpdate] = useState<AppointmentStatus | null>(null);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  
  // State for filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  
  // State for pagination
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  
  // Function to fetch appointments
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Build query string with filters
      let queryString = `?page=${pagination.page}&limit=${pagination.limit}`;
      if (statusFilter) {
        queryString += `&status=${statusFilter}`;
      }
      if (startDate) {
        queryString += `&startDate=${startDate}`;
      }
      if (endDate) {
        queryString += `&endDate=${endDate}`;
      }
      if (searchQuery) {
        queryString += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await fetch(`/api/admin/appointments${queryString}`);
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      setAppointments(data.appointments);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to refresh appointments
  const refreshAppointments = () => {
    fetchAppointments();
  };
  
  // Effect to fetch appointments when page, filters change
  useEffect(() => {
    fetchAppointments();
  }, [pagination.page, statusFilter, startDate, endDate, searchQuery]);
  
  // Open appointment detail modal
  const openAppointmentModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.notes || '');
    setIsModalOpen(true);
  };
  
  // Close appointment detail modal
  const closeAppointmentModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
    setNotes('');
    setStatusToUpdate(null);
  };
  
  // Handle status update
  const updateAppointmentStatus = async () => {
    if (!selectedAppointment || !statusToUpdate) return;
    
    setUpdateLoading(true);
    try {
      const response = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedAppointment._id,
          status: statusToUpdate,
          notes,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }
      
      // Refresh the appointments list
      await fetchAppointments();
      
      // Close the modal
      closeAppointmentModal();
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the appointment');
    } finally {
      setUpdateLoading(false);
    }
  };
  
  // Handle page change
  const changePage = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination({
        ...pagination,
        page: newPage,
      });
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };
  
  // Format date for display
  const formatAppointmentDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Appointment Management</h1>
      
      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-medium text-gray-800">Filters</h2>
          <button 
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="text-gray-500 hover:text-gray-700 flex items-center text-sm font-medium"
          >
            {isFiltersOpen ? (
              <>
                <span className="mr-1">Hide Filters</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </>
            ) : (
              <>
                <span className="mr-1">Show Filters</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        </div>
        
        {isFiltersOpen && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Customer</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="pl-10 border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value={AppointmentStatus.PENDING_CUSTOMER}>Pending Customer</option>
                  <option value={AppointmentStatus.PENDING_ADMIN}>Pending Approval</option>
                  <option value={AppointmentStatus.CONFIRMED}>Confirmed</option>
                  <option value={AppointmentStatus.CANCELLED}>Cancelled</option>
                  <option value={AppointmentStatus.ARCHIVED}>Archived</option>
                  <option value={AppointmentStatus.COMPLETED}>Completed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={resetFilters}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Reset
              </button>
              <button
                onClick={fetchAppointments}
                className="px-3 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Apply Filters
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Appointment List Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center px-4 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-medium text-gray-800">Active Appointments</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {appointments.filter(appointment => appointment.status !== AppointmentStatus.ARCHIVED).length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center text-sm text-gray-600 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Archive size={16} className="mr-1" />
              {showArchived ? 'Hide Archived' : 'Show Archived'}
            </button>
            <button 
              onClick={refreshAppointments}
              className="flex items-center text-sm text-gray-600 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
              title="Refresh"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Active Appointments Table */}
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No appointments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments
                  .filter(appointment => appointment.status !== AppointmentStatus.ARCHIVED)
                  .map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-blue-50 transition-colors duration-150 group">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{appointment.name}</div>
                      <div className="text-sm text-gray-500">{appointment.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar size={16} className="mr-1 text-gray-500" />
                        {formatAppointmentDate(appointment.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock size={16} className="mr-1" />
                        {appointment.time}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={appointment.status} />
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatAppointmentDate(appointment.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => openAppointmentModal(appointment)}
                        className="bg-white group-hover:bg-blue-500 text-blue-600 group-hover:text-white px-3 py-1.5 rounded-md text-sm font-medium border border-blue-200 hover:border-blue-500 shadow-sm transition-all duration-200"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Archived Appointments Section (only shown when showArchived is true) */}
      {showArchived && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-medium text-gray-800">Archived Appointments</h2>
              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {appointments.filter(appointment => appointment.status === AppointmentStatus.ARCHIVED).length}
              </span>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appointments
                    .filter(appointment => appointment.status === AppointmentStatus.ARCHIVED)
                    .map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50 transition-colors duration-150 group bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-700">{appointment.name}</div>
                        <div className="text-sm text-gray-500">{appointment.email}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center text-sm text-gray-700">
                          <Calendar size={16} className="mr-1 text-gray-500" />
                          {formatAppointmentDate(appointment.date)}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock size={16} className="mr-1" />
                          {appointment.time}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={appointment.status} />
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatAppointmentDate(appointment.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => openAppointmentModal(appointment)}
                          className="bg-white group-hover:bg-gray-200 text-gray-600 group-hover:text-gray-800 px-3 py-1.5 rounded-md text-sm font-medium border border-gray-200 hover:border-gray-300 shadow-sm transition-all duration-200"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {appointments.filter(appointment => appointment.status === AppointmentStatus.ARCHIVED).length === 0 && (
                <div className="p-6 text-center text-gray-500">No archived appointments found</div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Appointment Detail Modal */}
      {isModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 animate-fadeInFast">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-800">Appointment Details</h2>
                <button
                  onClick={closeAppointmentModal}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                  aria-label="Close"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                    <User size={18} className="text-blue-500 mr-2" />
                    Customer Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-gray-600 w-24">Name:</span>
                      <span className="text-gray-800 font-medium">{selectedAppointment.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 w-24">Email:</span>
                      <a href={`mailto:${selectedAppointment.email}`} className="text-blue-600 hover:underline font-medium">
                        {selectedAppointment.email}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 w-24">Phone:</span>
                      <a href={`tel:${selectedAppointment.phone}`} className="text-blue-600 hover:underline font-medium">
                        {selectedAppointment.phone}
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                    <Calendar size={18} className="text-blue-500 mr-2" />
                    Appointment Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-gray-600 w-24">Date:</span>
                      <span className="text-gray-800 font-medium">{formatAppointmentDate(selectedAppointment.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 w-24">Time:</span>
                      <span className="text-gray-800 font-medium">{selectedAppointment.time}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 w-24">Status:</span>
                      <StatusBadge status={selectedAppointment.status} />
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedAppointment.message && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-700 mb-2">Customer Message</h3>
                  <div className="p-3 bg-gray-50 rounded-md text-gray-700">
                    {selectedAppointment.message}
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                  <FilePen size={18} className="mr-2" />
                  Notes
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Add notes about this appointment..."
                />
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-md font-semibold text-gray-700 mb-3">Update Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  <button
                    onClick={() => setStatusToUpdate(AppointmentStatus.PENDING_ADMIN)}
                    className={`p-2.5 border rounded-md flex items-center justify-center transition-all duration-200 ${
                      statusToUpdate === AppointmentStatus.PENDING_ADMIN
                        ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                        : 'hover:bg-gray-50 border-gray-300 text-gray-700'
                    }`}
                  >
                    <Info size={16} className="mr-1.5" />
                    Pending
                  </button>
                  
                  <button
                    onClick={() => setStatusToUpdate(AppointmentStatus.CONFIRMED)}
                    className={`p-2.5 border rounded-md flex items-center justify-center transition-all duration-200 ${
                      statusToUpdate === AppointmentStatus.CONFIRMED
                        ? 'bg-green-50 border-green-300 text-green-700 shadow-sm'
                        : 'hover:bg-gray-50 border-gray-300 text-gray-700'
                    }`}
                  >
                    <CheckCircle size={16} className="mr-1.5" />
                    Confirm
                  </button>
                  
                  <button
                    onClick={() => setStatusToUpdate(AppointmentStatus.CANCELLED)}
                    className={`p-2.5 border rounded-md flex items-center justify-center transition-all duration-200 ${
                      statusToUpdate === AppointmentStatus.CANCELLED
                        ? 'bg-red-50 border-red-300 text-red-700 shadow-sm'
                        : 'hover:bg-gray-50 border-gray-300 text-gray-700'
                    }`}
                  >
                    <XCircle size={16} className="mr-1.5" />
                    Cancel
                  </button>
                  
                  <button
                    onClick={() => setStatusToUpdate(AppointmentStatus.COMPLETED)}
                    className={`p-2.5 border rounded-md flex items-center justify-center transition-all duration-200 ${
                      statusToUpdate === AppointmentStatus.COMPLETED
                        ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-sm'
                        : 'hover:bg-gray-50 border-gray-300 text-gray-700'
                    }`}
                  >
                    <CheckCircle size={16} className="mr-1.5" />
                    Complete
                  </button>
                  
                  <button
                    onClick={() => setStatusToUpdate(AppointmentStatus.ARCHIVED)}
                    className={`p-2.5 border rounded-md flex items-center justify-center transition-all duration-200 ${
                      statusToUpdate === AppointmentStatus.ARCHIVED
                        ? 'bg-gray-200 border-gray-400 text-gray-800 shadow-sm'
                        : 'hover:bg-gray-50 border-gray-300 text-gray-700'
                    }`}
                  >
                    <Archive size={16} className="mr-1.5" />
                    Archive
                  </button>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeAppointmentModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateAppointmentStatus}
                    disabled={!statusToUpdate || updateLoading}
                    className={`px-4 py-2 rounded-md text-white transition-colors duration-200 ${
                      !statusToUpdate || updateLoading
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {updateLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                    ) : 'Update Appointment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage; 