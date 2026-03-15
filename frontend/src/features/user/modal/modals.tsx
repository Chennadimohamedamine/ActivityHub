import FriendsListComponent from '../components/friendlist';
import PopUpComponent from '../components/editingpopup';

export function FriendsListModal(props: { isOpen: boolean; title: string; onClose: () => void; friends: any[] }) {
    if (!props.isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={props.onClose} />
            <div className="relative bg-[#1E1E1E] text-white rounded-2xl w-full max-w-sm h-[500px] shadow-2xl border border-zinc-800 ">
                <FriendsListComponent title={props.title} onClose={props.onClose} friends={props.friends} />
            </div>
        </div>
    )
}

export function EditProfileModal(props: { isOpen: boolean; onClose: () => void; profile: any }) {
    if (!props.isOpen) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={props.onClose} />
			<div className="relative bg-[#1E1E1E] text-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                <PopUpComponent onClose={props.onClose} profile={props.profile} />
            </div>
        </div>
    )
}