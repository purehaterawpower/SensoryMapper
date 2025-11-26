import SenseMapperLoader from "@/components/sense-mapper/SenseMapperLoader";
import { FirebaseProvider } from "@/firebase/provider";

export default function Home() {
  return (
    <FirebaseProvider>
      <SenseMapperLoader />
    </FirebaseProvider>
  );
}

    