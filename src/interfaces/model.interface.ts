export type AdminDivision =
  | 'Director'
  | 'Finance'
  | 'IT'
  | 'Third Party'
  | 'Customer Service'
  | 'Marketing';

export type AdminRole = 'Supervisor' | 'Manager' | 'Staff';

export type FileType = 'image' | 'video';

export type PostPrivacy = 'public' | 'private' | 'friend-only';

export type CommunityMemberRole = 'admin' | 'member' | 'owner';

export type RoomChatType = 'private' | 'group';

export type RoomMemberType = 'admin' | 'member' | 'owner';

export type ChatStatusType = 'plain' | 'updated' | 'deleted';

export type ChatFileType = FileType | 'audio' | 'document';
