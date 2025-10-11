import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { stockAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

const StockEntryScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    itemId: '',
    itemName: '',
    categoryId: '',
    subcategoryId: '',
    brandId: '',
    model: '',
    description: '',
    // lowStockThreshold: '10',
  });
  
  // Variants state
  const [variants, setVariants] = useState([]);
  const [currentVariant, setCurrentVariant] = useState({
    gender: 'unisex',
    size: '',
    color: '',
    mrp: '',
    sellingPrice: '',
    costPrice: '',
    purchaseQuantity: '',
    sku: '',
    barcode: '',
  });
  useEffect(() => {
  if (formData.categoryId && formData.categoryId !== '') {
    console.log('Category selected, loading subcategories...');
    loadSubcategories();
  } else {
    // Clear subcategories when no category is selected
    setSubcategories([]);
    setFormData({ ...formData, subcategoryId: '' });
  }
}, [formData.categoryId]);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState(null);
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.categoryId) {
      loadSubcategories();
    }
  }, [formData.categoryId]);
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
      setImage(response.assets[0]);
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
      setImage(response.assets[0]);
    }
  });
};

// Add image upload function
const uploadImage = async () => {
  if (!image) return null;

  const formData = new FormData();
  formData.append('image', {
    uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
    type: image.type || 'image/jpeg',
    name: image.fileName || 'photo.jpg',
  });

  try {
    const response = await stockAPI.uploadImage(formData);
    return response.imageUrl;
  } catch (error) {
    Alert.alert('Error', 'Failed to upload image');
    return null;
  }
};

// Update handlePreview to include image
const handlePreview = async () => {
  if (!formData.itemId || !formData.itemName) {
    Alert.alert('Error', 'Please fill in required fields: Item ID and Item Name');
    return;
  }

  if (variants.length === 0) {
    Alert.alert('Error', 'Please add at least one product variant');
    return;
  }

  setIsLoading(true);
  const imageUrl = await uploadImage();
  setIsLoading(false);

  navigation.navigate('StockPreview', {
    formData: { 
      ...formData, 
      variants: variants,
      imageUrl: imageUrl 
    },
    image: image
  });
};
  const loadInitialData = async () => {
    try {
      const [cats, brds] = await Promise.all([
        stockAPI.getCategories(),
        stockAPI.getBrands()
      ]);
      setCategories(cats);
      setBrands(brds);
    } catch (error) {
      Alert.alert('Error', 'Failed to load initial data');
    }
  };
const handleAddCategory = async () => {
  if (!newCategory.trim()) return;

  try {
    const category = await stockAPI.createCategory({ name: newCategory });
    setCategories([...categories, category]);
    setNewCategory('');
    setShowCategoryModal(false);
    setFormData({ ...formData, categoryId: category.id.toString() });
  } catch (error) {
    Alert.alert('Error', 'Failed to add category');
  }
};

const handleAddBrand = async () => {
  if (!newBrand.trim()) return;

  try {
    const brand = await stockAPI.createBrand({ name: newBrand });
    setBrands([...brands, brand]);
    setNewBrand('');
    setShowBrandModal(false);
    setFormData({ ...formData, brandId: brand.id.toString() });
  } catch (error) {
    Alert.alert('Error', 'Failed to add brand');
  }
};

