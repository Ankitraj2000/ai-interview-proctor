import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import userService from '../services/userService';
import { User, Mail, Phone, BookOpen, Wrench, Calendar, Camera, CheckCircle, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateUserData } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    skills: '',
    education: '',
    photo: '',
    createdAt: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userService.getProfile();
        const data = response.data;
        setProfileData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          skills: data.skills || '',
          education: data.education || '',
          photo: data.photo || '',
          createdAt: data.createdAt || ''
        });
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const response = await userService.updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        skills: profileData.skills,
        education: profileData.education,
        photo: profileData.photo
      });
      // Sync AuthContext user state so the Navbar changes
      updateUserData({
        firstName: profileData.firstName,
        lastName: profileData.lastName
      });
      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-dark-900 dark:text-slate-100 transition-colors duration-200">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-dark-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 space-y-8">
        <div className="text-left">
          <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">My Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View and update your personal details and experience info.</p>
        </div>

        {message && (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar / Summary Info Card */}
          <div className="md:col-span-1 bg-white dark:bg-dark-600 border dark:border-dark-400 rounded-3xl p-6 text-center space-y-6 shadow-sm h-fit">
            <div className="relative inline-block">
              {profileData.photo ? (
                <img 
                  src={profileData.photo} 
                  alt="Profile Avatar" 
                  className="w-32 h-32 rounded-full object-cover mx-auto border-2 border-brand-500" 
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-brand-500/10 border-2 border-dashed border-brand-500/30 text-brand-500 flex items-center justify-center mx-auto">
                  <User className="w-16 h-16 stroke-[1.5]" />
                </div>
              )}
              <label htmlFor="photo-upload" className="absolute bottom-1 right-1 p-2 bg-brand-500 text-white rounded-full cursor-pointer hover:bg-brand-600 shadow-md transition-all">
                <Camera className="h-4 w-4" />
                <input 
                  type="file" 
                  id="photo-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePhotoUpload} 
                />
              </label>
            </div>

            <div>
              <h2 className="font-bold text-lg text-slate-800 dark:text-white">
                {profileData.firstName} {profileData.lastName}
              </h2>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">{user?.roles?.join(', ')}</p>
            </div>

            <hr className="dark:border-dark-400" />

            <div className="space-y-3 text-left text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{profileData.email}</span>
              </div>
              {profileData.createdAt && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>Joined {new Date(profileData.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Form details section */}
          <div className="md:col-span-2 bg-white dark:bg-dark-600 border dark:border-dark-400 rounded-3xl p-8 space-y-6 shadow-sm text-left">
            <h3 className="font-bold text-lg dark:text-white">Account & Career Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border dark:border-dark-400 bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border dark:border-dark-400 bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border dark:border-dark-400 bg-slate-100 dark:bg-dark-500 text-slate-500 dark:text-slate-300 text-xs cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border dark:border-dark-400 bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Education</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={profileData.education}
                  onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border dark:border-dark-400 bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="e.g. BS Computer Science, Stanford University"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Skills (comma-separated)</label>
              <div className="relative">
                <Wrench className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={profileData.skills}
                  onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border dark:border-dark-400 bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="e.g. React, Java, Spring Boot, Python, SQL"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
      <footer className="py-6 border-t dark:border-dark-400 glass text-center text-xs text-slate-500 dark:text-slate-400">
        &copy; {new Date().getFullYear()} ProctorPro Inc. Secured AI Proctored Evaluations. All rights reserved.
      </footer>
    </div>
  );
};

export default Profile;
