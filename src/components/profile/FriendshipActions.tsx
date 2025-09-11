import React from 'react';
import Button from '@/components/ui/Button/Button';
import {
  UserPlus,
  UserMinus,
  Clock,
  Check,
  X
} from 'lucide-react';
import { FriendshipStatus, FriendAction } from '@/types/profile';

interface FriendshipActionsProps {
  friendshipStatus: FriendshipStatus | null;
  loading?: boolean;
  onFriendAction: (action: FriendAction) => void;
}

export const FriendshipActions: React.FC<FriendshipActionsProps> = ({
  friendshipStatus,
  loading = false,
  onFriendAction
}) => {
  if (!friendshipStatus) {
    return null;
  }

  const { status, canSendRequest, canAcceptRequest, canCancelRequest } = friendshipStatus;

  // Map API statuses to appropriate buttons
  switch (status) {
    case 'FRIENDS':
      return (
        <Button
          variant="ghost"
          size="sm"
          className="border border-gray-600 hover:border-red-500 hover:bg-red-500/10 hover:text-red-400"
          onClick={() => onFriendAction('UNFRIEND')}
          disabled={loading}
        >
          <UserMinus className="w-4 h-4 mr-2" />
          Unfriend
        </Button>
      );

    case 'REQUEST_SENT':
      return (
        <Button
          variant="ghost"
          size="sm"
          className="border border-gray-600 bg-gray-700/30"
          onClick={() => onFriendAction('CANCEL_FRIEND_REQUEST')}
          disabled={loading}
        >
          <Clock className="w-4 h-4 mr-2" />
          Request Sent
        </Button>
      );

    case 'REQUEST_RECEIVED':
      return (
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onFriendAction('ACCEPT_FRIEND_REQUEST')}
            disabled={loading}
          >
            <Check className="w-4 h-4 mr-2" />
            Accept
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="border border-gray-600"
            onClick={() => onFriendAction('REJECT_FRIEND_REQUEST')}
            disabled={loading}
          >
            <X className="w-4 h-4 mr-2" />
            Decline
          </Button>
        </div>
      );

    case 'NONE':
    default:
      return canSendRequest ? (
        <Button
          variant="primary"
          size="sm"
          onClick={() => onFriendAction('SEND_FRIEND_REQUEST')}
          disabled={loading}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Friend
        </Button>
      ) : null;
  }
};
