import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { userAPI, authAPI } from '../api/api';

const UsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'employee'
  });
  const [editUser, setEditUser] = useState({
    role: 'employee',
    is_active: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userAPI.getUsers();
      setUsers(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      await authAPI.register(newUser);
      setShowAddModal(false);
      setNewUser({ username: '', email: '', password: '', role: 'employee' });
      loadUsers();
      Alert.alert('Success', 'User created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create user: ' + error.message);
    }
  };

  const handleEditUser = (user) => {
  setSelectedUser(user);
  setEditUser({
    email: user.email, 
    role: user.role,
    is_active: user.is_active,
    password: ''
  });
  setShowEditModal(true);
};

const handleUpdateUser = async () => {
  try {
    // Create update data object with only provided fields
    const updateData = {
      role: editUser.role,
      is_active: editUser.is_active
    };
    
    // Only include email if it was modified and not empty
    if (editUser.email && editUser.email.trim() !== '') {
      updateData.email = editUser.email;
    }
    
    // Only include password if a new one was provided and not empty
    if (editUser.password && editUser.password.trim() !== '') {
      updateData.password = editUser.password;
    }
    
    console.log('🔄 Updating user with data:', updateData);
    
    await userAPI.updateUser(selectedUser.id, updateData);
    setShowEditModal(false);
    setSelectedUser(null);
    setEditUser({
      role: 'employee',
      is_active: true,
      email: '',
      password: ''
    });
    loadUsers();
    Alert.alert('Success', 'User updated successfully');
  } catch (error) {
    console.log('❌ Update user error:', error);
    Alert.alert('Error', 'Failed to update user: ' + error.message);
  }
};

//   const handleUpdateUser = async () => {
//   try {
//     // Create update data object with only provided fields
//     const updateData = {
//       role: editUser.role,
//       is_active: editUser.is_active
//     };
    
//     // Only include email if it was modified
//     if (editUser.email && editUser.email !== selectedUser.email) {
//       updateData.email = editUser.email;
//     }
    
//     // Only include password if a new one was provided
//     if (editUser.password) {
//       updateData.password = editUser.password;
//     }
    
//     await userAPI.updateUser(selectedUser.id, updateData);
//     setShowEditModal(false);
//     setSelectedUser(null);
//     loadUsers();
//     Alert.alert('Success', 'User updated successfully');
//   } catch (error) {
//     Alert.alert('Error', 'Failed to update user: ' + error.message);
//   }
// };

  const handleDeleteUser = async (user) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await userAPI.deleteUser(user.id);
              loadUsers();
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user: ' + error.message);
            }
          }
        },
      ]
    );
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.username}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        {/* <Text style={styles.userPassword}>Password: {item.password ? '••••••••' : 'Not set'}</Text> */}
        <Text style={styles.userPassword}>Password: ••••••••</Text>
      </View>
      <View style={styles.userActions}>
        <View style={[styles.roleBadge, 
          { backgroundColor: 
            item.role === 'admin' ? '#FF3B30' : 
            item.role === 'manager' ? '#FF9500' : '#007AFF' 
          }]}>
          <Text style={styles.roleText}>{item.role}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditUser(item)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteUser(item)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>Add New User</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Add User Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New User</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={newUser.username}
              onChangeText={(text) => setNewUser({ ...newUser, username: text })}
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={newUser.email}
              onChangeText={(text) => setNewUser({ ...newUser, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={newUser.password}
              onChangeText={(text) => setNewUser({ ...newUser, password: text })}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Role:</Text>
              {['employee', 'manager', 'admin'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOption,
                    newUser.role === role && styles.roleOptionSelected
                  ]}
                  onPress={() => setNewUser({ ...newUser, role })}
                >
                  <Text style={[
                    styles.roleOptionText,
                    newUser.role === role && styles.roleOptionTextSelected
                  ]}>
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddUser}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit User Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit User: {selectedUser?.username}</Text>


           
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={editUser.email || selectedUser?.email}
        onChangeText={(text) => setEditUser({ ...editUser, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
    
      <TextInput
        style={styles.input}
        placeholder="New Password (leave blank to keep current)"
        placeholderTextColor="#999" 
        value={editUser.password || ''}
        onChangeText={(text) => setEditUser({ ...editUser, password: text })}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
            
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Role:</Text>
              {['employee', 'manager', 'admin'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOption,
                    editUser.role === role && styles.roleOptionSelected
                  ]}
                  onPress={() => setEditUser({ ...editUser, role })}
                >
                  <Text style={[
                    styles.roleOptionText,
                    editUser.role === role && styles.roleOptionTextSelected
                  ]}>
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.statusContainer}>
              <Text style={styles.roleLabel}>Status:</Text>
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  editUser.is_active && styles.statusOptionActive
                ]}
                onPress={() => setEditUser({ ...editUser, is_active: !editUser.is_active })}
              >
                <Text style={[
                  styles.statusOptionText,
                  editUser.is_active && styles.statusOptionTextActive
                ]}>
                  {editUser.is_active ? 'Active' : 'Inactive'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateUser}
              >
                <Text style={styles.saveButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    color: '#333333',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  roleLabel: {
    fontSize: 16,
    marginRight: 15,
    color: '#333',
    marginBottom: 10,
  },
  roleOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  roleOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  roleOptionText: {
    color: '#333',
    fontSize: 14,
  },
  roleOptionTextSelected: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

   userCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userPassword: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#FFA500',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginLeft: 10,
  },
  statusOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  statusOptionText: {
    color: '#666',
    fontWeight: '600',
  },
  statusOptionTextActive: {
    color: '#fff',
  },
});

export default UsersScreen;