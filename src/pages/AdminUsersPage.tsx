import React, { useMemo, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { useCampusRide } from '../context/CampusRideContext';
import { normalizeGhanaPhone } from '../data/uccData';
import { UserRole } from '../types/campus';
import { StatusBadge } from '../components/StatusBadge';

export const AdminUsersPage: React.FC = () => {
  const { users, toggleUserStatus, addDemoUser } = useCampusRide();

  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Add user form state
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('passenger');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [studentOrStaffId, setStudentOrStaffId] = useState('');
  const [hallOrDepartment, setHallOrDepartment] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [formError, setFormError] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.studentOrStaffId.toLowerCase().includes(q) ||
          u.hallOrDepartment.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, roleFilter, search]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedPhone = normalizeGhanaPhone(phone);
    if (name.trim().length < 2) {
      setFormError('Please enter the user full name.');
      return;
    }
    if (!normalizedPhone) {
      setFormError(
        'Enter a valid Ghana +233 phone number (e.g. +233 24 123 4567).'
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Enter a valid email address.');
      return;
    }
    if (
      users.some(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      )
    ) {
      setFormError('A user with this email address already exists.');
      return;
    }
    if (!studentOrStaffId.trim()) {
      setFormError('Enter a UCC Student, Driver, or Staff ID.');
      return;
    }
    if (role === 'driver' && (!vehicleModel.trim() || !plateNumber.trim())) {
      setFormError('Enter vehicle model and Ghana plate number for drivers.');
      return;
    }

    setFormError('');
    addDemoUser({
      name,
      role,
      phone: normalizedPhone,
      email,
      studentOrStaffId,
      hallOrDepartment: hallOrDepartment || 'UCC Main Campus',
      vehicleModel,
      plateNumber,
      licenseNumber,
    });

    setName('');
    setPhone('');
    setEmail('');
    setStudentOrStaffId('');
    setHallOrDepartment('');
    setVehicleModel('');
    setPlateNumber('');
    setLicenseNumber('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#142B4A]">
            Campus User Directory
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Manage UCC students, registered drivers, and transport administrators.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="h-10 px-4 rounded-lg bg-[#142B4A] hover:bg-[#1E3A5F] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4" />
              <span>Close Form</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add User / Driver</span>
            </>
          )}
        </button>
      </div>

      {/* Add User / Driver Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-md p-5 sm:p-6 space-y-4"
        >
          <h2 className="text-base font-bold text-[#142B4A]">
            Register New CampusRide User
          </h2>
          {formError && (
            <p className="text-xs font-medium text-[#BE123C] bg-[#FFE4E6] px-3 py-2 rounded-lg">
              {formError}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#202938] mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kojo Appiah"
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202938] mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-sm bg-white"
              >
                <option value="passenger">Passenger (Student)</option>
                <option value="driver">Driver (Enters Verification Queue)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202938] mb-1">
                Ghana Phone (+233)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+233 24 600 1122"
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202938] mb-1">
                UCC / Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kojo.appiah@stu.ucc.edu.gh"
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202938] mb-1">
                Student / Driver / Staff ID
              </label>
              <input
                type="text"
                value={studentOrStaffId}
                onChange={(e) => setStudentOrStaffId(e.target.value)}
                placeholder="PS/CSC/23/0041"
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202938] mb-1">
                Hall / Rank / Department
              </label>
              <input
                type="text"
                value={hallOrDepartment}
                onChange={(e) => setHallOrDepartment(e.target.value)}
                placeholder="Oguaa Hall · Economics"
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-sm"
              />
            </div>

            {role === 'driver' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#202938] mb-1">
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="Toyota Vitz (White)"
                    className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#202938] mb-1">
                    License Plate
                  </label>
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="CR 5120-25"
                    className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#202938] mb-1">
                    DVLA License Number
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="DVLA-CR-70122"
                    className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-sm tabular-nums"
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="h-10 px-4 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#202938] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-5 rounded-lg bg-[#FF8A34] hover:bg-[#E57523] text-white text-xs font-semibold cursor-pointer"
            >
              Save User
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-[#F2F4F6] rounded-lg self-start">
          {(
            [
              { key: 'all', label: 'All Roles' },
              { key: 'passenger', label: 'Passengers' },
              { key: 'driver', label: 'Drivers' },
              { key: 'admin', label: 'Admins' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setRoleFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                roleFilter === tab.key
                  ? 'bg-white text-[#142B4A] shadow-sm'
                  : 'text-[#64748B] hover:text-[#142B4A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, ID, hall, or email"
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#F8F9FB] border border-[#CBD5E1] text-sm text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8F9FB] text-[11px] font-bold uppercase tracking-[0.04em] text-[#64748B]">
              <th className="py-3 px-5">Name & Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">UCC ID</th>
              <th className="py-3 px-4">Hall / Unit</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9] text-xs">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-[#F8FAFC]">
                <td className="py-3.5 px-5">
                  <div className="font-bold text-[#202938]">{user.name}</div>
                  <div className="text-[#64748B]">{user.email}</div>
                </td>
                <td className="py-3.5 px-4 capitalize font-semibold text-[#142B4A]">
                  {user.role}
                </td>
                <td className="py-3.5 px-4 font-medium text-[#202938] tabular-nums">
                  {user.studentOrStaffId}
                </td>
                <td className="py-3.5 px-4 text-[#64748B]">
                  {user.hallOrDepartment}
                </td>
                <td className="py-3.5 px-4 text-[#202938] tabular-nums">
                  {user.phone}
                </td>
                <td className="py-3.5 px-4">
                  <StatusBadge variant={user.status} />
                </td>
                <td className="py-3.5 px-5 text-right">
                  {user.role !== 'admin' ? (
                    <button
                      type="button"
                      onClick={() => toggleUserStatus(user.id)}
                      className={`h-8 px-3 rounded-md text-xs font-semibold cursor-pointer ${
                        user.status === 'active'
                          ? 'border border-[#FDA4AF] text-[#BE123C] hover:bg-[#FFE4E6]'
                          : 'bg-[#142B4A] text-white hover:bg-[#1E3A5F]'
                      }`}
                    >
                      {user.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </button>
                  ) : (
                    <span className="text-[#64748B]">Protected</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
