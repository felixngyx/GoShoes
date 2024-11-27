import React from 'react';
import BasicInfoForm from './BasicFormation';
import ChangeAvatar from './ChangeAvatar';
import ChangePasswordForm from './ChangePassword';
import useProfile from '../../../../hooks/client/useProfile';

const Profile = () => {
  const {
    profile,
    isLoading,
    selectedLocation,
    handleUpdateProfile,
    handleLocationSelect,
    handleSendEmailChangeRequest,
    handleVerifyTokenChangeEmail,
    handleVerifyTokenChangePhone,
    handleSendPhoneChangeRequest,
    isSendingEmail,
    isSendingPhone,
    isVerifyingPhoneToken,
  } = useProfile();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="col-span-9 space-y-8">
      <div className="grid grid-cols-1 gap-8">
        {/* Basic Information Form - Full width */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Basic Information</h2>
          <BasicInfoForm
            profile={profile}
            selectedLocation={selectedLocation}
            handleUpdateProfile={handleUpdateProfile}
            handleLocationSelect={handleLocationSelect}
            handleSendEmailChangeRequest={handleSendEmailChangeRequest}
            handleVerifyTokenChangeEmail={handleVerifyTokenChangeEmail}
            handleVerifyTokenChangePhone={handleVerifyTokenChangePhone}
            handleSendPhoneChangeRequest={handleSendPhoneChangeRequest}
            isSendingPhone={isSendingPhone}
            isVerifyingPhoneToken={isVerifyingPhoneToken}
          />
        </div>

        {/* Change Password and Change Avatar - Side by side */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Change Password Form - 50% width */}
          {profile?.email && (
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold">Change Password</h2>
              <ChangePasswordForm email={profile.email} />
            </div>
          )}

          {/* Change Avatar Form - 50% width */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold">Profile Picture</h2>
            <ChangeAvatar profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
