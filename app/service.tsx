import { useRouter } from 'expo-router';
import { doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';
import { leadsCol } from '../database/db';



type ServiceClient = {
  id: string;
  name: string;
  neighbourhood?: string;
  system_size?: number;
  stage?: string;
};

export default function ServiceScreen() {
  const [clients, setClients] = useState<ServiceClient[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const loadServiceClients = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(leadsCol);
      const raw = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as any),
      }));

      const inService = raw
        .filter(c => c.stage === 'service')
        .map(c => ({
          id: c.id,
          name: c.name || 'No name',
          neighbourhood: c.neighbourhood,
          system_size: c.system_size,
          stage: c.stage,
        }));

      setClients(inService);
    } catch (err) {
      console.error('Error loading service clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const moveToContract = async (leadId: string) => {
    try {
      const ref = doc(leadsCol.firestore, 'leads', leadId);
      await updateDoc(ref, { stage: 'contract' });
      await loadServiceClients();
    } catch (err) {
      console.error('Error moving client back to contract:', err);
    }
  };

  const moveToBilling = async (leadId: string) => {
    try {
      const ref = doc(leadsCol.firestore, 'leads', leadId);
      await updateDoc(ref, { stage: 'billing' });
      await loadServiceClients();
    } catch (err) {
      console.error('Error moving client to billing:', err);
    }
  };

  const updateStage = async (leadId: string, stage: string) => {
    try {
      const ref = doc(leadsCol, leadId);
      await updateDoc(ref, { stage });
      await loadServiceClients();
    } catch (err) {
      console.error('Error updating stage:', err);
    }
  };


  useEffect(() => {
    loadServiceClients();
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
        Service – solarapp
        
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <View style={{ marginRight: 8 }}>
            <Button
              title="CONTRACT"
              onPress={() => router.push('/contract')}
            />
          </View>
          <View>
            <Button
              title="BILLING"
              onPress={() => router.push('/billing')}
            />
          </View>
        </View>
      
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 8 }}>
        Clients in Service stage:
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

            <View
              style={{
                flexDirection: 'row',
                marginTop: 8,
              }}
            >
              <View style={{ marginRight: 8 }}>
                <Button
                  title="Move Contract"
                  onPress={() => updateStage(client.id, 'contract')}
                />
              </View>
              <View>
                <Button
                  title="Move Billing"
                  onPress={() => updateStage(client.id, 'billing')}
                />
              </View>
            </View>
          </View>
        ))}


      {!loading && clients.length === 0 && (
        <Text>No clients in Service stage yet.</Text>
      )}
    </ScrollView>
  );
}
