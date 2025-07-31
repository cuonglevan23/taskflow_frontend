import Avatar from "./Avatar";

interface AvatarGroupProps {
  users: { name: string; src?: string }[];
  maxVisible?: number;
}

export default function AvatarGroup({ users, maxVisible = 2 }: AvatarGroupProps) {
  const visibleUsers = users.slice(0, maxVisible);
  const hiddenCount = users.length - maxVisible;

  return (
    <div className="flex items-center space-x-[-8px]">
      {visibleUsers.map((user, index) => (
        <Avatar
          key={index}
          src={user.src}
          name={user.name}
          size="sm"
          className="border-2 border-white"
        />
      ))}

      {hiddenCount > 0 && (
        <div className="h-8 w-8 rounded-full bg-gray-200 text-xs font-medium text-gray-700 flex items-center justify-center border-2 border-white">
          +{hiddenCount}
        </div>
      )}
    </div>
  );
}
