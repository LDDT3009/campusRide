import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Car, Lock, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { useCampusRide } from '../context/CampusRideContext';
import { normalizeGhanaPhone } from '../data/uccData';
import { CampusZone, UserRole } from '../types/campus';

const ROLE_DESTINATIONS: Record<UserRole, string> = {
  passenger: '/passenger',
  driver: '/driver',
  admin: '/admin',
};

const DEMO_SHORTCUTS: Array<{
  label: string;
  role: UserRole;
  email: string;
  note: string;
}> = [
  {
    label: 'Passenger (Akosua Darko)',
    role: 'passenger',
    email: 'akosua.darko@stu.ucc.edu.gh',
    note: 'Valco Hall · Active student',
  },
  {
    label: 'Verified Driver (Kwame Mensah)',
    role: 'driver',
    email: 'kwame.mensah@campusride.ucc.gh',
    note: 'Toyota Corolla · CR 4821-24',
  },
  {
    label: 'Pending Driver (Yaw Asante)',
    role: 'driver',
    email: 'yaw.asante@campusride.ucc.gh',
    note: 'Awaiting Admin verification',
  },
  {
    label: 'Admin (Dr. Efua Sarpong)',
    role: 'admin',
    email: 'transport.dispatch@ucc.edu.gh',
    note: 'Campus Transport Directorate',
  },
];

