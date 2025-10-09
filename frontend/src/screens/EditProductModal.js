import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
  Platform
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { stockAPI } from '../api/api';

const EditProductModal = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    item_id: '',
    item_name: '',
    model: '',
    color: '',
    size: '',
    mrp: '',
    selling_price: '',
    cost_price: '',
    description: '',
    category_id: '',
    subcategory_id: '', 
    brand_id: '',
    image_url: '',
    sku: '',
    barcode: '',
    low_stock_threshold: '',
  });
  const [newImage, setNewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const API_BASE_URL = Platform.OS === 'android' ? 'http://10.150.254.234:8080' : 'http://10.150.254.234:8080';
 const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `${API_BASE_URL}${imagePath}`;
    return `${API_BASE_URL}/uploads/${imagePath}`;
  };

  const currentImageUrl = newImage ? newImage.uri : getFullImageUrl(formData.image_url);
  useEffect(() => {
    if (product) {
      setFormData({
        item_id: product.item_id || '',
        item_name: product.item_name || '',
        model: product.model || '',
        color: product.color || '',
        size: product.size || '',
        mrp: product.mrp?.toString() || '',
        selling_price: product.selling_price?.toString() || '',
        cost_price: product.cost_price?.toString() || '',
        description: product.description || '',
        category_id: product.category_id?.toString() || '',
        subcategory_id: product.subcategory_id?.toString() || '',
        brand_id: product.brand_id?.toString() || '',
        image_url: product.image_url || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        low_stock_threshold: product.low_stock_threshold?.toString() || '',
      });
    }
  }, [product]);

  // const getFullImageUrl = (imagePath) => {
  //   if (!imagePath) return null;
  //   if (imagePath.startsWith('http')) return imagePath;
  //   if (imagePath.startsWith('/uploads')) return `${API_BASE_URL}${imagePath}`;
  //   return `${API_BASE_URL}/uploads/${imagePath}`;
  // };

  const handleImagePick = () => {
    Alert.alert('Select Image', 'Choose image source', [
      {
        text: 'Camera',
        onPress: takePhoto,
      },
      {
        text: 'Gallery',
        onPress: pickImage,
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const takePhoto = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.error) {
        Alert.alert('Error', 'Camera error: ' + response.error);
      } else {
        setNewImage(response.assets[0]);
      }
    });
  };

  const pickImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        Alert.alert('Error', 'Image picker error: ' + response.error);
      } else {
        setNewImage(response.assets[0]);
      }
    });
  };

  const uploadImage = async () => {
    if (!newImage) return null;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', {
      uri: Platform.OS === 'ios' ? newImage.uri.replace('file://', '') : newImage.uri,
      type: newImage.type || 'image/jpeg',
      name: newImage.fileName || 'photo.jpg',
    });

    try {
      const response = await stockAPI.uploadImage(formData);
      setIsUploading(false);
      return response.imageUrl;
    } catch (error) {
      setIsUploading(false);
      Alert.alert('Error', 'Failed to upload image');
      return null;
    }
  };

 const handleSave = async () => {
    if (!formData.item_id || !formData.item_name) {
        Alert.alert('Error', 'Item ID and Item Name are required');
        return;
    }

    let finalImageUrl = formData.image_url;

    // Upload new image if selected
    if (newImage) {
        const uploadedImageUrl = await uploadImage();
        if (uploadedImageUrl) {
            finalImageUrl = uploadedImageUrl;
        }
    }

    // Convert IDs properly - handle empty strings and invalid values
    const updatedProduct = {
        ...formData,
        mrp: parseFloat(formData.mrp) || 0,
        selling_price: parseFloat(formData.selling_price) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 0,
        image_url: finalImageUrl,
        is_active: true // Always set to true when updating to prevent accidental deactivation
    };

    // Handle foreign keys - only send if they have valid values
    updatedProduct.category_id = formData.category_id ? parseInt(formData.category_id) : null;
    updatedProduct.subcategory_id = formData.subcategory_id ? parseInt(formData.subcategory_id) : null;
    updatedProduct.brand_id = formData.brand_id ? parseInt(formData.brand_id) : null;

    // Remove any fields that might cause issues
    delete updatedProduct.category_name;
    delete updatedProduct.subcategory_name;
    delete updatedProduct.brand_name;

    console.log('🔄 Sending update with is_active:', updatedProduct.is_active);
    onSave(updatedProduct);
};

  const removeImage = () => {
    setFormData({ ...formData, image_url: '' });
    setNewImage(null);
  };

  // const currentImageUrl = newImage ? newImage.uri : getFullImageUrl(formData.image_url);

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Product</Text>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <TextInput
            style={styles.input}
            placeholder="Item ID *"
            placeholderTextColor="#999"
            value={formData.item_id}
            onChangeText={(text) => setFormData({ ...formData, item_id: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Item Name *"
            placeholderTextColor="#999"
            value={formData.item_name}
            onChangeText={(text) => setFormData({ ...formData, item_name: text })}
          />
          
          {/* Foreign key fields */}
          <TextInput
            style={styles.input}
            placeholder="Category ID"
            placeholderTextColor="#999"
            value={formData.category_id}
            onChangeText={(text) => setFormData({ ...formData, category_id: text })}
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Subcategory ID"
            placeholderTextColor="#999"
            value={formData.subcategory_id}
            onChangeText={(text) => setFormData({ ...formData, subcategory_id: text })}
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Brand ID"
            placeholderTextColor="#999"
            value={formData.brand_id}
            onChangeText={(text) => setFormData({ ...formData, brand_id: text })}
            keyboardType="number-pad"
          />
          
          {/* Product specifications */}
          <TextInput
            style={styles.input}
            placeholder="Model"
            placeholderTextColor="#999"
            value={formData.model}
            onChangeText={(text) => setFormData({ ...formData, model: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Color"
            placeholderTextColor="#999"
            value={formData.color}
            onChangeText={(text) => setFormData({ ...formData, color: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Size"
            placeholderTextColor="#999"
            value={formData.size}
            onChangeText={(text) => setFormData({ ...formData, size: text })}
          />

          {/* Pricing information */}
          <TextInput
            style={styles.input}
            placeholder="MRP"
            placeholderTextColor="#999"
            value={formData.mrp}
            onChangeText={(text) => setFormData({ ...formData, mrp: text })}
            keyboardType="decimal-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Selling Price"
            placeholderTextColor="#999"
            value={formData.selling_price}
            onChangeText={(text) => setFormData({ ...formData, selling_price: text })}
            keyboardType="decimal-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Cost Price"
            placeholderTextColor="#999"
            value={formData.cost_price}
            onChangeText={(text) => setFormData({ ...formData, cost_price: text })}
            keyboardType="decimal-pad"
          />

          {/* Additional fields */}
          <TextInput
            style={styles.input}
            placeholder="SKU"
            placeholderTextColor="#999"
            value={formData.sku}
            onChangeText={(text) => setFormData({ ...formData, sku: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Barcode"
            placeholderTextColor="#999"
            value={formData.barcode}
            onChangeText={(text) => setFormData({ ...formData, barcode: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Low Stock Threshold"
            placeholderTextColor="#999"
            value={formData.low_stock_threshold}
            onChangeText={(text) => setFormData({ ...formData, low_stock_threshold: text })}
            keyboardType="number-pad"
          />

          {/* Image Section */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Product Image</Text>
            
            {/* Current Image Preview */}
            {currentImageUrl && (
              <View style={styles.imagePreviewContainer}>
                <Text style={styles.imagePreviewLabel}>
                  {newImage ? 'New Image Preview:' : 'Current Image:'}
                </Text>
                <Image 
                  source={{ uri: currentImageUrl }} 
                  style={styles.imagePreview}
                  resizeMode="contain"
                  onError={(error) => console.log('Image preview error:', error)}
                />
                {newImage && (
                  <Text style={styles.newImageText}>New image selected: {newImage.fileName || 'photo'}</Text>
                )}
                {formData.image_url && !newImage && (
                  <Text style={styles.imageUrlText}>{formData.image_url}</Text>
                )}
              </View>
            )}

            {/* Image Action Buttons */}
            <View style={styles.imageButtonsContainer}>
              <TouchableOpacity 
                style={[styles.imageButton, styles.uploadButton]}
                onPress={handleImagePick}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.imageButtonText}>
                    {newImage ? 'Change Image' : 'Upload New Image'}
                  </Text>
                )}
              </TouchableOpacity>

              {(formData.image_url || newImage) && (
                <TouchableOpacity 
                  style={[styles.imageButton, styles.removeButton]}
                  onPress={removeImage}
                >
                  <Text style={styles.imageButtonText}>Remove Image</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={3}
          />
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.saveButton, isUploading && styles.buttonDisabled]} 
            onPress={handleSave}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
  input: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  imageSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  imagePreviewContainer: {
    marginBottom: 12,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  imagePreviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  imageUrlText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  newImageText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 8,
    fontWeight: '600',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  imageButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default EditProductModal;