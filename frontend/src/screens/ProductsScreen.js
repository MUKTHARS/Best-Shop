import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Platform
} from 'react-native';
import { stockAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import EditProductModal from './EditProductModal';

const ProductsScreen = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Add this line - Check if user can edit/delete products
  const canEditProducts = user?.role === 'admin' || user?.role === 'manager';
  
  // Use different URLs based on platform for image loading
  const API_BASE_URL = Platform.OS === 'android' ? 'http://10.150.254.234:8080' : 'http://10.150.254.234:8080';

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(product =>
        product.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.item_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.model && product.model.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const handleEditProduct = (product) => {
    // Add access check
    if (!canEditProducts) {
      Alert.alert('Access Denied', 'You do not have permission to edit products');
      return;
    }
    
    setEditingProduct(product);
    setShowEditModal(true);
    setShowDetailsModal(false);
  };

  const handleUpdateProduct = async (updatedProduct) => {
    try {
      await stockAPI.updateProduct(editingProduct.id, updatedProduct);
      setShowEditModal(false);
      setEditingProduct(null);
      loadProducts(); // Refresh the list
      Alert.alert('Success', 'Product updated successfully');
    } catch (error) {
      console.log('Error', 'Failed to update product: ' + error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    // Add access check
    if (!canEditProducts) {
      Alert.alert('Access Denied', 'You do not have permission to delete products');
      return;
    }

    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await stockAPI.deleteProduct(productId);
              setShowDetailsModal(false);
              loadProducts(); // Refresh the list
              Alert.alert('Success', 'Product deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product: ' + error.message);
            }
          }
        },
      ]
    );
  };

  // MODIFY THIS FUNCTION - Update the role check
  const renderModalActions = () => {
    // Change from 'admin' to 'admin' or 'manager'
    if (!canEditProducts) return null;
    
    return (
      <View style={styles.modalActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditProduct(selectedProduct)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteProduct(selectedProduct.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const loadProducts = async () => {
    try {
      const data = await stockAPI.getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const handleProductPress = (product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  // Function to get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it starts with /uploads, prepend the base URL
    if (imagePath.startsWith('/uploads')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    
    // If it's just a filename, construct the full path
    return `${API_BASE_URL}/uploads/${imagePath}`;
  };

  // Move renderDetailRow outside of the component return to avoid conditional hook calls
  const renderDetailRow = (label, value) => {
    if (!value) return null;
    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}:</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    );
  };

  const renderProductDetails = () => {
    if (!selectedProduct) return null;

    const fullImageUrl = getFullImageUrl(selectedProduct.image_url);

    return (
      <>
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          {renderDetailRow('Item ID', selectedProduct.item_id)}
          {renderDetailRow('Item Name', selectedProduct.item_name)}
          {renderDetailRow('Category', selectedProduct.category_name)}
          {renderDetailRow('Subcategory', selectedProduct.subcategory_name)}
          {renderDetailRow('Brand', selectedProduct.brand_name)}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Product Specifications</Text>
          {renderDetailRow('Model', selectedProduct.model)}
          {renderDetailRow('Color', selectedProduct.color)}
          {renderDetailRow('Size', selectedProduct.size)}
          {renderDetailRow('SKU', selectedProduct.sku)}
          {renderDetailRow('Barcode', selectedProduct.barcode)}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Pricing Information</Text>
          {renderDetailRow('Cost Price', selectedProduct.cost_price ? `₹${selectedProduct.cost_price}` : null)}
          {renderDetailRow('MRP', selectedProduct.mrp ? `₹${selectedProduct.mrp}` : null)}
          {renderDetailRow('Selling Price', selectedProduct.selling_price ? `₹${selectedProduct.selling_price}` : null)}
        </View>

        {fullImageUrl && (
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Product Image</Text>
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: fullImageUrl }} 
                style={styles.productImage}
                resizeMode="contain"
                onError={(error) => {
                  console.log('Image loading error:', error);
                  console.log('Failed to load image from:', fullImageUrl);
                }}
                onLoad={() => console.log('Image loaded successfully:', fullImageUrl)}
              />
            </View>
          </View>
        )}

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          {renderDetailRow('Description', selectedProduct.description)}
          {renderDetailRow('Low Stock Threshold', selectedProduct.low_stock_threshold ? selectedProduct.low_stock_threshold.toString() : null)}
          {renderDetailRow('Status', selectedProduct.is_active ? 'Active' : 'Inactive')}
          {renderDetailRow('Created', selectedProduct.created_at ? new Date(selectedProduct.created_at).toLocaleDateString() : null)}
          {renderDetailRow('Last Updated', selectedProduct.updated_at ? new Date(selectedProduct.updated_at).toLocaleDateString() : null)}
        </View>
      </>
    );
  };

  const renderProductItem = ({ item }) => {
    const fullImageUrl = getFullImageUrl(item.image_url);

    return (
      <TouchableOpacity 
        style={styles.productCard} 
        onPress={() => handleProductPress(item)}
      >
        {fullImageUrl && (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: fullImageUrl }}
              style={styles.productImagePreview}
              resizeMode="cover"
              onError={(error) =>
                console.log("Preview image loading error:", error)
              }
            />
          </View>
        )}
        
        <View style={styles.productContent}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.item_name}
          </Text>
          <Text style={styles.productId}>{item.item_id}</Text>
          
          {item.model && (
            <Text style={styles.detailText} numberOfLines={1}>
              {item.model}
            </Text>
          )}
          
          <View style={styles.priceContainer}>
            {item.selling_price > 0 && (
              <Text style={styles.sellingPriceText}>
                ₹{item.selling_price}
              </Text>
            )}
          </View>
          
          {/* ADD: Role-based access indicator */}
          {!canEditProducts && (
            <View > 
              {/* style={styles.readOnlyBadge} */}
              {/* <Text style={styles.readOnlyText}>View Only</Text> */}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ADD: User role indicator */}
      <View style={styles.roleHeader}>
        <Text style={styles.roleText}>
          Logged in as: {user?.role} 
          {!canEditProducts}
        </Text>
      </View>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search products by name, ID, or model..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        numColumns={2} 
        columnWrapperStyle={styles.columnWrapper} 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No products found matching your search' : 'No products available'}
            </Text>
          </View>
        }
      />

      {/* Product Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Product Details</Text>
              <View style={styles.headerRight}>
                {renderModalActions()}
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowDetailsModal(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.modalContent}>
              {renderProductDetails()}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Edit Product Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <EditProductModal
          product={editingProduct}
          onSave={handleUpdateProduct}
          onCancel={() => setShowEditModal(false)}
        />
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
  // ADD: Role header styles
  roleHeader: {
    backgroundColor: '#007AFF',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
  },
  roleText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  // ADD: Read-only badge styles
  readOnlyBadge: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  readOnlyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    width: '48%',
  },
  productContent: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productId: {
    fontSize: 11,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceContainer: {
    marginTop: 4,
  },
  sellingPriceText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 0,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  // Image Styles
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: 300, 
    height: 300, 
    alignSelf: 'center',
  },
  productImage: {
    width: 280,
    height: 280, 
    borderRadius: 8,
  },
  imagePreviewContainer: {
    width: '100%',
    height: 100,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
    marginBottom: 8,
  },
  productImagePreview: {
    width: '100%',
    height: '100%',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    marginRight: 15,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: '#FFA500',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});

export default ProductsScreen;

