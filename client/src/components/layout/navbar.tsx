import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="link" className="text-2xl font-bold px-0">
              HR Manager
            </Button>
          </Link>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <Avatar>
            <AvatarImage src="https://images.unsplash.com/photo-1507679799987-c73779587ccf" />
            <AvatarFallback>HR</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
}