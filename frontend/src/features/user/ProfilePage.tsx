import { useState, useEffect } from 'react'
import { useParams } from "react-router-dom";
import axios from 'axios'
import { FriendsListModal, EditProfileModal } from './modal/modals';
import { KeepUpButton } from "../activity/components/activity-card/KeepUpButton";
import ActivityCard from "../activity/components/activity-card/ActivityCard";
import { useAuthContext } from '../auth/context/AuthProvider';


const API_URL = 'https://localhost/api';

interface Profile {
  id: string;
  Firstname: string;
  Lastname: string;
  Username: string;
  bio: string;
  profileImage: string;
  createdAt: string;
  isOnMyOwnProfile: boolean
}

interface Keeper {
  id: string;
  Username: string;
  profileImage: string;
  Firstname: string;
  Lastname: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export function InfoCard(props: { title: string; value: number; onClick?: () => void }) {
    return (
        <div
            onClick={props.onClick}
            className={`
                bg-[#1E1E1E] flex flex-col rounded-2xl justify-center items-center p-6
                transition-all duration-200 border border-transparent
                ${props.onClick ? 'cursor-pointer hover:bg-[#2A2A2A] hover:border-zinc-700 active:scale-95' : ''}
            `}
        >
            <h1 className="font-bold text-3xl">{props.value}</h1>
            <p className="text-[#B0B0B0]">{props.title}</p>
        </div>
    )
}

export default function ProfilePage() {
	
	const { username } = useParams<{ username: string }>();
    const [profile, setProfile] = useState<Profile | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [friendsListType, setFriendsListType] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null);
	const [keepers, setKeepers] = useState<Keeper[]>([]);
	const [keepingUp, setKeepingUp] = useState<Keeper[]>([]);
	const [isFollowing, setIsFollowing] = useState(false);
	const [activities, setActivities] = useState<Activity[]>([]);
	const [isOnline, setIsOnline] = useState(false);
	useEffect(() => {
    const fetchFullData = async () => {
        setProfile(null);
        setError(null);
        setKeepers([]);
        setKeepingUp([]);
        setActivities([]);
        setIsOnline(false);
        try {
            const url = username 
                ? `${API_URL}/users/${username}` 
                : `${API_URL}/users/profile`;
            
            const userData = await axios.get<Profile>(url, { withCredentials: true });
            const user = userData.data;

            if (!user) {
                setError('User not found');
                return;
            }

            setProfile(user);

            const [keepersRes, followingRes, isFollowingRes, activitiesRes, onlineStatusRes] = await Promise.all([
                axios.get<Keeper[]>(`${API_URL}/keepups/followers/${user.id}`, { withCredentials: true }),
                axios.get<Keeper[]>(`${API_URL}/keepups/following/${user.id}`, { withCredentials: true }),
                axios.get<{ isFollowing: boolean }>(`${API_URL}/keepups/is-following/${user.id}`, { withCredentials: true }),
                axios.get<Activity[]>(`${API_URL}/activities/created-activities/${user.id}`, { withCredentials: true }),
                axios.get<{ isOnline: boolean }>(`${API_URL}/users/${user.id}/online-status`)
            ]);

            setKeepers(keepersRes.data);
            setKeepingUp(followingRes.data);
            setIsFollowing(isFollowingRes.data.isFollowing);
            setActivities(activitiesRes.data);
            setIsOnline(onlineStatusRes.data.isOnline);
        } catch (err: any) {
            setError('Something went wrong');
            console.error(err);
        }
    };

    fetchFullData();
}, [username]);


	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-[#121212] text-white">
				<div className="text-center">
					<h1 className="text-3xl font-bold mb-2">{error}</h1>
					<p className="text-zinc-400">The username "{username}" does not exist.</p>
				</div>
			</div>
		)
    }

    if (!profile) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-[#121212]">
			<div className="flex flex-col items-center">
				<div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent border-solid rounded-full animate-spin mb-4"></div>
				<p className="text-yellow-500 text-lg font-semibold">Loading profile...</p>
			</div>
			</div>
		)
	}

	const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

	
    return (
        <div className="bg-[#121212] min-h-screen text-white flex flex-col p-6 md:p-10 gap-6">
            <div className="bg-[#1E1E1E] rounded-3xl p-6 md:p-12 flex flex-col md:flex-row gap-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 min-w-0 flex-1">
					<div className="relative inline-block shrink-0">
						<img 
							className="border-4 border-white w-32 h-32 md:w-40 md:h-40 rounded-full object-cover" 
							src={`https://localhost${profile.profileImage}`} 
							alt="profile" 
						/>
						<span className={`absolute bottom-4 right-3 w-5 h-5 rounded-full border-[3px] border-white shadow-md ${!username || isOnline || profile.isOnMyOwnProfile  ? 'bg-green-400 ring-2 ring-green-300' : 'bg-gray-400'}`} />
					</div>   
					<div className="flex flex-col text-center md:text-left min-w-0 w-full overflow-hidden">
						<h2 className="text-2xl md:text-3xl font-bold truncate w-full">{profile.Firstname} {profile.Lastname}</h2>
						<p className="text-[#B0B0B0] truncate">@{profile.Username} • Joined {joinDate}</p>
						<p className="text-[#B0B0B0] mt-2 w-full line-clamp-3">{profile.bio}</p>
					</div>
				</div>
				{!username && (
                <div className="md:ml-auto flex justify-center md:justify-end items-center">
                    <button onClick={() => setIsEditOpen(true)} className="group flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-2.5 text-sm font-semibold transition-all hover:bg-zinc-800 active:scale-95">
                        Edit Profile
                    </button>
                </div>
				)}
                {username && !profile.isOnMyOwnProfile  && (
                    <div className="md:ml-auto flex justify-center md:justify-end items-center">
    					<KeepUpButton
							creatorId={profile.id}
							isFollowing={isFollowing}
							toggleFollow={async () => setIsFollowing(!isFollowing)}
						/>
					</div>
                )}
            </div>

			<div className="grid grid-cols-3 gap-6 text-xs sm:text-sm">	
                <InfoCard title="Activities Hosted" value={activities.length} />
                <InfoCard title="Keepers" value={keepers.length} onClick={() => setFriendsListType('Keepers')} />
                <InfoCard title="Keeping Up" value={keepingUp.length} onClick={() => setFriendsListType('Keeping Up')} />
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4">Created Activities</h2>
                {activities.length > 0 ? (
                    <div className="flex gap-10 flex-wrap items-center justify-center">
                        {activities.map((activity: Activity) => (
                            <ActivityCard key={activity.id} activity={activity} />
                        ))}
                    </div>
                ) : (
                <div className="bg-[#1E1E1E] p-6 rounded-2xl">
                    <p className="text-[#B0B0B0]">No Created activities to display.</p>
                </div>
                )}
            </div>

            {!username && <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} profile={profile} />}
            
			<FriendsListModal
                isOpen={!!friendsListType}
                title={friendsListType || ''}
                onClose={() => setFriendsListType(null)}
                friends={friendsListType === 'Keepers' ? keepers : keepingUp} 
            />
        </div>
    )
}