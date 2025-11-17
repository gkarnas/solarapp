// app/afterSales.tsx
import { useRouter } from 'expo-router';
import { doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';
import { leadsCol } from '../database/db';

type AfterSalesClient = {
  id: string;
  name: string;
  neighbourhood?: string;
  system_size?: number;
  stage?: string;
};

export default function AfterSalesScreen() {
  const [clients, setClients] = useState<AfterSalesClient[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loadAfterSalesClients = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(leadsCol);
      const raw = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as any),
      }));

      const inAfterSales = raw
        .filter(c => c.stage === 'after_sales')
        .map(c => ({
          id: c.id,
          name: c.name || 'No name',
          neighbourhood: c.neighbourhood,
          system_size: c.system_size,
          stage: c.stage,
        }));

      setClients(inAfterSales);
    } catch (err) {
      console.error('Error loading after-sales clients:', err);
    } finally {
      setLoading(false);
    }
  };

    const updateStage = async (leadId: string, stage: string) => {
    try {
        const ref = doc(leadsCol, leadId);
        await updateDoc(ref, { stage });
        await loadAfterSalesClients();
    } catch (err) {
        console.error('Error updating stage:', err);
    }
    };

  useEffect(() => {
    loadAfterSalesClients();
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{
        paddingTop: 60,
        paddingHorizontal: 16,
        paddingBottom: 40,
      }}
    >
      <Text style={{ fontSize: 22, marginBottom: 16 }}>
        After-sales – solarapp
      </Text>

        <View style={{ marginBottom: 16 }}>
            <Button
                title="Back: Billing"
                onPress={() => router.push('/billing')}
            />
            </View>

      <Text style={{ fontSize: 16, marginBottom: 8 }}>
        Clients in After-sales stage:
      </Text>

      {loading && <Text>Loading...</Text>}

      {!loading &&
        clients.map(client => (
            <View key={client.id} style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: 'bold' }}>
                {client.name}
                {client.system_size ? ` – ${client.system_size} kW` : ''}
            </Text>
            {client.neighbourhood ? (
                <Text>{client.neighbourhood}</Text>
            ) : null}

            <View style={{ marginTop: 8 }}>
                <Button
                title="Back: Billing"
                onPress={() => updateStage(client.id, 'billing')}
                />
            </View>
            </View>
        ))}


      {!loading && clients.length === 0 && (
        <Text>No clients in After-sales stage yet.</Text>
      )}
    </ScrollView>
  );
}
