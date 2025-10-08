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
  Image
} from 'react-native';

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

  const handleSave = () => {
    if (!formData.item_id || !formData.item_name) {
      Alert.alert('Error', 'Item ID and Item Name are required');
      return;
    }

    const updatedProduct = {
      ...formData,
      mrp: parseFloat(formData.mrp) || 0,
      selling_price: parseFloat(formData.selling_price) || 0,
      cost_price: parseFloat(formData.cost_price) || 0,
      category_id: parseInt(formData.category_id) || null,
      subcategory_id: parseInt(formData.subcategory_id) || null,
      brand_id: parseInt(formData.brand_id) || null,
      low_stock_threshold: parseInt(formData.low_stock_threshold) || 0,
    };

    onSave(updatedProduct);
  };

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
            value={formData.item_id}
            onChangeText={(text) => setFormData({ ...formData, item_id: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Item Name *"
            value={formData.item_name}
            onChangeText={(text) => setFormData({ ...formData, item_name: text })}
          />
          
          {/* Foreign key fields */}
          <TextInput
            style={styles.input}
            placeholder="Category ID"
            value={formData.category_id}
            onChangeText={(text) => setFormData({ ...formData, category_id: text })}
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Subcategory ID"
            value={formData.subcategory_id}
            onChangeText={(text) => setFormData({ ...formData, subcategory_id: text })}
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Brand ID"
            value={formData.brand_id}
            onChangeText={(text) => setFormData({ ...formData, brand_id: text })}
            keyboardType="number-pad"
          />
          
          {/* Product specifications */}
          <TextInput
            style={styles.input}
            placeholder="Model"
            value={formData.model}
            onChangeText={(text) => setFormData({ ...formData, model: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Color"
            value={formData.color}
            onChangeText={(text) => setFormData({ ...formData, color: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Size"
            value={formData.size}
            onChangeText={(text) => setFormData({ ...formData, size: text })}
          />

          {/* Pricing information */}
          <TextInput
            style={styles.input}
            placeholder="MRP"
            value={formData.mrp}
            onChangeText={(text) => setFormData({ ...formData, mrp: text })}
            keyboardType="decimal-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Selling Price"
            value={formData.selling_price}
            onChangeText={(text) => setFormData({ ...formData, selling_price: text })}
            keyboardType="decimal-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Cost Price"
            value={formData.cost_price}
            onChangeText={(text) => setFormData({ ...formData, cost_price: text })}
            keyboardType="decimal-pad"
          />

          {/* Additional fields */}
          <TextInput
            style={styles.input}
            placeholder="SKU"
            value={formData.sku}
            onChangeText={(text) => setFormData({ ...formData, sku: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Barcode"
            value={formData.barcode}
            onChangeText={(text) => setFormData({ ...formData, barcode: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Low Stock Threshold"
            value={formData.low_stock_threshold}
            onChangeText={(text) => setFormData({ ...formData, low_stock_threshold: text })}
            keyboardType="number-pad"
          />

          {/* Image URL field */}
          <TextInput
            style={styles.input}
            placeholder="Image URL"
            value={formData.image_url}
            onChangeText={(text) => setFormData({ ...formData, image_url: text })}
          />

          {/* Image preview */}
          {formData.image_url && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.imagePreviewLabel}>Current Image:</Text>
              <Image 
                source={{ uri: formData.image_url.startsWith('http') ? formData.image_url : `http://10.0.2.2:8080${formData.image_url}` }} 
                style={styles.imagePreview}
                resizeMode="contain"
                onError={(error) => console.log('Image preview error:', error)}
              />
              <Text style={styles.imageUrlText}>{formData.image_url}</Text>
            </View>
          )}

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
          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
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
    maxHeight: '85%',
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
    maxHeight: 500,
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
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginBottom: 12,
    padding: 10,
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
    width: 120,
    height: 120,
    borderRadius: 6,
  },
  imageUrlText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default EditProductModal;