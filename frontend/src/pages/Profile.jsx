import React, { memo, useCallback, useEffect, useState } from "react";
import { profileStyles } from "../assets/dummyStyles";
import Modal from "react-modal";
import { Eye, EyeOff, User, Edit, Lock, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthHeader, API_URL } from "../../auth.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Removed BASE_URL — now using API_URL from authHeader util

Modal.setAppElement("#root");

const PasswordInput = memo(
  ({ name, label, value, error, showField, onToggle, onChange, disabled }) => (
    <div>
      <label className={profileStyles.passwordLabel}>{label}</label>
      <div className={profileStyles.passwordContainer}>
        <input
          type={showField ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          className={`${profileStyles.inputWithError} ${
            error ? "border-red-300" : "border-gray-200"
          }`}
          placeholder={`Enter ${label.toLowerCase()}`}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={onToggle}
          className={profileStyles.passwordToggle}
          disabled={disabled}
        >
          {showField ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
      {error && <p className={profileStyles.errorText}>{error}</p>}
    </div>
  ),
);

PasswordInput.displayName = "PasswordInput";

const Profile = ({ onUpdateProfile, onLogout }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState({ name: "", email: "", joinDate: "" });
  const [editMode, setEditMode] = useState(false);
  const [tempUser, setTempUser] = useState({ ...user });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ Uses getAuthHeader() from util, API_URL from util
  const handleApiRequest = useCallback(
    async (method, endpoint, data = null) => {
      const headers = getAuthHeader();
      if (!Object.keys(headers).length) {
        navigate("/login");
        return null;
      }
      try {
        setLoading(true);
        const config = {
          method,
          url: `${API_URL}${endpoint}`,
          headers,
        };
        if (data) config.data = data;
        const response = await axios(config);
        return response.data || {};
      } catch (error) {
        console.error(`${method} request error:`, error);
        if (error.response?.status === 401) navigate("/login");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );

  // Fetch current user on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await handleApiRequest("get", "/user/me");
        if (data) {
          const userData = data.user || data;
          setUser(userData);
          setTempUser(userData);
        }
      } catch {
        toast.error("Failed to load user data");
      }
    };
    fetchUserData();
  }, [handleApiRequest]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setTempUser((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const togglePasswordVisibility = useCallback((field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const handleSaveProfile = async () => {
    try {
      const data = await handleApiRequest("put", "/user/profile", tempUser);
      if (data) {
        const updatedUser = data.user || data;
        setUser(updatedUser);
        setTempUser(updatedUser);
        setEditMode(false);
        onUpdateProfile?.(updatedUser);
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleCancelEdit = useCallback(() => {
    setTempUser(user);
    setEditMode(false);
  }, [user]);

  const validatePassword = useCallback(() => {
    const errors = {};
    if (!passwordData.current) errors.current = "Current password is required";
    if (!passwordData.new) {
      errors.new = "New password is required";
    } else if (passwordData.new.length < 8) {
      errors.new = "Password must be at least 8 characters";
    }
    if (passwordData.new !== passwordData.confirm) {
      errors.confirm = "Passwords do not match";
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  }, [passwordData]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    try {
      await handleApiRequest("put", "/user/password", {
        currentPassword: passwordData.current,
        newPassword: passwordData.new,
      });
      toast.success("Password changed successfully!");
      closePasswordModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  const handleLogout = useCallback(() => {
    onLogout?.();
    navigate("/signup");
  }, [onLogout, navigate]);

  const closePasswordModal = useCallback(() => {
    if (!loading) {
      setShowPasswordModal(false);
      setPasswordData({ current: "", new: "", confirm: "" });
      setPasswordErrors({});
      setShowPassword({ current: false, new: false, confirm: false });
    }
  }, [loading]);

  return (
    <div className={profileStyles.container}>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className={profileStyles.mainContainer}>
        {/* Header / Avatar */}
        <div className={profileStyles.header}>
          <div className={profileStyles.avatar}>
            <User className="w-12 h-12 text-white" />
          </div>
          <h1 className={profileStyles.userName}>
            {user.name || "Loading..."}
          </h1>
          <p className={profileStyles.userEmail}>
            {user.email || "Loading..."}
          </p>
        </div>

        <div className={profileStyles.content}>
          <div className={profileStyles.grid}>
            {/* Personal Information Card */}
            <div className={profileStyles.card}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={profileStyles.cardTitle}>
                  <User className={profileStyles.icon} />
                  Personal Information
                </h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className={profileStyles.editButton}
                    disabled={loading}
                  >
                    <Edit className="w-4 h-4 inline mr-1" />
                    {loading ? "Loading..." : "Edit"}
                  </button>
                )}
              </div>

              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className={profileStyles.label}>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={tempUser.name}
                      onChange={handleInputChange}
                      className={profileStyles.input}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className={profileStyles.label}>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={tempUser.email}
                      onChange={handleInputChange}
                      className={profileStyles.input}
                      disabled={loading}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveProfile}
                      className={profileStyles.buttonPrimary}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className={profileStyles.buttonSecondary}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // ✅ View mode — shows both name and email
                <div className="space-y-4">
                  <div>
                    <p className={profileStyles.label}>Full Name</p>
                    <p className="font-medium text-gray-800">{user.name}</p>
                  </div>
                  <div>
                    <p className={profileStyles.label}>Email Address</p>
                    <p className="font-medium text-gray-800">{user.email}</p>
                  </div>
                  {user.joinDate && (
                    <div>
                      <p className={profileStyles.label}>Member Since</p>
                      <p className="font-medium text-gray-800">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ✅ Action buttons — Change Password & Logout */}
              {!editMode && (
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className={profileStyles.buttonSecondary}
                    disabled={loading}
                  >
                    <Lock className="w-4 h-4 inline mr-1" />
                    Change Password
                  </button>
                  <button
                    onClick={handleLogout}
                    className={
                      profileStyles.buttonDanger ||
                      "flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                    }
                  >
                    <LogOut className="w-4 h-4 inline mr-1" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Password Modal — was completely missing */}
      <Modal
        isOpen={showPasswordModal}
        onRequestClose={closePasswordModal}
        className={
          profileStyles.modal ||
          "bg-white rounded-xl p-6 max-w-md mx-auto mt-24 outline-none shadow-xl"
        }
        overlayClassName={
          profileStyles.overlay ||
          "fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50"
        }
      >
        <h2
          className={
            profileStyles.cardTitle ||
            "text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
          }
        >
          <Lock className="w-5 h-5" />
          Change Password
        </h2>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {[
            { field: "current", label: "Current Password" },
            { field: "new", label: "New Password" },
            { field: "confirm", label: "Confirm New Password" },
          ].map(({ field, label }) => (
            <PasswordInput
              key={field}
              name={field}
              label={label}
              value={passwordData[field]}
              error={passwordErrors[field]}
              showField={showPassword[field]}
              onToggle={() => togglePasswordVisibility(field)}
              onChange={handlePasswordChange}
              disabled={loading}
            />
          ))}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className={
                profileStyles.buttonPrimary ||
                "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              }
              disabled={loading}
            >
              {loading ? "Saving..." : "Change Password"}
            </button>
            <button
              type="button"
              onClick={closePasswordModal}
              className={
                profileStyles.buttonSecondary ||
                "px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
              }
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
