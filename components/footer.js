import Link from "next/link"
import { Leaf } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-background/50 backdrop-blur-sm">
      <div className="container px-4 py-12 md:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">AgroScan</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Empowering farmers with AI-driven insights to improve crop yield, detect diseases early, and optimize
              farming practices.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Features</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/detect" className="text-muted-foreground hover:text-primary transition-colors">
                  Disease Detection
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-muted-foreground hover:text-primary transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Insights Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AgroScan. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

