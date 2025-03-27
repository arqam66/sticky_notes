import "./globals.css"
import Script from "next/script"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Sticky Notes App</title>
        <meta name="description" content="A beautiful sticky notes app for capturing your thoughts" />
      </head>
      <body>
        {children}
        <Script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js" />
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
