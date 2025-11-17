// app/clients/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Button,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { leadsCol } from '../../database/db';

type ClientData = {
  name?: string;
  address?: string;
  neighbourhood?: string;
  system_size?: number;
  lead_origin?: string;
  desired_date?: string;
  battery_option?: boolean;
  extras?: string;
  stage?: string;
  obs_leads?: string;

  visit_start_note?: string;
  visit_final_note?: string;

  contract_start_note?: string;
  contract_final_note?: string;

  service_start_note?: string;
  service_final_note?: string;

  billing_start_note?: string;
  billing_final_note?: string;

  after_sales_start_note?: string;
  after_sales_final_note?: string;
};

export default function ClientDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const rawId = params.id;
  const clientId =
    Array.isArray(rawId) ? rawId[0] : (rawId as string | undefined);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [client, setClient] = useState<ClientData | null>(null);

  useEffect(() => {
    const loadClient = async () => {
      if (!clientId) {
        setLoading(false);
        setNotFound(true);
        return;
      }

      setLoading(true);
      try {
        const ref = doc(leadsCol, clientId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setClient(snap.data() as ClientData);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Error loading client:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadClient();
  }, [clientId]);

  if (!clientId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Invalid client id</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{
        paddingTop: 60,
        paddingHorizontal: 16,
        paddingBottom: 40,
      }}
    >
      <Text style={{ fontSize: 22, marginBottom: 8 }}>
        Client details
      </Text>
      <Text style={{ marginBottom: 16, color: '#666' }}>
        id: {clientId}
      </Text>

      {loading ? (
        <Text>Loading...</Text>
      ) : notFound ? (
        <Text>No client found in "leads" with this id.</Text>
      ) : !client ? (
        <Text>No data.</Text>
      ) : (
        <>
          {/* CORE INFO – READ ONLY */}
          <Text style={{ fontSize: 18, marginBottom: 8 }}>Basic info</Text>
          <Text>Name: {client.name || '-'}</Text>
          <Text>Address: {client.address || '-'}</Text>
          <Text>Neighbourhood: {client.neighbourhood || '-'}</Text>
          <Text>
            System size:{' '}
            {client.system_size != null ? `${client.system_size} kW` : '-'}
          </Text>
          <Text>Lead origin: {client.lead_origin || '-'}</Text>
          <Text>Desired date: {client.desired_date || '-'}</Text>
          <Text>
            Battery option:{' '}
            {client.battery_option == null
              ? '-'
              : client.battery_option
              ? 'yes'
              : 'no'}
          </Text>
          <Text>Extras: {client.extras || '-'}</Text>
          <Text>Stage: {client.stage || '-'}</Text>
          <Text style={{ marginBottom: 12 }}>
            Lead notes: {client.obs_leads || '-'}
          </Text>

          {/* VISIT NOTES */}
          <Text style={{ fontSize: 18, marginTop: 16, marginBottom: 4 }}>
            Visit notes
          </Text>
          <Text>
            START_NOTE: {client.visit_start_note || '-'}
          </Text>
          <Text style={{ marginBottom: 8 }}>
            FINAL_NOTE: {client.visit_final_note || '-'}
          </Text>

          {/* CONTRACT NOTES */}
          <Text style={{ fontSize: 18, marginTop: 16, marginBottom: 4 }}>
            Contract notes
          </Text>
          <Text>
            START_NOTE: {client.contract_start_note || '-'}
          </Text>
          <Text style={{ marginBottom: 8 }}>
            FINAL_NOTE: {client.contract_final_note || '-'}
          </Text>

          {/* SERVICE NOTES */}
          <Text style={{ fontSize: 18, marginTop: 16, marginBottom: 4 }}>
            Service notes
          </Text>
          <Text>
            START_NOTE: {client.service_start_note || '-'}
          </Text>
          <Text style={{ marginBottom: 8 }}>
            FINAL_NOTE: {client.service_final_note || '-'}
          </Text>

          {/* BILLING NOTES */}
          <Text style={{ fontSize: 18, marginTop: 16, marginBottom: 4 }}>
            Billing notes
          </Text>
          <Text>
            START_NOTE: {client.billing_start_note || '-'}
          </Text>
          <Text style={{ marginBottom: 8 }}>
            FINAL_NOTE: {client.billing_final_note || '-'}
          </Text>

          {/* AFTER-SALES NOTES */}
          <Text style={{ fontSize: 18, marginTop: 16, marginBottom: 4 }}>
            After-sales notes
          </Text>
          <Text>
            START_NOTE: {client.after_sales_start_note || '-'}
          </Text>
          <Text style={{ marginBottom: 8 }}>
            FINAL_NOTE: {client.after_sales_final_note || '-'}
          </Text>

          <View style={{ marginTop: 16 }}>
            <Button title="Back" onPress={() => router.back()} />
          </View>
        </>
      )}
    </ScrollView>
  );
}
