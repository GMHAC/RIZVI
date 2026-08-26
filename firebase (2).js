import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInAnonymously, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, query, where, limit, orderBy, serverTimestamp, writeBatch } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

export const firebaseConfig={apiKey:"AIzaSyCjYmBDuqmkfs6HE27Gha4zH4GBlUdZA0",authDomain:"rizvifashionsfirebasestorageap.firebaseapp.com",projectId:"rizvifashionsfirebasestorageap",storageBucket:"rizvifashionsfirebasestorageap.firebasestorage.app",messagingSenderId:"292892570046",appId:"1:292892570046:web:14a44bd7741e0a5292c9ef",measurementId:"G-6RB3V4ZGMH"};
export const app=initializeApp(firebaseConfig); export const auth=getAuth(app); export const db=getFirestore(app); export const storage=getStorage(app);
export {onAuthStateChanged,signInWithEmailAndPassword,signInAnonymously,signOut,collection,doc,getDoc,getDocs,addDoc,setDoc,updateDoc,query,where,limit,orderBy,serverTimestamp,writeBatch,ref,uploadBytes,getDownloadURL};
