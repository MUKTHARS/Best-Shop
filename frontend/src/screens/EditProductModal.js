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
  Platform,
  FlatList
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { stockAPI } from '../api/api';

const EditProductModal = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    item_id: '',
    item_name: '',
    model: '',
    description: '',
    category_id: '',
    subcategory_id: '', 
    brand_id: '',
    // low_stock_threshold: '',
  });
  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState({
    gender: 'unisex',
    size: '',
    color: '',
    mrp: '',
    selling_price: '',
    cost_price: '',
    sku: '',
    barcode: '',
    current_stock: '',
  });
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState(null);

  useEffect(() => {
    if (product) {
      setFormData({
        item_id: product.item_id || '',
        item_name: product.item_name || '',
        model: product.model || '',
        description: product.description || '',
        category_id: product.category_id?.toString() || '',
        subcategory_id: product.subcategory_id?.toString() || '',
        brand_id: product.brand_id?.toString() || '',
        low_stock_threshold: product.low_stock_threshold?.toString() || '',
      });
      
      // Set variants if they exist
      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants);
      }
    }
  }, [product]);

  const handleAddVariant = () => {
    if (!newVariant.size) {
      Alert.alert('Error', 'Size is required for variant');
      return;
    }

    const variant = {
      ...newVariant,
      mrp: parseFloat(newVariant.mrp) || 0,
      selling_price: parseFloat(newVariant.selling_price) || 0,
      cost_price: parseFloat(newVariant.cost_price) || 0,
      current_stock: parseInt(newVariant.current_stock) || 0,
    };

    if (editingVariantIndex !== null) {
      // Update existing variant
      const updatedVariants = [...variants];
      updatedVariants[editingVariantIndex] = variant;
      setVariants(updatedVariants);
      setEditingVariantIndex(null);
    } else {
      // Add new variant
      setVariants([...variants, variant]);
    }

    setNewVariant({
      gender: 'unisex',
      size: '',
      color: '',
      mrp: '',
      selling_price: '',
      cost_price: '',
      sku: '',
      barcode: '',
      current_stock: '',
    });
    setShowVariantModal(false);
  };

  const handleEditVariant = (index) => {
    const variant = variants[index];
    setNewVariant({
      gender: variant.gender,
      size: variant.size,
      color: variant.color,
      mrp: variant.mrp?.toString() || '',
      selling_price: variant.selling_price?.toString() || '',
      cost_price: variant.cost_price?.toString() || '',
      sku: variant.sku || '',
      barcode: variant.barcode || '',
      current_stock: variant.current_stock?.toString() || '',
    });
    setEditingVariantIndex(index);
    setShowVariantModal(true);
  };

  const handleDeleteVariant = (index) => {
    Alert.alert(
      'Delete Variant',
      'Are you sure you want to delete this variant?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const updatedVariants = variants.filter((_, i) => i !== index);
            setVariants(updatedVariants);
          }
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.item_id || !formData.item_name) {
      Alert.alert('Error', 'Item ID and Item Name are required');
      return;
    }

    if (variants.length === 0) {
      Alert.alert('Error', 'At least one product variant is required');
      return;
    }

    const updatedProduct = {
      ...formData,
      low_stock_threshold: parseInt(formData.low_stock_threshold) || 0,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      subcategory_id: formData.subcategory_id ? parseInt(formData.subcategory_id) : null,
      brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
      variants: variants,
    };

    onSave(updatedProduct);
  };

  const renderVariantItem = ({ item, index }) => (
    <View style={styles.variantItem}>
      <View style={styles.variantInfo}>
        <Text style={styles.variantText}>
          {item.gender} - {item.size} {item.color ? `- ${item.color}` : ''}
        </Text>
        <Text style={styles.variantDetails}>
          Price: ₹{item.selling_price} | Stock: {item.current_stock}
        </Text>
        {item.sku && <Text style={styles.variantSku}>SKU: {item.sku}</Text>}
      </View>
      <View style={styles.variantActions}>
        <TouchableOpacity 
          style={[styles.variantButton, styles.editVariantButton]}
          onPress={() => handleEditVariant(index)}
        >
          <Text style={styles.variantButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.variantButton, styles.deleteVariantButton]}
          onPress={() => handleDeleteVariant(index)}
        >
          <Text style={styles.variantButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {product ? 'Edit Product' : 'Add Product'}
          </Text>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
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
          
          <TextInput
            style={styles.input}
            placeholder="Model"
            placeholderTextColor="#999"
            value={formData.model}
            onChangeText={(text) => setFormData({ ...formData, model: text })}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={3}
          />

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

          {/* <TextInput
            style={styles.input}
            placeholder="Low Stock Threshold"
            placeholderTextColor="#999"
            value={formData.low_stock_threshold}
            onChangeText={(text) => setFormData({ ...formData, low_stock_threshold: text })}
            keyboardType="number-pad"
          /> */}

          {/* Variants Section */}
          <View style={styles.variantsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Product Variants</Text>
              <TouchableOpacity 
                style={styles.addVariantButton}
                onPress={() => setShowVariantModal(true)}
              >
                <Text style={styles.addVariantButtonText}>+ Add Variant</Text>
              </TouchableOpacity>
            </View>

            {variants.length === 0 ? (
              <Text style={styles.noVariantsText}>No variants added</Text>
            ) : (
              <FlatList
                data={variants}
                renderItem={renderVariantItem}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.saveButton]} 
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Product</Text>
          </TouchableOpacity>
        </View>

        {/* Variant Modal */}
        <Modal visible={showVariantModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingVariantIndex !== null ? 'Edit Variant' : 'Add Variant'}
                </Text>
                <TouchableOpacity onPress={() => {
                  setShowVariantModal(false);
                  setEditingVariantIndex(null);
                  setNewVariant({
                    gender: 'unisex',
                    size: '',
                    color: '',
                    mrp: '',
                    selling_price: '',
                    cost_price: '',
                    sku: '',
                    barcode: '',
                    current_stock: '',
                  });
                }}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <Text style={styles.label}>Gender *</Text>
                <View style={styles.genderContainer}>
                  {['unisex', 'male', 'female', 'kids'].map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.genderOption,
                        newVariant.gender === gender && styles.genderOptionSelected
                      ]}
                      onPress={() => setNewVariant({ ...newVariant, gender })}
                    >
                      <Text style={[
                        styles.genderOptionText,
                        newVariant.gender === gender && styles.genderOptionTextSelected
                      ]}>
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Size *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., S, M, L, 42, 10"
                  value={newVariant.size}
                  onChangeText={(text) => setNewVariant({ ...newVariant, size: text })}
                />

                <Text style={styles.label}>Color</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Red, Blue, Black"
                  value={newVariant.color}
                  onChangeText={(text) => setNewVariant({ ...newVariant, color: text })}
                />

                <Text style={styles.label}>Pricing</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="MRP"
                    value={newVariant.mrp}
                    onChangeText={(text) => setNewVariant({ ...newVariant, mrp: text })}
                    keyboardType="decimal-pad"
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Selling Price"
                    value={newVariant.selling_price}
                    onChangeText={(text) => setNewVariant({ ...newVariant, selling_price: text })}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Cost Price"
                    value={newVariant.cost_price}
                    onChangeText={(text) => setNewVariant({ ...newVariant, cost_price: text })}
                    keyboardType="decimal-pad"
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Current Stock"
                    value={newVariant.current_stock}
                    onChangeText={(text) => setNewVariant({ ...newVariant, current_stock: text })}
                    keyboardType="number-pad"
                  />
                </View>

                <Text style={styles.label}>Identification</Text>
                <TextInput
                  style={styles.input}
                  placeholder="SKU (auto-generated if empty)"
                  value={newVariant.sku}
                  onChangeText={(text) => setNewVariant({ ...newVariant, sku: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Barcode"
                  value={newVariant.barcode}
                  onChangeText={(text) => setNewVariant({ ...newVariant, barcode: text })}
                />
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={() => {
                    setShowVariantModal(false);
                    setEditingVariantIndex(null);
                    setNewVariant({
                      gender: 'unisex',
                      size: '',
                      color: '',
                      mrp: '',
                      selling_price: '',
                      cost_price: '',
                      sku: '',
                      barcode: '',
                      current_stock: '',
                    });
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.saveButton]} 
                  onPress={handleAddVariant}
                >
                  <Text style={styles.saveButtonText}>
                    {editingVariantIndex !== null ? 'Update Variant' : 'Add Variant'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  variantsSection: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addVariantButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addVariantButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noVariantsText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
  variantItem: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  variantInfo: {
    flex: 1,
  },
  variantText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  variantDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  variantSku: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  variantActions: {
    flexDirection: 'row',
  },
  variantButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 6,
  },
  editVariantButton: {
    backgroundColor: '#FFA500',
  },
  deleteVariantButton: {
    backgroundColor: '#FF3B30',
  },
  variantButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  genderContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  genderOption: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  genderOptionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  genderOptionTextSelected: {
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
});

export default EditProductModal;
