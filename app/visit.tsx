// app/visits.tsx
import { useRouter } from 'expo-router';
import { addDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Button,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { leadsCol, visitsCol } from '../database/db';


type Visit = {
  id: string;
  date: string;
  time: string;
  gps?: string;
  notes?: string;
  lead_id?: string | null;
};

type LeadOption = {
  id: string;
  name: string;
  neighbourhood?: string;
  system_size?: number;
};

export default function VisitsScreen() {
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [leadOptions, setLeadOptions] = useState<LeadOption[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [visitStartNote, setVisitStartNote] = useState('');
  const [visitFinalNote, setVisitFinalNote] = useState('');
  
  // campos do formulário
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [gps, setGps] = useState('');
  const [notes, setNotes] = useState('');

  const loadVisitNotesForLead = async (leadId: string) => {
    try {
      const ref = doc(leadsCol, leadId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as any;
        setVisitStartNote(data.visit_start_note || '');
        setVisitFinalNote(data.visit_final_note || '');
      } else {
        setVisitStartNote('');
        setVisitFinalNote('');
      }
    } catch (err) {
      console.error('Error loading visit notes:', err);
      setVisitStartNote('');
      setVisitFinalNote('');
    }
  };

  

  const loadData = async () => {
    setLoading(true);
    try {
      // carrega visits e leads ao mesmo tempo
      const [visitsSnap, leadsSnap] = await Promise.all([
        getDocs(visitsCol),
        getDocs(leadsCol),
      ]);

      const visitsData: Visit[] = visitsSnap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
      }));

      const leadsRaw = leadsSnap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
      }));

      const leadsData: LeadOption[] = leadsRaw
        .filter(l => l.stage === 'visit') // only clients in visit stage
        .map(l => ({
          id: l.id,
          name: l.name || 'No name',
          neighbourhood: l.neighbourhood,
          system_size: l.system_size,
      }));


      setVisits(visitsData);
      setLeadOptions(leadsData);

      // se ainda não tem lead selecionado e existir ao menos um lead, seleciona o primeiro
      if (!selectedLeadId && leadsData.length > 0) {
        setSelectedLeadId(leadsData[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar visits/leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const moveClientToContract = async (leadId: string) => {
    try {
      const ref = doc(leadsCol.firestore, 'leads', leadId);
      await updateDoc(ref, { stage: 'contract' });
      await loadData(); // refresh list so it disappears from Visits
    } catch (error) {
      console.error('Error moving client to contract stage:', error);
    }
  };

 const saveVisit = async () => {
    if (!selectedLeadId) return;

    try {
      // salva a visita em visits
      await addDoc(visitsCol, {
        lead_id: selectedLeadId,
        date,
        time,
        gps,
        notes,
      });

      // salva/atualiza as notas de visita no doc do cliente em leads
      const leadRef = doc(leadsCol, selectedLeadId);
      await setDoc(
        leadRef,
        {
          visit_start_note: visitStartNote,
          visit_final_note: visitFinalNote,
        },
        { merge: true }
      );

      await loadData();

      // limpa campos da visita
      setDate('');
      setTime('');
      setGps('');
      setNotes('');
      // opcional: deixar as notas na tela, ou limpar também
      // setVisitStartNote('');
      // setVisitFinalNote('');
    } catch (err) {
      console.error('Error saving visit and notes:', err);
    }
  };


  useEffect(() => {
    loadData();
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
        Visits – solarapp
      </Text>
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <View style={{ marginRight: 8 }}>
          <Button
            title="LEADS"
            onPress={() => router.push('/')}
          />
        </View>
        <View>
          <Button
            title="CONTRACT"
            onPress={() => router.push('/contract')}
          />
        </View>
      </View>
 
      {/* SELECIONAR LEAD */}
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
        Selecionar cliente (Lead)
      </Text>

      <Text style={{ marginTop: 8, marginBottom: 4, fontSize: 16 }}>
        Clients in Visit stage:
      </Text>

      {leadOptions.length === 0 ? (
        <Text style={{ marginBottom: 16 }}>
          Nenhum lead cadastrado ainda. Volte em Leads e crie um cliente.
        </Text>
      ) : (
        <View style={{ marginBottom: 16 }}>
                
         {leadOptions.map(lead => (
          <View
            key={lead.id}
            style={{
              padding: 8,
              marginBottom: 4,
              borderWidth: 1,
              borderColor:
                selectedLeadId === lead.id ? 'blue' : '#ccc',
              borderRadius: 4,
            }}
          >


            
            <TouchableOpacity  key={lead.id}
            onPress={() => {setSelectedLeadId(lead.id); loadVisitNotesForLead(lead.id);  }}
            >
              <Text>
                {selectedLeadId === lead.id ? '🔘 ' : '⚪ '}
                {lead.name}
                {lead.system_size ? ` – ${lead.system_size} kW` : ''}
                {lead.neighbourhood ? ` – ${lead.neighbourhood}` : ''}
              </Text>
            </TouchableOpacity>

            <View style={{ marginTop: 4 }}>
              <Button
                title="Move to Contract"
                onPress={() => moveClientToContract(lead.id)}
              />
            </View>
          </View>
                 ))}
               
        </View>
      )}

      {/* FORMULÁRIO DA VISITA */}
      <Text>Data da visita</Text>
      <TextInput
        value={date}
        onChangeText={setDate}
        placeholder="2025-01-01"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 8,
          marginBottom: 8,
        }}
      />

      <Text>Hora da visita</Text>
      <TextInput
        value={time}
        onChangeText={setTime}
        placeholder="14:30"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 8,
          marginBottom: 8,
        }}
      />

      <Text>Localização / GPS</Text>
      <TextInput
        value={gps}
        onChangeText={setGps}
        placeholder="Coordenadas ou endereço resumido"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 8,
          marginBottom: 8,
        }}
      />

      <Text>Notas</Text>
      <TextInput></TextInput>
        
        <Text style={{ marginTop: 16, fontSize: 16, marginBottom: 4 }}>
          Visit notes
        </Text>

        <Text>START_NOTE</Text>
        <TextInput
          value={visitStartNote}
          onChangeText={setVisitStartNote}
          placeholder="Start note for this client in Visit stage"
          multiline
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 8,
            marginBottom: 8,
            minHeight: 40,
            textAlignVertical: 'top',
          }}
        />

         
       
      <Button title="Salvar visita" onPress={saveVisit} />

      {/* LISTA DE VISITS */}
      <Text style={{ marginTop: 24, fontSize: 18, marginBottom: 8 }}>
        Visits salvas:
      </Text>

      {loading && <Text>Carregando...</Text>}

{!loading &&
  visits.map(visit => (
    <View key={visit.id} style={{ marginBottom: 12 }}>
      <Text style={{ fontWeight: 'bold' }}>
        {visit.date} {visit.time}
      </Text>
      {visit.gps ? <Text>{visit.gps}</Text> : null}
      {visit.notes ? <Text>Notes: {visit.notes}</Text> : null}
      {visit.lead_id ? (
        <Text>lead_id: {visit.lead_id}</Text>
      ) : (
        <Text>No lead linked</Text>
      )}
    </View>
  ))}
    </ScrollView>
  );
}
