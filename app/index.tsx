import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { supabase as db } from "@/utils/supabaseClient";
import Login from "@/components/Login";
import Loading from "@/components/Loading";

interface UserProfile {
  role: 'worker' | 'employer';
}

export default function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    db.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        // Fetch user profile to get role
        const { data: profile } = await db
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        setUserProfile(profile);
      }
      
      setIsLoading(false);
    });

    const { data: { subscription } } = db.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      
      if (session?.user) {
        const { data: profile } = await db
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session && userProfile) {
    // Route based on user role
    return <Redirect href={userProfile.role === "worker" ? "/tabs" : "/tabs/dashboard"} />;
  } else if (isLoading) {
    return <Loading />;
  } else {
    return <Login />;
  }
}

