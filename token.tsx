import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";

const getToken = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        if (token == null) {
            return '';
        }
        return token;
    } catch (error) {
        console.log(error);
        return '';
    }
}

const TokenContext = React.createContext<{ token: string, setToken: (token: string) => void }>({
    token: '',
    setToken: () => { },
});

const TokenProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = React.useState('');

    React.useEffect(() => {
        getToken().then((token) => {
            setToken(token ?? '');
        });
    }, []);

    return (
        <TokenContext.Provider value={{ token, setToken }}>
            {children}
        </TokenContext.Provider>
    );
}

export { TokenProvider, TokenContext };