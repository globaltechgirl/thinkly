import { CSSProperties, FC, useState } from "react";
import { useEffect } from "react";

import { Box, Select, Text, Loader } from "@mantine/core";
import { IconChevronRight, IconUserCircle, IconX } from "@tabler/icons-react";
/* import { IconUser } from 'nucleo-glass'; */

import { useUsers } from "@/hooks/use-users";

import { notifyErrorOnce, notifySuccess } from "@/api/notify";
import API from "@/api/api";

const Profile: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [screenMode, setScreenMode] = useState<"small" | "medium" | "large">("large");

  useEffect(() => {
    const checkScreenMode = () => {
      setScreenMode(window.innerWidth < 768 ? "small" : window.innerWidth < 1024 ? "medium" : "large");
    };

    checkScreenMode();
    window.addEventListener("resize", checkScreenMode);
    return () => window.removeEventListener("resize", checkScreenMode);
  }, []);

  const styles: Record<string, CSSProperties> = {
    container: {
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.3)",
      backdropFilter: "blur(2px)",
      WebkitBackdropFilter: "blur(2px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: screenMode === "small" ? 18 : 0,
    },
    wrapper: {
      width: "100%",
      maxWidth: screenMode === "small" ? "none" : 600,
      ...(screenMode === "small" ? {
        height: "100%",
        overflowY: "auto" as const,
      } : {
        maxHeight: "90vh",
      }),
      animation: "slideInTop 0.3s ease",
      borderRadius: 12,
      backgroundColor: "var(--light-400)",
      border: "2px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
      padding: 15
    },
    main: {
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      width: "100%",
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "column",
      gap: 35
    },
    header: {
      height: "100%",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: {
      fontSize: "clamp(13px, 1.1vw, 15px)",
      fontWeight: 450,
      color: "var(--dark-100)",
    },
    close: {
      width: 16,
      height: 16,
      color: "var(--dark-200)",
      cursor: "pointer",
    },
    content: {
      flex: 1,                 
      minHeight: 0,
      display: "flex",  
      flexDirection: "column",
      width: "100%",
      gap: 25,
      minWidth: 0,
    },
    inputs: {
      display: "flex",
      flexDirection: screenMode === "small" ? "column" : "row",
      gap: 20,
      width: "100%",
    },
    label: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      marginTop: 2,
      width: 120,
    },
    input: {
      flex: 1,
      padding: "0 12px",
      minHeight: 42,
      height: 42,          
      lineHeight: "40px",    
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      borderRadius: 10,
      backgroundColor: "var(--light-400)",
      border: "1.5px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
      display: "flex",
      alignItems: "center",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      outline: "none",
    },
    profile: {
      width: 100,
      height: 100,
      borderRadius: 10,
      backgroundColor: "var(--light-400)",
      border: "1.5px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "top",
      borderRadius: 10,
    },
    icon: {
      width: 26,
      height: 26,
      color: "var(--dark-200)"
    },
    button: {
      width: "fit-content",
      padding: "0 12px",
      height: 42,
      cursor: "pointer",
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      borderRadius: 10,
      border: "1.5px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background-color 0.2s ease",
      marginLeft: "auto"
    },
  };

  const { getProfile, updateProfile, loading } = useUsers();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "user" as "user" | "admin",
  });

  const [hovered, setHovered] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const typeOptions = [
    { value: "user", label: "User" },
    { value: "admin", label: "Admin" },
  ];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const user = await getProfile();
        if (!user || !mounted) return;

        setFormData({
          fullName: user.fullName || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
          role: user.role === "admin" ? "admin" : "user",
        });

        setAvatar(user.profilePicture || null);
      } catch (err) {
        notifyErrorOnce(err);
      }
    };

    loadProfile();

    return () => { mounted = false; };
  }, []);

  const handleFormChange = (field: keyof typeof formData, value: string) => {
    if (value.length > 300) return;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const uploadImage = async (file: File) => {
    const formDataUpload = new FormData();
    formDataUpload.append("images", file, file.name);

    const res = await API.post("/uploads/cloud", formDataUpload, {
      headers: { "Content-Type": "multipart/form-data", },
    });

    return res.data.urls?.[0];
  };

  const handleFileChange = async (file?: File) => {
    if (!file) return;

    try {
      setAvatarUploading(true);
      const url = await uploadImage(file);
      setAvatar(url);
    } catch (err) {
      notifyErrorOnce(err);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        profilePicture: avatar || undefined,
        role: formData.role,
      });

      notifySuccess("Profile updated successfully");
      onClose();
    } catch (err) {
      notifyErrorOnce(err);
    }
  };

  return (
    <Box style={styles.container}>
      <Box onClick={(e) => e.stopPropagation()} style={styles.wrapper} className="scroll">
        <Box style={styles.main}>
          <Box style={styles.header}>
            <Text style={styles.title}>Update Profile</Text>
            <IconX style={styles.close} onClick={onClose} />
          </Box>

          <Box style={styles.content}>
            <Box style={styles.inputs}>
              <label style={styles.label}>Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                id="avatarUpload"
                style={{ display: "none" }}
                onChange={(e) => { const file = e.target.files?.[0]; if (file) { handleFileChange(file); } }}
              />

              <label htmlFor="avatarUpload" style={styles.profile}>
                {avatarUploading ? (
                  <Loader size={18} color="var(--dark-200)" />
                ) : avatar ? (
                  <img src={avatar} alt="avatar" style={styles.image} />
                ) : (
                  <IconUserCircle style={styles.icon} />
                )}
              </label>
            </Box>

            <Box style={styles.inputs}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                style={styles.input}
                value={formData.fullName}
                onChange={(e) => handleFormChange("fullName", e.target.value) }
                placeholder="John Doe"
              />
            </Box>

            <Box style={styles.inputs}>
              <label style={styles.label}>Email Address</label>
              <input
                type="text"
                style={styles.input}
                value={formData.email}
                onChange={(e) => handleFormChange("email", e.target.value) }
                placeholder="exampl@gmail.com"
              />
            </Box>

            <Box style={styles.inputs}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                style={styles.input}
                value={formData.phoneNumber}
                onChange={(e) => handleFormChange("phoneNumber", e.target.value) }
                placeholder="+2348012345678"
              />
            </Box>

            <Box style={styles.inputs}>
              <label style={styles.label}>Role</label>
              <Select
                style={{ width: screenMode === "small" ? "100%" : "75%", marginLeft: screenMode === "small" ? "0" : "auto" }}
                data={typeOptions}
                value={formData.role}
                onChange={(val) => setFormData((prev) => ({...prev, role: (val as "user" | "admin") || "user", })) }
                rightSection={<IconChevronRight style={{ width: 14, height: 14 }} />}
                rightSectionWidth={28}
                withCheckIcon={false}
                styles={{
                  input: { ...styles.input, width: "100%" },
                  dropdown: { zIndex: 10000, backgroundColor: "var(--light-400)", border: "1.5px solid var(--border-100)", boxShadow: "inset 0 0 0 1px var(--border-300)", borderRadius: 10 },
                  option: { fontSize: "clamp(11px, 0.9vw, 13px)", fontWeight: 450, color: "var(--dark-200)", "&[data-combobox-selected]": { backgroundColor: "var(--light-400)", borderRadius: 10 }, },
                }}
              />
            </Box>

            <Box 
              style={{ ...styles.button, backgroundColor: hovered ? "var(--light-400)" : "var(--light-200)", opacity: loading ? 0.7 : 1, pointerEvents: loading ? "none" : "auto" }}
              onClick={handleSave}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              {loading ? "Updating..." : "Update Profile"}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;