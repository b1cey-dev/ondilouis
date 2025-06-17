import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LegalPage() {
  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Legal Information</h1>
          <p className="text-xl text-muted-foreground">
            Important legal documents and policies for using our platform
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Terms of Service</CardTitle>
              <CardDescription>
                The rules and guidelines for using our platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Our Terms of Service outline the rules for using our platform, your rights and responsibilities, and our obligations to you.
              </p>
              <Link
                href="/terms"
                className="inline-flex items-center text-primary hover:underline"
              >
                Read Terms of Service <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy Policy</CardTitle>
              <CardDescription>
                How we collect and use your information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Our Privacy Policy explains how we collect, use, and protect your personal information when you use our services.
              </p>
              <Link
                href="/privacy"
                className="inline-flex items-center text-primary hover:underline"
              >
                Read Privacy Policy <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookie Policy</CardTitle>
              <CardDescription>
                Information about how we use cookies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Our Cookie Policy explains how we use cookies and similar technologies to provide, improve, and protect our services.
              </p>
              <Link
                href="/cookies"
                className="inline-flex items-center text-primary hover:underline"
              >
                Read Cookie Policy <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Copyright & DMCA</CardTitle>
              <CardDescription>
                Our policies regarding intellectual property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Information about our copyright policies and how to report intellectual property violations.
              </p>
              <Link
                href="/dmca"
                className="inline-flex items-center text-primary hover:underline"
              >
                Read Copyright Policy <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Legal Team</CardTitle>
              <CardDescription>
                Get in touch with our legal department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                For legal inquiries or concerns, please contact us at:{" "}
                <a
                  href="mailto:legal@onidolus.com"
                  className="text-primary hover:underline"
                >
                  legal@onidolus.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 