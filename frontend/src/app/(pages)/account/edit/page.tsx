"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { SettingsHeader } from "@/components/feature/settings/SettingsHeader";
import { ProfileCard } from "@/components/feature/account/ProfileCard";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";

// TODO: Fetch from API
const MOCK_USER = {
  name: "Alex Walker",
  title: "The Strategist",
  email: "alex.walker@university.edu",
};

export default function EditProfilePage() {
  // Form State
  const [name, setName] = useState(MOCK_USER.name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Errors
  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateAndSave = async () => {
    setNameError("");
    setPasswordError("");

    // Validate name
    if (!name.trim()) {
      setNameError("Nama tidak boleh kosong");
      return;
    }

    // Validate password only if user filled current password
    if (currentPassword) {
      if (!newPassword) {
        setPasswordError("Kata sandi baru harus diisi");
        return;
      }
      if (newPassword.length < 8) {
        setPasswordError("Kata sandi minimal 8 karakter");
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError("Konfirmasi kata sandi tidak cocok");
        return;
      }
    }

    // TODO: Call API — PUT /update-user for name
    // TODO: Call API — PUT /update-password if currentPassword is filled
    console.log("Saving profile:", {
      name,
      changePassword: !!currentPassword,
    });
  };

  return (
    <div className="w-full h-screen flex flex-col mx-auto bg-neutral-50 relative overflow-hidden max-w-md">

      <SettingsHeader title="Edit Profil" onSave={validateAndSave} />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-28 relative">
        <div className="space-y-6">

          {/* Identity Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <ProfileCard name={name} title={MOCK_USER.title} />
          </motion.div>

          {/* Informasi Pribadi Section */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3 className="text-[12px] font-bold text-neutral-400 tracking-wider mb-3 px-2">
              INFORMASI PRIBADI
            </h3>

            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden p-5">
              {/* Name */}
              <div className="mb-4">
                <Input
                  label="Nama"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError(""); }}
                  placeholder="Nama lengkap"
                  error={nameError}
                />
              </div>

              {/* Email (Disabled) */}
              <div className="mb-0">
                <Input
                  label="Email"
                  value={MOCK_USER.email}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-neutral-400 mt-1 px-0.5">
                  Email tidak dapat diubah
                </p>
              </div>
            </div>
          </motion.div>

          {/* Ubah Kata Sandi Section */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden p-5">
              <h4 className="text-sm font-semibold text-neutral-900 mb-4">
                Ubah Kata Sandi
              </h4>

              <div className="space-y-4">
                <PasswordInput
                  label="Kata Sandi Saat Ini"
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(""); }}
                  placeholder="Masukkan kata sandi saat ini"
                />

                <PasswordInput
                  label="Kata Sandi Baru"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordError(""); }}
                  placeholder="Minimal 8 karakter"
                />

                <PasswordInput
                  label="Konfirmasi Kata Sandi"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(""); }}
                  placeholder="Ulangi kata sandi baru"
                />

                {passwordError && (
                  <p className="text-xs text-error">{passwordError}</p>
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
