**Target:** Next.js / Frontend Developer

> **Context:**
> I need a Web Dashboard for a Car Dealer Admin.
> **Tech Stack:** **Next.js 14 (App Router)**, **Tailwind CSS**, **Shadcn UI**. Backend is **Strapi v5**.
>
> **Key Modules:**
>
> 1.  **Master Data Management:**
>     *   CRUD interfaces for: Vehicle Groups, Vehicle Types, Colors, Supervisors (SPV), and Branches.
>     *   **Branch Input:** Integrate **Google Maps API** to allow the admin to pinpoint a location and save the Latitude/Longitude coordinates for the branch.
>
> 2.  **Sales Monitoring:**
>     *   **Live Map:** Display a Google Map (or Leaflet) showing markers for Sales staff who are currently "Online".
>     *   **Marker Logic:** Color-code markers based on the `last_updated` timestamp (e.g., Green = updated < 30 mins ago, Red = updated > 30 mins ago).
>
> 3.  **SPK (Order) Management:**
>     *   Data Table with filters (Date Range, Sales Name, SPK Number).
>     *   Actions: Change Status (ON PROGRESS / FINISH), Toggle `isEditable` (True/False).
>     *   **PDF Generation (CRITICAL TASK):**
>         Create a component using `@react-pdf/renderer` to generate a PDF that matches the attached "Purchase Order" layout **exactly**.
>         *   **Header:** Logo (Left), Company Address block (Center), SPK No & Date (Right).
>         *   **Layout:** A strict grid layout with borders.
>         *   **Sections:** Customer Info (Left Col), Sales Info (Right Col), Vehicle Details (Full width grid), Payment Details (Grid), Disclaimer (Footer), Signature Box (3 columns: SPV, Sales, Customer).
>         *   *Note: I will provide the text content, please focus on the Layout structure.*
>
> **Task:**
> 1. Create the `SpkDocument` component using `@react-pdf/renderer` that replicates the described layout.
> 2. Create the Sales Monitoring Map component using a mapping library compatible with Next.js.
