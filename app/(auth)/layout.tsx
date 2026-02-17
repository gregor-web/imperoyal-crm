export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#EDF1F5] flex items-center justify-center p-4">
      {children}
    </div>
  );
}
