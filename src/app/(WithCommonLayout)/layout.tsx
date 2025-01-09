import Navbar from "@/components/Navbar/Navbar";

export default function WithCommonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar />
      <main className="min-h-screen pt-20">{children}</main>
    </div>
  );
}
