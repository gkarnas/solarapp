// app/products.tsx
import { useRouter } from 'expo-router';
import { addDoc, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Button,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { db, productsCol } from '../database/db';



// =============================================================
// TYPES
// =============================================================
type Product = {
  id: string;
  item: 'inverter' | 'panel' | 'battery';
  brand: string;
  model: string;
  capacity: number;
  price: number;              // 👈 NOVO
};


// =============================================================
// COMPONENTE PRINCIPAL
// =============================================================
export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // form states
  const [item, setItem] = useState<'inverter' | 'panel' | 'battery'>('inverter');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState('');               
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);


  // =============================================================
  // LOAD PRODUCTS
  // =============================================================
  const loadProducts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(productsCol);
      const data: Product[] = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);


  // =============================================================
  // RESET FORM
  // =============================================================
  const resetForm = () => {
    setEditingId(null);
    setItem('inverter');
    setBrand('');
    setModel('');
    setCapacity('');
    setPrice('');            // 👈 reset price
    setErrorMsg(null);
  };


  // =============================================================
  // SAVE PRODUCT (CREATE / UPDATE)
  // =============================================================
  const saveProduct = async () => {
    setErrorMsg(null);

    if (!brand.trim() || !model.trim() || !capacity.trim() || !price.trim()) {
      setErrorMsg('Brand, model, capacity and price are required.');
      return;
    }

    const payload = {
      item,
      brand,
      model,
      capacity: Number(capacity),
      price: Number(price),   // 👈 salvando price
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), payload);
      } else {
        await addDoc(productsCol, payload);
      }
      await loadProducts();
      resetForm();
    } catch (err) {
      console.error('Error saving product:', err);
      setErrorMsg('Error saving product. Check console.');
    }
  };


  // =============================================================
  // EDIT PRODUCT
  // =============================================================
  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setItem(p.item);
    setBrand(p.brand);
    setModel(p.model);
    setCapacity(String(p.capacity));
    setPrice(String(p.price));               
  };


  // =============================================================
  // DELETE PRODUCT
  // =============================================================
  const removeProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      await loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };


  // =============================================================
  // RENDER GROUP (INVERTERS / PANELS / BATTERIES)
  // =============================================================
  const renderGroup = (title: string, key: Product['item']) => {
    const group = products.filter(p => p.item === key);
    if (!group.length) return null;

    return (
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>
          {title}
        </Text>

        {group.map(p => (
          <View
            key={p.id}
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              padding: 8,
              marginBottom: 6,
              backgroundColor: '#fafafa',
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>
              {p.brand} – {p.model}
            </Text>

            <Text>Capacity: {p.capacity}</Text>
            <Text>{`Price: $${p.price}`}</Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 4,
                gap: 8,
              }}
            >
              <TouchableOpacity onPress={() => startEdit(p)}>
                <Text style={{ color: '#007AFF' }}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => removeProduct(p.id)}>
                <Text style={{ color: 'red' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };


  // =============================================================
  // UI
  // =============================================================
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{
        paddingTop: 60,
        paddingHorizontal: 16,
        paddingBottom: 300
      }}
    >

      {/* BOTÃO FIXO PARA LEADS */}
      <View
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 20,
        }}
      >
        <TouchableOpacity onPress={() => router.push('/')}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>LEADS</Text>
        </TouchableOpacity>
      </View>

      <Text
        style={{
          fontSize: 22,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 16,
        }}
      >
        PRODUCTS
      </Text>

      {/* FORM */}
      <View
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 12,
          padding: 12,
          marginBottom: 16,
          backgroundColor: '#fafafa',
        }}
      >
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
          {editingId ? 'Edit product' : 'Add new product'}
        </Text>

        {/* Item selector */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          {(['inverter', 'panel', 'battery'] as const).map(opt => (
            <TouchableOpacity
              key={opt}
              onPress={() => setItem(opt)}
              style={{
                flex: 1,
                padding: 8,
                marginHorizontal: 2,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: item === opt ? '#007AFF' : '#ccc',
                backgroundColor: item === opt ? '#E6F0FF' : '#fff',
                alignItems: 'center',
              }}
            >
              <Text style={{ textTransform: 'capitalize' }}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Brand */}
        <Text>Brand</Text>
        <TextInput
          value={brand}
          onChangeText={setBrand}
          placeholder="Fronius, Sungrow..."
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 6,
            padding: 8,
            marginBottom: 8,
          }}
        />

        {/* Model */}
        <Text>Model</Text>
        <TextInput
          value={model}
          onChangeText={setModel}
          placeholder="Primo 5.0, SG5KTL..."
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 6,
            padding: 8,
            marginBottom: 8,
          }}
        />

        {/* Capacity */}
        <Text>Capacity</Text>
        <TextInput
          value={capacity}
          onChangeText={setCapacity}
          placeholder="6.6 kW, 440 W..."
          keyboardType="numeric"
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 6,
            padding: 8,
            marginBottom: 8,
          }}
        />

        {/* Price */}
        <Text>Price</Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          placeholder="1000"
          keyboardType="numeric"
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 6,
            padding: 8,
            marginBottom: 8,
          }}
        />

        {errorMsg && (
          <Text style={{ color: 'red', marginBottom: 8 }}>{errorMsg}</Text>
        )}

        <Button
          title={editingId ? 'Save changes' : 'Add product'}
          onPress={saveProduct}
        />

        {editingId && (
          <View style={{ marginTop: 8,  }}>
            <Button title="Cancel edit" color="#999" onPress={resetForm} />
          </View>
        )}
      </View>

      {/* LIST GROUPS */}
      {loading && <Text>Loading...</Text>}

      {!loading && (
        <>
          {renderGroup('Inverters', 'inverter')}
          {renderGroup('Panels', 'panel')}
          {renderGroup('Batteries', 'battery')}
        </>
      )}
    </ScrollView>
  );
}
