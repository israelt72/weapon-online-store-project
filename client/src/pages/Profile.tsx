// src/pages/Profile.tsx
import React, { useEffect } from 'react';
import { useForm, FieldError } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/appStore';
import { updateProfile } from '../redux/userSlice';
import './Profile.css';
const Profile: React.FC = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const user = useSelector((state: RootState) => state.user.user);
  const isLoading = useSelector((state: RootState) => state.user.isLoading);
  const error = useSelector((state: RootState) => state.user.error);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (user) {
      setValue('firstName', user.firstName);
      setValue('lastName', user.lastName);
      setValue('email', user.email);
    }
  }, [user, setValue]);

  const onSubmit = (data: any) => {
    dispatch(updateProfile(data));
  };

  return (
    <div className="profile-container">
      {isLoading && <p className="profile-loading">Loading...</p>}
      {error && <p className="profile-error">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
        <div className="profile-form-group">
          <label htmlFor="firstName" className="profile-label">First Name</label>
          <input 
            id="firstName" 
            className="profile-input" 
            {...register('firstName', { required: 'First Name is required' })} 
          />
          {errors.firstName && <p className="profile-error-message">{(errors.firstName as FieldError).message}</p>}
        </div>
        <div className="profile-form-group">
          <label htmlFor="lastName" className="profile-label">Last Name</label>
          <input 
            id="lastName" 
            className="profile-input" 
            {...register('lastName', { required: 'Last Name is required' })} 
          />
          {errors.lastName && <p className="profile-error-message">{(errors.lastName as FieldError).message}</p>}
        </div>
        <div className="profile-form-group">
          <label htmlFor="email" className="profile-label">Email</label>
          <input 
            id="email" 
            className="profile-input" 
            {...register('email', { 
              required: 'Email is required', 
              pattern: { value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/, message: 'Email is not valid' } 
            })} 
          />
          {errors.email && <p className="profile-error-message">{(errors.email as FieldError).message}</p>}
        </div>
        <button type="submit" className="profile-submit-button">Update Profile</button>
      </form>
    </div>
  );
};

export default Profile;
