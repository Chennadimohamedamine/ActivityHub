export default function FriendsListComponent(props: { title: string; onClose: () => void; friends: any[] }) {
	return (
		<div className="flex flex-col w-full h-full text-white">
			<div className='flex-1 overflow-y-auto p-2'>
				<div className="flex flex-col">
					{props.friends.length === 0 && (
						<div className="text-center text-gray-400 mt-10">
							No {props.title.toLowerCase()} yet.
						</div>
					)}
					{props.friends.map((friend) => (
						<a href={`/dashboard/profile/${friend.Username}`} key={friend.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors group cursor-pointer">
							<div className="flex items-center gap-3">
								<img src={`https://localhost${friend.profileImage}`} alt={friend.Username} className="w-12 h-12 rounded-full object-cover border border-zinc-700" />
								<div className="flex flex-col">
									<span className="font-bold text-sm">{friend.Firstname} {friend.Lastname}</span>
									<span className="text-xs text-zinc-400">@{friend.Username}</span>
								</div>
							</div>
						</a>
					))}
				</div>
			</div>
		</div>
	)
}