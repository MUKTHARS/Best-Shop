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
Image
} from 'react-native';
import { stockAPI } from '../api/api';

const ProductsScreen = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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

        {selectedProduct.image_url && (
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Product Image</Text>
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: selectedProduct.image_url }} 
                style={styles.productImage}
                resizeMode="contain"
                onError={(error) => console.log('Image loading error:', error)}
              />
            </View>
            <Text style={styles.imagePathText}>Image Path: {selectedProduct.image_url}</Text>
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

  const renderProductItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleProductPress(item)}>
      <View style={styles.productCard}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{item.item_name}</Text>
          <Text style={styles.productId}>{item.item_id}</Text>
        </View>
        
        <View style={styles.productDetails}>
          {item.model && (
            <Text style={styles.detailText}>Model: {item.model}</Text>
          )}
          {item.color && (
            <Text style={styles.detailText}>Color: {item.color}</Text>
          )}
          {item.size && (
            <Text style={styles.detailText}>Size: {item.size}</Text>
          )}
          <View style={styles.priceContainer}>
            {item.mrp > 0 && (
              <Text style={styles.mrpText}>MRP: ₹{item.mrp}</Text>
            )}
            {item.selling_price > 0 && (
              <Text style={styles.sellingPriceText}>Selling: ₹{item.selling_price}</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
      <TextInput
        style={styles.searchInput}
        placeholder="Search products by name, ID, or model..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowDetailsModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {renderProductDetails()}
            </ScrollView>
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
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  productId: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  productDetails: {
    marginTop: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  mrpText: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  sellingPriceText: {
    fontSize: 16,
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
   imageContainer: {
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  productImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  imagePathText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default ProductsScreen;