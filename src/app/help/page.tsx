import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HelpCenterPage() {
  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Help Center</h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions and learn how to use our platform
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Learn the basics of using our platform</p>
              <Button variant="link" className="mt-2 p-0">Read more →</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Tips for creating and selling digital products</p>
              <Button variant="link" className="mt-2 p-0">Read more →</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Account & Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Manage your account and payment settings</p>
              <Button variant="link" className="mt-2 p-0">Read more →</Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I create an account?</AccordionTrigger>
              <AccordionContent>
                Click the "Sign Up" button in the top right corner and follow the registration process. You'll need to provide your email, create a username, and set a password.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How do I sell my digital products?</AccordionTrigger>
              <AccordionContent>
                After creating an account, go to your Creator Dashboard and click "Add Product". Fill in the product details, upload your files, set a price, and publish!
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How do payments work?</AccordionTrigger>
              <AccordionContent>
                We process payments securely through Stripe. You'll receive payouts for your sales every 7 days, minus our platform fee. Make sure to set up your payout information in your account settings.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>What file types are supported?</AccordionTrigger>
              <AccordionContent>
                We support most common digital file types including ZIP, PDF, and executables. For product thumbnails, you can use JPEG, PNG, or WebP images.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Contact Support */}
        <div className="text-center space-y-4 bg-muted p-8 rounded-lg">
          <h2 className="text-2xl font-bold">Still need help?</h2>
          <p className="text-muted-foreground">
            Our support team is here to help you with any questions or issues
          </p>
          <Button>Contact Support</Button>
        </div>
      </div>
    </div>
  )
} 