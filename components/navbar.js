"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, Leaf, ShoppingCart, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/app/marketplace/CartContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, logout } = useAuth()
  const { cartItems } = useCart()
  const isLoggedIn = !!user
  const pathname = usePathname()
  const router = useRouter()

  const cartItemCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0)

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getUserInitials = () => {
    if (!user?.displayName) return user?.email?.[0]?.toUpperCase() || 'U'
    return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = isLoggedIn
    ? [
        { href: "/", label: "Home" },
        { href: "/detect", label: "Disease Detection" },
        { href: "/marketplace", label: "Marketplace" },
      ]
    : []

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-md dark:bg-gray-950/80 border-b" : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">AgroScan</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn && (
            <Link href="/marketplace/cart">
              <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-orange-500 hover:bg-orange-600 text-white text-xs"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          )}
          
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || user?.email || 'User'} />
                    <AvatarFallback className="bg-emerald-600 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <Button>Login</Button>
            </Link>
          )}
        </div>

        {/* Mobile Nav */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Menu" className="relative">
              <Menu className="h-5 w-5" />
              {isLoggedIn && cartItemCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-orange-500 text-white text-[10px]"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px] sm:w-[300px]">
            <nav className="flex flex-col gap-4 mt-8">
              {isLoggedIn && (
                <div className="flex items-center gap-3 pb-4 border-b">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || user?.email || 'User'} />
                    <AvatarFallback className="bg-emerald-600 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{user?.displayName || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              )}
              
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === link.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {isLoggedIn && (
                <Link href="/marketplace/cart">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Cart
                    {cartItemCount > 0 && (
                      <Badge className="ml-auto bg-orange-500 hover:bg-orange-600 text-white">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )}
              
              <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                {isLoggedIn ? (
                  <Button onClick={handleLogout} variant="outline" className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                ) : (
                  <Link href="/auth/login">
                    <Button className="w-full">Login</Button>
                  </Link>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

