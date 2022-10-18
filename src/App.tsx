import './App.css';
import { useState, useEffect, useRef } from 'react';
import { db } from './firebase/firebase-config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { auth } from './firebase/firebase-config';
import { onAuthStateChanged } from '@firebase/auth'
import styles from './App.module.css'
type user = {
    name: string;
    age: number;
    id: string
};
function App() {
    // onAuthStateChanged(auth, (currentUser) => {

    // })
    const [users, setUsers] = useState<user[]>([]);
    const usersCollectionRef = collection(db, "users")
    const [fetchUsersAgain, setFetchUsersAgain] = useState<boolean>(false);
    useEffect(() => {

        const getUsers = async () => {
            const res = await getDocs(usersCollectionRef);
            setUsers(res.docs.map((doc) => {
                const userInfo = { ...doc.data(), id: doc.id } as user; // type assertion
                return userInfo;
            }))
        }
        getUsers();

    }, [fetchUsersAgain])
    const inputName = useRef<HTMLInputElement | null>(null);
    const inputAge = useRef<HTMLInputElement | null>(null);

    const addUserHandler = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // console.log(inputName.current?.value, inputAge.current?.value)

        await addDoc(usersCollectionRef, {
            name: inputName.current?.value,
            age: +inputAge.current?.value!,
        })
        setFetchUsersAgain((prevState) => !prevState); // re-render the page
    }
    const updateUser = async (id: string, age: number) => {
        const newFields = {
            age: age + 1,
        }
        const userDoc = doc(db, "users", id);
        await updateDoc(userDoc, newFields);
        setFetchUsersAgain((prevState) => !prevState);
    }
    const deleteUser = async (id: string) => {
        const userDoc = doc(db, "users", id);
        await deleteDoc(userDoc);
        setFetchUsersAgain((prevState) => !prevState);
    }
    return (
        <div className="App">
            <header className="App-header">
                <form onSubmit={addUserHandler}>
                    <input ref={inputName} placeholder="name" />
                    <input ref={inputAge} placeholder="age" />
                    <button type='submit'>Add new User</button>
                </form>
                {users.map((user) => {
                    return (
                        <div className={styles.card}>
                            <h1>{user.name}</h1>
                            <h2>{user.age}</h2>
                            <button onClick={() => updateUser(user.id, user.age)}>Increase Age</button>
                            <button onClick={() => deleteUser(user.id)}>Delete User</button>
                        </div>
                    )
                })}
            </header>
        </div>
    );
}

export default App;
