"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function MainNavbar() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <header className="w-full bg-background/95 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Intellect</span>
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/about" className="text-foreground/80 hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/terms" className="text-foreground/80 hover:text-foreground transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="text-foreground/80 hover:text-foreground transition-colors">
            Privacy
          </Link>
        </div>

        {/* CTA Buttons with smooth text-to-arrow transitions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LoginButton />
          <SignUpButton />
        </div>
      </div>
    </header>
  )
}

// Login button with text-to-arrow transition
function LoginButton() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant="outline"
        className="rounded-full px-6 border-primary/50 hover:border-primary hover:bg-primary/10 overflow-hidden h-10 w-24"
        asChild
      >
        <Link href="/login" className="relative flex items-center justify-center">
          <div className="relative h-5 w-full overflow-hidden">
            {/* Text element */}
            <motion.span
              className="absolute w-full text-center"
              initial={{ y: 0 }}
              animate={{ y: isHovered ? -30 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              Login
            </motion.span>

            {/* Arrow element */}
            <motion.span
              className="absolute w-full flex justify-center text-primary"
              initial={{ y: 30 }}
              animate={{ y: isHovered ? 0 : 30 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.span>
          </div>
        </Link>
      </Button>
    </motion.div>
  )
}

// Sign up button with text-to-arrow transition
function SignUpButton() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        className="bg-amber-400 hover:bg-amber-500 text-black font-medium rounded-full px-6 overflow-hidden h-12 w-28"
        asChild
      >
        <Link href="/login" className="relative flex items-center justify-center">
          <div className="relative h-6 w-full overflow-hidden">
            {/* Text element */}
            <motion.span
              className="absolute w-full text-center"
              initial={{ y: 0 }}
              animate={{ y: isHovered ? -30 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              Sign up
            </motion.span>

            {/* Arrow element */}
            <motion.span
              className="absolute w-full flex justify-center"
              initial={{ y: 30 }}
              animate={{ y: isHovered ? 0 : 30 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.span>
          </div>
        </Link>
      </Button>
    </motion.div>
  )
}
