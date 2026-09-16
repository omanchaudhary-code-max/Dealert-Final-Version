import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto transition-colors">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Slogan */}
          <div className="flex flex-col space-y-3">
            <Link href="/">
              <Image
                src="/dealert_logo.png"
                alt="Dealert"
                width={110}
                height={32}
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nepal&apos;s price tracking & seller trust intelligence platform. Monitor historical prices, receive instant deal alerts, and verify online seller legitimacy.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Explore</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/deals" className="text-muted-foreground hover:text-foreground transition-colors">Hot Deals</Link></li>
              <li><Link href="/price-index" className="text-muted-foreground hover:text-foreground transition-colors">Nepal Price Index</Link></li>
              <li><Link href="/fake-page-detector" className="text-muted-foreground hover:text-foreground transition-colors">Fake Page Check</Link></li>
              <li><Link href="/pricing" className="text-primary hover:underline font-semibold transition-colors">Pricing & Plans</Link></li>
            </ul>
          </div>

          {/* Quick Tools */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Features</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/deals" className="text-muted-foreground hover:text-foreground transition-colors">Price Drop Alerts</Link></li>
              <li><Link href="/price-index" className="text-muted-foreground hover:text-foreground transition-colors">Category Indices</Link></li>
              <li><Link href="/fake-page-detector" className="text-muted-foreground hover:text-foreground transition-colors">Seller Trust Verification</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Kathmandu University, Nepal</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>support@dealert.com.np</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>+977 1 4410000</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Dealert (SPTDAS). All rights reserved.</span>
          <div className="flex items-center space-x-4 text-xs">
            <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
