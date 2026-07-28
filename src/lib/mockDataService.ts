import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';
import { User, mockProducts } from '../mockData';

const generateDummyUsers = (): User[] => {
  return [
    { id: 's1', name: 'Tech Store Mw', email: 'tech@example.demo', role: 'seller', verified: true, avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80' },
    { id: 's2', name: 'Fashion Hub', email: 'fashion@example.demo', role: 'seller', verified: false, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80' },
  ];
};

export const injectMockData = async () => {
  try {
    const users = generateDummyUsers();

    const batch = writeBatch(db);

    // Inject Users
    users.forEach(user => {
      const userRef = doc(db, 'users', user.id);
      batch.set(userRef, {
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        avatar: user.avatar,
        createdAt: new Date().toISOString()
      }, { merge: true });
    });

    // Inject all 60 mock products
    mockProducts.forEach((product) => {
      const productRef = doc(db, 'products', product.id);
      batch.set(productRef, {
        ...product,
        createdAt: new Date().toISOString()
      }, { merge: true });
    });

    await batch.commit();
    console.log('Successfully injected 60 mock products into Firestore');
    return true;
  } catch (error) {
    console.error('Error injecting mock data:', error);
    throw error;
  }
};
