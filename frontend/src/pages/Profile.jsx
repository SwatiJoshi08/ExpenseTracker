import React, { memo, useCallback, useEffect, useState } from "react";
import { profileStyles } from "../assets/dummyStyles";
import Modal from "react-modal";
import { Eye, EyeOff, User, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "http://localhost:4000/api";

Modal.setAppElement("#root");
// Move PasswordInput component outside of ProfilePage to prevent recreation on every render
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
          // Add key prop to help React identify the input
          key={`password-input-${name}`}
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
  const [user, setUser] = useState({
    name: "",
    email: "",
    joinDate: "",
  });
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

  const getAuthToken = useCallback(() => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  }, []);

  //API request
  const handleApiRequest = useCallback(
    async (method, endpoint, data = null) => {
      const token = getAuthToken();
      if (!token) {
        navigate("/login");
        return null;
      }
      try {
        setLoading(true);
        const config = {
          method,
          url: `${BASE_URL}${endpoint}`,
          headers: { Authorization: `Bearer ${token}` },
        };
        if (data) config.data = data;
        const response = await axios(config);
        return response.data;
      } catch (error) {
        console.error(`${method} request error:`, error);
        if (error.response?.status === 401) {
          navigate("/login");
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [getAuthToken, navigate],
  );

  //to fetch current user
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await handleApiRequest("get", "/user/me");
        if (data) {
          const userData = data.user || data;
          setUser(userData);
          setTempUser(userData);
        }
      } catch (error) {
        toast.error("Failed to load user data");
      }
    };
    fetchUserData();
  }, [handleApiRequest]);

  //input change
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setTempUser((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  // Password visibility toggle
  const togglePasswordVisibility = useCallback((field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  //save profile
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

  //Password validation
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

  //to change password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      await handleApiRequest("put", "/user/password", {
        currentPassword: passwordData.current,
        newPassword: passwordData.new,
      });

      toast.success("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordData({ current: "", new: "", confirm: "" });
      setPasswordErrors({});

      //reset password visibility
      setShowPassword({ current: false, new: false, confirm: false });
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

      //reset password visibility
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
                    {loading ? "Loading..." : "Edit"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
