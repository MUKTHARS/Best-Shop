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
  
  const canEditProducts = user?.role === 'admin' || user?.role === 'manager';
  const API_BASE_URL = Platform.OS === 'android' ? 'http://10.150.253.4:8080' : 'http://10.150.253.4:8080';

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
      loadProducts();
      Alert.alert('Success', 'Product updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update product: ' + error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
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
              loadProducts();
              Alert.alert('Success', 'Product deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product: ' + error.message);
            }
          }
        },
      ]
    );
  };

  const renderModalActions = () => {
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

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `${API_BASE_URL}${imagePath}`;
    return `${API_BASE_URL}/uploads/${imagePath}`;
  };

  const renderDetailRow = (label, value) => {
    if (!value && value !== 0) return null;
    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}:</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    );
  };

 const renderVariantItem = ({ item, index }) => {
  const variantImageUrl = item.image_url ? getFullImageUrl(item.image_url) : null;

  return (
    <View style={styles.variantCard}>
      <Text style={styles.variantTitle}>
        Variant {index + 1}: {item.gender} - {item.size} {item.color ? `- ${item.color}` : ''}
      </Text>
      
      {variantImageUrl && (
        <View style={styles.variantImagePreview}>
          <Image
            source={{ uri: variantImageUrl }}
            style={styles.variantThumbnail}
            resizeMode="cover"
          />
        </View>
      )}
      
      <View style={styles.variantDetails}>
        {renderDetailRow('Current Stock', item.current_stock)}
        {renderDetailRow('Cost Price', item.cost_price ? `₹${item.cost_price}` : null)}
        {renderDetailRow('Selling Price', item.selling_price ? `₹${item.selling_price}` : null)}
        {renderDetailRow('MRP', item.mrp ? `₹${item.mrp}` : null)}
        {renderDetailRow('SKU', item.sku)}
        {renderDetailRow('Barcode', item.barcode)}
      </View>
    </View>
  );
};

  const renderProductDetails = () => {
  if (!selectedProduct) return null;

  // Get all unique images from variants
  const variantImages = selectedProduct.variants 
    ? selectedProduct.variants.filter(v => v.image_url).map(v => ({
        image_url: v.image_url,
        label: `${v.gender} - ${v.size} ${v.color ? `- ${v.color}` : ''}`
      }))
    : [];

  return (
    <>
      {/* Product Images Section */}
      {variantImages.length > 0 && (
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Product Images</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.imagesContainer}>
              {variantImages.map((variant, index) => (
                <View key={index} style={styles.variantImageContainer}>
                  <Image 
                    source={{ uri: getFullImageUrl(variant.image_url) }} 
                    style={styles.variantImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.variantImageLabel}>{variant.label}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        {renderDetailRow('Item ID', selectedProduct.item_id)}
        {renderDetailRow('Item Name', selectedProduct.item_name)}
        {renderDetailRow('Model', selectedProduct.model)}
        {renderDetailRow('Description', selectedProduct.description)}
        {renderDetailRow('Low Stock Threshold', selectedProduct.low_stock_threshold)}
      </View>

      {selectedProduct.variants && selectedProduct.variants.length > 0 && (
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Product Variants ({selectedProduct.variants.length})</Text>
          <FlatList
            data={selectedProduct.variants}
            renderItem={renderVariantItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        </View>
      )}

      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        {renderDetailRow('Status', selectedProduct.is_active ? 'Active' : 'Inactive')}
        {renderDetailRow('Created', selectedProduct.created_at ? new Date(selectedProduct.created_at).toLocaleDateString() : null)}
        {renderDetailRow('Last Updated', selectedProduct.updated_at ? new Date(selectedProduct.updated_at).toLocaleDateString() : null)}
      </View>
    </>
  );
};

  const renderProductItem = ({ item }) => {
  // Get the first variant with an image or use the first variant
  const firstVariant = item.variants && item.variants.length > 0 ? item.variants[0] : null;
  
  // Try to get image from variants first, then from product
  let imageUrl = null;
  if (firstVariant && firstVariant.image_url) {
    imageUrl = getFullImageUrl(firstVariant.image_url);
  } else if (item.image_url) {
    imageUrl = getFullImageUrl(item.image_url);
  }

  return (
    <TouchableOpacity 
      style={styles.productCard} 
      onPress={() => handleProductPress(item)}
    >
      {imageUrl ? (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.productImagePreview}
            resizeMode="cover"
            onError={(error) => console.log("Image loading error:", error)}
          />
        </View>
      ) : (
        <View style={[styles.imagePreviewContainer, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>No Image</Text>
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
        
        {item.variants && item.variants.length > 0 && (
          <View style={styles.variantsSummary}>
            <Text style={styles.variantsText}>
              {item.variants.length} variant(s)
            </Text>
            <Text style={styles.variantsDetails}>
              Sizes: {[...new Set(item.variants.map(v => v.size))].join(', ')}
            </Text>
          </View>
        )}
        
        <View style={styles.priceContainer}>
          {item.variants && item.variants.length > 0 && (
            <Text style={styles.priceRange}>
              ₹{Math.min(...item.variants.map(v => v.selling_price || 0))} - 
              ₹{Math.max(...item.variants.map(v => v.selling_price || 0))}
            </Text>
          )}
        </View>
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
      <View style={styles.roleHeader}>
        <Text style={styles.roleText}>
          Logged in as: {user?.role} 
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
  priceRange: {
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
  variantImagePreview: {
  marginBottom: 8,
  alignItems: 'center',
},
variantThumbnail: {
  width: 80,
  height: 80,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: '#e0e0e0',
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
  variantsSummary: {
    marginTop: 4,
  },
  variantsText: {
    fontSize: 12,
    color: '#666',
  },
  variantsDetails: {
    fontSize: 11,
    color: '#999',
  },
  variantCard: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  variantTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  variantDetails: {
    marginLeft: 8,
  },
  placeholderImage: {
  backgroundColor: '#e0e0e0',
  justifyContent: 'center',
  alignItems: 'center',
},
placeholderText: {
  color: '#999',
  fontSize: 12,
},
imagesContainer: {
  flexDirection: 'row',
  paddingVertical: 10,
},
variantImageContainer: {
  marginRight: 15,
  alignItems: 'center',
},
variantImage: {
  width: 120,
  height: 120,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#e0e0e0',
},
variantImageLabel: {
  marginTop: 5,
  fontSize: 12,
  color: '#666',
  textAlign: 'center',
},
});

export default ProductsScreen;