// src/screens/Profile/ProfileScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../hooks/useAuth";
import { uploadImageToCloudinary } from "../../config/cloudinary";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZES,
  CITIES,
  OCCUPATIONS,
} from "../../utils/constants";

const ProfileScreen = () => {
  const { profile, isVerified, isAdmin, updateProfile, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    gender: profile?.gender || "",
    guardian_type: profile?.guardian_type || "father",
    guardian_name: profile?.guardian_name || "",
    city: profile?.city || "",
    address: profile?.address || "",
    pincode: profile?.pincode || "",
    occupation: profile?.occupation || "",
    photo_url: profile?.photo_url || "",
  });

  // Sync formData when profile updates (e.g. after onboarding or refresh)
  useEffect(() => {
    if (profile && !editing) {
      setFormData({
        full_name: profile.full_name || "",
        gender: profile.gender || "",
        guardian_type: profile.guardian_type || "father",
        guardian_name: profile.guardian_name || "",
        city: profile.city || "",
        address: profile.address || "",
        pincode: profile.pincode || "",
        occupation: profile.occupation || "",
        photo_url: profile.photo_url || "",
      });
    }
  }, [profile]);

  const handleImagePick = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        const localUri = result.assets[0].uri;
        // Immediately show the picked image as preview
        setFormData((prev) => ({ ...prev, photo_url: localUri }));

        // Auto-upload to Cloudinary and persist
        try {
          setLoading(true);
          const uploadResult = await uploadImageToCloudinary(
            localUri,
            "profiles",
          );
          if (!uploadResult.success) throw new Error(uploadResult.error);

          // Merge with full profile so upsert doesn't wipe other fields
          const { error } = await updateProfile({
            ...profile,
            photo_url: uploadResult.url,
          });
          if (error) throw error;

          setFormData((prev) => ({ ...prev, photo_url: uploadResult.url }));
          Alert.alert("Success", "Profile photo updated!");
        } catch (uploadError) {
          console.error("Photo upload error:", uploadError);
          Alert.alert(
            "Error",
            "Failed to update photo: " + uploadError.message,
          );
          // Revert preview on failure
          setFormData((prev) => ({
            ...prev,
            photo_url: profile?.photo_url || "",
          }));
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Image pick error:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      Alert.alert("Required", "Please enter your name");
      return;
    }

    try {
      setLoading(true);

      let photoUrl = formData.photo_url;

      // Upload photo to Cloudinary if changed
      if (
        formData.photo_url &&
        formData.photo_url !== profile?.photo_url &&
        formData.photo_url.startsWith("file://")
      ) {
        console.log("Uploading image to Cloudinary...");

        const uploadResult = await uploadImageToCloudinary(
          formData.photo_url,
          "profiles",
        );

        if (uploadResult.success) {
          photoUrl = uploadResult.url;
          console.log("Image uploaded successfully:", photoUrl);
        } else {
          throw new Error("Failed to upload image: " + uploadResult.error);
        }
      }
      console.log("data to be sent - ", {
        full_name: formData.full_name,
        gender: formData.gender,
        guardian_type: formData.guardian_type,
        guardian_name: formData.guardian_name,
        phone: formData.phone ?? profile?.phone,
        email: formData.email ?? profile?.email,
        city: formData.city,
        address: formData.address,
        pincode: formData.pincode,
        occupation: formData.occupation,
        photo_url: photoUrl,
      });
      const { error } = await updateProfile({
        full_name: formData.full_name,
        gender: formData.gender,
        guardian_type: formData.guardian_type,
        guardian_name: formData.guardian_name,
        phone: formData.phone ?? profile?.phone,
        email: formData.email ?? profile?.email,
        city: formData.city,
        address: formData.address,
        pincode: formData.pincode,
        occupation: formData.occupation,
        photo_url: photoUrl,
      });

      if (error) throw error;

      Alert.alert("Success", "Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("User initiated sign out");
            const { error } = await signOut();

            if (error) {
              Alert.alert("Error", "Failed to sign out: " + error.message);
            } else {
              console.log("Sign out successful, clearing app state...");

              // Clear any local state
              setFormData({
                full_name: "",
                gender: "",
                guardian_type: "father",
                guardian_name: "",
                city: "",
                address: "",
                pincode: "",
                occupation: "",
                photo_url: "",
              });

              // Force navigation to login (AppNavigator will handle this)
              console.log("Waiting for navigation to login...");
            }
          } catch (err) {
            console.error("Sign out exception:", err);
            Alert.alert("Error", "An error occurred during sign out");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <Card style={styles.headerCard} variant="elevated">
        <View style={styles.profileHeader}>
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handleImagePick}
            >
              {formData.photo_url ? (
                <Image
                  source={{ uri: formData.photo_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={60} color={COLORS.gray400} />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={20} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.name}>{profile?.full_name || "User"}</Text>
            <View style={styles.statusBadge}>
              {isVerified ? (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={COLORS.success}
                  />
                  <Text style={styles.verifiedText}>Verified Member</Text>
                </>
              ) : (
                <>
                  <Ionicons name="time" size={16} color={COLORS.warning} />
                  <Text style={styles.pendingText}>Verification Pending</Text>
                </>
              )}
            </View>
            {isAdmin && (
              <View style={styles.adminBadge}>
                <Ionicons
                  name="shield-checkmark"
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={styles.adminText}>Admin</Text>
              </View>
            )}
          </View>
        </View>
      </Card>

      {/* Profile Info */}
      <Card style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Profile Information</Text>
          <TouchableOpacity
            onPress={() => {
              if (editing) {
                setFormData({
                  full_name: profile?.full_name || "",
                  gender: profile?.gender || "",
                  guardian_type: profile?.guardian_type || "father",
                  guardian_name: profile?.guardian_name || "",
                  city: profile?.city || "",
                  address: profile?.address || "",
                  pincode: profile?.pincode || "",
                  occupation: profile?.occupation || "",
                  photo_url: profile?.photo_url || "",
                });
              }
              setEditing(!editing);
            }}
          >
            <Text style={styles.editText}>{editing ? "Cancel" : "Edit"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Full Name</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={formData.full_name}
              onChangeText={(text) =>
                setFormData({ ...formData, full_name: text })
              }
              placeholder="Enter your name"
              placeholderTextColor={COLORS.gray400}
            />
          ) : (
            <Text style={styles.value}>{profile?.full_name || "-"}</Text>
          )}
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Gender</Text>
          {editing ? (
            <View style={styles.genderRow}>
              {["male", "female"].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderOption,
                    formData.gender === g && styles.genderOptionActive,
                  ]}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      gender: g,
                      guardian_type: g === "male" ? "father" : "father",
                      guardian_name: "",
                    })
                  }
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      formData.gender === g && styles.genderOptionTextActive,
                    ]}
                  >
                    {g === "male" ? "Male" : "Female"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.value}>
              {profile?.gender
                ? profile.gender === "male"
                  ? "Male"
                  : "Female"
                : "-"}
            </Text>
          )}
        </View>

        {(editing
          ? formData.gender === "female"
          : profile?.gender === "female") && (
          <View style={styles.infoGroup}>
            <Text style={styles.label}>Name Type</Text>
            {editing ? (
              <View style={styles.genderRow}>
                {["father", "husband"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.genderOption,
                      formData.guardian_type === t && styles.genderOptionActive,
                    ]}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        guardian_type: t,
                        guardian_name: "",
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.genderOptionText,
                        formData.guardian_type === t &&
                          styles.genderOptionTextActive,
                      ]}
                    >
                      {t === "father" ? "Father's Name" : "Husband's Name"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.value}>
                {profile?.guardian_type === "husband"
                  ? "Husband's Name"
                  : "Father's Name"}
              </Text>
            )}
          </View>
        )}

        {(formData.gender || profile?.gender) && (
          <View style={styles.infoGroup}>
            <Text style={styles.label}>
              {(() => {
                const gender = editing ? formData.gender : profile?.gender;
                const gType = editing
                  ? formData.guardian_type
                  : profile?.guardian_type;
                if (gender === "female" && gType === "husband")
                  return "Husband's Name";
                return "Father's Name";
              })()}
            </Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={formData.guardian_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, guardian_name: text })
                }
                placeholder={
                  formData.gender === "female" &&
                  formData.guardian_type === "husband"
                    ? "Enter husband's name"
                    : "Enter father's name"
                }
                placeholderTextColor={COLORS.gray400}
              />
            ) : (
              <Text style={styles.value}>{profile?.guardian_name || "-"}</Text>
            )}
          </View>
        )}

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>+91 {profile?.phone || "-"}</Text>
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{profile?.email || "-"}</Text>
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>City</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              placeholder="Enter your city"
              placeholderTextColor={COLORS.gray400}
            />
          ) : (
            <Text style={styles.value}>{profile?.city || "-"}</Text>
          )}
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Address</Text>
          {editing ? (
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: "top" }]}
              value={formData.address}
              onChangeText={(text) =>
                setFormData({ ...formData, address: text })
              }
              placeholder="Enter your full address"
              placeholderTextColor={COLORS.gray400}
              multiline
              numberOfLines={3}
            />
          ) : (
            <Text style={styles.value}>{profile?.address || "-"}</Text>
          )}
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Pincode</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={formData.pincode}
              onChangeText={(text) =>
                setFormData({ ...formData, pincode: text })
              }
              placeholder="Enter pincode"
              placeholderTextColor={COLORS.gray400}
              keyboardType="numeric"
              maxLength={6}
            />
          ) : (
            <Text style={styles.value}>{profile?.pincode || "-"}</Text>
          )}
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Occupation</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={formData.occupation}
              onChangeText={(text) =>
                setFormData({ ...formData, occupation: text })
              }
              placeholder="Enter your occupation"
              placeholderTextColor={COLORS.gray400}
            />
          ) : (
            <Text style={styles.value}>{profile?.occupation || "-"}</Text>
          )}
        </View>

        {editing && (
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={loading}
            fullWidth
            style={styles.saveButton}
          />
        )}
      </Card>

      {/* Account Actions */}
      <Card style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Account</Text>

        <TouchableOpacity style={styles.actionItem} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
          <Text style={[styles.actionText, { color: COLORS.error }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </Card>

      {/* App Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>JBP Agrawal Sabha v1.0.0</Text>
        <Text style={styles.footerSubtext}>Made with ❤️ for the community</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING["2xl"],
  },
  headerCard: {
    marginBottom: SPACING.lg,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.lg,
  },
  avatarSection: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.gray100,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.gray300,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  changePhotoText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    marginTop: 4,
    marginBottom: 4,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "bold",
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.gray50,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    alignSelf: "flex-start",
    marginBottom: SPACING.xs,
  },
  verifiedText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
    color: COLORS.success,
  },
  pendingText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
    color: COLORS.warning,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    alignSelf: "flex-start",
  },
  adminText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
    color: COLORS.primary,
  },
  infoCard: {
    marginBottom: SPACING.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "bold",
    color: COLORS.gray900,
  },
  editText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.primary,
  },
  infoGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.gray600,
    marginBottom: SPACING.sm,
  },
  value: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray900,
  },
  input: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray900,
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  genderRow: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  genderOption: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    backgroundColor: COLORS.gray50,
    alignItems: "center",
  },
  genderOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}15`,
  },
  genderOptionText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray600,
    fontWeight: "500",
  },
  genderOptionTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  saveButton: {
    marginTop: SPACING.md,
  },
  actionsCard: {
    marginBottom: SPACING.lg,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  actionText: {
    fontSize: FONT_SIZES.base,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
  },
  footerSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
  },
});

export default ProfileScreen;
