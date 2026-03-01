"use client"

import { motion } from "framer-motion"
import { Mail, Phone, Linkedin, Github, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function ContactPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <div className="container py-10 px-4 md:px-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-4">Contact Us</h1>
          <p className="text-muted-foreground md:text-xl">
            Get in touch with the developer
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Arsh Kalra</CardTitle>
            <CardDescription>Full Stack Developer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a href="tel:+919871287990" className="font-medium hover:text-primary transition-colors">
                    +91 9871287990
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a 
                    href="mailto:arshkalra17@gmail.com" 
                    className="font-medium hover:text-primary transition-colors break-all"
                  >
                    arshkalra17@gmail.com
                  </a>
                </div>
              </div>

              <Link 
                href="https://www.linkedin.com/in/arsh-kalra-b813b928b/?skipRedirect=true"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Linkedin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">LinkedIn</p>
                  <p className="font-medium group-hover:text-primary transition-colors">
                    My LinkedIn
                  </p>
                </div>
              </Link>

              <Link 
                href="https://github.com/arshkalra17"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Github className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">GitHub</p>
                  <p className="font-medium group-hover:text-primary transition-colors">
                    My GitHub
                  </p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
