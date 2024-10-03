/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import envConfig from "@/config/envConfig";

// Define types for Puppeteer and chrome-aws-lambda
import type { Browser } from "puppeteer-core";

// Dynamically import chrome-aws-lambda in production
const isProduction = envConfig.node_env === "production";

// Declare variables for Puppeteer and chrome-aws-lambda
let puppeteer: typeof import("puppeteer-core");
let chromeAwsLambda: typeof import("chrome-aws-lambda");

if (isProduction) {
  chromeAwsLambda = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

// Helper function to generate a PDF using Puppeteer
async function generatePDF(htmlContent: string): Promise<Buffer> {
  let browser: Browser | null = null;

  try {
    browser = isProduction
      ? await puppeteer.launch({
          args: chromeAwsLambda.args,
          executablePath: await chromeAwsLambda.executablePath,
          headless: true,
          defaultViewport: chromeAwsLambda.defaultViewport,
        })
      : await puppeteer.launch();

    const page = await browser.newPage();

    // Load the HTML content into the Puppeteer page
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0", // Wait until there are no network requests
    });

    // Generate the PDF from the HTML content
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true, // Include background images and colors
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
}

// Type for the request's body content
interface PDFRequestBody {
  content: string;
}

// POST handler
export async function POST(request: Request) {
  let body: PDFRequestBody;

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 },
    );
  }

  const { content } = body;

  if (!content) {
    return NextResponse.json({ error: "No content provided" }, { status: 400 });
  }

  try {
    const pdfBuffer = await generatePDF(content);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="post.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
