import { useEffect, useState } from "react";
import { Text } from "react-native";

import { Redirect } from "expo-router";

import { supabase as db } from "@/utils/supabaseClient";
import Login from "@/components/Login";
import Loading from "@/components/Loading";
import Account from "@/app/tabs/account/account";

export default function App() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Default to true for initial load

  useEffect(() => {
    setIsLoading(true);

    db.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session) {
    return <Redirect href="/tabs" />; // page to go once you are in
  } else if (isLoading) {
    return <Loading />;
  } else {
    return <Login />;
  }
}

