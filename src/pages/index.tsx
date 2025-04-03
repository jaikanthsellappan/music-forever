import Image from "next/image";
import { useEffect } from 'react';
import router, { useRouter } from "next/router";
import { useState } from "react";



export default function Home() {
  useEffect(() => {
    fetch('/api/hello'); // This will call setup code to run the initial table creation script

    // Redirect to login page
    router.push('/login');
  }, []);

  return null; // Nothing is rendered here, because we're redirecting immediately
}
