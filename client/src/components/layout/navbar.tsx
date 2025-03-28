import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationCenter } from "@/components/notifications/notification-center";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, Building2, Mail, Phone, LogOut } from "lucide-react";

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
          <Link href="/employees">
            <Button variant="ghost">Employees</Button>
          </Link>
          <Link href="/evaluations">
            <Button variant="ghost">Evaluations</Button>
          </Link>
          <Link href="/resume-screening">
            <Button variant="ghost">Resume Screening</Button>
          </Link>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <NotificationCenter />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src="https://images.unsplash.com/photo-1507679799987-c73779587ccf" />
                  <AvatarFallback>HR</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Sarah Johnson</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    HR Director
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Contact Information</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  <span>sarah.j@company.com</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Phone className="mr-2 h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>HR Department - Floor 3</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}