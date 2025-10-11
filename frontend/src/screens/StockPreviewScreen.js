import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  Image
} from 'react-native';
import { stockAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

const StockPreviewScreen = ({ route, navigation }) => {
  const { formData, image } = route.params;
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // First create the product
      const productData = {
        item_id: formData.itemId,
        item_name: formData.itemName,
        category_id: formData.categoryId ? parseInt(formData.categoryId) : null,
        subcategory_id: formData.subcategoryId ? parseInt(formData.subcategoryId) : null,
        brand_id: formData.brandId ? parseInt(formData.brandId) : null,
        model: formData.model,
        description: formData.description,
        low_stock_threshold: 10, // Default value
        variants: formData.variants.map(variant => ({
          gender: variant.gender,
          size: variant.size,
          color: variant.color,
          mrp: parseFloat(variant.mrp) || 0,
          selling_price: parseFloat(variant.sellingPrice) || 0,
          cost_price: parseFloat(variant.costPrice) || 0,
          sku: variant.sku,
          barcode: variant.barcode,
          current_stock: parseInt(variant.purchaseQuantity) || 0,
        }))
      };

      // Use createProduct instead of createProductWithVariants
      const product = await stockAPI.createProduct(productData);

      Alert.alert('Success', 'Product with variants added successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add product: ' + error.message);
      console.log('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderVariantItem = ({ item, index }) => (
    <View style={styles.variantCard}>
      <Text style={styles.variantTitle}>
        Variant {index + 1}: {item.gender} - {item.size} {item.color ? `- ${item.color}` : ''}
      </Text>
      <View style={styles.variantDetails}>
        <Text style={styles.variantText}>Quantity: {item.purchaseQuantity}</Text>
        <Text style={styles.variantText}>Cost Price: ₹{item.costPrice}</Text>
        <Text style={styles.variantText}>Selling Price: ₹{item.sellingPrice}</Text>
        <Text style={styles.variantText}>MRP: ₹{item.mrp}</Text>
        {item.sku && <Text style={styles.variantText}>SKU: {item.sku}</Text>}
        {item.barcode && <Text style={styles.variantText}>Barcode: {item.barcode}</Text>}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Preview Product Entry</Text>

      <View style={styles.previewCard}>
        <Text style={styles.sectionTitle}>Product Details</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Item ID:</Text>
          <Text style={styles.value}>{formData.itemId}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Item Name:</Text>
          <Text style={styles.value}>{formData.itemName}</Text>
        </View>

        {formData.categoryId && (
          <View style={styles.row}>
            <Text style={styles.label}>Category ID:</Text>
            <Text style={styles.value}>{formData.categoryId}</Text>
          </View>
        )}

        {formData.subcategoryId && (
          <View style={styles.row}>
            <Text style={styles.label}>Subcategory ID:</Text>
            <Text style={styles.value}>{formData.subcategoryId}</Text>
          </View>
        )}

        {formData.brandId && (
          <View style={styles.row}>
            <Text style={styles.label}>Brand ID:</Text>
            <Text style={styles.value}>{formData.brandId}</Text>
          </View>
        )}

        {formData.model && (
          <View style={styles.row}>
            <Text style={styles.label}>Model:</Text>
            <Text style={styles.value}>{formData.model}</Text>
          </View>
        )}

        {formData.description && (
          <View style={styles.row}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{formData.description}</Text>
          </View>
        )}

        {formData.imageUrl && (
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Product Image</Text>
            <Image 
              source={{ uri: image?.uri || formData.imageUrl }} 
              style={styles.previewImage}
              resizeMode="cover"
            />
          </View>
        )}

        <Text style={styles.sectionTitle}>Product Variants</Text>
        
        {formData.variants && formData.variants.length > 0 ? (
          <FlatList
            data={formData.variants}
            renderItem={renderVariantItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.noVariantsText}>No variants added</Text>
        )}

        <Text style={styles.addedBy}>Added by: {user?.username} ({user?.role})</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.backButton]} 
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.backButtonText}>Back to Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.submitButton, isLoading && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Confirm & Submit</Text>
          )}
        </TouchableOpacity>
      </View>
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
  previewCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
  },
  variantCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  variantTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  variantDetails: {
    marginLeft: 10,
  },
  variantText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  noVariantsText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
  imageSection: {
    marginTop: 15,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  addedBy: {
    marginTop: 15,
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  backButton: {
    backgroundColor: '#8E8E93',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StockPreviewScreen;

// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   Image
// } from 'react-native';
// import { stockAPI } from '../api/api';
// import { useAuth } from '../context/AuthContext';

// const StockPreviewScreen = ({ route, navigation }) => {
//   const { formData, image } = route.params;
//   const { user } = useAuth();
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async () => {
//     setIsLoading(true);
//     try {
//       // First create the product
//       const product = await stockAPI.createProduct({
//         item_id: formData.itemId,
//         item_name: formData.itemName,
//         category_id: formData.categoryId ? parseInt(formData.categoryId) : null,
//         subcategory_id: formData.subcategoryId ? parseInt(formData.subcategoryId) : null,
//         brand_id: formData.brandId ? parseInt(formData.brandId) : null,
//         model: formData.model,
//         color: formData.color,
//         size: formData.size,
//         mrp: formData.mrp ? parseFloat(formData.mrp) : 0,
//         selling_price: formData.sellingPrice ? parseFloat(formData.sellingPrice) : 0,
//         image_url: formData.imageUrl,
//       });

//       // Then create stock entry
//       await stockAPI.createStockEntry({
//         product_id: product.id,
//         bill_number: formData.billNumber,
//         purchase_quantity: parseInt(formData.purchaseQuantity),
//         purchase_price: formData.purchasePrice ? parseFloat(formData.purchasePrice) : 0,
//         mrp: formData.mrp ? parseFloat(formData.mrp) : 0,
//         selling_price: formData.sellingPrice ? parseFloat(formData.sellingPrice) : 0,
//         notes: formData.notes,
//       });

//       Alert.alert('Success', 'Stock entry added successfully!', [
//         { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
//       ]);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to add stock entry: ' + error.message);
//       console.log('Error:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getCategoryName = (id) => {
//     // This would ideally come from your categories state
//     return id || 'Not selected';
//   };

//   const getBrandName = (id) => {
//     // This would ideally come from your brands state
//     return id || 'Not selected';
//   };

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//       <Text style={styles.title}>Preview Stock Entry</Text>

//       <View style={styles.previewCard}>
//         <Text style={styles.sectionTitle}>Product Details</Text>
        
//         <View style={styles.row}>
//           <Text style={styles.label}>Item ID:</Text>
//           <Text style={styles.value}>{formData.itemId}</Text>
//         </View>

//         <View style={styles.row}>
//           <Text style={styles.label}>Item Name:</Text>
//           <Text style={styles.value}>{formData.itemName}</Text>
//         </View>

//         {formData.categoryId && (
//           <View style={styles.row}>
//             <Text style={styles.label}>Category:</Text>
//             <Text style={styles.value}>{getCategoryName(formData.categoryId)}</Text>
//           </View>
//         )}

//         {formData.subcategoryId && (
//           <View style={styles.row}>
//             <Text style={styles.label}>Subcategory:</Text>
//             <Text style={styles.value}>{formData.subcategoryId}</Text>
//           </View>
//         )}

//         {formData.brandId && (
//           <View style={styles.row}>
//             <Text style={styles.label}>Brand:</Text>
//             <Text style={styles.value}>{getBrandName(formData.brandId)}</Text>
//           </View>
//         )}

//         {formData.model && (
//           <View style={styles.row}>
//             <Text style={styles.label}>Model:</Text>
//             <Text style={styles.value}>{formData.model}</Text>
//           </View>
//         )}

//         {formData.color && (
//           <View style={styles.row}>
//             <Text style={styles.label}>Color:</Text>
//             <Text style={styles.value}>{formData.color}</Text>
//           </View>
//         )}

//         {formData.size && (
//           <View style={styles.row}>
//             <Text style={styles.label}>Size:</Text>
//             <Text style={styles.value}>{formData.size}</Text>
//           </View>
//         )}

//         <Text style={styles.sectionTitle}>Pricing & Quantity</Text>

//         {formData.mrp && (
//           <View style={styles.row}>
//             <Text style={styles.label}>MRP:</Text>
//             <Text style={styles.value}>₹{formData.mrp}</Text>
//           </View>
//         )}

//         {formData.sellingPrice && (
//           <View style={styles.row}>
//             <Text style={styles.label}>Selling Price:</Text>
//             <Text style={styles.value}>₹{formData.sellingPrice}</Text>
//           </View>
//         )}

//         {formData.purchasePrice && (
//           <View style={styles.row}>
//             <Text style={styles.label}>Purchase Price:</Text>
//             <Text style={styles.value}>₹{formData.purchasePrice}</Text>
//           </View>
//         )}

//         <View style={styles.row}>
//           <Text style={styles.label}>Purchase Quantity:</Text>
//           <Text style={styles.value}>{formData.purchaseQuantity}</Text>
//         </View>

//         {formData.billNumber && (
//           <View style={styles.row}>
//             <Text style={styles.label}>Bill Number:</Text>
//             <Text style={styles.value}>{formData.billNumber}</Text>
//           </View>
//         )}

//         {formData.notes && (
//           <>
//             <Text style={styles.sectionTitle}>Notes</Text>
//             <Text style={styles.notes}>{formData.notes}</Text>
//           </>
//         )}

//         {image && (
//           <>
//             <Text style={styles.sectionTitle}>Image</Text>
//             <Image 
//               source={{ uri: image.uri }} 
//               style={styles.previewImage}
//               resizeMode="cover"
//             />
//           </>
//         )}

//         <Text style={styles.addedBy}>Added by: {user?.username} ({user?.role})</Text>
//       </View>

//       <View style={styles.buttonContainer}>
//         <TouchableOpacity 
//           style={[styles.button, styles.backButton]} 
//           onPress={() => navigation.goBack()}
//           disabled={isLoading}
//         >
//           <Text style={styles.backButtonText}>Back to Edit</Text>
//         </TouchableOpacity>

//         <TouchableOpacity 
//           style={[styles.button, styles.submitButton, isLoading && styles.buttonDisabled]} 
//           onPress={handleSubmit}
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.submitButtonText}>Confirm & Submit</Text>
//           )}
//         </TouchableOpacity>
//       </View>
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
//   previewCard: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 8,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginTop: 15,
//     marginBottom: 10,
//     color: '#333',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     paddingBottom: 5,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f5f5f5',
//   },
//   label: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '500',
//     flex: 1,
//   },
//   value: {
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '400',
//     flex: 1,
//     textAlign: 'right',
//   },
//   notes: {
//     fontSize: 14,
//     color: '#333',
//     lineHeight: 20,
//     marginTop: 5,
//     fontStyle: 'italic',
//   },
//   previewImage: {
//     width: '100%',
//     height: 200,
//     borderRadius: 8,
//     marginTop: 10,
//   },
//   addedBy: {
//     marginTop: 15,
//     fontSize: 12,
//     color: '#999',
//     fontStyle: 'italic',
//     textAlign: 'right',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 30,
//   },
//   button: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginHorizontal: 5,
//   },
//   backButton: {
//     backgroundColor: '#8E8E93',
//   },
//   submitButton: {
//     backgroundColor: '#007AFF',
//   },
//   buttonDisabled: {
//     backgroundColor: '#ccc',
//   },
//   backButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   submitButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// export default StockPreviewScreen;