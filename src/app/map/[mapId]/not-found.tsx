import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-center">
      <h1 className="text-4xl font-bold mb-4">Map Not Found</h1>
      <p className="text-muted-foreground mb-8">
        Sorry, the map you are looking for does not exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/">Create a New Map</Link>
      </Button>
    </div>
  );
}

    