import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

// Helper function to generate a PDF using Puppeteer
async function generatePDF(htmlContent: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Load the HTML content into the Puppeteer page
  await page.setContent(htmlContent, {
    waitUntil: "networkidle0", // Wait until there are no network requests
  });

  // Generate the PDF from the HTML content
  const pdfBuffer = await page.pdf({
    format: "A4", // Set paper size
    printBackground: true, // Include background images and colors
  });

  await browser.close();
  return pdfBuffer;
}

export async function POST(request: Request) {
  const { content } = await request.json();

  if (!content) {
    return NextResponse.json({ error: "No content provided" }, { status: 400 });
  }

  const pdfBuffer = await generatePDF(content);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="post.pdf"`,
    },
  });
}