const handleAddSubcategory = async () => {
  if (!newSubcategory.trim() || !formData.categoryId) return;

  try {
    const subcategoryData = {
      name: newSubcategory,
      category_id: parseInt(formData.categoryId)
    };
    
    const response = await stockAPI.createSubcategory(subcategoryData);
    
    console.log('Subcategory created successfully');
    
    // Refresh subcategories list
    const subs = await stockAPI.getSubcategories(formData.categoryId);
    setSubcategories(subs);
    setNewSubcategory('');
    setShowSubcategoryModal(false);
    
    // Try to get the ID from different response formats
    const subcategoryId = response.id || response.data?.id;
    if (subcategoryId) {
      setFormData({ ...formData, subcategoryId: subcategoryId.toString() });
    }
    
  } catch (error) {
    console.log('Error creating subcategory:', error);
    if (!error.message.includes('201')) {
      Alert.alert('Error', 'Failed to add subcategory: ' + error.message);
    }
  }
};
 const loadSubcategories = async () => {
  try {
    console.log('Loading subcategories for category ID:', formData.categoryId);
    const subs = await stockAPI.getSubcategories(formData.categoryId);
    console.log('Subcategories loaded:', subs);
    setSubcategories(subs);
  } catch (error) {
    console.log('Error loading subcategories:', error);
    Alert.alert('Error', 'Failed to load subcategories');
  }
};

  // Variant Management Functions
  const handleAddVariant = () => {
    if (!currentVariant.size || !currentVariant.purchaseQuantity) {
      Alert.alert('Error', 'Size and Purchase Quantity are required for variant');
      return;
    }

    const variant = {
      ...currentVariant,
      mrp: parseFloat(currentVariant.mrp) || 0,
      sellingPrice: parseFloat(currentVariant.sellingPrice) || 0,
      costPrice: parseFloat(currentVariant.costPrice) || 0,
      purchaseQuantity: parseInt(currentVariant.purchaseQuantity) || 0,
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

    // Reset variant form
    setCurrentVariant({
      gender: 'unisex',
      size: '',
      color: '',
      mrp: '',
      sellingPrice: '',
      costPrice: '',
      purchaseQuantity: '',
      sku: '',
      barcode: '',
    });
    setShowVariantModal(false);
  };

  const handleEditVariant = (index) => {
    const variant = variants[index];
    setCurrentVariant({
      gender: variant.gender,
      size: variant.size,
      color: variant.color,
      mrp: variant.mrp?.toString() || '',
      sellingPrice: variant.sellingPrice?.toString() || '',
      costPrice: variant.costPrice?.toString() || '',
      purchaseQuantity: variant.purchaseQuantity?.toString() || '',
      sku: variant.sku || '',
      barcode: variant.barcode || '',
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

  // const handlePreview = async () => {
  //   if (!formData.itemId || !formData.itemName) {
  //     Alert.alert('Error', 'Please fill in required fields: Item ID and Item Name');
  //     return;
  //   }

  //   if (variants.length === 0) {
  //     Alert.alert('Error', 'Please add at least one product variant');
  //     return;
  //   }

  //   navigation.navigate('StockPreview', {
  //     formData: { 
  //       ...formData, 
  //       variants: variants 
  //     }
  //   });
  // };

  const renderModalItem = (item, onSelect) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => onSelect(item)}
    >
      <Text style={styles.modalItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderVariantItem = ({ item, index }) => (
    <View style={styles.variantItem}>
      <View style={styles.variantInfo}>
        <Text style={styles.variantText}>
          {item.gender} - {item.size} {item.color ? `- ${item.color}` : ''}
        </Text>
        <Text style={styles.variantDetails}>
          Qty: {item.purchaseQuantity} | Price: ₹{item.sellingPrice}
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Stock Entry</Text>

      <Text style={styles.sectionTitle}>Basic Information</Text>

      <TextInput
        style={styles.input}
        placeholder="Item ID *"
        placeholderTextColor="#999"
        value={formData.itemId}
        onChangeText={(text) => setFormData({ ...formData, itemId: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Item Name *"
        placeholderTextColor="#999"
        value={formData.itemName}
        onChangeText={(text) => setFormData({ ...formData, itemName: text })}
      />

      <View style={styles.row}>
        <TouchableOpacity 
          style={[styles.input, styles.selector]}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={formData.categoryId ? styles.selectorTextSelected : styles.selectorText}>
            {formData.categoryId 
              ? categories.find(c => c.id.toString() === formData.categoryId)?.name 
              : 'Select Category'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.input, styles.selector]}
          onPress={() => setShowSubcategoryModal(true)}
        >
          <Text style={formData.subcategoryId ? styles.selectorTextSelected : styles.selectorText}>
            {formData.subcategoryId 
              ? subcategories.find(s => s.id.toString() === formData.subcategoryId)?.name 
              : 'Select Subcategory'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.input, styles.selector]}
        onPress={() => setShowBrandModal(true)}
      >
        <Text style={formData.brandId ? styles.selectorTextSelected : styles.selectorText}>
          {formData.brandId 
            ? brands.find(b => b.id.toString() === formData.brandId)?.name 
            : 'Select Brand'}
        </Text>
      </TouchableOpacity>

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
        placeholderTextColor="#999"
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
{/* Image Field */}
<TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
  <Text style={styles.imageButtonText}>
    {image ? 'Change Image' : 'Add Product Image'}
  </Text>
</TouchableOpacity>

{image && (
  <Text style={styles.imageText}>Image selected: {image.fileName || 'photo'}</Text>
)}
      {/* <TextInput
        style={styles.input}
        placeholder="Low Stock Threshold"
        placeholderTextColor="#999"
        value={formData.lowStockThreshold}
        onChangeText={(text) => setFormData({ ...formData, lowStockThreshold: text })}
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
          <Text style={styles.noVariantsText}>No variants added. Click "Add Variant" to add sizes, genders, and quantities.</Text>
        ) : (
          <FlatList
            data={variants}
            renderItem={renderVariantItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        )}
      </View>

      <TouchableOpacity 
        style={[styles.previewButton, isLoading && styles.buttonDisabled]} 
        onPress={handlePreview}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.previewButtonText}>Preview Stock Entry</Text>
        )}
      </TouchableOpacity>

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
                setCurrentVariant({
                  gender: 'unisex',
                  size: '',
                  color: '',
                  mrp: '',
                  sellingPrice: '',
                  costPrice: '',
                  purchaseQuantity: '',
                  sku: '',
                  barcode: '',
                });
              }}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderContainer}>
                {['unisex', 'male', 'female', 'kids'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderOption,
                      currentVariant.gender === gender && styles.genderOptionSelected
                    ]}
                    onPress={() => setCurrentVariant({ ...currentVariant, gender })}
                  >
                    <Text style={[
                      styles.genderOptionText,
                      currentVariant.gender === gender && styles.genderOptionTextSelected
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
                value={currentVariant.size}
                onChangeText={(text) => setCurrentVariant({ ...currentVariant, size: text })}
              />

              <Text style={styles.label}>Color</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Red, Blue, Black"
                value={currentVariant.color}
                onChangeText={(text) => setCurrentVariant({ ...currentVariant, color: text })}
              />

              <Text style={styles.label}>Pricing</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="MRP"
                  value={currentVariant.mrp}
                  onChangeText={(text) => setCurrentVariant({ ...currentVariant, mrp: text })}
                  keyboardType="decimal-pad"
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Selling Price"
                  value={currentVariant.sellingPrice}
                  onChangeText={(text) => setCurrentVariant({ ...currentVariant, sellingPrice: text })}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Cost Price"
                  value={currentVariant.costPrice}
                  onChangeText={(text) => setCurrentVariant({ ...currentVariant, costPrice: text })}
                  keyboardType="decimal-pad"
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Purchase Quantity *"
                  value={currentVariant.purchaseQuantity}
                  onChangeText={(text) => setCurrentVariant({ ...currentVariant, purchaseQuantity: text })}
                  keyboardType="number-pad"
                />
              </View>

              <Text style={styles.label}>Identification</Text>
              <TextInput
                style={styles.input}
                placeholder="SKU (auto-generated if empty)"
                value={currentVariant.sku}
                onChangeText={(text) => setCurrentVariant({ ...currentVariant, sku: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Barcode"
                value={currentVariant.barcode}
                onChangeText={(text) => setCurrentVariant({ ...currentVariant, barcode: text })}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => {
                  setShowVariantModal(false);
                  setEditingVariantIndex(null);
                  setCurrentVariant({
                    gender: 'unisex',
                    size: '',
                    color: '',
                    mrp: '',
                    sellingPrice: '',
                    costPrice: '',
                    purchaseQuantity: '',
                    sku: '',
                    barcode: '',
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

      {/* Existing Category, Brand, Subcategory Modals remain the same */}
      <Modal visible={showCategoryModal} animationType="slide" transparent>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Select Category</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => renderModalItem(item, (selectedItem) => {
          setFormData({ ...formData, categoryId: selectedItem.id.toString(), subcategoryId: '' });
          setShowCategoryModal(false);
        })}
        style={styles.modalList}
      />
            <View style={styles.addNewContainer}>
              <TextInput
                style={styles.addNewInput}
                placeholder="Add new category"
                placeholderTextColor="#999"
                value={newCategory}
                onChangeText={setNewCategory}
              />
              <TouchableOpacity style={styles.addNewButton} onPress={handleAddCategory}>
                <Text style={styles.addNewButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.closeModalButton} 
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Brand and Subcategory modals remain the same */}
      {/* Brand Modal */}
       <Modal visible={showBrandModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
           <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Brand</Text>
             <FlatList
              data={brands}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => renderModalItem(item, (selectedItem) => {
                setFormData({ ...formData, brandId: selectedItem.id.toString() });
                setShowBrandModal(false);
              })}
              style={styles.modalList}
            />
            <View style={styles.addNewContainer}>
              <TextInput
                style={styles.addNewInput}
                placeholder="Add new brand"
                placeholderTextColor="#999"
                value={newBrand}
                onChangeText={setNewBrand}
              />
              <TouchableOpacity style={styles.addNewButton} onPress={handleAddBrand}>
                <Text style={styles.addNewButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.closeModalButton} 
              onPress={() => setShowBrandModal(false)}
            >
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

     
      <Modal visible={showSubcategoryModal} animationType="slide" transparent>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Select Subcategory</Text>
      <FlatList
        data={subcategories} // Add this line - you were missing the data prop
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => renderModalItem(item, (selectedItem) => {
          setFormData({ ...formData, subcategoryId: selectedItem.id.toString() });
          setShowSubcategoryModal(false);
        })}
        style={styles.modalList}
      />
      <View style={styles.addNewContainer}>
        <TextInput
          style={styles.addNewInput}
          placeholder="Add new subcategory"
          placeholderTextColor="#999"
          value={newSubcategory}
          onChangeText={setNewSubcategory}
        />
        <TouchableOpacity style={styles.addNewButton} onPress={handleAddSubcategory}>
          <Text style={styles.addNewButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.closeModalButton} 
        onPress={() => setShowSubcategoryModal(false)}
      >
        <Text style={styles.closeModalText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    color: '#333333',
  },
  selector: {
    justifyContent: 'center',
  },
  selectorText: {
    color: '#999',
  },
  selectorTextSelected: {
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  textArea: {
    height: 80,
  },
  previewButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  previewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalList: {
    maxHeight: 200,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
  },
  addNewContainer: {
    flexDirection: 'row',
    marginVertical: 15,
  },
  addNewInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  addNewButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addNewButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  closeModalButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Variants Styles
  variantsSection: {
    marginTop: 20,
    marginBottom: 20,
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
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalContent: {
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  button: {
    flex: 1,
    padding: 12,
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
  imageButton: {
  backgroundColor: '#FF9500',
  padding: 15,
  borderRadius: 8,
  alignItems: 'center',
  marginBottom: 15,
},
imageButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
imageText: {
  textAlign: 'center',
  marginBottom: 15,
  color: '#666',
  fontStyle: 'italic',
},
});

export default StockEntryScreen;


// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
//   Modal,
//   FlatList,
//   Platform
// } from 'react-native';
// import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import { stockAPI } from '../api/api';
// import { useAuth } from '../context/AuthContext';

// const StockEntryScreen = ({ navigation }) => {
//   const { user } = useAuth();
//   const [formData, setFormData] = useState({
//     itemId: '',
//     itemName: '',
//     categoryId: '',
//     subcategoryId: '',
//     brandId: '',
//     model: '',
//     color: '',
//     size: '',
//     mrp: '',
//     sellingPrice: '',
//     purchasePrice: '',
//     purchaseQuantity: '',
//     billNumber: '',
//     notes: '',
//   });
//   const [image, setImage] = useState(null);
//   const [categories, setCategories] = useState([]);
//   const [brands, setBrands] = useState([]);
//   const [subcategories, setSubcategories] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [showCategoryModal, setShowCategoryModal] = useState(false);
//   const [showBrandModal, setShowBrandModal] = useState(false);
//   const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
//   const [newCategory, setNewCategory] = useState('');
//   const [newBrand, setNewBrand] = useState('');
//   const [newSubcategory, setNewSubcategory] = useState('');

//   useEffect(() => {
//     loadInitialData();
//   }, []);

//   useEffect(() => {
//     if (formData.categoryId) {
//       loadSubcategories();
//     }
//   }, [formData.categoryId]);

//   const loadInitialData = async () => {
//     try {
//       const [cats, brds] = await Promise.all([
//         stockAPI.getCategories(),
//         stockAPI.getBrands()
//       ]);
//       setCategories(cats);
//       setBrands(brds);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to load initial data');
//     }
//   };

//   const loadSubcategories = async () => {
//     try {
//       const subs = await stockAPI.getSubcategories(formData.categoryId);
//       setSubcategories(subs);
//     } catch (error) {
//       console.log('Error loading subcategories:', error);
//     }
//   };

//   const handleImagePick = () => {
//     Alert.alert('Select Image', 'Choose image source', [
//       {
//         text: 'Camera',
//         onPress: takePhoto,
//       },
//       {
//         text: 'Gallery',
//         onPress: pickImage,
//       },
//       {
//         text: 'Cancel',
//         style: 'cancel',
//       },
//     ]);
//   };

//   const takePhoto = () => {
//     const options = {
//       mediaType: 'photo',
//       includeBase64: false,
//       maxHeight: 2000,
//       maxWidth: 2000,
//     };

//     launchCamera(options, (response) => {
//       if (response.didCancel) {
//         console.log('User cancelled camera');
//       } else if (response.error) {
//         Alert.alert('Error', 'Camera error: ' + response.error);
//       } else {
//         setImage(response.assets[0]);
//       }
//     });
//   };

//   const pickImage = () => {
//     const options = {
//       mediaType: 'photo',
//       includeBase64: false,
//       maxHeight: 2000,
//       maxWidth: 2000,
//     };

//     launchImageLibrary(options, (response) => {
//       if (response.didCancel) {
//         console.log('User cancelled image picker');
//       } else if (response.error) {
//         Alert.alert('Error', 'Image picker error: ' + response.error);
//       } else {
//         setImage(response.assets[0]);
//       }
//     });
//   };

//   const uploadImage = async () => {
//     if (!image) return null;

//     const formData = new FormData();
//     formData.append('image', {
//       uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
//       type: image.type || 'image/jpeg',
//       name: image.fileName || 'photo.jpg',
//     });

//     try {
//       const response = await stockAPI.uploadImage(formData);
//       return response.imageUrl;
//     } catch (error) {
//       Alert.alert('Error', 'Failed to upload image');
//       return null;
//     }
//   };

//   const handleAddCategory = async () => {
//     if (!newCategory.trim()) return;

//     try {
//       const category = await stockAPI.createCategory({ name: newCategory });
//       setCategories([...categories, category]);
//       setNewCategory('');
//       setShowCategoryModal(false);
//       setFormData({ ...formData, categoryId: category.id.toString() });
//     } catch (error) {
//       Alert.alert('Error', 'Failed to add category');
//     }
//   };


  
//   const handleAddBrand = async () => {
//     if (!newBrand.trim()) return;

//     try {
//       const brand = await stockAPI.createBrand({ name: newBrand });
//       setBrands([...brands, brand]);
//       setNewBrand('');
//       setShowBrandModal(false);
//       setFormData({ ...formData, brandId: brand.id.toString() });
//     } catch (error) {
//       Alert.alert('Error', 'Failed to add brand');
//     }
//   };

//   const handleAddSubcategory = async () => {
//   if (!newSubcategory.trim() || !formData.categoryId) return;

//   try {
//     const subcategoryData = {
//       name: newSubcategory,
//       category_id: parseInt(formData.categoryId)
//     };
    
//     const response = await stockAPI.createSubcategory(subcategoryData);
    
//     // 201 status means success - refresh the list regardless of response format
//     console.log('Subcategory created successfully');
    
//     // Refresh subcategories list
//     const subs = await stockAPI.getSubcategories(formData.categoryId);
//     setSubcategories(subs);
//     setNewSubcategory('');
//     setShowSubcategoryModal(false);
    
//     // Try to get the ID from different response formats
//     const subcategoryId = response.id || response.data?.id;
//     if (subcategoryId) {
//       setFormData({ ...formData, subcategoryId: subcategoryId.toString() });
//     }
    
//   } catch (error) {
//     console.log('Error creating subcategory:', error);
//     // Only show alert for actual errors, not for 201 responses
//     if (!error.message.includes('201')) {
//       Alert.alert('Error', 'Failed to add subcategory: ' + error.message);
//     }
//   }
// };

//   const handlePreview = async () => {
//     if (!formData.itemId || !formData.itemName || !formData.purchaseQuantity) {
//       Alert.alert('Error', 'Please fill in required fields: Item ID, Item Name, and Purchase Quantity');
//       return;
//     }

//     setIsLoading(true);
//     const imageUrl = await uploadImage();
//     setIsLoading(false);

//     navigation.navigate('StockPreview', {
//       formData: { ...formData, imageUrl },
//       image: image
//     });
//   };

//   const renderModalItem = (item, onSelect) => (
//     <TouchableOpacity
//       style={styles.modalItem}
//       onPress={() => onSelect(item)}
//     >
//       <Text style={styles.modalItemText}>{item.name}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//       <Text style={styles.title}>Stock Entry</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Item ID *"
//         placeholderTextColor="#999"
//         value={formData.itemId}
//         onChangeText={(text) => setFormData({ ...formData, itemId: text })}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Item Name *"
//         placeholderTextColor="#999"
//         value={formData.itemName}
//         onChangeText={(text) => setFormData({ ...formData, itemName: text })}
//       />

//       <View style={styles.row}>
//         <TouchableOpacity 
//           style={[styles.input, styles.selector]}
//           onPress={() => setShowCategoryModal(true)}
//         >
//           <Text style={formData.categoryId ? styles.selectorTextSelected : styles.selectorText}>
//             {formData.categoryId 
//               ? categories.find(c => c.id.toString() === formData.categoryId)?.name 
//               : 'Select Category'}
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity 
//           style={[styles.input, styles.selector]}
//           onPress={() => setShowSubcategoryModal(true)}
//         >
//           <Text style={formData.subcategoryId ? styles.selectorTextSelected : styles.selectorText}>
//             {formData.subcategoryId 
//               ? subcategories.find(s => s.id.toString() === formData.subcategoryId)?.name 
//               : 'Select Subcategory'}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity 
//         style={[styles.input, styles.selector]}
//         onPress={() => setShowBrandModal(true)}
//       >
//         <Text style={formData.brandId ? styles.selectorTextSelected : styles.selectorText}>
//           {formData.brandId 
//             ? brands.find(b => b.id.toString() === formData.brandId)?.name 
//             : 'Select Brand'}
//         </Text>
//       </TouchableOpacity>

//       <TextInput
//         style={styles.input}
//         placeholder="Model"
//         placeholderTextColor="#999"
//         value={formData.model}
//         onChangeText={(text) => setFormData({ ...formData, model: text })}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Color"
//         placeholderTextColor="#999"
//         value={formData.color}
//         onChangeText={(text) => setFormData({ ...formData, color: text })}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Size"
//         placeholderTextColor="#999"
//         value={formData.size}
//         onChangeText={(text) => setFormData({ ...formData, size: text })}
//       />

//       <View style={styles.row}>
//         <TextInput
//           style={[styles.input, styles.halfInput]}
//           placeholder="MRP"
//           placeholderTextColor="#999"
//           value={formData.mrp}
//           onChangeText={(text) => setFormData({ ...formData, mrp: text })}
//           keyboardType="decimal-pad"
//         />

//         <TextInput
//           style={[styles.input, styles.halfInput]}
//           placeholder="Selling Price"
//           placeholderTextColor="#999"
//           value={formData.sellingPrice}
//           onChangeText={(text) => setFormData({ ...formData, sellingPrice: text })}
//           keyboardType="decimal-pad"
//         />
//       </View>

//       <View style={styles.row}>
//         <TextInput
//           style={[styles.input, styles.halfInput]}
//           placeholder="Purchase Price"
//           placeholderTextColor="#999"
//           value={formData.purchasePrice}
//           onChangeText={(text) => setFormData({ ...formData, purchasePrice: text })}
//           keyboardType="decimal-pad"
//         />

//         <TextInput
//           style={[styles.input, styles.halfInput]}
//           placeholder="Purchase Quantity *"
//           placeholderTextColor="#999"
//           value={formData.purchaseQuantity}
//           onChangeText={(text) => setFormData({ ...formData, purchaseQuantity: text })}
//           keyboardType="number-pad"
//         />
//       </View>

//       <TextInput
//         style={styles.input}
//         placeholder="Bill Number"
//         placeholderTextColor="#999"
//         value={formData.billNumber}
//         onChangeText={(text) => setFormData({ ...formData, billNumber: text })}
//       />

//       <TextInput
//         style={[styles.input, styles.textArea]}
//         placeholder="Notes"
//         placeholderTextColor="#999"
//         value={formData.notes}
//         onChangeText={(text) => setFormData({ ...formData, notes: text })}
//         multiline
//         numberOfLines={3}
//         textAlignVertical="top"
//       />

//       <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
//         <Text style={styles.imageButtonText}>
//           {image ? 'Change Image' : 'Add Image'}
//         </Text>
//       </TouchableOpacity>

//       {image && (
//         <Text style={styles.imageText}>Image selected: {image.fileName || 'photo'}</Text>
//       )}

//       <TouchableOpacity 
//         style={[styles.previewButton, isLoading && styles.buttonDisabled]} 
//         onPress={handlePreview}
//         disabled={isLoading}
//       >
//         {isLoading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.previewButtonText}>Preview Stock Entry</Text>
//         )}
//       </TouchableOpacity>

//       {/* Category Modal */}
//       <Modal visible={showCategoryModal} animationType="slide" transparent>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>Select Category</Text>
//             <FlatList
//               data={categories}
//               keyExtractor={(item) => item.id.toString()}
//               renderItem={({ item }) => renderModalItem(item, (selectedItem) => {
//                 setFormData({ ...formData, categoryId: selectedItem.id.toString(), subcategoryId: '' });
//                 setShowCategoryModal(false);
//               })}
//               style={styles.modalList}
//             />
//             <View style={styles.addNewContainer}>
//               <TextInput
//                 style={styles.addNewInput}
//                 placeholder="Add new category"
//                 placeholderTextColor="#999"
//                 value={newCategory}
//                 onChangeText={setNewCategory}
//               />
//               <TouchableOpacity style={styles.addNewButton} onPress={handleAddCategory}>
//                 <Text style={styles.addNewButtonText}>Add</Text>
//               </TouchableOpacity>
//             </View>
//             <TouchableOpacity 
//               style={styles.closeModalButton} 
//               onPress={() => setShowCategoryModal(false)}
//             >
//               <Text style={styles.closeModalText}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Brand Modal */}
//       <Modal visible={showBrandModal} animationType="slide" transparent>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>Select Brand</Text>
//             <FlatList
//               data={brands}
//               keyExtractor={(item) => item.id.toString()}
//               renderItem={({ item }) => renderModalItem(item, (selectedItem) => {
//                 setFormData({ ...formData, brandId: selectedItem.id.toString() });
//                 setShowBrandModal(false);
//               })}
//               style={styles.modalList}
//             />
//             <View style={styles.addNewContainer}>
//               <TextInput
//                 style={styles.addNewInput}
//                 placeholder="Add new brand"
//                 placeholderTextColor="#999"
//                 value={newBrand}
//                 onChangeText={setNewBrand}
//               />
//               <TouchableOpacity style={styles.addNewButton} onPress={handleAddBrand}>
//                 <Text style={styles.addNewButtonText}>Add</Text>
//               </TouchableOpacity>
//             </View>
//             <TouchableOpacity 
//               style={styles.closeModalButton} 
//               onPress={() => setShowBrandModal(false)}
//             >
//               <Text style={styles.closeModalText}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Subcategory Modal */}
//       <Modal visible={showSubcategoryModal} animationType="slide" transparent>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>Select Subcategory</Text>
//             <FlatList
//               data={subcategories}
//               keyExtractor={(item) => item.id.toString()}
//               renderItem={({ item }) => renderModalItem(item, (selectedItem) => {
//                 setFormData({ ...formData, subcategoryId: selectedItem.id.toString() });
//                 setShowSubcategoryModal(false);
//               })}
//               style={styles.modalList}
//             />
//             <View style={styles.addNewContainer}>
//               <TextInput
//                 style={styles.addNewInput}
//                 placeholder="Add new subcategory"
//                 placeholderTextColor="#999"
//                 value={newSubcategory}
//                 onChangeText={setNewSubcategory}
//               />
//               <TouchableOpacity style={styles.addNewButton} onPress={handleAddSubcategory}>
//                 <Text style={styles.addNewButtonText}>Add</Text>
//               </TouchableOpacity>
//             </View>
//             <TouchableOpacity 
//               style={styles.closeModalButton} 
//               onPress={() => setShowSubcategoryModal(false)}
//             >
//               <Text style={styles.closeModalText}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 15,
//     backgroundColor: '#f5f5f5',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//     color: '#333',
//   },
//   input: {
//     backgroundColor: '#fff',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     fontSize: 16,
//     color: '#333333',
//   },
//   selector: {
//     justifyContent: 'center',
//   },
//   selectorText: {
//     color: '#999',
//   },
//   selectorTextSelected: {
//     color: '#333',
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   halfInput: {
//     width: '48%',
//   },
//   textArea: {
//     height: 80,
//   },
//   imageButton: {
//     backgroundColor: '#FF9500',
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   imageButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   imageText: {
//     textAlign: 'center',
//     marginBottom: 15,
//     color: '#666',
//     fontStyle: 'italic',
//   },
//   previewButton: {
//     backgroundColor: '#007AFF',
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 30,
//   },
//   buttonDisabled: {
//     backgroundColor: '#ccc',
//   },
//   previewButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     padding: 20,
//   },
//   modalContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     padding: 20,
//     maxHeight: '80%',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   modalList: {
//     maxHeight: 200,
//   },
//   modalItem: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   modalItemText: {
//     fontSize: 16,
//   },
//   addNewContainer: {
//     flexDirection: 'row',
//     marginVertical: 15,
//   },
//   addNewInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 10,
//     marginRight: 10,
//   },
//   addNewButton: {
//     backgroundColor: '#007AFF',
//     padding: 10,
//     borderRadius: 8,
//     justifyContent: 'center',
//   },
//   addNewButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   closeModalButton: {
//     backgroundColor: '#FF3B30',
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   closeModalText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// export default StockEntryScreen;