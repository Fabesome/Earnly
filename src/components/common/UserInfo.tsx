import { useUser } from "@clerk/clerk-react";

export const UserInfo = () => {
  const { user } = useUser();
  
  if (!user) return null;
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">User Information</h3>
      <p><strong>User ID:</strong> {user.id}</p>
      <p><strong>Username:</strong> {user.username}</p>
    </div>
  );
};
