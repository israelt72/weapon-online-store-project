// src/components/AdminUserManagement.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/appStore';
import { fetchUsers, updateProfile, deleteUser, selectUsers } from '../redux/userSlice';
import Pagination from '../components/Pagination'; 
import './AdminUserManagement.css';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

const AdminUserManagement: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const users = useSelector((state: RootState) => selectUsers(state));
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [updatedUser, setUpdatedUser] = useState<User>({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        role: '',
    });

    const [newPassword, setNewPassword] = useState<string>(''); 

    // Pagination states
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 7;

    useEffect(() => {
        const loadUsers = async () => {
            try {
                console.log("Fetching users...");
                await dispatch(fetchUsers());
                console.log("Users fetched successfully.");
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };

        loadUsers();
    }, [dispatch]);

    useEffect(() => {
        console.log("Users state updated:", users);
    }, [users]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(users.length / itemsPerPage);

    const paginate = (pageNumber: number) => {
        console.log(`Paginating to page ${pageNumber}`);
        setCurrentPage(pageNumber);
    };

    const handleEditClick = (user: User) => {
        console.log("Editing user:", user);
        setSelectedUser(user);
        setUpdatedUser(user);
        setNewPassword(''); // Reset the password field when editing a user
    };

    const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("Updating field:", e.target.name, "with value:", e.target.value);
        setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("Setting new password:", e.target.value);
        setNewPassword(e.target.value);
    };

    const handleUpdateSubmit = async () => {
        if (selectedUser) {
            console.log("Submitting update for user:", updatedUser);
            try {
                // Include new password if it was changed
                const userToUpdate = newPassword ? { ...updatedUser, password: newPassword } : updatedUser;
                console.log("User data to update:", userToUpdate);
                await dispatch(updateProfile(userToUpdate));
                console.log("User updated successfully.");
                setSelectedUser(null);
            } catch (error) {
                console.error("Failed to update user:", error);
            }
        }
    };

    const handleDelete = async (userId: string) => {
        console.log("Deleting user with ID:", userId);
        try {
            await dispatch(deleteUser(userId));
            console.log("User deleted successfully.");
        } catch (error) {
            console.error("Failed to delete user:", error);
        }
    };

    return (
        <div className="admin-user-management">
            <h1>User Management</h1>
            {selectedUser && (
                <div className="edit-user-form">
                    <h2>Edit User</h2>
                    <label>
                        First Name:
                        <input
                            type="text"
                            name="firstName"
                            value={updatedUser.firstName}
                            onChange={handleUpdateChange}
                        />
                    </label>
                    <label>
                        Last Name:
                        <input
                            type="text"
                            name="lastName"
                            value={updatedUser.lastName}
                            onChange={handleUpdateChange}
                        />
                    </label>
                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={updatedUser.email}
                            onChange={handleUpdateChange}
                        />
                    </label>
                    <label>
                        Role:
                        <input
                            type="text"
                            name="role"
                            value={updatedUser.role}
                            onChange={handleUpdateChange}
                        />
                    </label>
                    <label>
                        New Password:
                        <input
                            type="password"
                            name="password"
                            value={newPassword}
                            onChange={handlePasswordChange}
                        />
                    </label>
                    <div className="btn-for-update-user">
                        <button onClick={handleUpdateSubmit}>Update User</button>
                        <button onClick={() => setSelectedUser(null)}>Cancel</button>
                    </div>
                </div>
            )}
            <h2>Users</h2>
            <div className="user-list">
                {currentUsers.length > 0 ? (
                    currentUsers.map((user: User) => (
                        <div key={user.id} className="user-item">
                            <h3>{user.firstName} {user.lastName}</h3>
                            <p>Email: {user.email}</p>
                            <p>Role: {user.role}</p>
                            <div className="user-buttons">
                                <button onClick={() => handleEditClick(user)}>Edit</button>
                                <button onClick={() => handleDelete(user.id)}>Delete</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No users found.</p>
                )}
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                paginate={paginate}
            />
        </div>
    );
};

export default AdminUserManagement;
