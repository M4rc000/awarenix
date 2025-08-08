import Input from "../form/input/InputField";
import { useUserSession } from "../context/UserSessionContext";
import Label from "../form/Label";
import Swal from "../utils/AlertContainer";
import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Button from "../ui/button/Button";

export interface PasswordFormData {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export function ChangePasswordForm() {
    const { user } = useUserSession();
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

    // Tambahkan state untuk menyimpan data password
    const [passwordData, setPasswordData] = useState<PasswordFormData>({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    });

    // Handle perubahan input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault(); 
        
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            Swal.fire({
                icon: "error",
                text: "New password and confirm new password do not match!",
                duration: 3000,
            });
            return;
        }

        if (!passwordData.oldPassword) {
            Swal.fire({
                icon: "error",
                text: "Old Password is required!",
                duration: 3000,
            });
            return;
        }
        if (!passwordData.newPassword) {
            Swal.fire({
                icon: "error",
                text: "New Password is required!",
                duration: 3000,
            });
            return;
        }
        if (!passwordData.confirmNewPassword) {
            Swal.fire({
                icon: "error",
                text: "Confirm New Password is required!",
                duration: 3000,
            });
            return;
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const token = localStorage.getItem("token");

            const response = await fetch(`${API_URL}/profiles/change-password/${user?.id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    oldPassword: passwordData.oldPassword,
                    newPassword: passwordData.newPassword,
                    id: user?.id,
                    updatedBy: user?.id,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                // Gunakan message dari backend jika ada
                throw new Error(data.message || "Failed to change password");
            }
            
            Swal.fire({
                icon: "success",
                text: "Password updated successfully!",
                duration: 3000,
            });

            // Setelah berhasil, reset form
            setPasswordData({
                oldPassword: "",
                newPassword: "",
                confirmNewPassword: ""
            });

        } catch (error: unknown) {
            console.error("Error changing password:", error);
            Swal.fire({
                icon: "error",
                text: (error as Error).message || "Failed to change password. Please try again.",
                duration: 3000,
            });
        }
    };
    
    return (    
        <div className="rounded-2xl">
            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400 lg:mb-3">
                Update your credentials to keep your account is secure.
            </p>
            <form onSubmit={handleSave}>
                <div className="overflow-y-auto px-2 pb-3">
                    <div className="mt-3 w-full">
                        {/* Old Password */}
                        <div className="grid grid-cols-1">
                            <div className="col-span-2 lg:col-span-1">
                                <div>
                                    <Label required>Old Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showOldPassword ? "text" : "password"}
                                            name="oldPassword"
                                            value={passwordData.oldPassword}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <span
                                            onClick={() => setShowOldPassword((s) => !s)}
                                            className="absolute z-30 right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                                        >
                                            {showOldPassword ? (
                                                <EyeIcon className="size-5 fill-gray-500" />
                                            ) : (
                                                <EyeCloseIcon className="size-5 fill-gray-500" />
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="grid grid-cols-1 mt-5">
                            <div className="col-span-2 lg:col-span-1">
                                <div>
                                    <Label required>New Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <span
                                            onClick={() => setShowNewPassword((s) => !s)}
                                            className="absolute z-30 right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                                        >
                                            {showNewPassword ? (
                                                <EyeIcon className="size-5 fill-gray-500" />
                                            ) : (
                                                <EyeCloseIcon className="size-5 fill-gray-500" />
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Confirm New Password */}
                        <div className="grid grid-cols-1 mt-5">
                            <div className="col-span-2 lg:col-span-1">
                                <div>
                                    <Label required>Confirm New Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmNewPassword ? "text" : "password"}
                                            name="confirmNewPassword"
                                            value={passwordData.confirmNewPassword}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <span
                                            onClick={() => setShowConfirmNewPassword((s) => !s)}
                                            className="absolute z-30 right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                                        >
                                            {showConfirmNewPassword ? (
                                                <EyeIcon className="size-5 fill-gray-500" />
                                            ) : (
                                                <EyeCloseIcon className="size-5 fill-gray-500" />
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Tombol Update */}
                        <div className="grid grid-cols-1 mt-5">
                            <div className="col-span-1 text-end mt-3">
                                <Button type="submit">Update</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}