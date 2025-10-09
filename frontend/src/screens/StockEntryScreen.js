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
    color: '',
    size: '',
    mrp: '',
    sellingPrice: '',
    purchasePrice: '',
    purchaseQuantity: '',
    billNumber: '',
    notes: '',
  });
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

  const loadSubcategories = async () => {
    try {
      const subs = await stockAPI.getSubcategories(formData.categoryId);
      setSubcategories(subs);
    } catch (error) {
      console.log('Error loading subcategories:', error);
    }
  };

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
    
    // 201 status means success - refresh the list regardless of response format
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
    // Only show alert for actual errors, not for 201 responses
    if (!error.message.includes('201')) {
      Alert.alert('Error', 'Failed to add subcategory: ' + error.message);
    }
  }
};

  const handlePreview = async () => {
    if (!formData.itemId || !formData.itemName || !formData.purchaseQuantity) {
      Alert.alert('Error', 'Please fill in required fields: Item ID, Item Name, and Purchase Quantity');
      return;
    }

    setIsLoading(true);
    const imageUrl = await uploadImage();
    setIsLoading(false);

    navigation.navigate('StockPreview', {
      formData: { ...formData, imageUrl },
      image: image
    });
  };

  const renderModalItem = (item, onSelect) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => onSelect(item)}
    >
      <Text style={styles.modalItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Stock Entry</Text>

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

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="MRP"
          placeholderTextColor="#999"
          value={formData.mrp}
          onChangeText={(text) => setFormData({ ...formData, mrp: text })}
          keyboardType="decimal-pad"
        />

        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Selling Price"
          placeholderTextColor="#999"
          value={formData.sellingPrice}
          onChangeText={(text) => setFormData({ ...formData, sellingPrice: text })}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Purchase Price"
          placeholderTextColor="#999"
          value={formData.purchasePrice}
          onChangeText={(text) => setFormData({ ...formData, purchasePrice: text })}
          keyboardType="decimal-pad"
        />

        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Purchase Quantity *"
          placeholderTextColor="#999"
          value={formData.purchaseQuantity}
          onChangeText={(text) => setFormData({ ...formData, purchaseQuantity: text })}
          keyboardType="number-pad"
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Bill Number"
        placeholderTextColor="#999"
        value={formData.billNumber}
        onChangeText={(text) => setFormData({ ...formData, billNumber: text })}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Notes"
        placeholderTextColor="#999"
        value={formData.notes}
        onChangeText={(text) => setFormData({ ...formData, notes: text })}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
        <Text style={styles.imageButtonText}>
          {image ? 'Change Image' : 'Add Image'}
        </Text>
      </TouchableOpacity>

      {image && (
        <Text style={styles.imageText}>Image selected: {image.fileName || 'photo'}</Text>
      )}

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

      {/* Category Modal */}
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

      {/* Subcategory Modal */}
      <Modal visible={showSubcategoryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Subcategory</Text>
            <FlatList
              data={subcategories}
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
});

export default StockEntryScreen;