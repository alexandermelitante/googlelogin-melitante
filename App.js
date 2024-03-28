import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import * as React from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

//Expo go  : 714080997219-jtkeggpdcoib5iv7mb167g7vlqcit53u.apps.googleusercontent.com
//android : 714080997219-auafc3bp8m6ndf65anm2irk3ianbklvv.apps.googleusercontent.com
//ios : 714080997219-u3nscbcl39lan71pb7jfmobme6lrdp8d.apps.googleusercontent.com
//web : 714080997219-g411426eqspjm4ikuovuaetgvt55o3o9.apps.googleusercontent.com

WebBrowser.maybeCompleteAuthSession();
export default function App() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 
      "714080997219-jtkeggpdcoib5iv7mb167g7vlqcit53u.apps.googleusercontent.com",
    androidClientId: 
      "714080997219-auafc3bp8m6ndf65anm2irk3ianbklvv.apps.googleusercontent.com",
    iosClientId: 
      "714080997219-u3nscbcl39lan71pb7jfmobme6lrdp8d.apps.googleusercontent.com",
    webClientId: 
      "714080997219-g411426eqspjm4ikuovuaetgvt55o3o9.apps.googleusercontent.com",
    scopes: ["profile","email"],
  });

  const [userInfo, setUserInfo] = React.useState(null);

  React.useEffect(() => {
    handleEffect();
  }, [response]);

  async function handleEffect() {
    const user = await getLocalUser();
    if (!user) {
      getUserInfo(response.authentication.accessToken);
    } else {
      setUserInfo(user);
    }
  }

  const getLocalUser = async () => {
    const data = await AsyncStorage.getItem("@user");
    if (!data) return null;
    return JSON.parse(data);
  };

  const getUserInfo = async (token) => {
    if (!token) return;

    try {
      const response = await fetch (
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const user = await response.json();
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      setUserInfo(user);
    } catch (error) {}
  };

  return (
    <View style={styles.container}>
      { !userInfo ? (
        <Button
          title="Login With Google"
          onPress={() => {
            promptAsync();
          }}
        />
      ) : (
        <View>
          <Image style={styles.image} source={{ uri: userInfo?.picture }} />
          <Text style={styles.text}>Email: {userInfo.email}</Text>
          <Text style={styles.text}>Full Name: {userInfo.name}</Text>

          <Button
            title="Remove AsyncStorage Value"
            onPress={ async () => {
              await AsyncStorage.removeItem("@user");
              setUserInfo(null);
            }}
          />
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 25,
    fontWeight: "bold",
  },
  image: {
    width: 100,
    height: 100,
  }
});
