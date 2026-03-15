import axios from "axios";
import { useState } from "react";
import type { updatedProfile } from '../types/types';

async function saveProfile(updatedProfile: updatedProfile): Promise<string | null> {
  try {
    await axios.patch('https://localhost/api/users/profile', {
      firstName: updatedProfile.firstName,
      lastName: updatedProfile.lastName,
      bio: updatedProfile.bio,
    }, {withCredentials: true });

    return null; 

  } catch (err: any) {
    if (err.response) {
      return err.response.data?.message || 'Failed to update profile';
    }
    return 'Server not reachable';
  }
}

export default function PopUpComponent(props: { onClose: () => void; profile: any }) {
    const profile = props.profile
    const [firstName, setFirstName] = useState(profile?.Firstname || '');
	const [lastName, setLastName] = useState(profile?.Lastname || '');
    const username = profile?.Username;
    const [bio, setBio] = useState(profile.bio || '');
    const [error, setError] = useState<string | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);

    const handleSave = async () => {
		if (!firstName.trim()) return setError('First name is required');
		if (!lastName.trim()) return setError('Last name is required');
		if (!username.trim()) return setError('Username is required');
        const err = await saveProfile({ firstName, lastName, username, bio });

		if (selectedFile) {
			const formData = new FormData();
			formData.append('file', selectedFile);
			try {
				await axios.post('https://localhost/api/users/upload-avatar', formData, {
					headers: { 'Content-Type': 'multipart/form-data' },
					withCredentials: true,
				});
			} catch (uploadErr) {
				setError('Profile updated but failed to upload avatar');
				return;
			}
		}

        setError(err);
        if (!err) {
			props.onClose();
			window.location.reload();
		}
    };

	return (
        <div className="flex flex-col w-full h-full max-h-[90vh] text-white overflow-hidden">

            {/* Header */}
            <div className="relative flex justify-between items-center w-full p-6 border-b border-zinc-700 shrink-0">
                <h2 className="text-xl font-bold">Edit Profile</h2>
                <button className="text-zinc-400 hover:text-white text-3xl leading-none" onClick={props.onClose}>&times;</button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-500">
                <div className="flex flex-col gap-6">

                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-bold">Profile Picture</span>
                        <label className="cursor-pointer block">
                            <img
                                src={preview ? preview : `https://localhost${profile.profileImage}`}
                                alt="avatar"
                                className="w-24 h-24 rounded-full border-4 border-zinc-800 object-cover hover:border-yellow-500 transition-colors"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        setSelectedFile(file);
                                        setPreview(URL.createObjectURL(file));
                                    }
                                }}
                            />
                        </label>
                        <p className="text-xs text-zinc-400">Click to change avatar</p>
                    </div>

                    {/* First / Last name */}
                    <div className="flex gap-3 w-full">
                        <div className="flex flex-col gap-2 min-w-0 flex-1">
                            <label className="text-sm font-bold">First Name *</label>
                            <input
                                maxLength={15}
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                type="text"
                                className="w-full bg-black/20 border border-zinc-700 rounded-lg p-3 focus:border-yellow-500 focus:outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-2 min-w-0 flex-1">
                            <label className="text-sm font-bold">Last Name *</label>
                            <input
                                maxLength={15}
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                type="text"
                                className="w-full bg-black/20 border border-zinc-700 rounded-lg p-3 focus:border-yellow-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Username (read-only) */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-zinc-500">Username</label>
                        <input
                            disabled
                            maxLength={15}
                            type="text"
                            value={username}
                            className="bg-black/20 border border-zinc-700 rounded-lg p-3 text-zinc-500 cursor-not-allowed opacity-60"
                        />
                    </div>

                    {/* Bio */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Bio</label>
                        <textarea
                            maxLength={100}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-black/20 border border-zinc-700 rounded-lg p-3 h-32 resize-none focus:border-yellow-500 focus:outline-none"
                        />
                    </div>

                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-700 flex flex-col gap-3 bg-[#1E1E1E] rounded-b-2xl shrink-0">
                {error && (
                    <div className="p-4 bg-red-500 text-white rounded-lg text-sm">
                        {error}
                    </div>
                )}
                <div className="flex justify-end gap-3">
                    <button
                        className="px-4 py-2 rounded-lg border border-zinc-600 hover:bg-zinc-800 transition-colors"
                        onClick={props.onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-600 transition-colors"
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </div>

        </div>
    );
}