import { db } from './src/lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

async function check() {
  const docRef = doc(db, 'products', 'SKU-48201-AX');
  const docSnap = await getDoc(docRef);
  console.log('Exists:', docSnap.exists());
  if (docSnap.exists()) {
      console.log(docSnap.data());
  } else {
      console.log('Checking all products:');
      const q = await getDocs(collection(db, 'products'));
      q.forEach(d => console.log(d.id));
  }
  process.exit(0);
}

check();