export const AuthPage: React.FC = () => {
  const { currentUser, loginUser, registerUser } = useCampusRide();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialMode =
    searchParams.get('mode') === 'register' ? 'register' : 'login';
  const paramRole = searchParams.get('role') as UserRole | null;
  const initialRole: UserRole =
    paramRole && ['passenger', 'driver', 'admin'].includes(paramRole)
      ? paramRole
      : 'passenger';

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);

  // Login fields
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studentOrStaffId, setStudentOrStaffId] = useState('');
  const [hallOrDepartment, setHallOrDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Driver-specific registration fields
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('Silver');
  const [plateNumber, setPlateNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [homeZone, setHomeZone] = useState<CampusZone>('New Site');

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      navigate(ROLE_DESTINATIONS[currentUser.role], { replace: true });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const nextMode = searchParams.get('mode');
    const nextRole = searchParams.get('role') as UserRole | null;
    const resolvedRole: UserRole =
      nextRole && ['passenger', 'driver', 'admin'].includes(nextRole)
        ? nextRole
        : role;

    if (nextRole && ['passenger', 'driver', 'admin'].includes(nextRole)) {
      setRole(nextRole);
    }

    if (resolvedRole === 'admin') {
      setMode('login');
    } else if (nextMode === 'login' || nextMode === 'register') {
      setMode(nextMode);
    }
    setErrorMsg('');
  }, [searchParams]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Enter your email address or UCC ID.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Enter your password.');
      return;
    }

    const res = loginUser(identifier, loginPassword, role);
    if (!res.ok || !res.user) {
      setErrorMsg(res.error || 'Unable to sign in.');
      return;
    }

    navigate(ROLE_DESTINATIONS[res.user.role], { replace: true });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (name.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    const normalizedPhone = normalizeGhanaPhone(phone);
    if (!normalizedPhone) {
      setErrorMsg(
        'Enter a valid Ghana +233 phone number (e.g. +233 24 519 8832 or 0245198832).'
      );
      return;
    }
    if (studentOrStaffId.trim().length < 3) {
      setErrorMsg(
        role === 'passenger'
          ? 'Enter your UCC Student ID (e.g. PS/CSC/22/0148).'
          : role === 'driver'
            ? 'Enter your Driver Union ID.'
            : 'Enter your UCC Staff ID.'
      );
      return;
    }
    if (hallOrDepartment.trim().length < 2) {
      setErrorMsg(
        role === 'passenger'
          ? 'Enter your Hall of Residence or Department.'
          : role === 'driver'
            ? 'Enter your primary UCC taxi rank.'
            : 'Enter your administrative unit.'
      );
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (role === 'driver') {
      if (vehicleModel.trim().length < 3) {
        setErrorMsg('Enter your vehicle make and model.');
        return;
      }
      if (plateNumber.trim().length < 5) {
        setErrorMsg('Enter a valid Ghana vehicle plate (e.g. CR 4821-24).');
        return;
      }
      if (licenseNumber.trim().length < 5) {
        setErrorMsg('Enter your DVLA driver license number.');
        return;
      }
    }

    const res = registerUser({
      name,
      role,
      phone: normalizedPhone,
      email,
      password,
      studentOrStaffId,
      hallOrDepartment,
      vehicleModel,
      vehicleColor,
      plateNumber,
      licenseNumber,
      homeZone,
    });

    if (!res.ok || !res.user) {
      setErrorMsg(res.error || 'Could not complete registration.');
      return;
    }

    navigate(ROLE_DESTINATIONS[res.user.role], { replace: true });
  };

  const handleDemoQuickLogin = (demoEmail: string, demoRole: UserRole) => {
    setRole(demoRole);
    const res = loginUser(demoEmail, 'password123', demoRole);
    if (res.ok && res.user) {
      navigate(ROLE_DESTINATIONS[res.user.role], { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#202938] flex flex-col">
      <header className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0"
          >
            <span className="w-8 h-8 rounded-lg bg-[#142B4A] flex items-center justify-center">
              <Car className="w-4 h-4 text-[#FF8A34]" />
            </span>
            <span className="text-lg font-bold tracking-[-0.02em] text-[#142B4A]">
              CampusRide
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#142B4A] hover:text-[#FF8A34]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Auth Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-md p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#142B4A]">
                {mode === 'login'
                  ? 'Sign in to CampusRide'
                  : 'Create a CampusRide Account'}
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                {mode === 'login'
                  ? 'Access your UCC student, driver, or dispatch dashboard.'
                  : 'Register with your UCC details and Ghanaian +233 phone number.'}
              </p>
            </div>

            <div className="flex items-center p-1 bg-[#F2F4F6] border border-[#E2E8F0] rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-[#142B4A] shadow-sm'
                    : 'text-[#64748B]'
                }`}
              >
                Sign In
              </button>
              {role !== 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white text-[#142B4A] shadow-sm'
                      : 'text-[#64748B]'
                  }`}
                >
                  Register
                </button>
              )}
            </div>
          </div>

          {/* Role Selector Tabs */}
          <div>
            <span className="block text-xs font-semibold text-[#202938] mb-2">
              Select Account Role
            </span>
            <div className="grid grid-cols-3 gap-2 p-1 bg-[#F2F4F6] rounded-xl border border-[#E2E8F0]">
              {(['passenger', 'driver', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    if (r === 'admin') {
                      setMode('login');
                    }
                    setErrorMsg('');
                  }}
                  className={`h-10 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                    role === r
                      ? 'bg-[#142B4A] text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#142B4A]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            {role === 'admin' && (
              <p className="text-[11px] text-[#64748B] mt-2">
                Administrator accounts are provisioned internally by the UCC Directorate of Campus Transport and cannot be registered publicly.
              </p>
            )}
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-[#FFE4E6] border border-[#FDA4AF] text-xs font-semibold text-[#93000A]"
            >
              {errorMsg}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor="login-identifier"
                  className="block text-xs font-semibold text-[#202938] mb-1"
                >
                  Email Address or UCC ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      role === 'passenger'
                        ? 'akosua.darko@stu.ucc.edu.gh'
                        : role === 'driver'
                          ? 'kwame.mensah@campusride.ucc.gh'
                          : 'transport.dispatch@ucc.edu.gh'
                    }
                    className="w-full h-11 pl-9 pr-3 rounded-lg border border-[#CBD5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-[#202938] mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password (demo: password123)"
                    className="w-full h-11 pl-9 pr-3 rounded-lg border border-[#CBD5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-lg bg-[#FF8A34] hover:bg-[#E57523] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleRegisterSubmit}
              noValidate
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#202938] mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ama Serwaa"
                      className="w-full h-11 pl-9 pr-3 rounded-lg border border-[#CBD5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202938] mb-1">
                    Ghana Phone (+233)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+233 24 519 8832"
                      className="w-full h-11 pl-9 pr-3 rounded-lg border border-[#CBD5E1] text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202938] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ama.serwaa@stu.ucc.edu.gh"
                    className="w-full h-11 px-3 rounded-lg border border-[#CBD5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202938] mb-1">
                    {role === 'passenger'
                      ? 'UCC Student ID'
                      : role === 'driver'
                        ? 'Driver Union ID'
                        : 'UCC Staff ID'}
                  </label>
                  <input
                    type="text"
                    value={studentOrStaffId}
                    onChange={(e) => setStudentOrStaffId(e.target.value)}
                    placeholder={
                      role === 'passenger'
                        ? 'PS/CSC/23/0112'
                        : role === 'driver'
                          ? 'UCC-DRV-150'
                          : 'UCC-STF-045'
                    }
                    className="w-full h-11 px-3 rounded-lg border border-[#CBD5E1] text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#202938] mb-1">
                    {role === 'passenger'
                      ? 'Hall of Residence & Programme'
                      : role === 'driver'
                        ? 'Campus Taxi Rank / Union Branch'
                        : 'Administrative Directorate'}
                  </label>
                  <input
                    type="text"
                    value={hallOrDepartment}
                    onChange={(e) => setHallOrDepartment(e.target.value)}
                    placeholder={
                      role === 'passenger'
                        ? 'Oguaa Hall · BSc Information Technology'
                        : role === 'driver'
                          ? 'Valco & New Site Taxi Rank'
                          : 'Directorate of Campus Transport'
                    }
                    className="w-full h-11 px-3 rounded-lg border border-[#CBD5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
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
                        placeholder="Toyota Corolla (Silver)"
                        className="w-full h-11 px-3 rounded-lg border border-[#CBD5E1] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#202938] mb-1">
                        Vehicle Color
                      </label>
                      <input
                        type="text"
                        value={vehicleColor}
                        onChange={(e) => setVehicleColor(e.target.value)}
                        placeholder="Silver"
                        className="w-full h-11 px-3 rounded-lg border border-[#CBD5E1] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#202938] mb-1">
                        Ghana Plate Number
                      </label>
                      <input
                        type="text"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        placeholder="CR 5402-25"
                        className="w-full h-11 px-3 rounded-lg border border-[#CBD5E1] text-sm tabular-nums"
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
                        placeholder="DVLA-CR-61204"
                        className="w-full h-11 px-3 rounded-lg border border-[#CBD5E1] text-sm tabular-nums"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#202938] mb-1">
                        Primary UCC Zone
                      </label>
                      <select
                        value={homeZone}
                        onChange={(e) =>
                          setHomeZone(e.target.value as CampusZone)
                        }
                        className="w-full h-11 px-3 rounded-lg border border-[#CBD5E1] text-sm bg-white"
                      >
                        <option value="New Site">New Site</option>
                        <option value="Old Site">Old Site</option>
                        <option value="Central Academic">
                          Central Academic
                        </option>
                        <option value="Hostel Corridor">Hostel Corridor</option>
                        <option value="Highway Gate">Highway Gate</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#202938] mb-1">
                    Password (min 6 chars)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create password"
                    className="w-full h-11 px-3 rounded-lg border border-[#CBD5E1] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202938] mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full h-11 px-3 rounded-lg border border-[#CBD5E1] text-sm"
                  />
                </div>
              </div>

              {role === 'driver' && (
                <div className="p-3 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-xs text-[#92400E]">
                  New driver accounts start in <strong>Pending Verification</strong> status. An Admin must verify your DVLA license before you can go online or accept rides.
                </div>
              )}

              <button
                type="submit"
                className="w-full h-11 rounded-lg bg-[#FF8A34] hover:bg-[#E57523] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Register {role.charAt(0).toUpperCase() + role.slice(1)} Account
              </button>
            </form>
          )}
        </div>

        {/* Demo Quick Access Panel */}
        <aside className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#142B4A]">
              <ShieldCheck className="w-4 h-4 text-[#22A06B]" />
              <span>Quick Demo Sign-In (Password: password123)</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Sign in immediately with any pre-seeded UCC role account to test booking, driver verification enforcement, or dispatch administration.
            </p>

            <div className="space-y-2.5">
              {DEMO_SHORTCUTS.map((item) => (
                <button
                  key={item.email}
                  type="button"
                  onClick={() => handleDemoQuickLogin(item.email, item.role)}
                  className="w-full text-left p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#142B4A] hover:bg-[#F8FAFC] transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div>
                    <div className="text-sm font-bold text-[#142B4A]">
                      {item.label}
                    </div>
                    <div className="text-xs text-[#64748B] mt-0.5">
                      {item.note}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#FF8A34] shrink-0">
                    Sign In →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};
