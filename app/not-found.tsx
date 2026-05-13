import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-black text-muted-foreground/20 mb-6">404</p>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/"><Home className="mr-2 h-4 w-4" /> Go Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop"><Search className="mr-2 h-4 w-4" /> Browse Shop</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
