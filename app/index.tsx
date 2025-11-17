// app/index.tsx
import { useRouter } from 'expo-router';
import { addDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Button,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { leadsCol } from '../database/db';


type Lead = {
  id: string;
  name: string;
  address: string;
  neighbourhood?: string;
  system_size?: number;
  lead_origin?: string;
  stage?: string;
  obs_leads?: string;
  battery_option?: string;
  extras?: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [leadNotes, setLeadNotes] = useState('');

  // Campos do formulário
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [neighbourhood, setNeighbourhood] = useState('');
  const [systemSize, setSystemSize] = useState('');
  const [leadOrigin, setLeadOrigin] = useState('');
  const [desiredDate, setDesiredDate] = useState('');
  const [batteryOption, setBatteryOption] = useState('no');
  const [extras, setExtras] = useState('');

  const loadLeads = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(leadsCol);
      const data: Lead[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setLeads(data.filter(l => !l.stage || l.stage === 'lead'));
      
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveLead = async () => {
    try {
      await addDoc(leadsCol, {
        name,
        address,
        neighbourhood,
        system_size: systemSize ? parseFloat(systemSize) : null,
        lead_origin: leadOrigin,
        desired_date: desiredDate,
        battery_option: batteryOption === 'yes',
        extras,
        obs_leads: leadNotes,
        stage: 'lead', // 🔵 new: this client is in the “lead” stage
        createdAt: new Date().toISOString(),
      });
      // limpa o formulário
      setName('');
      setAddress('');
      setNeighbourhood('');
      setSystemSize('');
      setLeadOrigin('');
      setDesiredDate('');
      setBatteryOption('no');
      setExtras('');
      setLeadNotes(''); // 🔵 clear notes

      await loadLeads();
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
    }
  };

  const moveLeadToVisit = async (leadId: string) => {
    try {
      const ref = doc(leadsCol.firestore, 'leads', leadId);
      await updateDoc(ref, { stage: 'visit' });
      await loadLeads(); // refresh list, so it disappears from Leads
    } catch (error) {
      console.error('Error moving lead to visit stage:', error);
    }
  };


  useEffect(() => {
    loadLeads();
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
        solarapp – Leads (Firebase)
      </Text>

      <View style={{ marginBottom: 16 }}>
        <Button
          title="VISIT"
          onPress={() => router.push('/visit')}
        />
      </View>

      {/* LIST FIRST */}
      <Text style={{ marginTop: 24, fontSize: 18, marginBottom: 8 }}>
        Clients in Leads stage:
      </Text>

      {loading && <Text>Loading...</Text>}

      {!loading &&
        leads.map(lead => (
          <View key={lead.id} style={{ marginBottom: 12 }}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/clients/[id]',
                  params: { id: lead.id },
                })
              }
            >
              <Text style={{ fontWeight: 'bold' }}>
                {lead.name}
                {lead.system_size ? ` - ${lead.system_size} kW` : ''}
              </Text>
              <Text>{lead.address}</Text>
              <Text>{lead.neighbourhood}</Text>
              <Text>Origin: {lead.lead_origin}</Text>
              <Text>Battery: {lead.battery_option ? 'yes' : 'no'}</Text>
              {lead.extras ? <Text>Extras: {lead.extras}</Text> : null}
              {lead.obs_leads ? <Text>Notes: {lead.obs_leads}</Text> : null}
            </TouchableOpacity>

            <View style={{ marginTop: 4 }}>
              <Button
                title="Move to Visits"
                onPress={() => moveLeadToVisit(lead.id)}
              />
            </View>
          </View>
        ))}


      {/* FORM AFTER LIST */}
      <Text style={{ marginTop: 32, fontSize: 18, marginBottom: 8 }}>
        Add new lead
      </Text>

      <Text>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Client name"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 8,
          marginBottom: 8,
        }}
      />

      <Text>Address</Text>
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="Street, number..."
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 8,
          marginBottom: 8,
        }}
      />

      <Text>Neighbourhood</Text>
      <TextInput
        value={neighbourhood}
        onChangeText={setNeighbourhood}
        placeholder="Suburb / neighbourhood"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 8,
          marginBottom: 8,
        }}
      />

      <Text>System size (kW)</Text>
      <TextInput
        value={systemSize}
        onChangeText={setSystemSize}
        placeholder="e.g. 6.6"
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 8,
          marginBottom: 8,
        }}
      />

      <Text>Lead origin</Text>
      <TextInput
        value={leadOrigin}
        onChangeText={setLeadOrigin}
        placeholder="Facebook, referral, website..."
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 8,
          marginBottom: 8,
        }}
      />

      <Text>Desired installation date</Text>
      <TextInput
        value={desiredDate}
        onChangeText={setDesiredDate}
        placeholder="2025-01-01"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 8,
          marginBottom: 8,
        }}
      />

      <Text>Battery? (yes/no)</Text>
      <TextInput
        value={batteryOption}
        onChangeText={setBatteryOption}
        placeholder="yes or no"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 8,
          marginBottom: 8,
        }}
      />

      <Text>Extras</Text>
      <TextInput
        value={extras}
        onChangeText={setExtras}
        placeholder="tiled roof, switchboard upgrade, steep roof..."
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 8,
          marginBottom: 8,
        }}
      />

      <Text>Lead notes</Text>
      <TextInput
        value={leadNotes}
        onChangeText={setLeadNotes}
        placeholder="Notes for this client in the Lead stage"
        multiline
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 8,
          marginBottom: 16,
          minHeight: 60,
          textAlignVertical: 'top',
        }}
      />

      <Button title="Save lead" onPress={saveLead} />
    </ScrollView>
  );

}
