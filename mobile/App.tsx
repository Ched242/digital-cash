import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { getSupabase } from './src/lib/supabase';

type Product = { id: string; name: string; description: string | null; product_type: string; currency: string; price: number };
type Order = { id: string; order_number: string; status: string; total: number; currency: string; created_at: string };

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<'catalogue' | 'panier' | 'commandes' | 'compte'>('catalogue');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const supabase = getSupabase();
      const [{ data: catalog, error: catalogError }, { data: auth }] = await Promise.all([
        supabase.from('products').select('id,name,description,product_type,currency,price').eq('is_active', true).eq('stock_status', 'available').order('created_at', { ascending: false }),
        supabase.auth.getSession(),
      ]);
      if (catalogError) throw catalogError;
      setProducts((catalog ?? []) as Product[]);
      setSession(auth.session);
      if (auth.session) {
        const { data: rows } = await supabase.from('orders').select('id,order_number,status,total,currency,created_at').eq('user_id', auth.session.user.id).order('created_at', { ascending: false }).limit(30);
        setOrders((rows ?? []) as Order[]);
      } else setOrders([]);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connexion indisponible.');
    }
  }, []);

  useEffect(() => {
    void load();
    let subscription: { unsubscribe: () => void } | undefined;
    try {
      const { data } = getSupabase().auth.onAuthStateChange((_event, next) => {
        setSession(next);
        void load();
      });
      subscription = data.subscription;
    } catch { /* Environment configuration is shown in the screen. */ }
    return () => subscription?.unsubscribe();
  }, [load]);

  const count = useMemo(() => Object.values(cart).reduce((a, b) => a + b, 0), [cart]);
  const cartItems = useMemo(() => Object.entries(cart).filter(([, qty]) => qty > 0).map(([product_id, quantity]) => ({ product_id, quantity })), [cart]);

  const signIn = async () => {
    setBusy(true); setError('');
    try {
      const { error: authError } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password });
      if (authError) throw authError;
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Connexion impossible.'); }
    finally { setBusy(false); }
  };

  const signUp = async () => {
    setBusy(true); setError('');
    try {
      const { error: authError } = await getSupabase().auth.signUp({ email: email.trim(), password });
      if (authError) throw authError;
      Alert.alert('Inscription', 'Vérifiez votre adresse e-mail pour confirmer votre compte.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Inscription impossible.'); }
    finally { setBusy(false); }
  };

  const checkout = async () => {
    if (!session) { setTab('compte'); setError('Connectez-vous pour créer une commande.'); return; }
    setBusy(true); setError('');
    try {
      const { data, error: orderError } = await getSupabase().rpc('create_order_from_cart', { p_items: cartItems });
      if (orderError) throw orderError;
      setCart({});
      await load();
      setTab('commandes');
      Alert.alert('Commande créée', 'Votre commande est enregistrée. Le paiement sera disponible après activation des fournisseurs.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Création de commande impossible.'); }
    finally { setBusy(false); }
  };

  const add = (id: string) => setCart(current => ({ ...current, [id]: Math.min(10, (current[id] ?? 0) + 1) }));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}><Text style={styles.brand}>DIGITAL<Text style={styles.gold}>CASH</Text></Text><Text style={styles.headerTag}>MARKETPLACE</Text></View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {tab === 'catalogue' && <FlatList data={products} keyExtractor={item => item.id} contentContainerStyle={styles.list} ListHeaderComponent={<View style={styles.intro}><Text style={styles.kicker}>VOTRE UNIVERS NUMÉRIQUE</Text><Text style={styles.title}>Tout le digital, au même endroit.</Text><Text style={styles.muted}>Cartes cadeaux, recharges, jeux et services.</Text></View>} ListEmptyComponent={<Text style={styles.muted}>Aucun produit publié pour le moment.</Text>} renderItem={({ item }) => <View style={styles.card}><Text style={styles.kicker}>{item.product_type.replaceAll('_', ' ')}</Text><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.muted}>{item.description ?? 'Produit numérique'}</Text><View style={styles.cardFooter}><Text style={styles.price}>{Number(item.price).toFixed(2)} {item.currency}</Text><TouchableOpacity style={styles.smallButton} onPress={() => add(item.id)}><Text style={styles.buttonText}>Ajouter</Text></TouchableOpacity></View>{cart[item.id] ? <Text style={styles.muted}>Dans le panier : {cart[item.id]}</Text> : null}</View>} />}
      {tab === 'panier' && <ScrollView contentContainerStyle={styles.list}><Text style={styles.title}>Votre panier ({count})</Text>{cartItems.map(line => { const p = products.find(x => x.id === line.product_id); return p ? <View style={styles.card} key={p.id}><Text style={styles.cardTitle}>{p.name}</Text><Text style={styles.muted}>{line.quantity} × {Number(p.price).toFixed(2)} {p.currency}</Text><TouchableOpacity onPress={() => setCart(c => ({ ...c, [p.id]: Math.max(0, (c[p.id] ?? 0) - 1) }))}><Text style={styles.goldText}>Retirer un article</Text></TouchableOpacity></View> : null; })}{count > 0 ? <TouchableOpacity disabled={busy} style={styles.button} onPress={checkout}><Text style={styles.buttonText}>{busy ? 'Patientez…' : 'Créer la commande'}</Text></TouchableOpacity> : <Text style={styles.muted}>Votre panier est vide.</Text>}<Text style={styles.muted}>Aucun paiement n'est débité. Les moyens de paiement seront ajoutés lors de l'intégration des fournisseurs.</Text></ScrollView>}
      {tab === 'commandes' && <FlatList data={orders} keyExtractor={item => item.id} contentContainerStyle={styles.list} ListHeaderComponent={<Text style={styles.title}>Mes commandes</Text>} ListEmptyComponent={<Text style={styles.muted}>Connectez-vous pour consulter vos commandes.</Text>} renderItem={({ item }) => <View style={styles.card}><Text style={styles.cardTitle}>{item.order_number}</Text><Text style={styles.muted}>{item.status.replaceAll('_', ' ')}</Text><Text style={styles.price}>{Number(item.total).toFixed(2)} {item.currency}</Text></View>} />}
      {tab === 'compte' && <ScrollView contentContainerStyle={styles.list}><Text style={styles.title}>{session ? 'Mon compte' : 'Connexion'}</Text>{session ? <><Text style={styles.muted}>{session.user.email}</Text><TouchableOpacity style={styles.button} onPress={async () => { await getSupabase().auth.signOut(); await load(); }}><Text style={styles.buttonText}>Se déconnecter</Text></TouchableOpacity></> : <><TextInput style={styles.input} placeholder="Adresse e-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} /><TextInput style={styles.input} placeholder="Mot de passe (8 caractères minimum)" secureTextEntry value={password} onChangeText={setPassword} /><TouchableOpacity disabled={busy} style={styles.button} onPress={signIn}><Text style={styles.buttonText}>Se connecter</Text></TouchableOpacity><TouchableOpacity disabled={busy} style={styles.secondaryButton} onPress={signUp}><Text style={styles.darkButtonText}>Créer un compte</Text></TouchableOpacity></>}</ScrollView>}
      <View style={styles.nav}>{(['catalogue','panier','commandes','compte'] as const).map(item => <TouchableOpacity key={item} onPress={() => setTab(item)} style={styles.navItem}><Text style={[styles.navText, tab === item && styles.navActive]}>{item === 'catalogue' ? 'Catalogue' : item === 'panier' ? 'Panier' : item === 'commandes' ? 'Commandes' : 'Compte'}{item === 'panier' && count ? ` · ${count}` : ''}</Text></TouchableOpacity>)}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#faf9f6' },
  header: { height: 64, paddingHorizontal: 22, borderBottomWidth: 1, borderBottomColor: '#e9e6df', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { fontSize: 20, fontWeight: '900', letterSpacing: -1, color: '#151515' },
  gold: { color: '#c79b45' },
  headerTag: { fontSize: 9, letterSpacing: 2, color: '#98712f' },
  intro: { paddingVertical: 24 },
  kicker: { color: '#98712f', fontSize: 10, letterSpacing: 1.5, fontWeight: '800', textTransform: 'uppercase' },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '900', color: '#171717', marginVertical: 10 },
  muted: { fontSize: 12, color: '#777', lineHeight: 19, marginTop: 5 },
  list: { padding: 18, paddingBottom: 35 },
  card: { padding: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e9e6df', borderRadius: 12, marginBottom: 12 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: '#171717', marginTop: 6 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  price: { fontSize: 15, fontWeight: '800', color: '#171717', marginTop: 8 },
  smallButton: { backgroundColor: '#171717', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 7 },
  button: { backgroundColor: '#171717', padding: 16, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  secondaryButton: { borderWidth: 1, borderColor: '#c79b45', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 8 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  darkButtonText: { color: '#171717', fontWeight: '800', fontSize: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e9e6df', borderRadius: 8, padding: 14, marginVertical: 7, fontSize: 14 },
  error: { margin: 15, padding: 12, backgroundColor: '#fff0ee', color: '#a33b2d', borderRadius: 8, fontSize: 12 },
  nav: { minHeight: 60, flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e9e6df', backgroundColor: '#fff', justifyContent: 'space-around', alignItems: 'center' },
  navItem: { padding: 10 },
  navText: { color: '#777', fontSize: 11, fontWeight: '700' },
  navActive: { color: '#98712f' },
  goldText: { color: '#98712f', fontSize: 12, fontWeight: '800', marginTop: 12 },
});
